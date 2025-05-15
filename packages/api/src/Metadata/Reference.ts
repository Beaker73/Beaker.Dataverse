import { type Guid } from "../Helpers";
import type { EntityReference } from "../Types/ConnectorTypes";

import type { EntityMetadata } from "./Entity";
import { coreTag, fieldType, type FieldMetadataBase, type FieldOptions, type FieldSetupOptions } from "./Field";

export interface ReferenceFieldSetupOptions extends FieldSetupOptions
{
	targetSchemaName: string,
}

export interface ReferenceFieldMetadata extends FieldMetadataBase
{
	/** The type of the field, in this case a reference */
	type: "reference",
	/** The options for the reference field */
	options: ReferenceFieldOptions,
}

export interface ReferenceFieldOptions extends FieldOptions
{
	/** The target entity for the reference */
	targetSchemaName: string,
}

export function referenceConstructor<
	TFieldSchemaName extends string,
	TOptions extends ReferenceFieldSetupOptions,
>(
	schemaName: TFieldSchemaName,
	options?: TOptions,
)
{
	type Target = TOptions["targetSchemaName"] extends string ? TOptions["targetSchemaName"] : never;
	type Reference = EntityReference<Target>;

	const metadata = {
		schemaName,
		type: "reference",
		options: {
			optional: (options?.optional ?? false) as TOptions extends { optional: true } ? true : false,
			targetSchemaName: options?.targetSchemaName as Target,
		} satisfies ReferenceFieldOptions,
	} satisfies ReferenceFieldMetadata;

	return coreTag<Reference>()(metadata);
}

const coreReference = fieldType(referenceConstructor, "reference", {});

export function reference<
	TFieldSchemaName extends string,
	TTargetSchemaName extends string,
	TOtherOptions extends Omit<ReferenceFieldSetupOptions, "targetSchemaName"> = Omit<ReferenceFieldSetupOptions, "targetSchemaName">
>(
	fieldSchemaName: TFieldSchemaName,
	targetSchemaName: TTargetSchemaName,
	options?: TOtherOptions extends Omit<ReferenceFieldSetupOptions, "targetSchemaName"> ? TOtherOptions : ReferenceFieldSetupOptions,
)
{
	type TOptions = TOtherOptions & { targetSchemaName: TTargetSchemaName };

	return coreReference<TFieldSchemaName, TOptions>(fieldSchemaName, {
		...options,
		targetSchemaName: targetSchemaName as TTargetSchemaName,
	} as TOptions);
}


/**
 * Creats a reference to an entity with the given id
 * @param metadata The metadata of the entity to create a reference to
 * @param id The if of the entity to create a reference to
 * @returns Reference to the entity
 */
export function entityReference<
	TMetadata extends EntityMetadata,
>(
	metadata: TMetadata, 
	id: Guid<TMetadata["schemaName"]>,
)
{
	return {
		schemaName: metadata.schemaName as TMetadata["schemaName"],
		id,
	} satisfies EntityReference<TMetadata["schemaName"]>;
}
