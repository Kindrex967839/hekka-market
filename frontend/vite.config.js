import react from "@vitejs/plugin-react";
import "dotenv/config";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import injectHTML from "vite-plugin-html-inject";
import tsConfigPaths from "vite-tsconfig-paths";
/**
 * Build variables for the application
 * These replace the Databutton-specific variables
 */
const buildVariables = () => {
    const defines = {
        __APP_ID__: JSON.stringify("hekka-market"),
        __API_PATH__: JSON.stringify(""),
        __API_URL__: JSON.stringify("http://localhost:8000"),
        __WS_API_URL__: JSON.stringify("ws://localhost:8000"),
        __APP_BASE_PATH__: JSON.stringify("/"),
        __APP_TITLE__: JSON.stringify("HEKKA MARKET"),
        __APP_FAVICON_LIGHT__: JSON.stringify("/favicon-light.svg"),
        __APP_FAVICON_DARK__: JSON.stringify("/favicon-dark.svg"),
        // Add these back to maintain compatibility with existing code
        __APP_DEPLOY_USERNAME__: JSON.stringify(""),
        __APP_DEPLOY_APPNAME__: JSON.stringify(""),
        __APP_DEPLOY_CUSTOM_DOMAIN__: JSON.stringify(""),
        __FIREBASE_CONFIG__: JSON.stringify({}),
    };
    return defines;
};
// https://vite.dev/config/
export default defineConfig({
    define: buildVariables(),
    plugins: [react(), splitVendorChunkPlugin(), tsConfigPaths(), injectHTML()],
    server: {
        proxy: {
            "/routes": {
                target: "http://127.0.0.1:8000",
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            resolve: {
                alias: {
                    "@": path.resolve(__dirname, "./src"),
                },
            },
        },
    },
});
