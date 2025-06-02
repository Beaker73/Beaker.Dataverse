import { Base64String } from "../Helpers";
import { coreTag, FieldMetadataBase, FieldOptions, FieldSetupOptions, fieldType } from "./Field";

export interface ImageFieldSetupOptions extends FieldSetupOptions
{
	maxSize?: number,
}

export interface ImageFieldMetadata extends FieldMetadataBase
{
	type: "image",
	options: ImageFieldOptions,
}

export interface ImageFieldOptions extends FieldOptions
{
	maxSize: number,
}

function imageConstructor<
	const TSchemaName extends string,
	const TOptions extends ImageFieldSetupOptions,
>(
	schemaName: TSchemaName,
	options?: TOptions,
)
{
	const metadata = {
		schemaName,
		type: "image",
		options: {
			optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
			readOnly: (options?.readOnly ?? false) as TOptions extends { readOnly: true } ? true : false,
			maxSize: (options?.maxSize ?? 10240 * 1024) as TOptions extends { maxSize: infer N extends number } ? N : 10240 * 1024,
		} satisfies ImageFieldOptions,
	} satisfies ImageFieldMetadata;

	return coreTag<Base64String>()(metadata);
}

export const image = fieldType(imageConstructor, "image");