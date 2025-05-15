import type { Guid } from "../Helpers/Types";
import type { Entity } from "../Metadata";
import type { EntityData, EntityReference } from "./ConnectorTypes";
import type { Query } from "../Query";

export interface ApiRetrieveOptions {
	fields: string[],
	includeNamesOfReferences?: boolean,
}

export interface ApiConnector
{
	retrieve(entityName: string, id: Guid, options?: ApiRetrieveOptions ): Promise<EntityData>;
	retrieveMultiple(query: Query): Promise<EntityData[]>;
	create(schemaName: string, data: EntityData): Promise<Guid>;
	update(schemaName: string, id: Guid, data: EntityData): Promise<unknown>;
	remove(schemaName: string, id: Guid): Promise<void>;
	execute(action: DataverseAction): Promise<unknown>;
	fetch(entityName: string, fetchXml: string): Promise<unknown>;
	downloadImage(schemaName: string, id: Guid, field: string): Promise<Blob>;

	whoAmI(): Promise<WhoAmIResponse>;
	retrieveOptionSetValues(entitySchemaName: string, fieldSchemaName: string): Promise<Record<number, string>>
	getSetName(entityName: string): string | undefined;
}

export type DataverseAction<T extends object = object> = T & { 
	boundTo?: EntityReference | Entity,
	name: string,
	parameters: Record<string, unknown>,
	onSuccess: (result: unknown) => unknown,
};

export interface WhoAmIResponse
{
	OrganizationId: Guid,
	BusinessUnitId: Guid,
	UserId: Guid,
}