import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        react(),
        dts({
            // rollupTypes: true,
            tsconfigPath: './tsconfig.json',
        })
    ],
    build: {
        lib: {
            entry: 'lib/index.ts',
            name: 'beaker.dataverse.react.fluentui',
            fileName: (format) => `beaker.dataverse.react.fluentui.${format}.js`,
        },
        rollupOptions: {
            external: [
                "react",
                "react/jsx-runtime",
                "react-dom",
            ],
            output: {
                globals: {
                }
            }
        },
    }
})