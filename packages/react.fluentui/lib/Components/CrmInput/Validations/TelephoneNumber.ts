import type { AddressFormatter } from "@/Hooks/Formatting";
import type { LangKey, ValidationExport, ValidationResult } from "../Types";

export const validator: ValidationExport = {
	type: "tel",
	validate,
	format,
};

function validate(value: string, formatter: AddressFormatter): ValidationResult
{
	const { isTelephoneValid } = formatter;

	if (value && !isTelephoneValid(value))
		return { key: "Components.CrmInput.Validation.Phone" as LangKey };

	return true;
}

function format(value: string, formatter: AddressFormatter) 
{
	const { isTelephoneValid, telephone } = formatter;

	if (isTelephoneValid(value))
		return telephone(value);

	return value;
}
