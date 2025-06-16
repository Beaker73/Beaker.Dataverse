import { debugThrow, type Issue } from "./Helpers";
import type { ClearTags, HasTag } from "./Helpers";
import { newGuid } from "./Helpers";
import type { Entity, EntityMetadata, FieldMetadata, GetSchemaName } from "./Metadata";
import { getTypeDescriptor } from "./Metadata";
import { entityMutationFields, entityStateFields, type EntityMutationFields, type EntityStateFields } from "./Metadata/DefaultFields";
import type { TypeFromMetadata, BaseTypeFromMetadata } from "./Metadata/Derive";
import { hasMethods } from "./Metadata/Methods";
import type { CoreServerType, EntityData, EntityReference } from "./Types";

const trackingDataTag = Symbol();

type EntityState = "newUnsaved" | "unchanged" | "changed" | "markedForDeletion" | "abandoned";

interface TrackingData<
	TMetadata extends EntityMetadata = EntityMetadata,
> {
	metadata: TMetadata,
	original: EntityData,
	changes: EntityData,
	state: EntityState;
}

type NullableOptional<T> = { [K in keyof T as (null extends T[K] ? K : never)]+?: T[K] };
type NotNullabeRequired<T> = { [K in keyof T as (null extends T[K] ? never : K)]-?: T[K] };
/** Makes the nullable fields optional, as those are not required for a new entity */
export type NullablePartial<T> = NullableOptional<T> & NotNullabeRequired<T>;

/** Get property names of fields that extend the given type */
export type FieldNamesOfType<T, TType> = {
	[K in keyof T]: T[K] extends TType ? K : never
}[keyof T];

/** Init data for a new entity, id and server side generated fields removed, nullable fields made optional */
export type EntityInitData<
	TEntityMetadata extends EntityMetadata,
	TEntity extends Entity = BaseTypeFromMetadata<TEntityMetadata>
> = Omit<
	NullablePartial<ClearTags<TEntity>>,
	EntityStateFields // state cannot be set on creation
	| FieldNamesOfType<TEntityMetadata["fields"], { options: { readOnly: true } }> // remove all readonly fields
>;

// dictionary for quick run-time check against state and mutation fields
const stateAndMutationFields = {
	...Object.fromEntries(Object.keys(entityStateFields()).map(key => [key, true])),
	...Object.fromEntries(Object.keys(entityMutationFields()).map(key => [key, true])),
} as Record<EntityStateFields | EntityMutationFields, true>;

/**
 * Creates a new entity of given type, optionally with initial data
 * @param metadata The metadata of the change tracked entity
 * @param initData The [optional] initial data for the entity
 */
export function newEntity<
	const TMetadata extends EntityMetadata<TSchemaName>,
	const TSchemaName extends string = TMetadata["schemaName"],
	const TEntity = TypeFromMetadata<TMetadata>,
>(
	metadata: TMetadata,
	// if final initData type is emtpy, we allow no initData to be passed (make it optional argument)
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	...initData: {} extends NoInfer<EntityInitData<TMetadata>> ? [NoInfer<EntityInitData<TMetadata>>?] : [NoInfer<EntityInitData<TMetadata>>]
): NonNullable<TEntity> // no idea why nonnullable is needed here. TypeFromMetadata should already be non-nullable
{
	const data: Record<string, unknown> = initData?.[0] ?? {};
	const entityData: EntityData = {};
	for (const [key, field] of Object.entries(metadata.fields)) {
		if (key in data) {
			if (key in stateAndMutationFields)
				console.warn(`Cannot set state or mutation fields on entity creation. Field ${field.schemaName} ignored.`);
			else
				entityData[field.schemaName.toLowerCase()] = convertFieldToServer(field, data[key]);
		}
		else {
			if (field.type === "id")
				entityData[field.schemaName.toLowerCase()] = newGuid();
			else if (key in stateAndMutationFields) {
				// not set, correct, ignore
			}
			else if (!field.options.optional && !field.options.readOnly)
				debugThrow(new Error(`The field '${key}' is required but not provided`));
			else
				entityData[field.schemaName.toLowerCase()] = null;
		}
	}

	const entity: Entity<TMetadata> = mapEntity(metadata, entityData);

	// mark as new
	const trackingData = getTrackingData(entity);
	if (!trackingData)
		debugThrow(new Error("Unexpected. newly created entity has no tracking data"));

	trackingData.state = "newUnsaved";
	trackingData.changes = trackingData.original;
	trackingData.original = {};

	return entity as unknown as NonNullable<TEntity>;
}

