import type { ToolbarButtonProps } from "@fluentui/react-components";
import { makeStyles, tokens, ToolbarButton, Tooltip } from "@fluentui/react-components";
import { useCallback } from "react";

import { renderSlot, type RenderSlot } from "../Helpers";

export type CrmToolbarButtonProps<T = unknown> = { 
	tooltip?: string | RenderSlot 
	item?: T,
	onItemClick?: (item: T) => void,
	appearance2?: "primary" | "subtle" | "transparent" | "secondary",
} & ToolbarButtonProps;
// using Omit<ToolbarButtonProps, "appearance">
// gives strange errors: working arround it with a new appearance 2 prop. 

export function CrmToolbarButton<T = unknown>(props: CrmToolbarButtonProps<T>) 
{
	const { tooltip, item, onClick, onItemClick, appearance2, ...restProps } = props;
	const appearance = (appearance2 as ToolbarButtonProps["appearance"]) ?? "subtle";

	const onCombinedClick = useCallback(
		(ev: React.MouseEvent<HTMLButtonElement, MouseEvent> & React.MouseEvent<HTMLAnchorElement, MouseEvent>) => 
		{
			if(onItemClick && item)
				onItemClick(item);
			onClick?.(ev);
		}, 
		[item, onItemClick, onClick]);

	const styles = useStyles();

	if(tooltip)
		return <Tooltip content={renderSlot(tooltip) ?? <></>} relationship="description" appearance="inverted" withArrow>
			<ToolbarButton {...restProps} appearance={appearance} className={styles.crmToolbarButton} onClick={onCombinedClick} />
		</Tooltip>;

	return <ToolbarButton {...restProps} appearance={appearance} className={styles.crmToolbarButton} onClick={onCombinedClick} />;
}

const useStyles = makeStyles({
	crmToolbarButton: {
		fontWeight: tokens.fontWeightRegular,
		wordSpacing: "nowrap",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		minWidth: "unset",
	},
});