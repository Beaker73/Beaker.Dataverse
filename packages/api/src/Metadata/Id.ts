import type { Issue } from "../Helpers";
import type { Guid } from "../Helpers";
import { tryParseGuid } from "../Helpers";
import type { FieldMetadataBase, FieldOptions } from "./Field";
import { coreTag, fieldType } from "./Field";

/** The metadata that represents an id field */
export interface IdFieldMetadata extends FieldMetadataBase {
	/** The type of the field */
	type: "id",
	/** The options for the id field */
	options: IdFieldOptions,
}

/** The configured options for an id field */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IdFieldOptions extends FieldOptions {
	/* No options as of yet */
}

function idConstructor<
	const SchemaName extends string,
>(
	schemaName: SchemaName,
)
{
	type TGuid = Guid<SchemaName>;

	const metadata = {
		schemaName,
		type: "id",
		options: {
			optional: false,
			readOnly: true,
		} satisfies IdFieldOptions,
	} satisfies IdFieldMetadata;

	return coreTag<TGuid>()(metadata);
}

export const id = fieldType(idConstructor, "id", {
	validate(value)
	{
		function* yieldValidations(): Generator<Issue> 
		{
			if(typeof value !== "string") 
			{
				yield { level: "error", message: "Value is not a string, thus can never by an formatted guid" };
				return;
			}

			const falseOrGuid = tryParseGuid(value);
			if( falseOrGuid === false)
				yield { level: "error", message: `The value '${value}' is not a valid guid` };

			return falseOrGuid;
		}

		return [...yieldValidations()];
	},
});