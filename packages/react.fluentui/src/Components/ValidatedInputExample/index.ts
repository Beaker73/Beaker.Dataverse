import { useValidatedInputExampleState } from "./State.ts";
import type { ValidatedInputExampleProps } from "./Types.ts";
import { useValidatedInputExampleView } from "./View.tsx";

export function ValidatedInputExample(props: ValidatedInputExampleProps)
{
	const state = useValidatedInputExampleState(props);
	return useValidatedInputExampleView(state);
}