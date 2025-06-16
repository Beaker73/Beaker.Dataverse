import { coreTag, fieldType, type FieldMetadataBase, type FieldOptions, type FieldSetupOptions } from "./Field";

/** The options for setting up a boolean field */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BooleanFieldSetupOptions extends FieldSetupOptions {
	/** If the value is null, it will be replaced by this value. If optional is set, it will be ignored and type will not be null */
	defaultValue?: boolean,
}

/** The metadata that represents an boolean field */
export interface BooleanFieldMetadata extends FieldMetadataBase {
	/** The type of the field */
	type: "boolean",
	/** The options for the boolean field */
	options: BooleanFieldOptions,
}

/** The configured options for a boolean field */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BooleanFieldOptions extends FieldOptions {
}

/**
 * Creates the metadata representing an boolean field
 * @param schemaName The schema name of the field
 * @param options The options for the boolean field
 * @returns The metadata representing the boolean field
 */
export function booleanConstructor<
	const SchemaName extends string,
	const Options extends BooleanFieldSetupOptions,
>(
	schemaName: SchemaName,
	options?: Options,
)
{
	type TType = Options extends { converter: infer TUserConverter } 
		? TUserConverter extends { convert(value: any): infer TUserValue }
			? TUserValue
			: boolean
		: boolean;

	const metadata = {
		schemaName,
		type: "boolean",
		options: {
			optional: (options?.optional ?? false) as Options extends { readOnly: true } ? true : false,
			readOnly: (options?.readOnly ?? false) as Options extends { readOnly: true } ? true : false,
			defaultValue: false,
			converter: options?.converter ?? null,
		} satisfies BooleanFieldOptions,
	} satisfies BooleanFieldMetadata;

	return coreTag<TType>()(metadata);
}

export const boolean = fieldType(booleanConstructor, "boolean");
