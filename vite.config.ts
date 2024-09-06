import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import { fileURLToPath } from "url"
import path from "path"
import nodePolyfills from "rollup-plugin-polyfill-node"
import nodeResolve from "@rollup/plugin-node-resolve"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
    server: { port: 3000 },
    plugins: [
        vue(),
        nodePolyfills(),
        nodeResolve()
    ],
    define: {
        "global": "globalThis"
    },
    resolve: {
        alias: {
            "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
            "./runtimeConfig": "./runtimeConfig.browser"
        },
        extensions: [
            ".js",
            ".json",
            ".jsx",
            ".mjs",
            ".ts",
            ".tsx",
            ".vue",
        ]
    },
    envPrefix: "PUBLIC_"
})