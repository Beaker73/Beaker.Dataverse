import { Entity, EntityMetadata, TypeFromMetadata } from "../Metadata";
import { EntityMatch } from "../Queries/Match";
import { Query } from "../Queries/Query";

type SelectedEntity<
    TMetadata extends EntityMetadata,
    TEntity extends Entity,
    TSelect extends readonly (keyof TMetadata["fields"])[] | undefined,
> = TSelect extends readonly (keyof TMetadata["fields"])[]
    ? Pick<TEntity, Extract<TSelect[number], keyof TEntity>>
    : TEntity;

export type TypedApi<
    TMetadata extends EntityMetadata,
    TEntity extends Entity = TypeFromMetadata<TMetadata>
> = {
    create(entity: TEntity): Promise<TEntity["id"]>,
    update(entity: TEntity): Promise<void>,
    remove(id: TEntity["id"]): Promise<void>,
    saveChanges(entity: TEntity): Promise<TEntity["id"]>,
    retrieve<
        TSelect extends readonly (keyof TMetadata["fields"])[] | undefined = undefined,
    >(id: TEntity["id"], options?: {
        includeNamesOfReferences?: boolean
        /** Select specific columns only, instead of all of them */
        select?: TSelect,
    }): Promise<SelectedEntity<TMetadata, TEntity, TSelect>>,
    retrieveMultiple<
        TExpectSingle extends boolean = false,
        TRequireData extends boolean = false,
        TSelect extends readonly (keyof TMetadata["fields"])[] | undefined = undefined,
    >(
        options?: {
            /** Select specific columns only, instead of all of them */
            select?: TSelect,
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
    ): Promise<
        TExpectSingle extends true
        ? (TRequireData extends true
            ? SelectedEntity<TMetadata, TEntity, TSelect>
            : SelectedEntity<TMetadata, TEntity, TSelect> | undefined)
        : SelectedEntity<TMetadata, TEntity, TSelect>[]
    >,
};