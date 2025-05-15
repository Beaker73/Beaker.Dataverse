/**
 * Very basic query object that has no type information and expects most validation to be done by higher layers.
 */
export interface Query
{
	/** The schema name of the entity to fetch */
	schemaName: string,

	/** The schema names of the fields to fetch */
	fields: string[],

	/** Filters to apply during the retrieve */
	filter?: QueryFilter

	/** The max number of records to fetch */
	top?: number,
}

export interface QueryFilter
{
	modus: "and" | "or",
	operations: QueryFilterOperation[],
	filters: QueryFilter[],
}

export interface QueryFilterOperation
{
	fieldName: string,
	operator: Operator,
	value: unknown,
}

export type Operator = "in" | "eq" | "ne" | "gt" | "ge" | "lt" | "le" | "in" | "contains" | "startswith" | "endswith";
