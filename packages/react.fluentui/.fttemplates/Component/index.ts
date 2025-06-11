import { use[FTName]State } from "./State.ts";
import type { [FTName]Props } from "./Types.ts";
import { use[FTName]View } from "./View.tsx";

export function [FTName](props: [FTName]Props)
{
	const state = use[FTName]State(props);
	return use[FTName]View(state);
}