import { ValidationContext, ValidationProviderProps } from "./Types";
import { generateValidatorMap, validationContext } from "./Context";
import { PropsWithChildren, useMemo } from "react";
import { useBuildinValidations } from "./BuildInValidations";

export * from "./Hooks";

export function ValidationProvider(props: PropsWithChildren<ValidationProviderProps>) {

    const { validators } = props;
    const buildInValidators = useBuildinValidations();

    const context = useMemo<ValidationContext>(() => ({
        validators: generateValidatorMap([...buildInValidators, ...(validators ?? [])]),
    }), [validators]);

    const Provider = validationContext.Provider;

    return <Provider value={context}>
        { props.children }
    </Provider>;
}