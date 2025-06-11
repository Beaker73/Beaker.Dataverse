import type { ProcessContextValue, ProcessContextValues, ProcessState } from "./Types";

export function useProcessContextValues(state: ProcessState): ProcessContextValues
{
	const {
		selected,
		onRegister,
		onUnregister,
		getRegisteredSteps,
		onStepNext,
		onStepBack,
	} = state;

	const process: ProcessContextValue = {
		selected,
		onRegister,
		onUnregister,
		getRegisteredSteps,
		onStepNext,
		onStepBack,
	};

	return { process };
}