import { useMemo } from "react"
import { emailValidator } from "./EmailAddress"
import { requiredValidator } from "./Required"
import { urlValidator } from "./Url"

export function useBuildinValidations() {

    return useMemo(() => {
        return [
            emailValidator,
            requiredValidator,
            urlValidator,
        ]
    }, [])
}