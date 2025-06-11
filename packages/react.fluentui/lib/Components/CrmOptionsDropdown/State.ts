import { useApi } from "@/Hooks/Environment";
import type { DropdownProps } from "@fluentui/react-components";
import { useCallback, useMemo } from "react";
import { useQuery } from "react-query";
import type { CrmOptionsDropdownProps } from "./Types";

export function useCrmOptionsDropdownState<T extends number = number>(props: CrmOptionsDropdownProps<T>)
{
	const { entityMetadata, field, value, onValueChange,  ...dropdownProps } = props;
	const api = useApi();

	const { data: optionData } = useQuery({
		queryKey: ["Options", entityMetadata.schemaName, field],
		queryFn: async () => 
		{
			const values = await api?.getOptionSetValues<T>(entityMetadata, field as string);
			if(!values )
				return [];

			const options =  Object.entries(values).map(([k,v]) => ({ value: parseInt(k) as T, text: v as string }));
			return options;
		},
		enabled: !!api,
	});

	const selectedOption = useMemo(() => optionData?.find((o) => o.value === value), [optionData, value]);
	const selectedOptionIds = useMemo(() => selectedOption ? [selectedOption.value.toString()] : [], [selectedOption]);
	const text = selectedOption?.text ?? "";

	const onOptionSelect = useCallback<NonNullable<DropdownProps["onOptionSelect"]>>(
		(_, data) => 
		{
			if(!data.optionValue)
			{
				onValueChange?.(undefined);
			}
			else 
			{
				const value = parseInt(data.optionValue);
				const option = optionData?.find((o) => o.value === value);
				if(option) 
				{
					onValueChange?.(option.value);
				}
			}
		}, [onValueChange, optionData]);

	return {
		dropdownProps,
		options: optionData ?? [],
		text, selectedOptions: selectedOptionIds, onOptionSelect,
	};
}