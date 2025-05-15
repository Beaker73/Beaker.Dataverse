export function objectEntries<K extends string, V>(obj: Record<K, V>)
{
	return Object.entries(obj) as [K, V][];
}

export function objectNumEntries<K extends number, V>(obj: Record<K, V>)
{
	return Object.entries(obj).map(([k, v]) => [parseInt(k) as K, v]) as [K, V][];
}

export function groupBy<T, K extends string>(
	items: T[], 
	keySelector: (item: T) => K
)
{
	const groups = {} as Record<string, T[]>;
	for(const item of items)
	{
		const key = keySelector(item);
		const group = groups[key] ?? [];
		group.push(item);
		groups[key] = group;
	}
	return groups;
}

const _emptyArray: unknown[] = Object.freeze([] as unknown[]) as unknown[];

/**
 * Returns a stable, never changing, frozen empty array (always the same immutable instance)
 * @returns Stable, never changing, frozen emtpy array
 */
export function emptyArray<T>(): T[] 
{
	return _emptyArray as T[];
}

// Either key selector is given, or not
type KeySelector<T> = undefined | ((item: T) => string);
// If key selector given, we accept any type; otherwise it must be a string, or implement getKey method
type DistinctType<KS> = KS extends undefined ? (string | { getKey(): string }) : unknown;

/** Returns a set of distinct items based on their key */
export function distinct<T extends DistinctType<KS>, KS extends KeySelector<T>>(items: T[], keySelector?: KS): T[] 
{
	const getKey = (item: T) => item === undefined ? undefined
		: item === null ? undefined
			: keySelector ? keySelector(item)
				: typeof item === "string" ? item
					: typeof item === "object" && item !== null && "getKey" in item && typeof item.getKey === "function" ? item.getKey()
						: item;

	return items.filter((value, index) => 
	{
		const key = getKey(value);
		const i = items.findIndex(i => getKey(i) === key);
		return i === index;
	});
}

// cyrb53 hash function
// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
/**
 * Hashes a string using the cyrb53 algorithm
 * @param str The string to hash
 * @param seed The optional seed for the hash
 * @returns The hash value
 */
export function hash(str: string, seed = 0): number
{
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) 
	{
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
