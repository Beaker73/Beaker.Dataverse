import type { EntityMetadata, TypeFromMetadata } from "@beaker73/dataverse.api";
import type { DropdownProps } from "@fluentui/react-components";

import type { useCrmOptionsDropdownState } from "./State";

export type CrmOptionsDropdownProps<T extends number = number, Entity extends EntityMetadata = EntityMetadata> = Omit<DropdownProps, "value" | "onValueChange"> & {
	/** The currently selected value */
	value?: T | undefined,
	/** Called when the selected value changed */
	onValueChange?: (value: T | undefined) => void,
	/** The entity the optionset lives on */
	entityMetadata: Entity,
	/** The field the optionset is for */
	field: keyof TypeFromMetadata<Entity>,
};

export type CrmOptionsDropdownState = ReturnType<typeof useCrmOptionsDropdownState>;