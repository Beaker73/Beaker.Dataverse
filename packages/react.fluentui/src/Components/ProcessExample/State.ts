import { useCallback, useState } from "react";
import type { ProcessExampleProps, StepName } from "./Types";
import { ProcessProps } from "../../../lib";

export function useProcessExampleState(_props: ProcessExampleProps)
{
	const [selectedStep, setSelectedStep] = useState<StepName>("dev");
	const onStepSelect = useCallback<NonNullable<ProcessProps["onStepSelect"]>>(
		(_event, data) => {
			setSelectedStep(data.value as StepName);
		},
		[],
	);

	return {
		selectedStep, onStepSelect,
	};
}