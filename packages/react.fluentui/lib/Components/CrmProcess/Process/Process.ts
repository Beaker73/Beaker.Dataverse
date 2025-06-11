import type { ForwardRefComponent } from "@fluentui/react-components";
import { forwardRef } from "react";
import { useProcessView } from "./View";
import { useProcessState } from "./State";
import { useProcessStateBasedStyles } from "./Styles";
import type { ProcessProps } from "./Types";
import { useProcessContextValues } from "./UseCrmContextValues";

export const Process: ForwardRefComponent<ProcessProps> = forwardRef(
	(props, ref) => 
	{
		const state = useProcessState(props, ref);
		const contextValues = useProcessContextValues(state);
		const styles = useProcessStateBasedStyles(state);

		return useProcessView(state, contextValues, styles);
	},
);

Process.displayName = "Process";