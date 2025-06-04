import { emptyArray } from "../../Helpers";
import type { Guid } from "../../Helpers/Types";
import { parseGuid, tryParseGuid } from "../../Helpers/Types";
import type { Entity, EntityMetadata } from "../../Metadata";
import { metadata } from "../../Metadata";
import type { ApiConnector, ApiRetrieveOptions, DataverseAction, WhoAmIResponse } from "../../Types";
import type { EntityData } from "../../Types/ConnectorTypes";
import { getMetadata } from "../../EntityMapper";
import type { Query, QueryFilter } from "../../Query";

export async function odataConnector(url: URL, options?: { baseUrl?: string, token?: string, isPortal?: boolean }): Promise<ApiConnector>
{
	const token = options?.token;
	const isPortal = options?.isPortal ?? false;

	// set up basic properties for fetch requests
	const baseUrl = new URL(options?.baseUrl ?? isPortal ? "/_api/" : "/api/data/v9.2/", url);
	const baseConfig = {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json; charset=utf-8",
		},
	} satisfies RequestInit;

	if (token)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(baseConfig.headers as any)["Authorization"] = token;

	// GET request helper
	async function get<T>(partialUrl: string, customHeaders?: Record<string, string>) 
	{
		const config = { ...baseConfig, method: "GET", headers: { ...baseConfig.headers, ...customHeaders } };
		const response = await fetch(new URL(partialUrl, baseUrl), config);
		if (!response.ok)
			throw new Error(`Failed to get ${response.url} due to ${response.statusText}`);
		return response.json() as Promise<T>;
	}

	async function post(partialUrl: string, data: unknown)
	{
		const config = { ...baseConfig, method: "POST", body: JSON.stringify(data) };
		const response = await fetch(new URL(partialUrl, baseUrl), config);
		if (!response.ok)
			throw new Error(`Failed to post ${response.url} due to ${response.statusText}`);
		const createdUri = response.headers.get("OData-EntityId");
		if (createdUri) 
		{
			const id = tryParseGuid(createdUri.match(/\(([^)]+)\)$/)?.[1]);
			if (id)
				return id;
		}
	}

	async function patch(partialUrl: string, data: unknown)
	{
		const config = { ...baseConfig, method: "PATCH", body: JSON.stringify(data) };
		const response = await fetch(new URL(partialUrl, baseUrl), config);
		if (!response.ok)
			throw new Error(`Failed to post ${response.url} due to ${response.statusText}`);
	}

	async function del(partialUrl: string)
	{
		const config = { ...baseConfig, method: "DELETE" };
		const response = await fetch(new URL(partialUrl, baseUrl), config);
		if (!response.ok)
			throw new Error(`Failed to delete ${response.url} due to ${response.statusText}`);
	}


	// fetch metadata needed for odata queries. SetNames for OData queries differ from their SchemaNames
	let entitySetName: (entitySetName: string) => string | undefined;
	if(!isPortal) 
	{
		const _result = await get<EntityDefinitionResponse>("EntityDefinitions?$select=SchemaName,EntitySetName");

		/** Contains the mapping from schemaName to entitySetName for odata queries */
		const entitySetMapping: Record<string, string> = Object.fromEntries(_result.value.map(d => [d.SchemaName, d.EntitySetName]));
		entitySetName = (entityName: string) => 
		{
			if(!entityName)
				return undefined;
			
			const result = entitySetMapping[entityName];
			if(!result) 
			{
				const logicalName = entityName.toLowerCase();
				const key = Object.keys(entitySetMapping)
					.find(k => typeof k === "string" && k.toLowerCase() === logicalName);
				if(key)
					return entitySetMapping[key];
			}
			return result;
		};
	}
	else 
	{
		// portal does not provide metadata, so we 'create' it ourselves
		entitySetName = (entityName: string) => `${entityName}s`; // pluralize the name (todo, handle ies and such)
	}

	return {
		retrieve,
		retrieveMultiple,
		create,
		update,
		remove,
		execute,
		fetch: fetchXml,
		downloadImage,

		// special functions
		whoAmI,
		retrieveOptionSetValues,
		getSetName,
	};


	/**
	 * Converts the raw data of an entity to a slightly more structured form
	 * @param schemaName The schame name of the entity
	 * @param raw The raw data, with the _value fields for references
	 * @returns Slightly typed entity data
	 */
	function entityData(schemaName: string, raw: Record<string, unknown>): EntityData
	{
		const entity = metadata(schemaName);

		return Object.fromEntries(
			Object.entries(raw).map(
				([key, value]) => 
				{
					if (key[0] === "_" && key.endsWith("_value")) 
					{
						const fieldName = key.slice(1, -6);
						const field = Object.values(entity.fields).find(f => f.schemaName.toLowerCase() === fieldName);

						if (field && field.type === "reference")
						{
							if (typeof value === "string")
								return [fieldName, { schemaName: fieldName, id: parseGuid(value) }];
							if (value === null)
								return [fieldName, null];
						}
					}

					return [key, value];
				}),
		) as EntityData;
	}

	async function retrieve(entityName: string, id: Guid, options: ApiRetrieveOptions): Promise<EntityData>
	{
		const { includeNamesOfReferences = false } = options ?? {};
		const args = [];

		if (options?.fields) 
		{
			const entity = metadata(entityName);
			args.push(`$select=${options.fields.map(fieldName => 
			{
				const field = Object.values(entity.fields).find(f => f.schemaName.toLowerCase() === fieldName);
				if (field?.type === "reference")
					return `_${field?.schemaName.toLowerCase()}_value`;
				return fieldName;
			}).join(",")}`);
		}

		const queryArgs = args.join("&");

		const raw = await get<Record<string, unknown>>(
			`${entitySetName(entityName)}(${id})${queryArgs ? `?${queryArgs}` : ""}`,
			includeNamesOfReferences ? {Prefer: "odata.include-annotations=\"OData.Community.Display.V1.FormattedValue\""} : undefined,
		);

		return entityData(entityName, raw);
	}

	async function retrieveMultiple(query: Query): Promise<EntityData[]>
	{
		const entity = metadata(query.schemaName);
		const [filterString, args, { alwaysEmpty }] = query.filter ? stringifyFilter(entity, query.filter) : [undefined, [], { alwaysEmpty: false }];

		if(alwaysEmpty)
			return emptyArray();

		if (filterString)
			args.push(`$filter=${filterString}`);
		if(query.top)
			args.push(`$top=${query.top}`);

		if (query.fields) 
		{
			args.push(`$select=${query.fields.map(fieldName => 
			{
				const field = Object.values(entity.fields).find(f => f.schemaName.toLowerCase() === fieldName);
				if (field?.type === "reference")
					return `_${field?.schemaName.toLowerCase()}_value`;
				return fieldName;
			}).join(",")}`);
		}

		const queryArgs = args.join("&");

		const result = await get<{ value: Record<string, unknown>[] }>(`${entitySetName(query.schemaName)}?${queryArgs}`);
		return result.value.map(raw => entityData(query.schemaName, raw));
	}

	async function create(entityName: string, data: EntityData): Promise<Guid>
	{
		preprocessDataForUpdate(entityName, data);

		const id = await post(`${entitySetName(entityName)}`, data);
		if (!id)
			throw new Error("Failed to create entity or to get resulting id");
		return id;
	}

	function preprocessDataForUpdate(entityName: string, data: EntityData): void
	{
		// process references to create odata compatible data
		const entity = metadata(entityName);
		Object.values(entity.fields)
			.filter(f => f.type === "reference" && f.schemaName.toLowerCase() in data) // only process references that are in the data
			.forEach(f => 
			{
				if(f.type !== "reference")
					return; // just for typescript, we know this is a reference

				// only process references that are not null
				const value = data[f.schemaName.toLowerCase()];

				let navName = f.schemaName.toLowerCase();
				if(f.options.customNavigationName === true)
					navName = f.schemaName;
				else if(typeof f.options.customNavigationName === "string")
					navName = f.options.customNavigationName;

				const newKey = `${navName}@odata.bind`;
				let newValue: string | null = null;

				if(typeof value === "object" && value !== null && "id" in value && typeof value.id === "string") 
					newValue = `/${entitySetName(f.options.targetSchemaName)}(${value.id})`;

				delete data[f.schemaName.toLowerCase()]; // remove the old value
				data[newKey] = newValue; // add the new value
			});
	}

	async function update(entityName: string, id: Guid, data: EntityData): Promise<void>
	{
		preprocessDataForUpdate(entityName, data);
		await patch(`${entitySetName(entityName)}(${id})`, data);
	}

	async function remove(entityName: string, id: Guid): Promise<void>
	{
		await del(`${entitySetName(entityName)}(${id})`);
	}

	async function execute(action: DataverseAction): Promise<void>
	{
		const parts: string[] = [];

		if ("boundTo" in action && typeof action.boundTo === "object") 
		{
			if ("schemaName" in action.boundTo)
			{
				// reference, take schemaname and id directly from it
				parts.push(`${entitySetName(action.boundTo.schemaName)}(${action.boundTo.id})`);
			}
			else 
			{
				// entity, get metadata and use it to get the schemaName
				const metadata = getMetadata(action.boundTo);
				if (metadata)
					parts.push(`${entitySetName(metadata.schemaName)}(${action.boundTo.id})`);
			}
		}

		const params = Object
			.keys(action.parameters)
			.map(k => `${k}=@${k}`)
			.join(",");

		parts.push(`Microsoft.Dynamics.CRM.${action.name}(${params})`);

		const args = Object
			.entries(action.parameters)
			.map(([k, v]) => `@${k}=${stringify(v)}`);

		return await get(`${parts.join("/")}?${args.join("&")}`);

		function stringify(value: unknown): string
		{
			if (typeof value === "string")
				return `'${value.replaceAll("'", "''")}'`;

			if (typeof value === "object" && value !== null && "id" in value && typeof value.id === "string")
			{
				const metadata = getMetadata(value as unknown as Entity);
				if (metadata)
					return JSON.stringify({
						[metadata.fields["id"].schemaName.toLowerCase()]: value.id,
						"@odata.type": `Microsoft.Dynamics.CRM.${metadata.schemaName}`,
					});
			}

			return `${value}`;
		}
	}

	async function fetchXml(entityName: string, fetchXml: string): Promise<object>
	{
		return await get(`${entitySetName(entityName)}?fetchXml=${encodeURIComponent(fetchXml)}`);
	}

	async function downloadImage(entityName: string, id: Guid, fieldName: string): Promise<Blob>
	{
		const config = { ...baseConfig, method: "GET" };
		const response = await fetch(new URL(`${entitySetName(entityName)}(${id})/${fieldName}/$value?size=full`, baseUrl), config);
		if (!response.ok)
			throw new Error(`Failed to get ${response.url} due to ${response.statusText}`);
		return response.blob();
	}

	async function whoAmI(): Promise<WhoAmIResponse>
	{
		return await get<WhoAmIResponse>("WhoAmI");
	}

	function getSetName(entityName: string): string | undefined
	{
		return entitySetName(entityName);
	}

	async function retrieveOptionSetValues(entitySchemaName: string, fieldSchemaName: string): Promise<Record<number, string>>
	{
		const returnValue: Record<number, string> = {};

		const url = `EntityDefinitions(LogicalName='${entitySchemaName.toLowerCase()}')/Attributes(LogicalName='${fieldSchemaName.toLocaleLowerCase()}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet,GlobalOptionSet`;
		const data = await get<OptionSetData>(url);

		const options = data.OptionSet ? data.OptionSet.Options : (data.GlobalOptionSet ? data.GlobalOptionSet.Options : []);
		if (options.length > 0) 
		{
			let i: number;
			for (i = 0; i < options.length; i++) 
				returnValue[options[i].Value] = options[i].Label.LocalizedLabels[0].Label;
		}

		return returnValue;
	}
}

