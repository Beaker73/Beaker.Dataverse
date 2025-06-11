import type { ProcessStepState, ProcessStepStyles } from "./Types";

export const renderProcessStep =
	(state: ProcessStepState, styles: ProcessStepStyles) => 
	{
		return <li className={styles.root}>
			<div className={styles.highlight}></div>
			<button className={styles.button}>
				<div className={styles.outerCircle}>
					{state.isSelected && <div className={styles.innerCircle}></div>}
					{state.isProcessed && <div className={styles.checkmark}>
						<state.checkmark />
					</div>}
				</div>
				<span className={styles.textAndIcon}>
					{state.hasIcon && state.icon && <span className={styles.icon}><state.icon /></span>}
					{!state.iconOnly && state.title && <span className={styles.title}>
						<state.title />
					</span>}
				</span>
			</button>
		</li>;
	};