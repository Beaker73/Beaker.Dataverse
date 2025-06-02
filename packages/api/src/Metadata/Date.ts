import type { LocalDate } from "@js-joda/core";
import { Instant, ZoneId } from "@js-joda/core";
import "@js-joda/timezone/dist/js-joda-timezone-10-year-range";
import type { FieldMetadataBase, FieldOptions, FieldSetupOptions } from "./Field";
import { coreTag, fieldType } from "./Field";

/** The options for setting up a date-time field */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DateFieldSetupOptions extends FieldSetupOptions {
}

/** The metadta that represents a date-time field */
export interface DateFieldMetadata extends FieldMetadataBase {
	/** The type of the field */
	type: "date",
	/** The options for the date-time field */
	options: DateFieldOptions,
}

/** The configured options for a date-time field */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DateFieldOptions extends FieldOptions {
}

/**
 * Create the metadata representing a date-time field
 * @param schemaName The schema name of the field
 * @param options The options for the date-time field
 * @returns The metadata representing the date-time field
 */
function dateConstructor<
	const TSchemaName extends string,
	const TOptions extends DateFieldSetupOptions
>(
	schemaName: TSchemaName,
	options?: TOptions,
) {
	return coreTag<LocalDate>()({
		schemaName,
		type: "date",
		options: {
			optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
			readOnly: (options?.readOnly ?? false) as TOptions extends { readOnly: true } ? true : false,
		} satisfies DateFieldOptions,
	} satisfies DateFieldMetadata);
}

const amsterdam = ZoneId.of("Europe/Amsterdam");

export const date = fieldType(dateConstructor, "date", {
	convert: {
		toClientModel: value => Instant.parse(`${value}`).atZone(amsterdam).toLocalDate(),
		toServerModel: value => Instant.from(value).toJSON(),
	},
});