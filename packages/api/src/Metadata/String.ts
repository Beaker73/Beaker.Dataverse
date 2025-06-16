import type { Issue } from "../Helpers";
import type { FieldMetadataBase, FieldOptions, FieldSetupOptions } from "./Field";
import { coreTag, fieldType } from "./Field";

/** The options for setting up a string field */
export interface StringFieldSetupOptions extends FieldSetupOptions
{
	/** The maximum length of the string field, defaults to 100 (same as default for Dataverse) */
	maxLength?: number,
	/** Optional format of the string */
	format?: "url" | "email" | "phone",
	/** If set to true, this string represents a key/indentifier for the record */
	key?: boolean,
}

/** The metadata that represents a string field */
export interface StringFieldMetadata extends FieldMetadataBase
{
	/** The type of the field */
	type: "string",
	/** The options for the string field */
	options: StringFieldOptions,
}

export type StringFormat = "plain" | "url" | "email" | "phone";

/** The configured options for a string field */
export interface StringFieldOptions extends FieldOptions
{
	/** The maximum length of the string */
	maxLength: number,
	/** The format of the string */
	format: StringFormat,
	/** If set, this string represents a key/identifier for the record */
	key: boolean,
}

/**
 * Creates the metadata representing a string field
 * @param schemaName The schema name of the field
 * @param options The options for the string field
 * @returns The metadata representing the string field
 */
function stringConstructor<
	TSchemaName extends string,
	TOptions extends StringFieldSetupOptions,
	TSubType extends string = string,
>(
	schemaName: TSchemaName,
	options?: TOptions,
)
{
	type TType = TOptions extends { converter: infer TUserConverter } 
		? TUserConverter extends { convert(value: any): infer TUserValue }
			? TUserValue
			: TSubType
		: TSubType;
		
	const metadata = {
		schemaName,
		type: "string",
		options: {
			optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
			maxLength: (options?.maxLength ?? 100) as TOptions extends { maxLength: infer N extends number } ? N : 100,
			format: (options?.format ?? "plain") as TOptions extends { format: infer TFormat extends StringFormat } ? (TFormat extends undefined ? "plain" : TFormat) : StringFormat,
			key: (options?.key ?? false) as TOptions extends { key: true } ? true : false,
			converter: options?.converter ?? null,
		} satisfies StringFieldOptions,
	} satisfies StringFieldMetadata;

	return coreTag<TType>()(metadata);
}

export const string = fieldType(stringConstructor, "string", {
	validate: (value, field) => 
	{
		return [...validate()];

		function* validate(): Generator<Issue>
		{
			if (value.length > field.options.maxLength)
				yield { level: "error", message: `The field '${field.schemaName}' with value '${value}' has a length of ${value.length} which is to long, the maximum length is ${field.options.maxLength}.` };

			switch (field.options.format)
			{
			case "url":
				if (!isValidUrl(value))
					yield { level: "error", message: "The value is not a valid URL." };
				break;
			case "email":
				if (!isValidEmail(value))
					yield { level: "error", message: "The value is not a valid Email." };
				break;
			case "phone":
				if (!isValidPhone(value))
					yield { level: "error", message: "The value is not a valid Phone number." };
				break;
			}
		}
	},
});

export function typedString<
	TSubType extends string,
>() 
{
	return <
		TSchemaName extends string,
		TOptions extends StringFieldSetupOptions,
	>(schemaName: TSchemaName, options?: TOptions) =>
		string<TSchemaName, TOptions, TSubType>(schemaName, options);
}

function isValidUrl(value: string): boolean 
{
	try 
	{
		new URL(value);
		return true;
	}
	catch 
	{
		return false;
	}
}

function isValidEmail(value: string): boolean 
{
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean 
{
	return /^\+?[0-9\-. ]+$/.test(value);
}

/**
 * Creates the metadata representing a string field with url formatting
 * @param schemaName The schema name of the field
 * @param options The options for the string field
 * @returns The metadata representing the string field
 */
export function url<SchemaName extends string, Options extends undefined | Omit<StringFieldSetupOptions, "format">>(schemaName: SchemaName, options?: Options) 
{
	return string<SchemaName, Options & { format: "url" }>(schemaName, { ...options, format: "url" } as Options & { format: "url" });
}

/**
 * Creates the metadata representing a string field with email formatting
 * @param schemaName The schema name of the field
 * @param options The options for the string field
 * @returns The metadata representing the string field
 */
export function email<SchemaName extends string, Options extends undefined | Omit<StringFieldSetupOptions, "format">>(schemaName: SchemaName, options?: Options) 
{
	return string<SchemaName, Options & { format: "email" }>(schemaName, { ...options, format: "email" } as Options & { format: "email" });
}

/**
 * Creates the metadata representing a string field with phone formatting
 * @param schemaName The schema name of the field
 * @param options The options for the string field
 * @returns The metadata representing the string field
 */
export function phone<SchemaName extends string, Options extends Omit<StringFieldSetupOptions, "format">>(schemaName: SchemaName, options?: Options) 
{
	return string<SchemaName, Options & { format: "phone" }>(schemaName, { ...options, format: "phone" } as Options & { format: "phone" });
}

/**
 * Creates the metadata representing a string field that behaves as a key/identifier
 * @param schemaName The schema name of the field
 * @param options The options for the string field
 * @returns The metadata representing the string field
 */
export function key<SchemaName extends string, Options extends Omit<StringFieldSetupOptions, "format" | "key" | "optional">>(schemaName: SchemaName, options?: Options) 
{
	return string<SchemaName, Options & { key: true }>(schemaName, { ...options, key: true } as Options & { key: true });
}
