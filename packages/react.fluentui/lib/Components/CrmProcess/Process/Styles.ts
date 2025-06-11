import { makeStyles, mergeClasses, shorthands, tokens } from "@fluentui/react-components";
import type { ProcessState } from "./Types";

export function useProcessStateBasedStyles(state: ProcessState)
{
	const styles = useProcessStyles();

	return {
		root: styles.root,
		list: styles.list,
		header: styles.header,
		title: styles.title,
		subTitle: styles.subTitle,
		stepBack: mergeClasses(styles.step, state.canStepBack ? undefined : styles.stepDisabled),
		stepNext: mergeClasses(styles.step, state.canStepNext ? undefined : styles.stepDisabled),
	};
}

export const useProcessStyles = makeStyles({
	root: {
		display: "flex !important", // when inside card-preview, it is overruling flex to block
		flexDirection: "row",
		width: "100%",
		...shorthands.margin("14px", 0),
	},
	header: {
		width: "200px",
		flexGrow: 0,
		background: tokens.colorBrandBackground,
		color: tokens.colorStrokeFocus1,
		...shorthands.margin("14px", 0),
		...shorthands.padding("6px", "14px"),
		lineHeight: tokens.lineHeightBase200,
	},
	title: {
		fontSize: tokens.fontSizeBase300,
		fontWeight: tokens.fontWeightSemibold,
		overflow: "hidden",
		wordSpacing: "nowrap",
		textOverflow: "ellipsis",
	},
	subTitle: {
		fontSize: tokens.fontSizeBase200,
		fontWeight: tokens.fontWeightRegular,
		overflow: "hidden",
		wordSpacing: "nowrap",
		textOverflow: "ellipsis",
	},
	list: {
		display: "flex",
		flexDirection: "row",
		flexGrow: 1,
		width: "100%",
		background: tokens.colorNeutralBackground4,
		borderTop: `solid 4px ${tokens.colorNeutralStroke2}`,
		...shorthands.padding(0),
		...shorthands.margin("14px", 0),
	},
	step: {
		border: `solid 1px ${tokens.colorNeutralStroke1}`,
		background: tokens.colorNeutralBackground1,
		color: tokens.colorNeutralForeground1,
		flexGrow: 0,
		fontSize: "22px",
		...shorthands.padding("4px", 0, 0, 0),
		...shorthands.margin("14px", 0),
		width: "24px",
		cursor: "pointer",
	},
	stepDisabled: {
		cursor: "default",
		background: tokens.colorNeutralBackgroundDisabled,
		color: tokens.colorNeutralForegroundDisabled,
	},
});