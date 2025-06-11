import { useCrmOptionsDropdownState } from "./State.ts";
import type { CrmOptionsDropdownProps } from "./Types.ts";
import { useCrmOptionsDropdownView } from "./View.tsx";

export function CrmOptionsDropdown<T extends number = number>(props: CrmOptionsDropdownProps<T>)
{
	const state = useCrmOptionsDropdownState<T>(props);
	return useCrmOptionsDropdownView(state);
}