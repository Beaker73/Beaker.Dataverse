import type { FieldMetadata } from "@beaker73/dataverse.api";
import type { InputProps } from "@fluentui/react-components";

import type { AddressFormatter } from "@/Hooks/Formatting";

import type { ParseKeys } from "i18next";
import type { useCrmInputState } from "./State";


export type CrmInputProps = Omit<InputProps, "type"> & {
	type?: InputProps["type"] | "postalcode";
	/** If field metadata is supplied, it will be used to limit the length and type */
	metadata?: FieldMetadata;
};
export type CrmInputState = ReturnType<typeof useCrmInputState>;

export type LangKey = ParseKeys<"global">;
export type ValidationResult = true | { key: LangKey, params?: Record<string, string | number> };
export type ValidationExport = {
	type: NonNullable<InputProps["type"]> | "required" | [NonNullable<CrmInputProps["type"]> | "required", NonNullable<InputProps["type"]>];
	validate?: (value: string, formatter: AddressFormatter) => ValidationResult;
	format?: (value: string, formatter: AddressFormatter) => string;
};