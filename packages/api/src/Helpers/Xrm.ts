import memoize from "fast-memoize";

export type SchemaName<Metadata extends { schemaName: string } | string = string> = Metadata extends string ? Metadata : Metadata extends { schemaName: string } ? Metadata["schemaName"] : string;
export type LogicalName<Metadata extends { schemaName: string } | string = string> = Lowercase<SchemaName<Metadata>>;

/// Gets the schema name from the object
export const schemaName = memoize(
    <Metadata extends ({ schemaName: string } | string)>(metadata: Metadata): SchemaName<Metadata> =>
    {
        if(typeof metadata === "string")
            return metadata as SchemaName<Metadata>;
        return metadata.schemaName as SchemaName<Metadata>;
    }
);

/// Gets the schema name from the object and converts it to a logical name (lowercase).
export const logicalName = memoize(
    <Metadata extends { schemaName: string } | SchemaName>(metadata: Metadata): LogicalName<Metadata> => 
    {
        if(typeof metadata === "string")
            return metadata.toLowerCase() as LogicalName<Metadata>;
        return metadata.schemaName.toLowerCase() as LogicalName<Metadata>;
    }
);