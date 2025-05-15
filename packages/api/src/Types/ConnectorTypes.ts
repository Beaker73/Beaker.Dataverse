import type { Guid } from "../Helpers/Types";

/** Raw data of a retrieved entity */
export type EntityData = Record<string, CoreServerType>;

/** Reference to another entity */
export interface EntityReference<
	TSchemaName extends string = string,
> {
	schemaName: TSchemaName,
	id: Guid<TSchemaName>,
}

export type CoreServerType = string | Guid | number | boolean | null | EntityReference;
