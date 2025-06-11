import type { FunctionComponent, PropsWithChildren, ReactNode } from "react";
import { useProcessStateBasedStyles } from "./Styles";
import { useProcessState } from "./State";

export type ProcessProps = PropsWithChildren<{
	title?: FunctionComponent | ReactNode;
	subTitle?: FunctionComponent | ReactNode;
	selectedStep?: string,
	onStepSelect?: SelectStepEventHandler;
	disableNext?: boolean;
	disableBack?: boolean;
}>;

export type ProcessStepRegisterData = {
	/** The key of the step */
	key: string;
};

export type RegisterStepEventHandler = (data: ProcessStepRegisterData) => void;

export type ProcessContextValue = {

	/** The key of the selected step */
	selected: string | undefined;

	/** Callback so a step can register itself  */
	onRegister: RegisterStepEventHandler;
	/** Callback so a step can unregister itself  */
	onUnregister: RegisterStepEventHandler;

	/** Gets the registered steps */
	getRegisteredSteps: () => { registeredSteps: Record<string, ProcessStepRegisterData> };

	/** Go to the next stage */
	onStepNext: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	/** Go to the previous stage */
	onStepBack: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export type ProcessContextValues = {
	process: ProcessContextValue;
};


//
// The State
//

export type ProcessStyles = ReturnType<typeof useProcessStateBasedStyles>;
export type ProcessState = ReturnType<typeof useProcessState>;

export type SelectStepData = {
	/** The key of the selected process step */
	value: string;
};

export type SelectStepEvent<E = HTMLElement> = React.MouseEvent<E>;
export type SelectStepEventHandler = (event: SelectStepEvent, data: SelectStepData) => void;

