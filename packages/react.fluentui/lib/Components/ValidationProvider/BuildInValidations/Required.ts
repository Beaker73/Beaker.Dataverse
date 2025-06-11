import { ValidateContext, ValidationResult, Validator } from "../Types";

export const requiredValidator: Validator = {
	key: "buildin:required",
	useValidate: validate,
};

function validate(value: string, context?: ValidateContext): ValidationResult
{
	// if not required, always return valid.
	if(context?.props.required !== true)
		return { isValid: true, }

	// if value is empty, return invalid.
	if ((value?.trim()?.length ?? 0) === 0)
		return { isValid: false, errorMessage: context?.texts?.fieldRequired ?? "This field is required." };

	// otherwise, return valid.
	return { isValid: true };
}