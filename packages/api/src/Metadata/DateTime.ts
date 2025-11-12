import { formatISO, parseISO } from "date-fns";
import type { FieldMetadataBase, FieldOptions, FieldSetupOptions } from "./Field";
import { coreTag, fieldType } from "./Field";

/** The options for setting up a date-time field */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DateTimeFieldSetupOptions extends FieldSetupOptions
{
}

/** The metadta that represents a date-time field */
export interface DateTimeFieldMetadata extends FieldMetadataBase
{
	/** The type of the field */
	type: "dateTime",
	/** The options for the date-time field */
	options: DateTimeFieldOptions,
}

/** The configured options for a date-time field */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DateTimeFieldOptions extends FieldOptions
{
}

/**
 * Create the metadata representing a date-time field
 * @param schemaName The schema name of the field
 * @param options The options for the date-time field
 * @returns The metadata representing the date-time field
 */
function dateTimeConstructor<
	const TSchemaName extends string,
	const TOptions extends DateTimeFieldSetupOptions
>(
	schemaName: TSchemaName,
	options?: TOptions,
)
{
	type TType = TOptions extends { converter: infer TUserConverter } 
		? TUserConverter extends { convert(value: any): infer TUserValue }
			? TUserValue
			: Date
		: Date;

	return coreTag<TType>()({
		schemaName,
		type:"dateTime",
		options: {
			optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
			converter: options?.converter ?? null,
		} satisfies DateTimeFieldOptions,
	} satisfies DateTimeFieldMetadata);
}

export const dateTime = fieldType(dateTimeConstructor, "dateTime", {
	convert: {
		toClientModel: value => typeof value === "string" ? parseISO(value) : (null as unknown as Date),
		toServerModel: value => formatISO(value),
	},
});