import type { MessageBarProps } from "@fluentui/react-components";
import { makeStyles, mergeClasses, MessageBar, tokens } from "@fluentui/react-components";
import type { PropsWithChildren } from "react";

export type CrmMessageBarProps = MessageBarProps & {
	emphasize?: boolean,
};

export function CrmMessageBar(props: PropsWithChildren<CrmMessageBarProps>)
{
	const { emphasize, children, ...rest } = props;

	const style = useMessageBarStyles();
	return <MessageBar {...rest} className={mergeClasses(emphasize ? style[props.intent ?? "info"] : undefined,props.className)}>
		{children}
	</MessageBar>;
}

const useMessageBarStyles = makeStyles({
	info: {
		background: tokens.colorPaletteBlueBackground2,
		border: `solid 1px ${tokens.colorPaletteBlueBorderActive}`,
		color: tokens.colorPaletteBlueForeground2,
		"&>div": {
			color: tokens.colorPaletteBlueForeground2,
		},
	},
	success: {
		background: tokens.colorPaletteGreenBackground2,
		border: `solid 1px ${tokens.colorPaletteGreenBorderActive}`,
		color: tokens.colorPaletteGreenForeground2,
		"&>div": {
			color: tokens.colorPaletteGreenForeground2,
		},
	},
	warning: {
	},
	error: {
	},
});

