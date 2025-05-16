import { Entity, EntityMetadata, TypeFromMetadata } from "../Metadata";
import { EntityMatch } from "../Queries/Match";
import { Query } from "../Queries/Query";

export type TypedApi<
    TMetadata extends EntityMetadata,
    TEntity extends Entity = TypeFromMetadata<TMetadata>
> = {
    create(entity: TEntity): Promise<TEntity["id"]>,
    update(entity: TEntity): Promise<void>,
    delete(id: TEntity["id"]): Promise<void>,
    saveChanges(entity: TEntity): Promise<TEntity["id"]>,
    retrieve(id: TEntity["id"], options?: { includeNamesOfReferences?: boolean }): Promise<TEntity>,
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
        },
    ): Promise<TExpectSingle extends true ? TEntity : TEntity[]>,
};