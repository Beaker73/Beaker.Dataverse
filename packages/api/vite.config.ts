import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [
        dts({
            // rollupTypes: true,
            tsconfigPath: './tsconfig.json',
        })
    ],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'beaker.dataverse.api',
            fileName: (format) => `beaker.dataverse.api.${format}.js`,
        },
        rollupOptions: {
            external: [
                "@js-joda/core",
                "@js-joda/timezone",
                "@js-joda/timezone/dist/js-joda-timezone-10-year-range",
            ],
            output: {
                globals: {
                    "@js-joda/core": "JSJoda",
                    "@js-joda/timezone": "JSJoda",
                    "@js-joda/timezone/dist/js-joda-timezone-10-year-range": "JSJoda",
                }
            }
        },
    }
})