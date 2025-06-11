import { Dropdown, makeStyles, Option, tokens } from "@fluentui/react-components";
import type { CrmOptionsDropdownState } from "./Types";

export function useCrmOptionsDropdownView(state: CrmOptionsDropdownState)
{
	const style = useCrmOptionsDropdownStyles();

	return <Dropdown appearance="filled-darker" className={style.crm} 
		value={state.text} selectedOptions={state.selectedOptions} onOptionSelect={state.onOptionSelect} 
		{...state.dropdownProps}>
		{state.options.map((option) => <Option key={option.value} value={option.value.toString()} text={option.text}>{option.text}</Option>)}
	</Dropdown>;
}

const useCrmOptionsDropdownStyles = makeStyles({
	crm: {
		background: tokens.colorNeutralBackground3,
	},
});