import type { ForwardRefComponent } from "@fluentui/react-components";
import { forwardRef } from "react";

import { renderProcessStep } from "./View";
import { useProcessStepState } from "./State";
import { useProcessStepStateBasedStyles } from "./Styles";
import type { ProcessStepProps } from "./Types";

export const ProcessStep: ForwardRefComponent<ProcessStepProps> = forwardRef(
	(props, ref) => 
	{
		const state = useProcessStepState(props, ref);
		const styles = useProcessStepStateBasedStyles(state);
		
		return renderProcessStep(state, styles);
	},
);

ProcessStep.displayName = "ProcessStep";