import type { Issue } from "../Helpers";
import type { FieldMetadata } from ".";
import type { CoreServerType } from "../Types";
import type { FieldType } from "./Derive";

/** The setup options that are valid for creation of all types of fields */
export interface FieldSetupOptions {
	/** Whether the field is optional, i.e. if it allows null */
	optional?: boolean,

	/** optional converter added by user */
	converter?: {
		convert(value: unknown): unknown,
		revert(value: unknown): unknown,
	}
}


const coreTypeKey = Symbol("coreType");

/** The metadata that is shared by all fields */
export interface FieldMetadataBase {
	/** The schema name of the field */
	schemaName: string,
}

/** Adds core types metadata to existing metadata */
export type CoreTypeTag<TMeta extends FieldMetadataBase, TCore> = TMeta & { 
	[coreTypeKey]: TCore, // core type is only metadata for deriving types from metadata
};

/** Tags the metadata with core types */
// based on typed argument currying, so we can provided a single type argument and infer the second one without explicitly providing it.
// https://stackoverflow.com/questions/60377365/typescript-infer-type-of-generic-after-optional-first-generic
export function coreTag<TCore>(): <TMeta extends FieldMetadataBase>(meta: TMeta) => CoreTypeTag<TMeta, TCore>
{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return meta => meta as any;
}

/** Extracts core type from field metadata */
export type CoreType<TFieldMetadata> = TFieldMetadata extends {	[coreTypeKey]: infer TCore } ? TCore : unknown;


/** The options that are applicable to all fields */
export interface FieldOptions
{
	/** If the field is optional (i.e. if null is allowed) */
	optional: boolean,
	
	/** The optional default value if the value is null and the field is not optional. If not given the system will throw, if given the default is used instead. */
	defaultValue?: unknown
	
	/** optional converter added by user */
	converter: null | {
		convert(value: unknown): unknown,
		revert(value: unknown): unknown,
	}
}

export type TypeDescriptor = { 
	typeName: string, 
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ctor: (type: string, ...args: any[]) => FieldMetadataBase, 
	operations: TypeOperations,
};

export type TypeOperations<
	TField extends FieldMetadataBase = FieldMetadata,
	TValue extends FieldType<TField> | unknown = unknown,
> = {
	validate?: (value: Exclude<TValue, null>, field: TField) => Issue[],
	truncate?: (value: Exclude<TValue, null>, field: TField) => Exclude<TValue, null>,
	convert?: {
		toClientModel(value: Exclude<CoreServerType, null>, field: TField): TValue,
		toServerModel(value: TValue, field: TField): CoreServerType,
	}
};

const fieldTypes: Record<string, TypeDescriptor> = {};

/** registers a new field type */
export function fieldType<
	const TCtor extends (
		schemaName: TMetadata["schemaName"],
		options?: TSetupOptions,
	) => TMetadata,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const TSetupOptions extends FieldSetupOptions = TCtor extends (schemaName: string, options?: infer TOptions) => (infer _TReturnMeta extends FieldMetadataBase) ? TOptions : never,
	const TMetadata extends FieldMetadataBase = TCtor extends (schemaName: string, options?: infer _TOptions) => (infer TReturnMeta extends FieldMetadataBase) ? TReturnMeta : never,
	const TType extends string = TMetadata extends { type: (infer TTypeName extends string) } ? TTypeName : never,
	const TValue = CoreType<TMetadata>,
>(
	ctor: TCtor,
	typeName: NoInfer<TType>, 
	operations?: NoInfer<TypeOperations<TMetadata, TValue>>,
): TCtor 
{
	fieldTypes[typeName] = {
		typeName,
		ctor,
		operations: (operations ?? {}) as unknown as TypeOperations,
	};

	return ctor;
}

/**
 * Gets the type descriptor for the given type
 * @param typeName The name of the type to get the descriptor for
 * @returns The type descriptor or undefined if not found
 */
export function getTypeDescriptor(typeName: string): TypeDescriptor | undefined
{
	return fieldTypes[typeName];
}