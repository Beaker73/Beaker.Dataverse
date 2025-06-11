import { createContext } from "react";
import { ValidationContext, Validator } from "./Types";
import { emailValidator } from "./BuildInValidations/EmailAddress";
import { requiredValidator } from "./BuildInValidations/Required";
import { urlValidator } from "./BuildInValidations/Url";

const buildInValidators = [
    emailValidator,
    requiredValidator,
    urlValidator
];

// build a map of the default build-in validators by input type
// so that if user does not wrap code in a ValidationProvider, the default validators are still available and working
const defaultValidatorMap = generateValidatorMap(buildInValidators);
export function generateValidatorMap(validators: Validator[]) {
    const map: Record<string, Validator[]> = {};
    for (const v of validators) {
        if (!v.inputType)
            (map["*"] = map["*"] ?? []).push(v);
        else if (typeof v.inputType === "string")
            (map[v.inputType] = map[v.inputType] ?? []).push(v);
        else if (Array.isArray(v.inputType)) {
            for (const type of v.inputType) {
                (map[type] = map[type] ?? []).push(v);
            }
        }
    }
    return map;
}

export const validationContext = createContext<ValidationContext>({
    validators: defaultValidatorMap,
});