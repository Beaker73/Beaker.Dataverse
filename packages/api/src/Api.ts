import { ApiConnector, DataverseAction } from "./Types/Connector";
import { TypedApi } from "./Types/TypedApi";
import { TypeFromMetadata } from "./Metadata/Derive";
import { Entity, EntityMetadata } from "./Metadata/Entity";
import { DataverseApi, dataverseApi } from "./DataverseApi";
import { Guid } from "./Helpers";
import { EntityMatch } from "./Queries/Match";
import { Query } from "./Queries/Query";

export type ApiBaseUrlString = `https://${string}`;
export type ApiVersionString = `${number}.${number}`;

export type ApiOptions = {
    connector: ApiConnector,
    sets: Record<string, EntityMetadata>,
}


export type ApiForEntities<TOptions extends ApiOptions> = {
    [TKey in keyof TOptions["sets"]]: TypedApi<TOptions["sets"][TKey]>;
}
    & Pick<DataverseApi, "whoAmI" | "getOptionSetValues" | "getODataSetName">
    ;

export function api<TOptions extends ApiOptions>(options: TOptions)
    : ApiForEntities<TOptions> {
    const baseApi = dataverseApi(options.connector);

    return {

        ...Object.fromEntries(
            Object.entries(options.sets)
                .map(([key, metadata]) => [key, typedApi(metadata)])),

        whoAmI: baseApi.whoAmI,
        getOptionSetvalues: baseApi.getOptionSetValues,
        getODataSetName: baseApi.getODataSetName,

    } as unknown as ApiForEntities<TOptions>;

    function typedApi<TMetadata extends EntityMetadata>(metadata: TMetadata) {

        type TEntity = TypeFromMetadata<TMetadata>;
        type TSchemaName = TMetadata["schemaName"];

        return {
            create: (entity: TEntity) => baseApi.create<TEntity>(entity),
            update: (entity: TEntity) => baseApi.update<TEntity>(entity),
            remove: (id: Guid<TSchemaName>) => baseApi.remove<TMetadata>(metadata, id),
            saveChanges: (entity: TEntity) => baseApi.saveChanges<TEntity>(entity),
            retrieve: (id: Guid<TSchemaName>, options?: { includeNamesOfReferences?: boolean }) => baseApi.retrieve<TMetadata>(metadata, id, options),
            retrieveMultiple: <
                TExpectSingle extends boolean = false,
                TRequireData extends boolean = false
            >(
                options?: {
                    /** Matches by example */
                    match?: NoInfer<Partial<EntityMatch<TMetadata, TSchemaName>>>,
                    /** Full Filtering Query */
                    query?: NoInfer<Query<TMetadata, TSchemaName>>
                    /** Expects a single result, throws if multiple found. */
                    expectSingle?: TExpectSingle,
                    /** Expects at least one result or more, throws if none found */
                    requireData?: TRequireData,
                    /** Limit to the top n number of rows */
                    top?: number,
                },
            ) => baseApi.retrieveMultiple<TMetadata, TSchemaName, TEntity, TExpectSingle, TRequireData>(metadata, options),
            execute: (entity: TEntity, action: Omit<DataverseAction, "boundTo">) => baseApi.execute({ ...action, boundTo: entity }),
        } as const;
    }

}