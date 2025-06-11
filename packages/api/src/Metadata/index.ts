export * from "../Api";
export * from "./Boolean";
export * from "./DateTime";
export * from "./DefaultFields";
export * from "./Derive";
export * from "./Entity";
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

import type { BooleanFieldMetadata } from "./Boolean";
import type { DateTimeFieldMetadata } from "./DateTime";
import type { FloatFieldMetadata } from "./Float";
import { GuidFieldMetadata } from "./Guid";
import type { IdFieldMetadata } from "./Id";
import type { ImageFieldMetadata } from "./Image";
import type { IntegerFieldMetadata } from "./Integer";
import type { JsonFieldMetadata } from "./Json";
import type { MoneyFieldMetadata } from "./Money";
import type { OptionSetFieldMetadata } from "./OptionSet";
import type { ReferenceFieldMetadata } from "./Reference";
import type { StringFieldMetadata } from "./String";

export type FieldMetadata =
	| BooleanFieldMetadata
	| DateTimeFieldMetadata
	| FloatFieldMetadata
	| GuidFieldMetadata
	| IdFieldMetadata
	| ImageFieldMetadata
	| IntegerFieldMetadata
	| JsonFieldMetadata
	| MoneyFieldMetadata
	| OptionSetFieldMetadata
	| ReferenceFieldMetadata
	| StringFieldMetadata
	;

