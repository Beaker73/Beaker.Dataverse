import { Guid } from "../Helpers";

export interface WhoAmITypedResponse
{
	OrganizationId: Guid,
	BusinessUnitId: Guid<"BusinessUnit">,
	UserId: Guid<"SystemUser">,
}