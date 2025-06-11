import { makeStyles } from "@fluentui/react-components";
import type { [FTName]State } from "./Types";

export function use[FTName]View(_state: [FTName]State)
{
	const style = use[FTName]Styles();

	return <div className={style.root}>
	</div>;
}

const use[FTName]Styles = makeStyles({
	root: {
	}
})