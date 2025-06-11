import { useCrmInputState } from "./State.ts";
import type { CrmInputProps } from "./Types.ts";
import { useCrmInputView } from "./View.tsx";

export function CrmInput(props: CrmInputProps)
{
	const state = useCrmInputState(props);
	return useCrmInputView(state);
}