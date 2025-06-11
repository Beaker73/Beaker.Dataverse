import type { FunctionComponent, JSX, ReactNode } from "react";
import { isValidElement } from "react";


export type RenderSlot =
	| undefined // nothing provided, default content might be rendered
	| null // nothing forced, no default content might be rendered
	| ReactNode // user provided content
	| FunctionComponent // user provided component
	| (() => JSX.Element | null) // user provided render function
	;

/**
 * Renders the provided slot
 * @param slot The slot to render
 * @param defaultContent The default content to render if the slot is not provided
 * @returns The render result
 */
export function renderSlot(slot: RenderSlot, defaultContent?: RenderSlot): JSX.Element | null
{
	const Slot = prepareSlot(slot, defaultContent);
	return <Slot />;
}

/**
 * Preparse the provided slot for rendering, by returning a function component that can be used to render the slot.
 * @param slot The slot to prepare
 * @param defaultContent The default content to render if the slot is not provided
 * @returns A function component that can be used to render the content of the slot
 */
export function prepareSlot(slot: RenderSlot, defaultContent?: RenderSlot): FunctionComponent
{
	if (slot === undefined)
		return prepareSlot(defaultContent, null);

	if (slot === null)
		return () => null;

	if (typeof slot === "function")
		return slot;

	if (isValidElement(slot))
		return () => slot;

	const f = () => <>{slot}</>;
	f.displayName = "prepareSlot";
	return f;
}