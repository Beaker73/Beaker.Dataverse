import { makeStyles, tokens } from "@fluentui/react-components";
import type { PropsWithChildren } from "react";

export function CrmValue(props: PropsWithChildren) 
{
	const style = useCrmValueStyles();

	return <div className={style.root}>
		{props.children ?? <span>&nbsp;</span>}
	</div>;
}

export const useCrmValueStyles = makeStyles({
	root: {
		border: `solid ${tokens.strokeWidthThin} ${tokens.colorNeutralStroke1}`,
		borderRadius: tokens.borderRadiusMedium,
		padding: `${tokens.spacingHorizontalXS} ${tokens.spacingHorizontalS}`,
		backgroundColor: tokens.colorNeutralBackground3,
		color: tokens.colorNeutralForeground3,
	},
});