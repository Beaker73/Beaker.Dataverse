import type { ZonedDateTime } from "@js-joda/core";
import { Instant, ZoneId } from "@js-joda/core";
import "@js-joda/timezone/dist/js-joda-timezone-10-year-range";
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
	TSchemaName extends string,
	TOptions extends DateTimeFieldSetupOptions
>(
	schemaName: TSchemaName,
	options?: TOptions,
)
{
	return coreTag<ZonedDateTime>()({
		schemaName,
		type:"dateTime",
		options: {
			optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
		} satisfies DateTimeFieldOptions,
	} satisfies DateTimeFieldMetadata);
}

export const amsterdam = ZoneId.of("Europe/Amsterdam");

export const dateTime = fieldType(dateTimeConstructor, "dateTime", {
	convert: {
		toClientModel: value => Instant.parse(`${value}`).atZone(amsterdam),
		toServerModel: value => Instant.from(value).toJSON(),
	},
});