function stringifyFilter(entity: EntityMetadata, query: QueryFilter): [string | undefined, string[], {alwaysEmpty: boolean}]
{
	let argIndex = 0;
	const args: string[] = [];
	const flags = { alwaysEmpty: false };

	const ops = query.operations.map(operation => 
	{
		const field = Object.values(entity.fields).find(f => f.schemaName.toLowerCase() === operation.fieldName);

		if (operation.operator === "in" && Array.isArray(operation.value))
		{
			argIndex += 2;
			args.push(`@p${argIndex - 2}='${operation.fieldName}'`);
			args.push(`@p${argIndex - 1}=[${operation.value.map((v: unknown) => stringifyValue(v, true)).join(",")}]`); // if guids, we DO need to quote. values are now JSON, not ODATA values)
			
			// if the array is empty, then there will never be any results
			// api will throw for empty list, we set a flag so we can return empty results instead
			if(operation.value.length === 0)
				flags.alwaysEmpty = true;

			return `Microsoft.Dynamics.CRM.In(PropertyName=@p${argIndex - 2}, PropertyValues=@p${argIndex - 1})`;
		}

		if (operation.operator === "startswith")
			return `startswith(${operation.fieldName}, ${stringifyValue(operation.value)})`;
		else if (operation.operator === "endswith")
			return `endswith(${operation.fieldName}, ${stringifyValue(operation.value)})`;
		else if (operation.operator === "contains")
			return `contains(${operation.fieldName}, ${stringifyValue(operation.value)})`;

		if(field && field.type === "reference")
			return `_${operation.fieldName}_value ${operation.operator} ${stringifyValue(operation.value)}`;

		return `${operation.fieldName} ${operation.operator} ${stringifyValue(operation.value)}`;
	});

	const subOps = query.filters
		.map(f => stringifyFilter(entity, f))
		.map(s => 
		{
			flags.alwaysEmpty ||= s[2].alwaysEmpty; // if any subquery is empty, we can skip the whole thing
			return `(${s[0]})`;
		});
	const allOps = [...ops, ...subOps];

	return [
		allOps.join(` ${query.modus} `),
		args,
		flags,
	] as const;
}

