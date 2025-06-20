import type { GetTag, Guid, HasTag, Merge, Tag } from "../Helpers";
import { logicalName as getLogicalName } from "../Helpers";
import type { FieldMetadata } from ".";

/** Metadata to represent an entity in DataVerse */
export interface EntityMetadata<
	TSchemaName extends string = string,
	TFields extends Record<string, FieldMetadata> = Record<string, FieldMetadata>,
> {
	/** The schema name of the entity */
	schemaName: TSchemaName,
	/** The fields of the entity */
	fields: TFields,
	/** If this entity is readonly and won't allow any updates */
	isReadOnly: boolean,
}

export const knownEntityMetadata: Record<string, EntityMetadata> = {};

/**
 * Gets the metadata for an entity by its schema name
 * @param schemaName The schema name of the entity to get the metadata for
 * @returns The metadata for the entity
 */
export function metadata<TSchemaName extends string>(schemaName: TSchemaName) {
	const metadata = knownEntityMetadata[schemaName];

	if (!metadata)
		throw new Error(`No metadata found for entity with schema name '${schemaName}'`);

	return metadata as EntityMetadata<TSchemaName>;
}

export function findMetadataByLogicalName(logicalName: string) {
	return Object
		.values(knownEntityMetadata)
		.find(e => getLogicalName(e) === logicalName);
}

export interface EntityOptions {
	/** Mark this entity as readonly, thus changes will not be allowed. */
	isReadOnly?: boolean,
}

/**
 * Creates the metadata representing an entity
 * @param schemaName The schema name of the entity
 * @param setName The set name of the entity
 * @param fields The fields of the entity
 * @returns The metadata representing the entity
 */
export function entity<
	TSchemaName extends string,
	TFields extends Merge<[Record<string, FieldMetadata>, { id: FieldMetadata }]>,
>(
	schemaName: TSchemaName,
	fields: TFields,
	options?: EntityOptions,
) {
	if (schemaName in knownEntityMetadata)
		if (!import.meta.hot)
			throw new Error(`Entity metadata already exists for entity with schema name '${schemaName}'`);

	const metadata = {
		schemaName,
		fields,
		isReadOnly: options?.isReadOnly ?? false,
	} satisfies EntityMetadata<TSchemaName, TFields>;

	// store the metadata
	knownEntityMetadata[schemaName] = metadata;
	return metadata;
}

type EntityTag<TSchemaName extends string = string> = Tag<{ id: Guid<TSchemaName>; }, "type", "Entity">;
export type Entity<TMetadata extends EntityMetadata | undefined = undefined> =
	TMetadata extends undefined
	?
	Tag<
		EntityTag<string>,
		"schemaName",
		string
	>
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	: TMetadata extends EntityMetadata<infer TSchemaName, infer _TFields>
	?
	Tag<
		EntityTag<TSchemaName>,
		"schemaName",
		TSchemaName
	>
	:
	Tag<
		EntityTag<string>,
		"schemaName",
		string
	>
	;

// type TBareEntity = Entity;
// type TTypedEntity = Entity<AccountMetadata>;

export type GetSchemaName<TEntity> = TEntity extends HasTag<"schemaName">
	? GetTag<TEntity, "schemaName">
	: never;