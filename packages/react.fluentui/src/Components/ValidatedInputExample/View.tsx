import { makeStyles } from "@fluentui/react-components";
import type { ValidatedInputExampleState } from "./Types";
import { CrmInput } from "../../../lib/Components/CrmInput";

export function useValidatedInputExampleView(_state: ValidatedInputExampleState)
{
	const style = useValidatedInputExampleStyles();

	return <div className={style.root}>
		<CrmInput />
	</div>;
}

const useValidatedInputExampleStyles = makeStyles({
	root: {
	}
})