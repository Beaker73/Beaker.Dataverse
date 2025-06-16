import { coreTag, fieldType, type FieldMetadataBase, type FieldOptions, type FieldSetupOptions } from "./Field";

export interface JsonFieldSetupOptions extends FieldSetupOptions
{
	maxLength?: number,
}

export interface JsonFieldMetadata extends FieldMetadataBase
{
	type: "json",
	options: JsonFieldOptions,
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JsonFieldOptions extends FieldOptions
{
	/** The maximum length of the JSON string, defaults to 1000 */
	maxLength: number,
}

function jsonConstructor<
	const TSchemaName extends string,
	const Options extends JsonFieldSetupOptions,
	const TJsonType extends object = object,
>(
	schemaName: TSchemaName,
	options?: Options,
)
{
	type TNullableJsonType = Options extends { optional: true } ? (TJsonType | null) : TJsonType;
	type TType = Options extends { converter: infer TUserConverter } 
		? TUserConverter extends { convert(value: any): infer TUserValue }
			? TUserValue
			: TNullableJsonType
		: TNullableJsonType;

	const metadata = {
		schemaName,
		type: "json",
		options: {
			optional: (options?.optional ?? false) as Options extends { optional: true } ? true : false,
			readOnly: (options?.readOnly ?? false) as Options extends { readOnly: true } ? true : false,
			maxLength: (options?.maxLength ?? 1000) as Options extends { maxLength: infer N extends number } ? N : 1000,
			converter: options?.converter ?? null,
		} as JsonFieldOptions,
	} as JsonFieldMetadata;

	return coreTag<TType>()(metadata);
}

export const json = fieldType(jsonConstructor, "json", {
	convert: {
		toClientModel: value => typeof value === "string" ? JSON.parse(value) : null,
		toServerModel: value => JSON.stringify(value),
	},
});

export function typedJson<TJsonType extends object>()
{
	return <
		TSchemaName extends string,
		TOptions extends JsonFieldSetupOptions
	>(schemaName: TSchemaName, options?: TOptions) =>
		json<TSchemaName, TOptions, TJsonType>(schemaName, options);
}