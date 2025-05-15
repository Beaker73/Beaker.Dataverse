import { dateTime } from "./DateTime";
import { enumMetadata, optionSet } from "./OptionSet";
import { reference } from "./Reference";



export function entityMutationFields()
{
	return {
		createdBy: reference("CreatedBy", "SystemUser"),
		createdOn: dateTime("CreatedOn", {}),
		modifiedBy: reference("ModifiedBy", "SystemUser"),
		modifiedOn: dateTime("ModifiedOn", {}),
	} as const;
}

export type EntityMutationFields = keyof ReturnType<typeof entityMutationFields>;




/** The default states an antity can have in their statecode field */
export enum EntityState {
	Active = 0,
	Inactive = 1,
}

/** The default statusses an entity can have in their statuscode field */
export enum EntityStatus {
	Active = 1,
	Inactive = 2,
}


export function entityStateFields<
	S1 = EntityStatus,
	S0 = EntityState,
>(
	// we define status before state as for custom entities only that can be changed
	_defaultStatus?: S1,  // while value not used in code, it is used for inference
	statuses?: object,
	_defaultState?: S0,  // while value not used in code, it is used for inference
	states?: object,
) 
{
	type StateCode = S0;
	type StatusCode = S1;

	return {

		state: optionSet("statecode", enumMetadata<StateCode>(states ?? EntityState)),
		status: optionSet("statuscode", enumMetadata<StatusCode>(statuses ?? EntityStatus)),

	} as const;
}

export type K<T> = T extends (a: infer _S1,b: object,c: infer _S1, d: object) => infer R ? R : never;
export type EntityStateFields = keyof K<typeof entityStateFields>;