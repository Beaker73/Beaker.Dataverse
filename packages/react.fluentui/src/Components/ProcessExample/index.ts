import { useProcessExampleState } from "./State.ts";
import type { ProcessExampleProps } from "./Types.ts";
import { useProcessExampleView } from "./View.tsx";

export function ProcessExample(props: ProcessExampleProps)
{
	const state = useProcessExampleState(props);
	return useProcessExampleView(state);
}