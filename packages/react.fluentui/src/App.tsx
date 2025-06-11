import { FluentProvider, makeStyles, tokens, webLightTheme } from "@fluentui/react-components";
import { ProcessExample } from "./Components/ProcessExample";
import { ValidatedInputExample } from "./Components/ValidatedInputExample";

export function App() {

    const style = useAppStyles();
    return <FluentProvider theme={webLightTheme} className={style.root}>
        <ProcessExample />
        <ValidatedInputExample />
    </FluentProvider>;
}

const useAppStyles = makeStyles({
    root: {
        padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL,
    }
})