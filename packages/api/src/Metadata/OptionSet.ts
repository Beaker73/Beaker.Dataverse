import { tags } from "../Helpers";
import { coreTag, fieldType, type FieldMetadataBase, type FieldOptions, type FieldSetupOptions } from "./Field";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EnumValueMap<T extends Record<string, any>> = {
	[K in keyof T as K extends string ? T[K] extends number ? T[K] : never : never]: K;
};

export function enumValueMap<const TEnum extends Record<K, V>, K extends string, V>(enumType: TEnum)
	: EnumValueMap<TEnum>
{
	if(!enumType)
		return {} as EnumValueMap<TEnum>;

	const values = Object
		.entries(enumType)
		.filter(([k, v]) => typeof k === "string" && typeof v === "number")
		.map(([k, v]) => [v, k] as const);

	const valueMap = Object.fromEntries(values) as EnumValueMap<TEnum>;

	return valueMap as EnumValueMap<TEnum>;
}


export interface OptionSetFieldSetupOptions<T = unknown> extends FieldSetupOptions
{
	enumMetadata?: EnumMetadata<T>;
}

export interface OptionSetFieldMetadata<T = unknown> extends FieldMetadataBase
{
	type: "optionSet",
	options: OptionSetFieldOptions<T>
}

export interface OptionSetFieldOptions<T = unknown>
	extends FieldOptions
{
	enumMetadata?: EnumMetadata<T>;
}

export function optionSetConstructor<
	const TFieldSchemaName extends string,
	const TOptions extends OptionSetFieldSetupOptions<T>,
	const T = unknown,
>(
	schemaName: TFieldSchemaName,
	options?: TOptions,
) 
{
	type TEnumMetadata = TOptions extends { enumMetadata: infer TEnum } ? undefined extends TEnum ? EnumMetadata : TEnum : EnumMetadata;
	type TEnumType = TEnumMetadata[typeof tags]["coreType"]
	type TType = TOptions extends { converter: infer TUserConverter } 
		? TUserConverter extends { convert(value: any): infer TUserValue }
			? TUserValue
			: TEnumType
		: TEnumType;

	const metadata = {
		schemaName,
		type: "optionSet",
		options: {
			optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
			enumMetadata: options?.enumMetadata as TEnumMetadata,
			converter: options?.converter ?? null,
		} satisfies OptionSetFieldOptions,
	} satisfies OptionSetFieldMetadata;

	return coreTag<TType>()(metadata);
}

const coreOptionSet = fieldType(optionSetConstructor, "optionSet", {});

export function enumMetadata<TEnum>(e: unknown) 
{
	return {
		values: enumValueMap(e as Record<string, number>),
		[tags]: {
			type: "enum",
			coreType: e as TEnum,
		},
	} as const;
}
type EnumMetadata<TEnum = unknown> = ReturnType<typeof enumMetadata<TEnum>>;

export function optionSet<
	TSchemaName extends string,
	TEnum, TEnumMetadata extends EnumMetadata<TEnum>,
	TOtherOptions extends Omit<OptionSetFieldSetupOptions, "enumMetadata"> = Omit<OptionSetFieldSetupOptions, "enumMetadata">
>(
	schemaName: TSchemaName,
	enumMetadata: TEnumMetadata,
	options?: TOtherOptions,
)
{
	type Options = TOtherOptions & {
		enumMetadata: TEnumMetadata,
	};

	return coreOptionSet<TSchemaName, Options>(schemaName, {
		...options,
		enumMetadata,
	} as Options);
}