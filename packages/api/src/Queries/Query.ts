import type { CoreType, EntityMetadata } from "../Metadata";

export type Query<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string = TEntity["schemaName"]
> =
	| NoInfer<FieldQuery<TEntity, TSchemaName>[]>;


export type NestedOrQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string
> = {
	or: NoInfer<Query<TEntity, TSchemaName>>,
};

export type NestedAndQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string
> = {
	and: NoInfer<Query<TEntity, TSchemaName>>,
};


export type FieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string = TEntity["schemaName"],
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T = CoreType<TEntity["fields"][TFieldName]>
> =
	| EqualsFieldQuery<TEntity, TSchemaName, TFieldName, T>
	| NotEqualsFieldQuery<TEntity, TSchemaName, TFieldName, T>
	| GreaterThenFieldQuery<TEntity, TSchemaName, TFieldName, T>
	| GreaterThenOrEqualFieldQuery<TEntity, TSchemaName, TFieldName, T>
	| LessThenFieldQuery<TEntity, TSchemaName, TFieldName, T>
	| LessThenOrEqualFieldQuery<TEntity, TSchemaName, TFieldName, T>
	| NullFieldQuery<TEntity, TSchemaName, TFieldName>
	| NotNullFieldQuery<TEntity, TSchemaName, TFieldName>
	| InFieldQuery<TEntity, TSchemaName, TFieldName>
	| (T extends string ? ContainsFieldQuery<TEntity, TSchemaName, TFieldName, T> : never)
	| (T extends string ? StartsWithFieldQuery<TEntity, TSchemaName, TFieldName, T> : never)
	| (T extends string ? EndsWithFieldQuery<TEntity, TSchemaName, TFieldName, T> : never)
	| NestedAndQuery<TEntity, TSchemaName>
	| NestedOrQuery<TEntity, TSchemaName>
	;

/** The allowed operators for field queries */
export const enum Operator
	{
	Equal = "eq",
	NotEqual = "ne",
	Null = "eq null",
	NotNull = "ne null",
	Contains = "contains",
	StartsWith = "startswith",
	EndsWith = "endswith",
	In = "in",
	GreaterThan = "gt",
	GreaterThanOrEqual = "ge",
	LessThan = "lt",
	LessThanOrEqual = "le",
}

export type EqualsFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T = CoreType<TEntity["fields"][TFieldName]>
> = {
	field: TFieldName,
	operator?: Operator.Equal, // equals is the default, so use may omit it
	value: NoInfer<T>,
};

export type NotEqualsFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T = CoreType<TEntity["fields"][TFieldName]>
> = {
	field: TFieldName,
	operator: Operator.NotEqual,
	value: NoInfer<T>,
};

export type GreaterThenFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T = CoreType<TEntity["fields"][TFieldName]>
> = {
	field: TFieldName,
	operator: Operator.GreaterThan,
	value: NoInfer<T>,
};

export type GreaterThenOrEqualFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T = CoreType<TEntity["fields"][TFieldName]>
> = {
	field: TFieldName,
	operator: Operator.GreaterThanOrEqual,
	value: NoInfer<T>,
};

export type LessThenFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T = CoreType<TEntity["fields"][TFieldName]>
> = {
	field: TFieldName,
	operator: Operator.LessThan,
	value: NoInfer<T>,
};

export type LessThenOrEqualFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T = CoreType<TEntity["fields"][TFieldName]>
> = {
	field: TFieldName,
	operator: Operator.LessThanOrEqual,
	value: NoInfer<T>,
};

export type NullFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"]
> = {
	field: TFieldName,
	operator: Operator.Null,
};


export type NotNullFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"]
> = {
	field: TFieldName,
	operator: Operator.NotNull,
};

export type InFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T = CoreType<TEntity["fields"][TFieldName]>
> = {
	field: TFieldName,
	operator: Operator.In,
	value: T[],
};

export type ContainsFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T extends string = CoreType<TEntity["fields"][TFieldName]> extends string ? CoreType<TEntity["fields"][TFieldName]> : never,
> = {
	field: TFieldName,
	operator: Operator.Contains
	value: NoInfer<T>,
};


export type StartsWithFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T extends string = CoreType<TEntity["fields"][TFieldName]> extends string ? CoreType<TEntity["fields"][TFieldName]> : never,
> = {
	field: TFieldName,
	operator: Operator.StartsWith
	value: NoInfer<T>,
};


export type EndsWithFieldQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string,
	TFieldName extends keyof TEntity["fields"] = keyof TEntity["fields"],
	T extends string = CoreType<TEntity["fields"][TFieldName]> extends string ? CoreType<TEntity["fields"][TFieldName]> : never,
> = {
	field: TFieldName,
	operator: Operator.EndsWith
	value: NoInfer<T>,
};