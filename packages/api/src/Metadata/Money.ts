import type { Issue } from "../Helpers";
import type { FieldMetadataBase, FieldOptions, FieldSetupOptions } from "./Field";
import { coreTag, fieldType } from "./Field";

export type Money<N extends number> = bigint & { decimals: N };


/** The options for setting up a money field */
export interface MoneyFieldSetupOptions extends FieldSetupOptions {
	/** The number of decimals being kept track of */
	decimals: number,
}

/** The metadata that represents an money field */
export interface MoneyFieldMetadata extends FieldMetadataBase {
	/** The type of the field */
	type: "money",
	/** The options for the money field */
	options: MoneyFieldOptions,
}

/** The configured options for a money field */
export interface MoneyFieldOptions extends FieldOptions {
	/** The number of decimals being kept track of */
	decimals: number,
}

/**
 * Creates the metadata representing an money field
 * @param schemaName The schema name of the field
 * @param options The options for the money field
 * @returns The metadata representing the money field
 */
function moneyConstructor<
	const SchemaName extends string,
	const Options extends MoneyFieldSetupOptions
>(
	schemaName: SchemaName,
	options?: Options,
)
{
	


	const metadata = {
		schemaName,
		type: "money",
		options: {
			optional: (options?.optional ?? false) as Options extends { optional: true } ? true : false,
			decimals: (options?.decimals ?? 4) as Options extends { decimals: infer N extends number } ? N : 4,
			converter: options?.converter ?? null,
		} satisfies MoneyFieldOptions,
	} satisfies MoneyFieldMetadata;

	type DeriveCoreType<TField> = TField extends { options: { decimals: infer N extends number } } ? Money<N> : bigint;
	type MoneyType = DeriveCoreType<typeof metadata>;
	type TType = Options extends { converter: infer TUserConverter } 
		? TUserConverter extends { convert(value: any): infer TUserValue }
			? TUserValue
			: MoneyType
		: MoneyType;

	return coreTag<TType>()(metadata);
}



export const money = fieldType(moneyConstructor, "money", {
	validate(value)
	{
		function* yieldValidations(): Generator<Issue> 
		{
			if(typeof value !== "bigint") 
			{
				yield { level: "error", message: "Value is not a bigint" };
				return;
			}
		}

		return [...yieldValidations()];
	},
	convert: {
		toClientModel: (value, field) => (typeof value === "number" ? BigInt(value * (10 ** field.options.decimals)) : 0n) as Money<(typeof field)["options"]["decimals"]>,
		toServerModel: (value, field) => Number(value) / (10 ** field.options.decimals),
	},
});