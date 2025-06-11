import { ValidateContext, ValidationResult, Validator } from "../Types";

export const urlValidator: Validator = {
	key: "buildin:url",
	inputType: "url",
	useValidate: validate,
	useFormat: format,
};

export function validate(value: string, context?: ValidateContext): ValidationResult
{
	if (value && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/.test(value))
		return { isValid: false, errorMessage: context?.texts?.invalidUrl ?? "The URL is not valid." };
	return { isValid: true };
}

export function format(value: string)
{
	return value?.trim()?.length === 0 ? "" : value?.replace(/^(https?:\/\/)?/, "https://")?.toLowerCase() ?? "";
}