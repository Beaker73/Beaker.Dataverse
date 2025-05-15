import { defineConfig } from 'vite'

export default defineConfig({
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
            ]
        },
    }
})