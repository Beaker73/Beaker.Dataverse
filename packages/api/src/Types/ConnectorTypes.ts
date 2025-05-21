import type { Guid } from "../Helpers/Types";

/** Raw data of a retrieved entity */
export type EntityData = Record<string, CoreServerType>;

/** Reference to another entity */
export interface EntityReference<
	TSchemaName extends string = string,
> {
	/** The schema name of the entity being referenced */
	schemaName: TSchemaName,
	/** The unique identifier of the entity */
	id: Guid<TSchemaName>,
	/** Optional, if metadata was retrieved with names, this might be filled */
	name?: string,
}

export type CoreServerType = string | Guid | number | boolean | null | EntityReference;