function stringifyValue(value: unknown, quotedGuids = false): string
{
	if(value === undefined || value === null)
		return "null";

	if (typeof value === "object" && value !== null && "id" in value && typeof value.id === "string")
	{
		if (quotedGuids)
			return `'${value.id}'`;
		else
			return value.id;
	}

	if (typeof value === "string")
		return `'${value.replaceAll("'", "''")}'`;

	return `${value}`;
}





interface EntityDefinitionResponse
{
	value: {
		SchemaName: string,
		EntitySetName: string
	}[];
}






interface LocalizedLabel {
	Label: string;
	LanguageCode: number;
	IsManaged: boolean;
	MetadataId: string;
	HasChanged?: boolean;
}

interface UserLocalizedLabel {
	Label: string;
	LanguageCode: number;
	IsManaged: boolean;
	MetadataId: string;
	HasChanged?: boolean;
}

interface Description {
	LocalizedLabels: LocalizedLabel[];
	UserLocalizedLabel: UserLocalizedLabel;
}

interface LocalizedLabel2 {
	Label: string;
	LanguageCode: number;
	IsManaged: boolean;
	MetadataId: string;
	HasChanged?: boolean;
}

interface UserLocalizedLabel2 {
	Label: string;
	LanguageCode: number;
	IsManaged: boolean;
	MetadataId: string;
	HasChanged?: boolean;
}

