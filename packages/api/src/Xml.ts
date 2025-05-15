import type { JSX, ReactNode } from "react";
import { cloneElement } from "react";
import { renderToString } from "react-dom/server";

export function toXmlString(root: JSX.Element): string 
{
	// The only issue with using react to convert to xml
	// is that in react props are typed, but in xml all strings.
	// So we convert all props to strings before calling <react-dom className=""></react-dom>
	convertProps(root);
	return renderToString(root);
}

/* Converts all non-string properties to strings */
function convertProps(element: React.JSX.Element): void 
{
	if (element.props) 
	{
		// walk over all props
		for (const [key, value] of Object.entries(element.props)) 
		{

			if (key === "children") 
			{
				// walk children recursivly
				if (Array.isArray(value))
				{
					for (const subElement of value) 
					{
						if (subElement)
							convertProps(subElement);
					}
				}
				else if (typeof value === "object" && value !== null && ("$$type" in value || "$$typeof" in value))
				{
					convertProps(value as unknown as React.JSX.Element);
				}
			}
			else 
			{
				// convert base types to strings as required for xml
				if (typeof value === "boolean") 
					element = cloneElement(element, { [key]: value ? "true" : "false" });
				else if (typeof value === "number") 
					element = cloneElement(element, { [key]: value.toString() });
			}
		}
	}
}

type FetchOperator = "lt" | "gt" | "le" | "ge" | "eq" | "ne" | "neq" | "null" | "not-null" | "in" | "not-in" | "between" | "not-between" | "like" | "not-like" | "contain-values";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace React.JSX {
		interface IntrinsicElements {
			fetch: PropsWithChildren<{ aggregate?: boolean | "true" | "false", top?: number, version?: "1.0", mapping?: "logical", returntotalrecordcount?: boolean | "true" | "false", page?: number, count?: number, "no-lock"?: boolean | "true" | "false" }>,
			entity: PropsWithChildren<{ name: string }>,
			attribute: PropsWithChildren<{ name: string, alias?: string, aggregate?: string, groupby?: boolean | "true" | "false" }>,
			"link-entity": PropsWithChildren<{ name: string, to: string, from: string, alias?: string, "link-type"?: "inner" | "outer" }>,
			//filter: PropsWithChildren<object>,
			"all-attributes": Record<string, never>,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			condition: PropsWithChildren<{ attribute: string, entityname?: string, operator: FetchOperator, value?: any }>,
			value: PropsWithChildren<object>,
			order: PropsWithChildren<{ alias?: string, attribute?: string, descending?: boolean | "true" | "false" }>,
			grid: PropsWithChildren<{ name: string, jump?: string, select?: number, icon?: number, preview?: number, object?: number }>,
			row: PropsWithChildren<{ name: string, id: string }>,
			cell: PropsWithChildren<{ name: string, width: number }>,
		}
	}
}

export function toFetchXmlString(fetchQuery: JSX.Element): { fetchXmlString: string, entityName: string } 
{
	convertProps(fetchQuery);

	if (fetchQuery.type !== "fetch")
		throw new Error("Not a fetch query");
	if (!fetchQuery.props.children)
		throw new Error("fetch contains no query");

	const children = fetchQuery.props.children as ReactNode;
	if (children === null || typeof (children) !== "object")
		throw new Error("No entity element found in fetch");
	if (!("type" in children))
		throw new Error("No entity element found in fetch");
	if (children.type !== "entity")
		throw new Error("No entity element found in fetch");

	if (!("name" in children.props) || typeof children.props.name !== "string")
		throw new Error("Entity element missing name of entity");
	const entityName = children.props.name as string;

	const xmlQuery = toXmlString(fetchQuery);

	return { fetchXmlString: xmlQuery, entityName };
}
