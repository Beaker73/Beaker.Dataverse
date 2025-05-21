import { Entity, EntityMetadata, ExtendedTypeFromMetadata, BaseTypeFromMetadata } from "../Metadata";
import { EntityMatch } from "../Queries/Match";
import { Query } from "../Queries/Query";

export type TypedApi<
    TMetadata extends EntityMetadata,
    TEntity extends Entity = BaseTypeFromMetadata<TMetadata>,
    TInvokeableEntity extends TEntity = TMetadata extends { "methods": any } ? ExtendedTypeFromMetadata<TMetadata> : TEntity,
> = {
    create(entity: TEntity): Promise<TInvokeableEntity["id"]>,
    update(entity: TEntity): Promise<void>,
    delete(id: TEntity["id"]): Promise<void>,
    saveChanges(entity: TEntity): Promise<TInvokeableEntity["id"]>,
    retrieve(id: TEntity["id"], options?: { includeNamesOfReferences?: boolean }): Promise<TInvokeableEntity>,
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
    ): Promise<TExpectSingle extends true ? TInvokeableEntity : TInvokeableEntity[]>,
};