interface DisplayName {
	LocalizedLabels: LocalizedLabel2[];
	UserLocalizedLabel: UserLocalizedLabel2;
}

interface IsCustomizable {
	Value: boolean;
	CanBeChanged: boolean;
	ManagedPropertyLogicalName: string;
}

interface LocalizedLabel3 {
	Label: string;
	LanguageCode: number;
	IsManaged: boolean;
	MetadataId: string;
	HasChanged?: boolean;
}

interface UserLocalizedLabel3 {
	Label: string;
	LanguageCode: number;
	IsManaged: boolean;
	MetadataId: string;
	HasChanged?: boolean;
}

interface Label {
	LocalizedLabels: LocalizedLabel3[];
	UserLocalizedLabel: UserLocalizedLabel3;
}

interface LocalizedLabel4 {
	Label: string;
	LanguageCode: number;
	IsManaged: boolean;
	MetadataId: string;
	HasChanged?: boolean;
}

interface UserLocalizedLabel4 {
	Label: string;
	LanguageCode: number;
	IsManaged: boolean;
	MetadataId: string;
	HasChanged?: boolean;
}

interface Description2 {
	LocalizedLabels: LocalizedLabel4[];
	UserLocalizedLabel: UserLocalizedLabel4;
}

interface Option {
	Value: number;
	Label: Label;
	Description: Description2;
	Color: string;
	IsManaged: boolean;
	MetadataId?: string;
	HasChanged?: boolean;
}

interface OptionSet {
	MetadataId: string;
	HasChanged?: boolean;
	Description: Description;
	DisplayName: DisplayName;
	IsCustomOptionSet: boolean;
	IsGlobal: boolean;
	IsManaged: boolean;
	IsCustomizable: IsCustomizable;
	Name: string;
	OptionSetType: string;
	IntroducedVersion?: string;
	Options: Option[];
}

interface GlobalOptionSet extends OptionSet {
	"@odata.type": string;
}

interface OptionSetData {
	"@odata.context": string;
	LogicalName: string;
	MetadataId: string;
	"OptionSet@odata.context": string;
	OptionSet?: OptionSet;
	GlobalOptionSet?: GlobalOptionSet;
}