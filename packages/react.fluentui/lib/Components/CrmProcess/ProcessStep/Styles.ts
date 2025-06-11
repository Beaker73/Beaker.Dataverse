import { makeStyles, mergeClasses, shorthands, tokens } from "@fluentui/react-components";
import type { ProcessStepState } from "./Types";

export function useProcessStepStateBasedStyles(state: ProcessStepState)
{
	const styles = useProcessStepStyles();

	return {
		root: styles.root,
		highlight: mergeClasses(
			styles.highlight,
			state.isSelected ? (state.isFirst ? undefined : styles.partialHighlight) : state.isProcessed ? (state.isFirst ? styles.firstHighlight : styles.fullHighlight) : undefined,
		),
		button: mergeClasses(
			styles.button,
			state.isSelected ? styles.buttonSelected : undefined,
		),
		title: styles.title,
		outerCircle: mergeClasses(
			styles.outerCircle,
			state.isSelected ? styles.outerCircleSelected : undefined,
			state.isProcessed ? styles.outerCircleProcessed : undefined,
		),
		innerCircle: mergeClasses(
			styles.innerCircle,
			state.isSelected ? styles.innerCircleSelected : undefined,
		),
		checkmark: mergeClasses(
			styles.checkmark,
			state.isProcessed ? styles.checkmarkProcessed : undefined,
		),
		icon: styles.icon,
		textAndIcon: styles.textAndIcon,
	};
}

export const useProcessStepStyles = makeStyles({
	root: {
		position: "relative",
		display: "block",
		flexGrow: 1, // grow step inside container
		...shorthands.padding(0),
		...shorthands.margin(0),
	},
	highlight: {
		display: "none",
		position: "absolute",
		marginTop: "-4px",
		height: "4px",
		width: "0",
		background: tokens.colorNeutralForeground3,
	},
	firstHighlight: {
		display: "block",
		width: "50%",
		left: "50%",
	},
	fullHighlight: {
		display: "block",
		width: "100%",
	},
	partialHighlight: {
		display: "block",
		width: "50%",
	},
	button: {
		display: "flex", // button itself is a flex container to allign content
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		minWidth: "150px",

		fontWeight: tokens.fontWeightRegular,
		fontSize: tokens.fontSizeBase300,

		border: "none",
		background: "none",
		...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
	},
	title: {
		//paddingTop: "10px",
	},
	buttonSelected: {
		fontWeight: tokens.fontWeightSemibold,
	},
	outerCircle: {
		position: "absolute",
		marginTop: "-45px",

		width: "20px",
		height: "20px",
		border: `solid 4px ${tokens.colorNeutralForeground3}`,
		borderRadius: "50%",
		background: tokens.colorNeutralBackground2,
	},
	outerCircleSelected: {
		border: `solid 4px ${tokens.colorNeutralForeground2BrandSelected}`,
	},
	outerCircleProcessed: {
		background: tokens.colorNeutralForeground2BrandSelected,
		...shorthands.borderColor(tokens.colorNeutralForeground2BrandSelected),
	},
	innerCircle: {
		display: "none",
		width: "10px",
		height: "10px",
		borderRadius: "50%",
		background: tokens.colorNeutralForeground2BrandSelected,
		margin: "5px",
	},
	innerCircleSelected: {
		display: "block",
	},
	checkmark: {
		display: "none",
	},
	checkmarkProcessed: {
		display: "block",
		color: tokens.colorStrokeFocus1,
		marginTop: "2px",
		fontSize: "16px",
	},
	icon: {
		fontSize: "1.2em",
		marginBottom: "-0.3em",
	},
	textAndIcon: {
		marginTop: "0px",
		display: "flex",
		flexDirection: "row",
		alignItems: "end",
		gap: tokens.spacingHorizontalS,
		height: "1.7em",
	},
});