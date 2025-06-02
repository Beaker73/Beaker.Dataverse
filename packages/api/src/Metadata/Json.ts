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

	const metadata = {
		schemaName,
		type: "json",
		options: {
			optional: (options?.optional ?? false) as Options extends { optional: true } ? true : false,
			readOnly: (options?.readOnly ?? false) as Options extends { readOnly: true } ? true : false,
		} as JsonFieldOptions,
	} as JsonFieldMetadata;

	return coreTag<TNullableJsonType>()(metadata);
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