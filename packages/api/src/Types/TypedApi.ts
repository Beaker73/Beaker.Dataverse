import { Entity, EntityMetadata, ExtendedTypeFromMetadata, BaseTypeFromMetadata } from "../Metadata";
import { EntityMatch } from "../Queries/Match";
import { Query } from "../Queries/Query";

export type TypedApi<
    TMetadata extends EntityMetadata,
    TEntityData extends Entity = BaseTypeFromMetadata<TMetadata>,
    TEntity extends TEntityData = TMetadata extends { "methods": any } ? ExtendedTypeFromMetadata<TMetadata> : TEntityData,
> = {
    create(entity: TEntityData): Promise<TEntity["id"]>,
    update(entity: TEntityData): Promise<void>,
    delete(id: TEntityData["id"]): Promise<void>,
    saveChanges(entity: TEntityData): Promise<TEntity["id"]>,
    retrieve(id: TEntityData["id"], options?: { includeNamesOfReferences?: boolean }): Promise<TEntity>,
    retrieveMultiple<TExpectSingle extends boolean = false, TRequireData extends boolean = false>(
        options?: {
            /** Matches by example */
            match?: Partial<EntityMatch<TMetadata, TMetadata["schemaName"]>>,
            /** Full Filtering Query */
            query?: Query<TMetadata, TMetadata["schemaName"]>,
            /** Expects a single result, throws if multiple found. */
            expectSingle?: TExpectSingle,
            /** Expects at least one result or more, throws if none found */
            requireData?: TRequireData,
            /** Limit to the top n number of rows */
            top?: number,
            /** Abort signal to abort the fetch early if needed */
            abortSignal?: AbortSignal,
            /** The page size per fetched page */
            pageSize?: number,
        },
    ): Promise<TExpectSingle extends true ? TEntity : TEntity[]>,
};