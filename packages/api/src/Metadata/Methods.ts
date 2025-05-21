import { FieldMetadata, BaseTypeFromMetadata } from ".";
import { EntityMetadata } from "./Entity";

export type EntityMetadataWithMethods<
    TEntityMetadata extends EntityMetadata, 
    TMethods extends Record<string, (self: BaseTypeFromMetadata<TEntityMetadata>) => any>,
> =
    TEntityMetadata &
    {
        methods: TMethods,
    };


export function withMethods<
    TMethods extends Record<string, (self: TEntity) => any>,
    TMetadata extends EntityMetadata<TSchemaName, TFields>,
    TSchemaName extends string = TMetadata extends EntityMetadata<infer TSchemaName, infer _TFields> ? TSchemaName : never,
    TFields extends Record<string, FieldMetadata> = TMetadata extends EntityMetadata<TSchemaName, infer TFields> ? TFields : never,
    TEntity extends BaseTypeFromMetadata<TMetadata> = BaseTypeFromMetadata<TMetadata>,
>(
    metadata: TMetadata,
    methods: TMethods,
) {
    return {
        ...metadata,
        methods
    } as const; // satisfies EntityMetadataWithMethods<TMetadata, TMethods>;
}

export function hasMethods<TMetadata extends EntityMetadata>(
    metadata: TMetadata,
): metadata is EntityMetadataWithMethods<
    TMetadata, 
    TMetadata extends { "methods": any } 
        ? TMetadata["methods"]
        : never
    >
{
    return "methods" in metadata;
}
