import type { FunctionComponent, ReactNode } from "react";
import { useProcessStepStateBasedStyles } from "./Styles";
import { useProcessStepState } from "./State";

export type ProcessStepProps = {
	value: string;
	icon?: FunctionComponent | ReactNode;
	title?: FunctionComponent | ReactNode;
	checkmark?: FunctionComponent | ReactNode;
};

export type ProcessStepState = ReturnType<typeof useProcessStepState>;
export type ProcessStepStyles = ReturnType<typeof useProcessStepStateBasedStyles>;