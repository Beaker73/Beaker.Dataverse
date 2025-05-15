import { v4 } from "uuid";

/**
 * Merge two types together
 * base on: https://stackoverflow.com/questions/49682569/typescript-merge-object-types
 */

type OptionalPropertyNames<T> =
	{ [K in keyof T]-?: (object extends { [P in K]: T[K] } ? K : never) }[keyof T];

type MergeProperties<L, R, K extends keyof L & keyof R> =
	{ [P in K]: L[P] | Exclude<R[P], undefined> };

type Prop<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

type MergeTwo<L, R> = Prop<
& Pick<L, Exclude<keyof L, keyof R>>
& Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>>
& Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>>
& MergeProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Merge<A extends readonly [...any]> = A extends [infer L, ...infer R] ?
	MergeTwo<L, Merge<R>> : unknown;

// -----------------------------

export const tags = Symbol("tags");

/** Tags any type with special compile time values */
export type Tag<
	TBase,
	TTag extends string | symbol,
	TValue = unknown
> = TBase extends { [tags]: infer TTags extends object }
	? TTags extends { rootType?: [infer TRoot] }
		? TRoot extends object
			? Merge<[TRoot, { [tags]: Merge<[TTags, { [K in TTag]: TValue }]> }]>
			: TRoot & { [tags]: Merge<[TTags, { [K in TTag]: TValue }]> }
		: Merge<[TBase, { [tags]: Merge<[TTags, { [K in TTag]: TValue }]> }]>
	: GetRoot<TBase> extends object
		? Merge<[TBase, { [tags]: Merge<[{ [K in TTag]: TValue }, { rootType?: [GetRoot<TBase>] }]> }]>
		: TBase & { [tags]: Merge<[{ [K in TTag]: TValue }, { rootType?: [GetRoot<TBase>] }]> }
	;

/** Gets the root type of T, if not tagged returns T itself */
export type GetRoot<T> = T extends { [tags]: { rootType?: [infer TRoot] } } ? TRoot : ClearTags<T>;

// type Banana = Tag<string, "type", "Banana">;


/** Gets a specific tag from a tagged type */
export type GetTag<
	TTagged extends { [tags]: Record<string, unknown> },
	TTag extends string | symbol
// eslint-disable-next-line @typescript-eslint/no-explicit-any
> = TTagged extends { [tags]: infer TTags extends { [K in TTag]: any } }
	? TTags[TTag] : never;

/** 
 * Creates a type that allows for testing if it extends the tag (i.e. if it has the tag)
 * @example MyType extends HasTag<"type"> ? "has type tag" : "does not have type tag";
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HasTag<TTag extends string | symbol> = { [tags]: { [K in TTag]: any } };


/** Clears a tagged type from all its tags to get the root type back */
export type ClearTags<T> = T extends { readonly [tags]: object }
	? T extends { readonly [tags]: { rootType?: [infer TRoot] } }
		? TRoot
		: Omit<T, typeof tags>
	: T;


/** String that holds a Guid */
type GuidType = Tag<string, "type", "Guid">;
export type Guid<TSchemaName extends string = string> = Tag<GuidType, "schemaName", TSchemaName>;

// type TestId = Guid<"pw_Test">;
// type SingleTaggedWithEmbed = Tag<{ id: TestId }, "type", "Entity">;
// type DoubleTaggedWithEmbed = Tag<Tag<{ id: TestId }, "type", "Entity">, "schemaName", "pw_Test">;
// type Id = ClearTags<TestId>;
// type SchemaName = GetTag<TestId, "schemaName">;
// type Type = GetTag<TestId, "type">;
// type Ex = ExtendsTag<"type">;

/** Generates a new random Guid */
type NewGuid<TSchemaName extends string | undefined> = TSchemaName extends undefined ? Guid : Guid<NonNullable<TSchemaName>>;
export function newGuid<TSchemaName extends string | undefined = undefined>(): NewGuid<TSchemaName>
{
	return v4() as unknown as NewGuid<TSchemaName>;
}

const guidRegex = /^\{?([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})\}?$/i;

/**
 * Tries to parse a string as a Guid
 * @param possibleGuid the string that might be a guid
 * @returns The parsed guid
 * @throws Error if the string is not a valid guid
 */
export function parseGuid<T extends string | undefined | null, G extends (T extends undefined | null ? Guid | undefined : Guid)>(possibleGuid: T): G
{
	if (!possibleGuid)
		return undefined as G;

	const falseOrGuid = tryParseGuid<T, NonNullable<G>>(possibleGuid);
	if (falseOrGuid === false)
		throw new Error(`Could not parse ${possibleGuid} as a Guid`);

	return falseOrGuid;
}

export function tryParseGuid<T extends string | undefined | null, G extends Guid>(possibleGuid: T): false | G
{
	if (!possibleGuid)
		return false;

	const m = possibleGuid.match(guidRegex);
	if (m === null)
		return false;

	return `${m[1]}-${m[2]}-${m[3]}-${m[4]}-${m[5]}`.toLowerCase() as G;
}



/** String that holds a some type of key for type T */
export type Key<T extends string | undefined = undefined> = T extends undefined ? Tag<string, "type", "Key"> : Tag<Tag<string, "type", "Key">, "keyType", T>;


/** Gets all keys of requested type, unline keyof which returns all keys */
export type KeysOfType<TObject, TFilterType> = { [TKey in keyof TObject]-?: TObject[TKey] extends TFilterType ? TKey : never }[keyof TObject];

export type Base64String = Tag<string, "type", "base64">;