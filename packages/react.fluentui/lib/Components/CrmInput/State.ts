import type { InputProps } from "@fluentui/react-components";
import { createElement, useCallback, useEffect } from "react";

import { hasValue } from "../Helpers";
import { useCrmFieldContext } from "../CrmField";
import type { CrmInputProps, ValidationExport, ValidationResult } from "./Types";
import { useValidatorsForType } from "../ValidationProvider";
import { Validator } from "../ValidationProvider/Types";


export function useCrmInputState(props: CrmInputProps)
{
	const { type: userProvidedType, maxLength: userProvidedMaxLength, required: userProvidedRequired, metadata, ...inputProps } = props;

	let type = userProvidedType;
	let maxLength: number | undefined = userProvidedMaxLength;
	let required: boolean | undefined = userProvidedRequired;
	if (metadata && metadata.type === "string")
	{
		switch (metadata.options.format)
		{
			case "email":
				type = userProvidedType ?? "email";
				break;

			case "phone":
				type = userProvidedType ?? "tel";
				break;

			case "url":
				type = userProvidedType ?? "url";
				break;
		}

		if (hasValue(metadata.options.maxLength))
			maxLength = userProvidedMaxLength ?? metadata.options.maxLength;
		
		required = userProvidedRequired ?? metadata.options.optional !== true;
	}


	const value = props?.value;

	const context = useCrmFieldContext();
	const { validate = false, required: contextRequired } = context ?? {};
	if(validate && contextRequired)
		required = userProvidedRequired ?? contextRequired;

	const { setIssue, clearIssue } = context ?? {};
	const updateIssue = useCallback((result: ValidationResult) => 
	{
		if (result !== true)
			setIssue?.(t(result.key, result.params));
	}, [setIssue]);

	const disabled = props?.disabled ?? context?.disabled ?? false;

	// since we want the validators to be hooks, we cannot conditionally call them.
	// but we can conditionally 'render' them as controls and use their results via callbacks.
	const validators = useValidatorsForType(props.type);
	const Validators = createElement("Fragment", undefined, 
		validators.map(v => createElement(ValidatorRender, { value: v })));

	// useEffect(() => 
	// {
	// 	if (required && !disabled) 
	// 	{
	// 		const validator = validators["required"];
	// 		if (validator?.validate) 
	// 		{
	// 			const result = validator.validate(value ?? "", formatter);
	// 			updateIssue(result);
	// 		}
	// 	}

	// 	if (validate && validator && !disabled) 
	// 	{
	// 		if (type && validator.validate)
	// 		{
	// 			const result = validator.validate(value ?? "", formatter);
	// 			updateIssue(result);
	// 		}
	// 	}


	// 	return () => clearIssue?.();

	// }, [value, validate, required, setIssue, clearIssue, type, formatter, validator, disabled, updateIssue]);

	// const onFormat = useCallback<NonNullable<InputProps["onBlur"]>>(
	// 	(ev) => 
	// 	{
	// 		if (validate && type)
	// 		{
	// 			if (validator?.format && !disabled) 
	// 			{
	// 				const isValid = validator?.validate?.(value ?? "", formatter) ?? true;

	// 				if (isValid)
	// 					props.onChange?.(ev, { value: validator?.format(value ?? "", formatter) });
	// 			}
	// 		}
	// 	}, [disabled, formatter, props, type, validate, validator, value]);

	// const openUrl = useCallback(() => 
	// {
	// 	if (type === "url" && value) 
	// 	{
	// 		const url = validator?.format?.(value ?? "", formatter) ?? value;
	// 		if (url && url.trim().length > 0) 
	// 		{
	// 			window.open(url, "_blank");
	// 		}
	// 	}
	// }, [formatter, type, validator, value]);
	// const canOpenUrl = type === "url" && (value?.trim()?.length ?? 0) > 0 && !context?.issue;

	// const openEmail = useCallback(() => 
	// {
	// 	if (type === "email" && value) 
	// 	{
	// 		const email = validator?.format?.(value ?? "", formatter) ?? value;
	// 		if (email && email.trim().length > 0) 
	// 		{
	// 			window.open(`mailto:${email}`, "_blank");
	// 		}
	// 	}
	// }, [formatter, type, validator, value]);
	// const canOpenEmail = type === "email" && (value?.trim()?.length ?? 0) > 0 && !context?.issue;

	// const targetType = Array.isArray(validator?.type) ? validator?.type[1] : type;
	// const inputType = targetType === "postalcode" ? "text" : targetType;


	return {
		Validators,
		onFormat: null,
		type: "text", //targetType,
		inputProps: {
			...inputProps,
			disabled,
			required,
			type: "text", //inputType,
			maxLength,
		} satisfies InputProps,
	};
}


function ValidatorRender(props: { value: string, impl: Validator, onValidationResult: (result: ValidationResult) => void })
{
	const { value, impl, onValidationResult } = props;

	const useValidate = impl.useValidate ?? ((_value) => true);
	const isValid = useValidate(value);

	return createElement("input", {type: "hidden"});
}