/**
 * Maps a raw entity to a typed entity
 * @param metadata The metadata to use for mapping
 * @param entityData The raw unmapped entity to convert
 * @returns a mapped entity
 */
export function mapEntity<
	TMetadata extends EntityMetadata<TSchemaName>,
	TSchemaName extends string = TMetadata["schemaName"],
	TEntity = BaseTypeFromMetadata<TMetadata>
>(
	metadata: TMetadata,
	entityData: EntityData,
): TEntity {
	const trackingData: TrackingData<TMetadata> = {
		metadata,
		original: entityData,
		changes: {},
		state: "unchanged",
	};

	// we use proxies to allow us to 
	//
	// - track changes to the entity
	// - validate values on setting according to metadata

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- proxy is not used as a proxy but as a generic get/set interceptor
	const proxy = new Proxy<any>(entityData, {
		set(_obj, key, value) {
			if (trackingData.state === "abandoned")
				debugThrow(new Error("Cannot set values on an entity that has been abandoned"));

			// validate before setting new value
			if (typeof key === "string") {
				if (metadata.isReadOnly) {
					console.warn(`Write access detected to the readonly entity: ${metadata.schemaName}`);
					return false;
				}

				const field = metadata.fields[key];
				if (!field)
					debugThrow(new Error(`The field ${key} is not a known field for the entity of type ${metadata.schemaName}`));
				if (field.options.readOnly) {
					console.warn(`Write access detected to the readonly field: ${field.schemaName} on entity: ${metadata.schemaName}. Write ignored`);
					return false;
				}

				const logicalName = field.schemaName.toLowerCase();

				// validation
				const issues = validateField(field, value);
				if (issues.filter(i => i.level === "error").length > 0)
					debugThrow(new Error(`Validation failed for field ${key}: ${issues.map(i => i.code ? `${i.message} (${i.code})` : i.message).join(", ")}`));

				// truncations
				value = truncateField(field, value);

				// conversion
				value = convertFieldToServer(field, value);
				if(field.options.converter && field.options.converter.revert)
					value = field.options.converter.revert(value, _obj, metadata);

				// if new or changed, set value
				if (!(logicalName in trackingData.original) || trackingData.original[logicalName] !== value) {
					trackingData.changes[logicalName] = value;
					if (trackingData.state === "unchanged")
						trackingData.state = "changed";
				}
				// if same value as original, remove from changes
				else if (logicalName in trackingData.changes) {
					delete trackingData.changes[logicalName];
					if (trackingData.state === "changed" && Object.keys(trackingData.changes).length === 0)
						trackingData.state = "unchanged";
				}

				return true;
			}

			return false;
		},
		get(_obj, key) {
			if (typeof key === "symbol") {
				if (key === trackingDataTag)
					return trackingData;
			}
			else if (typeof key === "string" && key !== "constructor") {
				// standard method for any object, call on original or all kinds of things start to break
				if (key === "toString")
					return trackingData.original.toString();
				if (key === "valueOf")
					return trackingData.original.valueOf();

				if (trackingData.state === "abandoned")
					console.warn("Detected read access to an abandoned entity");

				let value = undefined;

				const field = metadata.fields[key];
				if (!field) {
					if (hasMethods(metadata)) {
						const method = metadata.methods[key];

						// method found, invoke
						if (method && typeof method === "function") {
							return (...args: unknown[]) => {
								const result = method(proxy);

								// returned result is a function, we have a curried function
								// call the inner with args
								if (typeof result === "function")
									return result(...args);
								return result;
							}
						}
					}

					return value;
				}

				if (field && !field.schemaName)
					debugThrow(new Error(`The field ${key} is missing a schema name`));
				const logicalName = field.schemaName.toLowerCase();

				if (logicalName in trackingData.changes)
					value = trackingData.changes[logicalName];
				else if (logicalName in trackingData.original)
					value = trackingData.original[logicalName];

				value = convertFieldToClient(field, value ?? null);
				if (field.options.converter && field.options.converter.convert)
					value = field.options.converter.convert(value, _obj, metadata);

				return value ?? field.options.defaultValue ?? null;
			}

			return undefined;
		},
		ownKeys(_obj) {
			return Object.keys(metadata.fields);
		},
		has(_obj, key) {
			if (typeof key === "symbol") {
				if (key === trackingDataTag)
					return true;
			}

			return key in metadata.fields;
		},
		getOwnPropertyDescriptor(_obj, key) {
			const field = metadata.fields[key as string];
			if (!field)
				return undefined;

			const logicalName = field.schemaName.toLowerCase();
			return {
				value: logicalName in trackingData.changes ? trackingData.changes[logicalName] : trackingData.original[logicalName],
				writable: !metadata.isReadOnly,
				enumerable: true, // this is required for JSON.stringify to work
				configurable: true, // required or it breaks
			};
		},
	});

	return proxy as TEntity;
}


