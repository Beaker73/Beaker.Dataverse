import type { RenderSlot } from "@/Helpers";
import { renderSlot } from "@/Helpers";
import type { CardHeaderProps } from "@fluentui/react-components";
import { CardHeader, makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import type { PropsWithChildren } from "react";

export type CrmCardHeaderProps = PropsWithChildren<Omit<CardHeaderProps, "action"> & {action?: RenderSlot}>;

export function CrmCardHeader(props: CrmCardHeaderProps) 
{
	const { children, action, className, ...headerProps } = props;

	const style = useStyles();
	const actions = action ? <div className={style.actions}>{renderSlot(action)}</div> : undefined;

	return <CardHeader className={mergeClasses(style.header, className)} {...headerProps} action={actions} header={<div className={style.headerTitle}>{children}</div>} />;
}

const useStyles = makeStyles({
	header: {
		borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
	},
	headerTitle: {
		fontWeight: tokens.fontWeightSemibold,
		textTransform: "uppercase",
	},
	actions: {
		display: "flex",
		alignItems: "center",
		gap: tokens.spacingHorizontalM,
		marginBottom: tokens.spacingVerticalS,
	},
});