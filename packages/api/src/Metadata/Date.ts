import { coreTag, FieldMetadataBase, FieldOptions, FieldSetupOptions, fieldType } from "./Field";

export type DateFieldSetupOptions = FieldSetupOptions;

export interface DateFieldMetadata extends FieldMetadataBase {
	/** The type of the field */
	type: "date";
	/** The options for the date fields */
	options: DateFieldOptions;
}

export type DateFieldOptions = FieldOptions;

function dateConstructor<
	const TSchemaName extends string,
	const TOptions extends DateFieldSetupOptions = DateFieldSetupOptions,
>(
	schemaName: TSchemaName,
	options?: TOptions,
)
{
	const metadata = {
		schemaName,
		type: "date",
		doNotQuoteInFilter: true, // dates are special cases and do not need quotes, suppress quoting in filters
		options: {
			optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
			converter: options?.converter ?? null,
		} satisfies DateFieldOptions,
	} satisfies DateFieldMetadata;

	return coreTag<Date>()(metadata);
}

export const date = fieldType(dateConstructor, "date", {
	convert: {
		toClientModel: v => typeof v === "string" ? new Date(v) : new Date(),
		toServerModel: v => v instanceof Date ? v.toISOString().split("T")[0] : null,
	},
});