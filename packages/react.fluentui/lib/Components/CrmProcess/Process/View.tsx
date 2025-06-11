import { ChevronLeftRegular, ChevronRightRegular } from "@fluentui/react-icons";
import { ProcessProvider } from "./Context";
import type { ProcessContextValues, ProcessState, ProcessStyles } from "./Types";

export function useProcessView(state: ProcessState, contextValues: ProcessContextValues, styles: ProcessStyles)
{
	return <div className={styles.root}>
		{state.showHeader && <div className={styles.header}>
			{state.title && <div className={styles.title}><state.title /></div>}
			{state.subTitle && <div className={styles.subTitle}><state.subTitle /></div>}
		</div>}

		{state.allowStepBack && <button className={styles.stepBack} onClick={state.onStepBack} disabled={!state.canStepBack}>
			<ChevronLeftRegular />
		</button>}

		<ul className={styles.list}>
			<ProcessProvider value={contextValues.process}>
				{state.children}
			</ProcessProvider>
		</ul>

		{state.allowStepNext && <button className={styles.stepNext} onClick={state.onStepNext} disabled={!state.canStepNext}>
			<ChevronRightRegular />
		</button>}
	</div>;
};