export function validateField(field: FieldMetadata, value: unknown): Issue[] {
	const descriptor = getTypeDescriptor(field.type);
	if (!descriptor)
		return [{ level: "error", message: `Unknown field type '${field.type}'` }];

	const operations = descriptor.operations;
	if ("validate" in operations && typeof operations.validate === "function") {
		if (value === null || value === undefined) {
			if (!field.options.optional)
				return [{ level: "error", message: "value is required" }];
		}
		else {
			return operations.validate(value, field);
		}
	}

	return [];
}

export function truncateField(field: FieldMetadata, value: unknown): unknown {
	const descriptor = getTypeDescriptor(field.type);
	if (!descriptor)
		return value;

	const operations = descriptor.operations;
	if ("truncate" in operations && typeof operations.truncate === "function") {
		if (value !== null && value !== undefined)
			return operations.truncate(value, field);
	}

	return value;
}


export function convertFieldToServer(field: FieldMetadata, value: unknown): CoreServerType {
	const descriptor = getTypeDescriptor(field.type);
	if (!descriptor)
		return value as CoreServerType;

	const operations = descriptor.operations;
	if ("convert" in operations) {
		if (value !== null && value !== undefined)
			return operations.convert!.toServerModel(value, field);
	}

	return value as CoreServerType;
}

export function convertFieldToClient(field: FieldMetadata, value: CoreServerType): unknown {
	const descriptor = getTypeDescriptor(field.type);
	if (!descriptor)
		return value;

	const operations = descriptor.operations;
	if ("convert" in operations) {
		if (value !== null && value !== undefined)
			return operations.convert!.toClientModel(value, field);
	}

	return value;
}

/**
 * Gets the tracking data from an entity, or undefined if the entity is not a tracked entity
 * @param entity The entity to get the tracking data from
 * @returns The tracking data of the entity, or undefined if the entity is not a tracked entity
 */
export function getTrackingData<
	TEntity extends Entity
>(
	entity: TEntity,
)
	: TrackingData | undefined {
	if (!entity)
		return undefined;
	if (!(trackingDataTag in entity))
		return undefined;

	return entity[trackingDataTag] as TrackingData | undefined;
}

/**
 * Gets the changes of an entity, or undefined if the entity is not a tracked entity
 * @param entity The entity to get the changes for
 * @returns The entity data of the changes, or undefined if the entity is not a tracked entity
 */
export function getChanges<TEntity extends Entity>(entity: TEntity): EntityData | undefined {
	return getTrackingData(entity)?.changes;
}

/**
 * Gets the metadata for the provided entity
 * @param entity The entity to get the metadata for/from
 * @returns The metadata or undefined if the entity is not a tracked entity
 */
export function getMetadata<TEntity extends Entity>(entity?: TEntity): EntityMetadata | undefined {
	if (!entity)
		return undefined;

	return (getTrackingData(entity)?.metadata ?? undefined) as EntityMetadata | undefined;
}

