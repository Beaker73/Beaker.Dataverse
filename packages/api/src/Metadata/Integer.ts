import type { Issue } from "../Helpers";
import type { FieldMetadataBase, FieldOptions, FieldSetupOptions } from "./Field";
import { coreTag, fieldType } from "./Field";

/** The options for setting up a integer field */
export interface IntegerFieldSetupOptions extends FieldSetupOptions {
	/** The minimum value of the integer field, defaults to -2147483648 */
	minValue?: number,
	/** The maximum value of the integer field, defaults to 2147483647 */
	maxValue?: number,
}

/** The metadata that represents an integer field */
export interface IntegerFieldMetadata extends FieldMetadataBase {
	/** The type of the field */
	type: "integer",
	/** The options for the integer field */
	options: IntegerFieldOptions,
}

/** The configured options for a integer field */
export interface IntegerFieldOptions extends FieldOptions {
	/** The minimum value of the integer */
	minValue: number,
	/** The maximum value of the integer */
	maxValue: number,
}

/**
 * Creates the metadata representing an integer field
 * @param schemaName The schema name of the field
 * @param options The options for the integer field
 * @returns The metadata representing the integer field
 */
function integerConstructor<
	const SchemaName extends string,
	const Options extends IntegerFieldSetupOptions
>(
	schemaName: SchemaName,
	options?: Options,
)
{
	const metadata = {
		schemaName,
		type: "integer",
		options: {
			optional: (options?.optional ?? false) as Options extends { optional: true } ? true : false,
			readOnly: (options?.readOnly ?? false) as Options extends { readOnly: true } ? true : false,
			minValue: (options?.minValue ?? -2147483648) as Options extends { minValue: infer N extends number } ? N : -2147483648,
			maxValue: (options?.maxValue ?? 2147483647) as Options extends { maxValue: infer N extends number } ? N : 2147483647,
		} satisfies IntegerFieldOptions,
	} satisfies IntegerFieldMetadata;

	return coreTag<number>()(metadata);
}

export const integer = fieldType(integerConstructor, "integer", {
	validate(value, field)
	{
		function* yieldValidations(): Generator<Issue> 
		{
			if(typeof value !== "number") 
			{
				yield { level: "error", message: "Value is not a number" };
				return;
			}

			if(value < field.options.minValue)
				yield { level: "error", message: `Value is less than the minimum value of ${field.options.minValue}.` };
			if(value > field.options.maxValue)
				yield { level: "error", message: `Value is greater than the maximum value of ${field.options.maxValue}.` };
			if(value !== (value | 0))
				yield { level: "warning", message: `Value is not an integer. ${value} will be rounded down to ${value | 0}.` };
		}

		return [...yieldValidations()];
	},
	truncate(value, field)
	{
		if(typeof value !== "number") 
			return 0;
		if(value < field.options.minValue)
			return field.options.minValue;
		if(value > field.options.maxValue)
			return field.options.maxValue;

		if(value !== (value | 0))
			return value | 0;

		return value;
	},
});