import type { AddressFormatter } from "@/Hooks/Formatting";
import type { LangKey, ValidationExport, ValidationResult } from "../Types";

export const validator: ValidationExport = {
	type: ["postalcode", "text"],
	validate,
	format,
};

function validate(value: string, formatter: AddressFormatter): ValidationResult 
{
	const { country, isPostalCodeValid } = formatter;

	// when no country available, we cannot validate the postal code, so always valid
	if (!country)
		return true;

	if (value && !isPostalCodeValid(value))
		return { key: "Components.CrmInput.Validation.PostalCode" as LangKey, params: { country: country.name } };

	return true;
}

function format(value: string, formatter: AddressFormatter) 
{
	const { country, isPostalCodeValid, postalCode } = formatter;

	// when no country available, we cannot format, so return original value
	if (!country)
		return value;

	if (isPostalCodeValid(value))
		return postalCode(value);

	return value;
}