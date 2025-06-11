import type { ContextSelector } from "@fluentui/react-context-selector";
import { createContext, useContextSelector } from "@fluentui/react-context-selector";
import type { ProcessContextValue } from "./Types";

const processContextDefaultValue: ProcessContextValue = {
	selected: undefined,
	onRegister: () => {},
	onUnregister: () => {},
	getRegisteredSteps: () => ({ registeredSteps: {} }),
	onStepNext: () => { console.warn("Uninitialized ProcessContext used for going to next step"); },
	onStepBack: () => { console.warn("Uninitialized ProcessContext used for going to pevious step");},
};

export const ProcessContext = createContext<ProcessContextValue>(processContextDefaultValue);

export const ProcessProvider = ProcessContext.Provider;
export const useProcessContext = <T>(selector: ContextSelector<ProcessContextValue, T>): T => 
	useContextSelector(ProcessContext, (ctx = processContextDefaultValue) => selector(ctx));