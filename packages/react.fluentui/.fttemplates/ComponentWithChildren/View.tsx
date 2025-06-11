import type { ReactNode } from "react";

import { makeStyles } from "@fluentui/react-components";
import type { [FTName]State } from "./Types";

export function use[FTName]View(children: ReactNode, _state: [FTName]State)
{
	const style = use[FTName]Styles();

	return <div className={style.root}>
		{children}
	</div>;
}

const use[FTName]Styles = makeStyles({
	root: {
	}
})