/**
 * Checks if the provided entity is dirty (i.e. has changes)
 * @param entity The entity to check for changes
 * @returns true if the entity has changes, false otherwise
 */
export function isDirty<TEntity extends Entity>(entity: TEntity): boolean {
	const trackingData = getTrackingData(entity);
	if (!trackingData)
		return false;

	return trackingData.state !== "unchanged";
}

/**
 * Marks the provided entity for deletion
 * @param entity The entity to mark for deletion
 * @throws Error if the entity is not tracked
 */
export function markForDeletion<TEntity extends Entity>(entity: TEntity): void {
	const trackingData = getTrackingData(entity);
	if (!trackingData)
		debugThrow(new Error("Cannot mark an entity for deletion that is not tracked"));
	if (trackingData.state === "abandoned")
		debugThrow(new Error("Cannot mark an entity for deletion that has been abandoned"));

	trackingData.state = "markedForDeletion";
}

/**
 * Collapses the 
 * @param entity The entity to collapse
 */
export function collapseEntity<TEntity extends Entity>(entity: TEntity): void {
	const trackingData = getTrackingData(entity);
	if (trackingData) {
		if (trackingData.state === "markedForDeletion")
			debugThrow(new Error("Cannot collapse an entity that is marked for deletion"));
		if (trackingData.state === "abandoned")
			debugThrow(new Error("Cannot collapse an entity that has been abandoned"));

		trackingData.original = { ...trackingData.original, ...trackingData.changes };
		trackingData.changes = {};
		trackingData.state = "unchanged";
	}
}

export function abandonEntity<TEntity extends Entity>(entity: TEntity): void {
	const trackingData = getTrackingData(entity);
	if (trackingData) {
		if (trackingData.state === "abandoned")
			console.warn("Detected duplicate abandon call on entity");

		trackingData.original = {};
		trackingData.changes = {};
		trackingData.state = "abandoned";
	}
}

/**
 * Apply changes from an old entity to a newly fetched entity
 * @param oldEntity The old entity that might have changes to re-apply on the new entity
 * @param newEntity The newly fetched entity to apply changes to
 */
export function applyChanges<TEntity extends Entity>(oldEntity: TEntity, newEntity: TEntity): void {
	if (isDirty(oldEntity)) {
		const oldTrackingData = getTrackingData(oldEntity);
		const newTrackingData = getTrackingData(newEntity);
		if (oldTrackingData && newTrackingData) {
			if (oldTrackingData.state === "markedForDeletion")
				newTrackingData.state = "markedForDeletion";

			for (const [key, value] of Object.entries(oldTrackingData.changes)) {
				// if value of new entity differs from original value of the old entity
				// then we have a conflict. Sorry, but server wins. So continue to next
				//
				if (oldTrackingData.original[key] !== newTrackingData.original[key])
					continue;

				// changed only on client, copy value over to new entity
				newTrackingData.changes[key] = value;
				if (newTrackingData.state === "unchanged")
					newTrackingData.state = "changed";
			}
		}
	}
}




type ToEntityResult<
	TEntity extends Entity | undefined
> = TEntity extends HasTag<"schameName">
	? TEntity extends undefined
	? EntityReference<GetSchemaName<NonNullable<TEntity>>> | undefined
	: EntityReference<GetSchemaName<NonNullable<TEntity>>>
	: never;

/**
 * Creates a reference to the given entity
 * @param entity The entity to get a reference for
 * @returns Reference to the entity
 */
export function toEntityReference<TEntity extends Entity | undefined>(entity: TEntity)
	: ToEntityResult<TEntity> {
	if (!entity)
		return undefined as (ToEntityResult<TEntity>);

	const nnEntity = entity as NonNullable<TEntity>;

	const data = getTrackingData(nnEntity);
	if (!data || !data.metadata)
		debugThrow(new Error("Entity is not tracked"));

	return {
		schemaName: data.metadata!.schemaName,
		id: nnEntity.id,
	} as ToEntityResult<TEntity>;
}