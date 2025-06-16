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
	type TType = TOptions extends { converter: infer TUserConverter } 
		? TUserConverter extends { convert(value: any): infer TUserValue }
			? TUserValue
			: Base64String
		: Base64String;

	const metadata = {
		schemaName,
		type: "image",
		options: {
			optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
			maxSize: (options?.maxSize ?? 10240 * 1024) as TOptions extends { maxSize: infer N extends number } ? N : 10240 * 1024,
			converter: options?.converter ?? null,
		} satisfies ImageFieldOptions,
	} satisfies ImageFieldMetadata;

	return coreTag<TType>()(metadata);
}

export const image = fieldType(imageConstructor, "image");