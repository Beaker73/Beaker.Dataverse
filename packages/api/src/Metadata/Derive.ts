
import type { Guid, Merge, tags } from "../Helpers";
import type { EntityMetadata } from "./Entity";
import type { CoreType, FieldMetadataBase } from "./Field";

/** make field nullable if it was marked as optional */
type MaybeOptional<TCore, TField extends FieldMetadataBase> = TField extends { options: { optional: true } } ? TCore | null : TCore;

/** Determines the type of the field based on metadata */
export type FieldType<TField extends FieldMetadataBase> = MaybeOptional<CoreType<TField>, TField>;

/** Generates a type from the entity metadata */
export type TypeFromMetadata<TMetadata> = 
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	TMetadata extends EntityMetadata<infer _TSchemaName, infer TFields>
		? Merge<[
			{ -readonly [K in keyof TFields]: FieldType<TFields[K]> },
			{ id: Guid<TMetadata["schemaName"]> },
			{ [tags]: {
				type: "Entity",
				schemaName: TMetadata["schemaName"],
				metadata: TMetadata,
			}}
		]>
		: never;
