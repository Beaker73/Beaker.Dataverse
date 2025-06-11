import { useCrmInteractions } from "@/Hooks/Crm";
import { useEffect, type PropsWithChildren } from "react";

/**
 * HACK: Tries to find the CRM parent window and adjust the styles of the root page to hide the padding and border, so the app really looks part of CRM
 * @param props The children to render
 */
export function CrmEmbedProvider(props: PropsWithChildren<object>) 
{
	const crm = useCrmInteractions();

	useEffect(() => 
	{
		if (crm.embedState === "embedded")
		{
			const document = window.parent.document;

			// we will assume (for now) that there is always just a single embedded app on the page
			const rootSection = document.querySelector("section:has(iframe)") as HTMLElement | null;
			if (rootSection) 
			{
				rootSection.style.margin = "-12px";
				rootSection.style.marginLeft = "4px";

				const innerSection = rootSection.querySelector("section");
				if (innerSection) 
				{
					innerSection.style.padding = "unset";
					innerSection.style.border = "unset";
					innerSection.style.boxShadow = "unset";
					innerSection.querySelectorAll("div").forEach(div => 
					{
						div.style.margin = "unset";
						div.style.padding = "unset";
					});
				}
			}
		}
	}, [crm.embedState]);

	return props.children;
}