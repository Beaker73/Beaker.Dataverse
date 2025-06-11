import { Card, CardHeader, CardPreview, makeStyles, Tab, TabList, tokens } from "@fluentui/react-components";
import type { ProcessExampleState } from "./Types";
import { Process, ProcessStep } from "../../../lib";
import { bundleIcon, DeveloperBoardFilled, DeveloperBoardRegular } from "@fluentui/react-icons";

export function useProcessExampleView(state: ProcessExampleState)
{
    const DevIcon = bundleIcon(DeveloperBoardFilled, DeveloperBoardRegular);
	const style = useProcessExampleStyles();

	return <Card className={style.root}>
            <CardHeader header={<div className={style.header}>Process Example</div>} />
            <CardPreview>
                <Process selectedStep={state.selectedStep} onStepSelect={state.onStepSelect}  title="Example Process" subTitle="Example process with 4 steps">
                    <ProcessStep value="dev" title="Development" icon={<DevIcon />}></ProcessStep>
                    <ProcessStep value="tst" title="Test"></ProcessStep>
                    <ProcessStep value="uat" title="Acceptance"></ProcessStep>
                    <ProcessStep value="prd" title="Production"></ProcessStep>
                </Process>
            </CardPreview>
        </Card>;
}

const useProcessExampleStyles = makeStyles({
	root: {
	},
	header: {
		fontWeight: tokens.fontWeightSemibold,
		fontSize: tokens.fontSizeBase500,
	}
})