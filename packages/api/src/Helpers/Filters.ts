

/**
 * Checks if the value is not null or undefined
 * @param value The value to check
 * @returns true if the value is not null or undefined; otherwise false
 */
export function hasValue<T>(value: T): value is NonNullable<T>
{
    return value !== undefined && value !== null;
}

/**
 * Checks if the value is null or undefined
 * @param value The value to check
 * @returns true if the value is null or undefined; otherwise false
 */
export function hasNoValue<T, NT extends T | null | undefined>(value: NT): value is Exclude<NT, T>
{
    return value === undefined || value === null;
}

/**
 * Checks if the value is not null, undefined or false.
 * @param value The value to check
 * @returns true if the value is null, undefined or false; otherwise false
 */
export function notFalseAndHasValue<T>(value: T | false): value is NonNullable<T>
{
    return value !== false && hasValue<T>(value);
}

export function hasValueAndNotEmtpyString<T>(value: T | null | undefined): value is Exclude<T, null | undefined | "">
{
    if(typeof value === "string" && value.trim() === "")
        return false;
    return hasValue(value);
}
