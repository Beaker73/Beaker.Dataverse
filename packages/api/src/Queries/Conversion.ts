import { convertFieldToServer } from "../EntityMapper";
import type { QOp, QueryFilter } from "../Query";
import type { EntityMetadata } from "../Metadata";
import type { EntityMatch } from "./Match";
import { isAndExpression, isOrExpression } from "./Match";
import type { NestedAndQuery, NestedOrQuery, Query } from "./Query";
import { Operator } from "./Query";

/**
 * Converts a entity match to a full blown query
 * @param metadata The metadata of the entity of the match/query
 * @param match The match to convert
 * @returns The resulting query
 */
export function matchToQuery<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string
>(
	_metadata: TEntity,
	match: Partial<EntityMatch<TEntity, TSchemaName>>,
): Query<TEntity, TSchemaName> {
	const query: Query<TEntity, TSchemaName> = [];

	for (const [key, value] of Object.entries(match)) {
		if (isOrExpression(value)) {
			const q: NestedOrQuery<TEntity, TSchemaName> = { or: [] };

			for (const v of value.values)
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- low level, no type safety anymore
				q.or.push({ field: key, operator: Operator.Equal, value: v as any });

			query.push(q);
		}
		else if (isAndExpression(value)) {
			const q: NestedAndQuery<TEntity, TSchemaName> = { and: [] };

			for (const v of value.values)
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- low level, no type safety anymore
				q.and.push({ field: key, operator: Operator.Equal, value: v as any });

			query.push(q);
		}
		else {
			query.push({ field: key, operator: Operator.Equal, value });
		}
	}

	return query;
}

/**
 * 
 * @param metadata The metadata of the entity to query for
 * @param query The query to convert
 * @param modus The modus of the query (defaults to and)
 * @returns The low level QueryFilter object
 */
export function queryToFilter<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string
>(
	metadata: TEntity,
	query: Query<TEntity, TSchemaName>,
	modus: "and" | "or" = "and",
)
	: QueryFilter {
	const filter: QueryFilter = { modus, operations: [], filters: [] };

	for (const fieldQuery of query) {
		if ("or" in fieldQuery && Object.keys(fieldQuery).length === 1) {
			filter.filters.push(queryToFilter<TEntity, TSchemaName>(metadata, fieldQuery.or, "or"));
		}
		else if ("and" in fieldQuery && Object.keys(fieldQuery).length === 1) {
			filter.filters.push(queryToFilter<TEntity, TSchemaName>(metadata, fieldQuery.and, "and"));
		}
		else if ("field" in fieldQuery && typeof fieldQuery.field === "string") {
			const qop = "operator" in fieldQuery ? fieldQuery.operator ?? Operator.Equal : Operator.Equal;

			const field = metadata.fields[fieldQuery.field];
			filter.operations.push({
				fieldName: field.schemaName.toLowerCase(),
				operator: operator(qop),
				value: qop === Operator.Null || qop === Operator.NotNull ? null
					: "value" in fieldQuery ? convertFieldToServer(field, fieldQuery.value) : undefined,
			});
		}
	}

	return filter;
}

function operator(op: Operator): QOp {
	switch (op) {
		case Operator.Equal: return "eq";
		case Operator.NotEqual: return "ne";
		case Operator.GreaterThan: return "gt";
		case Operator.GreaterThanOrEqual: return "ge";
		case Operator.LessThan: return "lt";
		case Operator.LessThanOrEqual: return "le";
		case Operator.Null: return "eq";
		case Operator.NotNull: return "ne";
		case Operator.In: return "in";
		case Operator.Contains: return "contains";
		case Operator.StartsWith: return "startswith";
		case Operator.EndsWith: return "endswith";
	}
}