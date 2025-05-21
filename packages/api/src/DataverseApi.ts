import { abandonEntity, getMetadata, getTrackingData, mapEntity } from "./EntityMapper";
import { debugThrow, Guid } from "./Helpers";
import { Entity, EntityMetadata, BaseTypeFromMetadata } from "./Metadata";
import { matchToQuery, queryToFilter } from "./Queries/Conversion";
import { EntityMatch } from "./Queries/Match";
import { mergeQueries } from "./Queries/Merge";
import { Query } from "./Queries/Query";
import { ApiConnector, DataverseAction, EntityData } from "./Types";
import { WhoAmITypedResponse } from "./Types/WhoAmITypedResponse";

/**
 * Sets up access to the environment api using the provided url and token
 * @param connector The connector to use for accessing the environment
 */
export function dataverseApi(connector: ApiConnector)
{
	return {
		retrieve,
		retrieveMultiple,
		create,
		update,
        remove,
		saveChanges,
		execute,
		fetch,
		downloadImage,

		whoAmI: async () => await connector.whoAmI() as WhoAmITypedResponse,
		getOptionSetValues,
		getODataSetName,
	} as const;

	async function create<
		TEntity extends Entity,
	>(
		entity: TEntity,
	): Promise<TEntity["id"]>
	{
		const tracking = getTrackingData(entity);
		if (!tracking)
			throw new Error("Cannot create an entity that is not tracked");
		if (tracking.state !== "newUnsaved")
			throw new Error("Cannot create an entity that is not new");

		const entityData = tracking.changes;
		const metadata = getMetadata(entity)!; // we already know there is tracking data, so metadata should be present
		const id = await connector.create(metadata.schemaName, entityData);

		abandonEntity(entity);
		return id as TEntity["id"];
	}

	async function update<
		TEntity extends Entity
	>(
		entity: TEntity,
	): Promise<void>
	{
		const tracking = getTrackingData(entity);
		if (!tracking)
			throw new Error("Cannot update an entity that is not tracked");

		// no changes, so return as is
		if (tracking.state === "unchanged")
			return;

		if (tracking.state !== "changed")
			throw new Error("Cannot update an entity that is new or deleted");

		// send update to connector
		const metadata = getMetadata(entity)!; // we already know there is tracking data, so metadata should be present
		await connector.update(metadata.schemaName, entity.id, tracking.changes);
		abandonEntity(entity);
	}

	async function saveChanges<
		TEntity extends Entity,
	>(
		entity: TEntity,
	): Promise<TEntity["id"]>
	{
		// simple logic for now. Assume that if it is an mapped entity, it was retrieved, and thus should be updated
		// If it is not an mapped entity, it is new and should be created
		const tracking = getTrackingData(entity);
		if (!tracking)
			throw new Error("Cannot save an entity that is not tracked");

		const metadata = getMetadata(entity)!; // we already know there is tracking data, so metadata should be present

		switch (tracking.state) 
		{
			case "changed":
				await update(entity);
				return entity.id;

			case "newUnsaved":
			{
				const id = await create(entity);
				return id;
			}

			case "markedForDeletion":
				await remove(metadata, entity.id);
				return entity.id;

			case "abandoned":
				debugThrow(new Error("Cannot save changes to an entity that has been abandoned"));
		}

		return entity.id;
	}


	function remove<
		TMetadata extends EntityMetadata
	>(
		metadata: TMetadata,
		id: Guid<TMetadata["schemaName"]>,
	): Promise<void>
	{
		return connector.remove(metadata.schemaName, id);
	}

	/**
	 * Retrieves an entity by its id
	 * @param metadata The metadata of the entity to retrieve
	 * @param id The id of the entity to retrieve
	 */
	async function retrieve<
		TMetadata extends EntityMetadata
	>(
		metadata: TMetadata,
		id: Guid<TMetadata["schemaName"]>,
		options?: { includeNamesOfReferences?: boolean },
	)
	{
		const { includeNamesOfReferences = false } = options ?? {};

		const unmapped = await connector.retrieve(metadata.schemaName, id, {
			fields: Object.values(metadata.fields).map(f => f.schemaName.toLowerCase()),
			includeNamesOfReferences,
		});

		const mapped = odataMapEntity(metadata, unmapped);

		return mapped;
	}

	/**
	 * Retrieve multiple entities based on the provided query
	 * @param metadata The metadata of the entities to retrieve
	 */
	async function retrieveMultiple<
		TMetadata extends EntityMetadata<TSchemaName>,
		TSchemaName extends string = TMetadata["schemaName"],
		T = BaseTypeFromMetadata<TMetadata>,
		TExpectSingle extends boolean = false,
		TRequireData extends boolean = false,
	>(
		metadata: TMetadata,
		options?: {
			/** Matches by example */
			match?: NoInfer<Partial<EntityMatch<TMetadata, TSchemaName>>>,
			/** Full Filtering Query */
			query?: Query<TMetadata, TSchemaName>
			/** Expects a single result, throws if multiple found. */
			expectSingle?: TExpectSingle,
			/** Expects at least one result or more, throws if none found */
			requireData?: TRequireData,
			/** Limit to the top n number of rows */
			top?: number,
		},
	):
		Promise<TExpectSingle extends true ? (TRequireData extends true ? T : T | undefined) : T[]>
	{
		const opt = { ...options ?? {} };

		// if user supplied a match, convert it to a full query
		// if user also suplied a query, merge them
		if (opt.match)
		{
			const query: Query<TMetadata, string> = matchToQuery(metadata, opt.match);
			if (opt.query)
				opt.query = mergeQueries<TMetadata, string>(query, opt.query);
			else
				opt.query = query;
		}

		const result = await connector.retrieveMultiple({
			schemaName: metadata.schemaName,
			fields: Object.values(metadata.fields).map(f => f.schemaName.toLowerCase()),
			filter: opt.query ? queryToFilter<TMetadata, TSchemaName>(metadata, opt.query) : undefined,
			top: opt.top,
		});

		if (result.length == 0 && opt?.requireData === true)
			throw new Error(`No data found for query against ${metadata.schemaName}`);
		if (result.length > 1 && opt?.expectSingle === true)
			throw new Error(`Expected single result for query against ${metadata.schemaName}, but found ${result.length} records`);

		const mapped = result.map(r => odataMapEntity(metadata, r));

		if (opt?.expectSingle === true)
			return mapped[0] as TExpectSingle extends true ? (TRequireData extends true ? T : T | undefined) : T[];

		return mapped as TExpectSingle extends true ? (TRequireData extends true ? T : T | undefined) : T[];
	}

	async function execute<TAction extends DataverseAction>(action: TAction): Promise<ReturnType<TAction["onSuccess"]>>
	{
		const result = await connector.execute(action);
		return action.onSuccess(result) as ReturnType<TAction["onSuccess"]>;
	}

	/// TODO: somehow make the Type automaticly derive from the metadata. Lost 4 hours during first try. Maybe future insight will help.
	async function getOptionSetValues<TType extends string | number>(metadata: EntityMetadata, field: string)
	{
		const result = await connector.retrieveOptionSetValues(metadata.schemaName, metadata.fields[field].schemaName);
		return result as Record<TType, string>;
	}

	async function fetch<TMetadata extends EntityMetadata>(metadata: TMetadata, fetchXml: string)
	{
		return await connector.fetch(metadata.schemaName, fetchXml);
	}

	/// TODO: somehow make the Type automaticly derive from the metadata. Lost 4 hours during first try. Maybe future insight will help.
	async function downloadImage<TMetadata extends EntityMetadata>(metadata: TMetadata, id: Guid<TMetadata["schemaName"]>, field: string)
	{
		return await connector.downloadImage(metadata.schemaName, id, field);
	}

	function getODataSetName(logicalName: string): string | undefined
	{
		return connector.getSetName(logicalName);
	}
}


function odataMapEntity<TMetadata extends EntityMetadata>(metadata: TMetadata, unmapped: EntityData): BaseTypeFromMetadata<TMetadata>
{
	// special reference handling, move _<schema>_value to <schema>
	Object.values(metadata.fields)
		.filter(f => f.type === "reference")
		.forEach(f => 
		{
			const to = f.schemaName.toLowerCase();
			const from = `_${to}_value`;

			if (from in unmapped)
			{
				unmapped[f.schemaName.toLowerCase()] = unmapped[`_${f.schemaName.toLowerCase()}_value`];
				delete unmapped[`_${f.schemaName.toLowerCase()}_value`];
			}
		});

	return mapEntity(metadata, unmapped);
}

export type DataverseApi = ReturnType<typeof dataverseApi>;


