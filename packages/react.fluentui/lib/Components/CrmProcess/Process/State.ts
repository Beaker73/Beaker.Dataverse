import { useEventCallback, useForceUpdate } from "@fluentui/react-utilities";
import { useCallback, useRef, type Ref } from "react";
import { asFunctionComponent } from "../Helpers";
import type { ProcessProps, ProcessStepRegisterData, SelectStepData, SelectStepEvent } from "./Types";

export function useProcessState(props: ProcessProps, _ref: Ref<HTMLElement>)
{
	const {
		selectedStep,
		onStepSelect,
	} = props;

	const onSelect = useEventCallback(
		(event: SelectStepEvent, data: SelectStepData) => 
		{
			onStepSelect?.(event, data);
		},
	);


	const registeredSteps = useRef<Record<string, ProcessStepRegisterData>>({});
	const forceUpdate = useForceUpdate();

	const onRegister = useEventCallback(
		(data: ProcessStepRegisterData) =>
		{
			registeredSteps.current[data.key] = data;
			forceUpdate();
		},
	);

	const onUnregister = useEventCallback(
		(data: ProcessStepRegisterData) =>
		{
			delete registeredSteps.current[data.key];
			forceUpdate();
		},
	);

	const getRegisteredSteps = useCallback(() =>
	{
		return {
			registeredSteps: registeredSteps.current,
		};
	}, []);

	const keys = Object.keys(registeredSteps.current);
	const selected = selectedStep ?? keys[0];
	const selectedIndex = keys.findIndex(k => k === selected);

	const onStepNext = useEventCallback<[React.MouseEvent<HTMLButtonElement>], void>(ev => 
	{
		const keys = Object.keys(registeredSteps.current);
		const currentIndex = keys.indexOf(selectedStep ?? "");
		if (currentIndex >= keys.length - 1)
			return;
		const nextKey = keys[currentIndex + 1];
		onSelect(ev, { value: nextKey });
	});

	const onStepBack = useEventCallback<[React.MouseEvent<HTMLButtonElement>], void>(ev =>
	{
		const keys = Object.keys(registeredSteps.current);
		const currentIndex = keys.indexOf(selectedStep ?? "");
		if (currentIndex === 0)
			return;
		const nextKey = keys[currentIndex - 1];
		onSelect(ev, { value: nextKey });
	});


	return {
		showHeader: !!props.title || !!props.subTitle,
		title: asFunctionComponent(props.title),
		subTitle: asFunctionComponent(props.subTitle),
		selected,
		children: props.children,

		allowStepNext: !(props.disableNext ?? false),
		canStepNext: selectedIndex < (keys.length - 1),
		onStepNext,

		allowStepBack: !(props.disableBack ?? false),
		canStepBack: selectedIndex > 0,
		onStepBack,

		onRegister,
		onUnregister,
		getRegisteredSteps,
	};
};