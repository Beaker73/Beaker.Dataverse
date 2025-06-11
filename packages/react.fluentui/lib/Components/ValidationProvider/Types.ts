import { InputProps } from "@fluentui/react-components";

export type AllType = "*";
export type ValidationContext = {
    /** validators by input type the react to. */
    validators: Record<string, Validator[]>;
}

export type ValidationProviderProps = {
    /** list of validators you want to add, if any */
    validators?: Validator[]
    /** optional list of translations for texts used by internal validations */
    texts?: {
        fieldRequired?: string,
        invalidEmail?: string,
        invalidUrl?: string,
    }
}

export type Validator = {
    /** The unique key to identify this validator */
    key: string,
    /** The type of the input to react to (<input type="inputType">), if not provided, applies to all types (like required) */
    inputType?: string | string[],
    /** Validate if the input is valid according its validation rules */
    useValidate: (value: string, context?: ValidateContext) => ValidationResult | Promise<ValidationResult>,
    /** If provided, format the value */
    useFormat?: (value: string, context?: ValidateContext) => string,
}

export type ValidateContext = {
    /** The type of the input that resulting in the current validation triggering */
    type: string,
    /** All the props provided to the input control */
    props: InputProps,
    /** List of strings for the default validations, so users can supply translated text, without any dependency on a translation library */
    texts: ValidationProviderProps["texts"],
}

export type ValidationResult = {
    /** Set to false if validation failed, otherwise set to true */
    isValid: boolean,
    /** If not valid, the error message to the user why it was not valid */
    errorMessage?: string,
    /** Set to override the type send to the actual input control */
    type?: string,
}