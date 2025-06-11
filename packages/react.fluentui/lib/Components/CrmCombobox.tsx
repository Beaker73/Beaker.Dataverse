import type { ComboboxProps } from "@fluentui/react-components";
import { Combobox, makeStyles, tokens } from "@fluentui/react-components";

export type CrmComboboxProps = ComboboxProps;

export function CrmCombobox(props: CrmComboboxProps) 
{
	const styles = useStyles();
	return <Combobox appearance="filled-darker" className={styles.crm} {...props} />;
}

const useStyles = makeStyles({
	crm: {
		background: tokens.colorNeutralBackground3,
	},
});