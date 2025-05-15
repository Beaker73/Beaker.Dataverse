import { hasValue } from "../Helpers";
import type { EntityMetadata } from "../Metadata";
import type { Query } from "./Query";

/**
 * Merges multiples queries into a single query via AND
 * @param queries The queries to merge
 * @returns The merged query
 */
export function mergeQueries<
	TEntity extends EntityMetadata<TSchemaName>,
	TSchemaName extends string
>(
	...queries: Query<TEntity, TSchemaName>[]
): Query<TEntity, TSchemaName>
{
	return [
		{ and: queries.filter(hasValue).map(q => ({ and: q })) },
	] satisfies Query<TEntity, TSchemaName>;
}
