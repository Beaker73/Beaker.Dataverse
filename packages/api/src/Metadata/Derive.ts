
import type { Guid, Merge, tags } from "../Helpers";
import type { EntityMetadata } from "./Entity";
import type { CoreType, FieldMetadataBase } from "./Field";

/** make field nullable if it was marked as optional */
type MaybeOptional<TCore, TField extends FieldMetadataBase> = TField extends { options: { optional: true } } ? TCore | null : TCore;

/** Determines the type of the field based on metadata */
export type FieldType<TField extends FieldMetadataBase> = MaybeOptional<CoreType<TField>, TField>;

/** Generates a type without methods from the entity metadata */
export type BaseTypeFromMetadata<TMetadata> =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	TMetadata extends EntityMetadata<infer _TSchemaName, infer TFields>
	? Merge<[
		{ -readonly [K in keyof TFields]: FieldType<TFields[K]> },
		{ id: Guid<TMetadata["schemaName"]> },
		{
			[tags]: {
				type: "Entity",
				schemaName: TMetadata["schemaName"],
				//metadata: TMetadata,
			}
		}
	]>
	: never;

/** Generates a type with methods from the entity metadata */
export type ExtendedTypeFromMetadata<TMetadata> =
	TMetadata extends { methods: infer TMethods }
	? Merge<[
		BaseTypeFromMetadata<TMetadata>,
		{
			[K in keyof TMethods]: TMethods[K] extends (self: infer TSelf) => infer TResult
			? TSelf extends BaseTypeFromMetadata<TMetadata>

			? ReturnType<TMethods[K]> extends (...args: infer TArgs) => infer TFinalResult
			// curried
			? (...args: TArgs) => TFinalResult
			// non-curried
			: () => TResult
			: never
			: never;
		}
	]>
	: BaseTypeFromMetadata<TMetadata>;

/** Generates a type from the entity metadata */
export type TypeFromMetadata<TMetadata> = TMetadata extends { "methods": any }
	? ExtendedTypeFromMetadata<TMetadata>
	: BaseTypeFromMetadata<TMetadata>;