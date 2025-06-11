import { CheckmarkFilled } from "@fluentui/react-icons";
import type { Ref } from "react";
import { createElement, useEffect } from "react";




import { asFunctionComponent } from "../Helpers";
import { useProcessContext } from "../Process/Context";
import type { ProcessStepRegisterData } from "../Process/Types";
import type { ProcessStepProps } from "./Types";

export function useProcessStepState(props: ProcessStepProps, _ref: Ref<HTMLElement>)
{
	const { title, icon, checkmark, value: name } = props;

	const onRegister = useProcessContext(ctx => ctx.onRegister);
	const onUnregister = useProcessContext(ctx => ctx.onUnregister);
	const isFirst = useProcessContext(ctx => Object.keys(ctx.getRegisteredSteps().registeredSteps)[0] == name);
	const isProcessed = useProcessContext(ctx => 
	{
		const keys = Object.keys(ctx.getRegisteredSteps().registeredSteps);
		return keys.indexOf(name) < keys.indexOf(ctx.selected ?? "");
	});
	const isSelected = useProcessContext(ctx => ctx.selected === name);

	useEffect(() =>
	{
		const registration: ProcessStepRegisterData = { key: name as string };
		onRegister(registration);
		return () => onUnregister(registration);
	}, [name, onRegister, onUnregister]);


	return {
		checkmark: asFunctionComponent(checkmark, createElement(CheckmarkFilled)),
		name,
		hasIcon: !!icon,
		icon: asFunctionComponent(icon),
		iconOnly: !!icon && !title,
		title: asFunctionComponent(title),
		isFirst,
		isSelected,
		isProcessed,
	};
}

