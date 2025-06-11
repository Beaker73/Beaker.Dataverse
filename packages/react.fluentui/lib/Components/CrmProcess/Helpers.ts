import type { FunctionComponent, ReactNode } from "react";

export function asFunctionComponent(render: FunctionComponent | ReactNode, defaultRender?: FunctionComponent | ReactNode): FunctionComponent
{
	if (typeof render === "function")
		return render;
	if(render)
		return () => render;
	if(!defaultRender)
		return () => null;

	return asFunctionComponent(defaultRender);
}