import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

// find root element
const rootElement = document.getElementById("root");
if (rootElement && rootElement instanceof HTMLElement) 
{
	// try to create the react dom root to render to
	const root = createRoot(rootElement);
	if (root) 
	{
		const app = <StrictMode>
			<App />
		</StrictMode>;

		root.render(app);
	}
}