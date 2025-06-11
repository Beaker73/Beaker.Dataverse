import { ValidateContext, ValidationResult, Validator } from "../Types";

export const emailValidator: Validator = {
	key: "buildin:email",
	inputType: "email",
	useValidate: validate,
};

function validate(value: string, context?: ValidateContext): ValidationResult 
{
	if (value && !/^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value))
		return { isValid: false, errorMessage: context?.texts?.invalidEmail ?? "The email address is not valid." };

	return { isValid: true };
}