import type { PropsWithChildren } from "react";

import { use[FTName]State } from "./State.ts";
import type { [FTName]Props } from "./Types.ts";
import { use[FTName]View } from "./View.tsx";

export function [FTName](props: PropsWithChildren<[FTName]Props>)
{
	const { children, ...childLessProps } = props;

	const state = use[FTName]State(childLessProps);
	return use[FTName]View(children, state);
}