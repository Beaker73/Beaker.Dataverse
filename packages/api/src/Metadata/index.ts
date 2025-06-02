export * from "./Boolean";
export * from "./Date";
export * from "./DateTime";
export * from "./Field";
export * from "./Float";
export * from "./Id";
export * from "./Image";
export * from "./Integer";
export * from "./Json";
export * from "./Money";
export * from "./OptionSet";
export * from "./Reference";
export * from "./String";

export * from "./DefaultFields";
export * from "./Derive";
export * from "./Entity";
export * from "./Methods";

import type { BooleanFieldMetadata } from "./Boolean";
import { DateFieldMetadata } from "./Date";
import type { DateTimeFieldMetadata } from "./DateTime";
import type { FloatFieldMetadata } from "./Float";
import type { IdFieldMetadata } from "./Id";
import type { ImageFieldMetadata } from "./Image";
import type { IntegerFieldMetadata } from "./Integer";
import type { JsonFieldMetadata } from "./Json";
import type { MoneyFieldMetadata } from "./Money";
import type { OptionSetFieldMetadata } from "./OptionSet";
import type { ReferenceFieldMetadata } from "./Reference";
import type { StringFieldMetadata } from "./String";

/// Type Extension Point
/// Add: FieldTypes field of types with you extensions
export interface Extensions
{
}

export type CoreFieldMetadata =
	| BooleanFieldMetadata
	| DateTimeFieldMetadata
	| DateFieldMetadata
	| FloatFieldMetadata
	| IdFieldMetadata
	| ImageFieldMetadata
	| IntegerFieldMetadata
	| JsonFieldMetadata
	| MoneyFieldMetadata
	| OptionSetFieldMetadata
	| ReferenceFieldMetadata
	| StringFieldMetadata
	;

export type FieldMetadata = 
	Extensions extends { "customTypes": infer TCustomTypes } 
		? CoreFieldMetadata | TCustomTypes 
		: CoreFieldMetadata
	;