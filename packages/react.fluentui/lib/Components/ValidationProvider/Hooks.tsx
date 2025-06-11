import { useContext, useMemo } from "react";
import { validationContext } from "./Context";
import { Validator } from "./Types";

export function useValidatorsForType(type?: string) {

    const context = useContext(validationContext);
    
    return useMemo(
        () => {
            const sharedValidators: Validator[] = context.validators["*"] ?? [];
            const typedValidators: Validator[] = type ? context.validators[type] : [];
            return  [...sharedValidators, ...typedValidators];
        }, 
        []
    );
}