import { GlobeIcon, MailIcon } from "@/Helpers/Icons";
import { Input, makeStyles, tokens, ToolbarButton } from "@fluentui/react-components";
import type { CrmInputState } from "./Types";
import { Fragment } from "react/jsx-runtime";

export function useCrmInputView(state: CrmInputState)
{
	const style = useCrmInputStyles();
	return <Fragment>
		{state.Validators}
		<Input appearance="filled-darker" 
			className={style.crm} 
			contentAfter={
				state.canOpenUrl ? <ToolbarButton className={style.inlineButton} onClick={state.openUrl} title="Open in Browser" icon={<GlobeIcon />} /> :
					state.canOpenEmail ? <ToolbarButton className={style.inlineButton} onClick={state.openEmail} title="Send Email" icon={<MailIcon />} /> :
						undefined
			}
			{...state.inputProps}
			onBlur={state.onFormat}
		/>
	</Fragment>;
}

const useCrmInputStyles = makeStyles({
	crm: {
		background: tokens.colorNeutralBackground3,
	},
	inlineButton: {
		marginTop: "-1px",
		marginBottom: "-1px",
		marginRight: "-11px",
		background: tokens.colorNeutralBackground6,
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,

		"&:hover": {
			background: tokens.colorNeutralBackground6,
		},
	},
});