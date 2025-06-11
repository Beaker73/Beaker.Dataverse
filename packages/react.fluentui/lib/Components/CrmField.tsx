import { renderSlot, type RenderSlot } from "@/Helpers";
import type { FieldProps } from "@fluentui/react-components";
import { Field, Tooltip } from "@fluentui/react-components";
import { LockClosedRegular } from "@fluentui/react-icons";
import { createContext, Fragment, useCallback, useContext, useMemo, useState, type PropsWithChildren } from "react";

type CrmFieldProps = FieldProps & {
	readOnly?: boolean,
	required?: boolean,
	adviced?: boolean,
	/** If set auto validate the containted CrmField according to its type */
	validate?: boolean,
	tooltip?: RenderSlot,
};

type CrmFieldContextValue = {
	required?: boolean,
	disabled?: boolean,
	validate: boolean,
	issue: string | null,
};
type CrmFieldContext = CrmFieldContextValue & {
	setIssue(issueMessage: string): void,
	clearIssue(): void,
};

export const fieldContext = createContext<CrmFieldContext | null>(null);

export function useCrmFieldContext() 
{
	return useContext(fieldContext);
}

export function CrmField(props: PropsWithChildren<CrmFieldProps>) 
{
	const { readOnly, tooltip, validate = false, ...fieldProps } = props;

	const [contextValue, setContextValue] = useState<CrmFieldContextValue>(() => ({
		required: props.required ?? false,
		adviced: props.adviced ?? false,
		disabled: readOnly,
		validate: validate,
		issue: null,
	}));

	const setIssue = useCallback(
		(message: string) => 
		{
			setContextValue(v => ({ ...v, issue: message }));
		},
		[]);
	const clearIssue = useCallback(
		() => 
		{
			setContextValue(v => ({ ...v, issue: null }));
		},
		[]);

	const context = useMemo<CrmFieldContext>(() => ({
		...contextValue,
		setIssue, clearIssue,
	}), [clearIssue, contextValue, setIssue]);

	const issue = context.issue;
	const valState = issue ? "error" : undefined;
	const valMsg = issue ? issue : undefined;

	const field = <Field orientation="horizontal" {...fieldProps} validationState={valState} validationMessage={valMsg}
		label={readOnly ? <Fragment><LockClosedRegular />{props.label as string}</Fragment> : props.label}
	>
		{props.children}
	</Field>;

	return <fieldContext.Provider value={context}>
		{tooltip && <Tooltip relationship="description" content={renderSlot(tooltip)!} appearance="inverted" withArrow >{field}</Tooltip>}
		{!tooltip && field}
	</fieldContext.Provider>;
}
