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
    const TMethods extends Record<string, (self: TEntity) => any>,
    const TMetadata extends EntityMetadata<TSchemaName, TFields>,
    const TSchemaName extends string = TMetadata extends EntityMetadata<infer TSchemaName, infer _TFields> ? TSchemaName : never,
    const TFields extends Record<string, FieldMetadata> = TMetadata extends EntityMetadata<TSchemaName, infer TFields> ? TFields : never,
    const TEntity extends BaseTypeFromMetadata<TMetadata> = BaseTypeFromMetadata<TMetadata>,
>(
    metadata: TMetadata,
    methods: TMethods,
) {
    return {
        ...metadata,
        methods
    } as const; // satisfies EntityMetadataWithMethods<TMetadata, TMethods>;
}

export function hasMethods<const TMetadata extends EntityMetadata>(
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
