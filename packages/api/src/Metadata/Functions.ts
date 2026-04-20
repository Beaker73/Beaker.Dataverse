import { TypeFromMetadata } from "./Derive";
import { EntityMetadata } from "./Entity";

export type EntityFunction<TMetadata> = 
    | ((entity: TypeFromMetadata<TMetadata>) => unknown) // function for a property
    | ((entity: TypeFromMetadata<TMetadata>) => (...args: any[]) => unknown) // function for a method, returns a function that takes arguments
    ;

export type EntityFunctions<TMetadata> = Record<string, EntityFunction<TMetadata>>;

export function extend<TBase extends EntityMetadata, TFunctions extends EntityFunctions<TBase>>(metadata: TBase, functions: TFunctions): TBase & { functions: TFunctions } 
{
    return {
        ...metadata,
        functions,
    };
}