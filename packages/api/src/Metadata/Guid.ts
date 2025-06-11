import { Guid, Issue, tryParseGuid } from "../Helpers";
import { coreTag, FieldMetadataBase, FieldOptions, FieldSetupOptions, fieldType } from "./Field";

export interface GuidFieldSetupOptions extends FieldSetupOptions {
    /** The target schema name for the guid field */
    targetSchemaName: string,
}

export interface GuidFieldMetadata extends FieldMetadataBase {
    type: "guid",
    options: GuidFieldOptions,
}

export interface GuidFieldOptions extends FieldOptions {
    /** The target schema name for the guid field */
    targetSchemaName: string,
}


export function guidConstructor<
    const TFieldSchemaName extends string,
    const TOptions extends GuidFieldSetupOptions,
>(
    schemaName: TFieldSchemaName,
    options?: TOptions,
) {
    type TGuid = Guid<TOptions["targetSchemaName"]>;

    const metadata = {
        schemaName,
        type: "guid",
        options: {
            optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
            targetSchemaName: (options as GuidFieldSetupOptions).targetSchemaName,
        } satisfies GuidFieldSetupOptions,
    } satisfies GuidFieldMetadata;

    return coreTag<TGuid>()(metadata);
}

const coreGuid = fieldType(guidConstructor, "guid", {
    validate(value) {
        function* yieldValidations(): Generator<Issue> {
            if (typeof value !== "string") {
                yield { level: "error", message: "Value is not a string, thus can never by an formatted guid" };
                return;
            }

            const falseOrGuid = tryParseGuid(value);
            if (falseOrGuid === false)
                yield { level: "error", message: `The value '${value}' is not a valid guid` };

            return falseOrGuid;
        }

        return [...yieldValidations()];
    },
});

export function guid<
    const TFieldSchemaName extends string,
    const TTargetSchemaName extends string,
    TOtherOptions extends Omit<GuidFieldSetupOptions, "targetSchemaName"> = Omit<GuidFieldSetupOptions, "targetSchemaName">
>(
    fieldSchemaName: TFieldSchemaName,
    targetSchemaName: TTargetSchemaName,
    options?: TOtherOptions extends Omit<GuidFieldSetupOptions, "targetSchemaName"> ? TOtherOptions : GuidFieldSetupOptions,
) {
    type TOptions = TOtherOptions & { targetSchemaName: TTargetSchemaName };

    return coreGuid<TFieldSchemaName, TOptions>(fieldSchemaName, {
        ...options,
        targetSchemaName: targetSchemaName as TTargetSchemaName,
    } as TOptions);
}