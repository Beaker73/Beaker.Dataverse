import { coreTag, fieldType, type FieldMetadataBase, type FieldOptions, type FieldSetupOptions } from "./Field";

/** The options for setting up a boolean field */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BooleanFieldSetupOptions extends FieldSetupOptions {
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
	SchemaName extends string,
	Options extends BooleanFieldSetupOptions,
>(
	schemaName: SchemaName,
	options?: Options,
)
{
	const metadata = {
		schemaName,
		type: "boolean",
		options: {
			optional: options?.optional ?? false,
			defaultValue: false,
		} satisfies BooleanFieldOptions,
	} satisfies BooleanFieldMetadata;

	return coreTag<boolean>()(metadata);
}

export const boolean = fieldType(booleanConstructor, "boolean");
