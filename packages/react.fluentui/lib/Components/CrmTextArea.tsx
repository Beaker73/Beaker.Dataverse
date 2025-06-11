import type { FieldMetadata } from "@beaker73/dataverse.api";
import type { TextareaProps } from "@fluentui/react-components";
import { Textarea, makeStyles, mergeClasses, tokens } from "@fluentui/react-components";

type CrmTextareaProps = {
	metadata?: FieldMetadata;
} & TextareaProps;

export function CrmTextArea(props: CrmTextareaProps) 
{
	const { metadata, ...textareaProps } = props;

	let maxLength = props.maxLength;
	if(metadata && metadata.type === "string")
		maxLength ??= metadata.options.maxLength;

	const styles = useStyles();
	return <div className={mergeClasses(styles.crm, props.readOnly ? styles.disabled : undefined)}>
		<Textarea appearance="filled-darker" resize="vertical" {...textareaProps} maxLength={maxLength} textarea={{ className: styles.area }} />
	</div>;
}

const useStyles = makeStyles({
	// bug in @fluentui/react-components: 9.53.0,
	// seems to ignore className in TextareaProps
	// so overrule the styles here, 
	// by wrapping in div, and applying styles to inner elements
	crm: {
		width: "100%",
		"& span": {
			width: "100%",
			background: tokens.colorNeutralBackground3,
			borderRadius: tokens.borderRadiusLarge,
			"&:after": {
				borderBottom: `solid 2px ${tokens.colorBrandStroke1}`,
			},
		},
	},
	disabled: {
		"& span": {
			"&:after": {
				borderBottom: `solid 2px ${tokens.colorNeutralStrokeDisabled}`,
			},
		},
	},
	area: {
		width: "100%",
		background: tokens.colorNeutralBackground3,
		minHeight: "100px",
	},
});