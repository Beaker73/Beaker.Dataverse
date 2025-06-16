import type { Issue } from "../Helpers";
import type { FieldMetadataBase, FieldOptions, FieldSetupOptions } from "./Field";
import { coreTag, fieldType } from "./Field";

/** The options for setting up a flaot field */
export interface FloatFieldSetupOptions extends FieldSetupOptions {
	/** The minimum value of the float field, defaults to -2147483648 */
	minValue?: number,
	/** The maximum value of the float field, defaults to 2147483647 */
	maxValue?: number,
}

/** The metadata that represents an float field */
export interface FloatFieldMetadata extends FieldMetadataBase {
	/** The type of the field */
	type: "float",
	/** The options for the float field */
	options: FloatFieldOptions,
}

/** The configured options for a float field */
export interface FloatFieldOptions extends FieldOptions {
	/** The minimum value of the float */
	minValue: number,
	/** The maximum value of the float */
	maxValue: number,
}

/**
 * Creates the metadata representing an float field
 * @param schemaName The schema name of the field
 * @param options The options for the float field
 * @returns The metadata representing the float field
 */
function floatConstructor<
	const SchemaName extends string,
	const Options extends FloatFieldSetupOptions
>(
	schemaName: SchemaName,
	options?: Options,
)
{
	type TType = Options extends { converter: infer TUserConverter } 
		? TUserConverter extends { convert(value: any): infer TUserValue }
			? TUserValue
			: number
		: number;

	const metadata = {
		schemaName,
		type: "float",
		options: {
			optional: (options?.optional ?? false) as Options extends { optional: true } ? true : false,
			readOnly: (options?.readOnly ?? false) as Options extends { readOnly: true } ? true : false,
			minValue: (options?.minValue ?? -2147483648) as Options extends { minValue: infer N extends number } ? N : -2147483648,
			maxValue: (options?.maxValue ?? 2147483647) as Options extends { maxValue: infer N extends number } ? N : 2147483647,
			converter: options?.converter ?? null,
		} satisfies FloatFieldOptions,
	} satisfies FloatFieldMetadata;

	return coreTag<TType>()(metadata);
}

export const float = fieldType(floatConstructor, "float", {
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

		return value;
	},
});