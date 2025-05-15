import type { EntityMetadata, FieldMetadataBase, StringFieldMetadata } from "../Metadata";
import type { FieldType } from "../Metadata/Derive";

export type EntityMatch<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string = TEntity["schemaName"]
> = {
	[K in keyof TEntity["fields"]]: FieldMatch<TEntity, TSchemaName, K, TEntity["fields"][K], FieldType<TEntity["fields"][K]>>;
} & {
	or?: EntityMatch<TEntity, TSchemaName>,
	and?: EntityMatch<TEntity, TSchemaName>,
};

export type FieldMatch<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"],
	TField extends FieldMetadataBase = TEntity["fields"][TFieldName],
	T = FieldType<TField>
> =
	| T
	| OrExpression<TEntity, TSchemaName, TFieldName, TField, T>
	| AndExpression<TEntity, TSchemaName, TFieldName, TField, T>
	| (T extends string ? TField extends StringFieldMetadata ? ContainsExpression : never : never)
	| (T extends string ? TField extends StringFieldMetadata ? StartsWithExpression : never : never)
	| (T extends string ? TField extends StringFieldMetadata ? EndsWithExpression : never : never)
	;


const expressionType = Symbol();

export function isOrExpression(
	value: unknown,
): value is { values: unknown[] }
{
	return typeof value === "object" && value !== null && expressionType in value && value[expressionType] === "or";
}

type OrExpression<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"],
	TField extends FieldMetadataBase,
	T = FieldType<TField>
> = {
	[expressionType]: "or",
	values: FieldMatch<TEntity, TSchemaName, TFieldName, TField, T>[],
};

export function or<T>(...values: T[])
{
	return {
		[expressionType]: "or",
		values,
	} as const;
}

export function isAndExpression(
	value: unknown,
): value is { values: unknown[] }
{
	return typeof value === "object" && value !== null && expressionType in value && value[expressionType] === "and";
}

type AndExpression<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"],
	TField extends FieldMetadataBase,
	T = FieldType<TField>
> = {
	[expressionType]: "and",
	values: FieldMatch<TEntity, TSchemaName, TFieldName, TField, T>[],
};

export function and<T>(...values: T[])
{
	return {
		[expressionType]: "and",
		values,
	} as const;
}


type ContainsExpression = {
	[expressionType]: "contains",
	value: string,
};

export function contains<T>(value: T)
{
	return {
		[expressionType]: "contains",
		value,
	} as const;
}


type EndsWithExpression = {
	[expressionType]: "endswith",
	value: string,
};

export function endsWith<T>(value: T)
{
	return {
		[expressionType]: "endswith",
		value,
	} as const;
}


type StartsWithExpression = {
	[expressionType]: "startswith",
	value: string,
};

export function startsWith<T>(value: T)
{
	return {
		[expressionType]: "startswith",
		value,
	} as const;
}