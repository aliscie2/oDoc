import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import path, { join, resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dfxJson = JSON.parse(
  readFileSync(path.resolve(__dirname, "dfx.json"), "utf8"),
);

let localCanisters: any, prodCanisters: any, canisters;
let localEnv = true;
let network = "local";

function initCanisterIds() {
  try {
    localCanisters = JSON.parse(
      readFileSync(path.resolve(".dfx", "local", "canister_ids.json"), "utf8"),
    );
  } catch (error) {
    console.log("No local canister_ids.json found. Continuing production");
  }
  try {
    prodCanisters = JSON.parse(
      readFileSync(path.resolve("canister_ids.json"), "utf8"),
    );
    localEnv = false;
  } catch (error) {
    console.log("No production canister_ids.json found. Continuing with local");
  }

  network = process.env.NODE_ENV === "production" && !localEnv ? "ic" : "local";
  canisters = network === "local" || localEnv ? localCanisters : prodCanisters;

  for (const canister in canisters) {
    process.env[canister.toUpperCase() + "_CANISTER_ID"] =
      canisters[canister][network];
  }
}

const isDevelopment = process.env.NODE_ENV !== "production" || localEnv;
initCanisterIds();
export default defineConfig({
  publicDir: 'public', // Changed from 'public'
  assetsInclude: ["**/*.md"],
  build: {
    outDir: "build",
    rollupOptions: { external: ["@excalidraw/excalidraw"] },
  },
  server: {
    host: true,
    port: 5173,
    open: true,
    hmr: {
      port: 24678,
      overlay: true,
      clientPort: 24678,
    },
    fs: {
      allow: ["."],
      deny: ["**/playwright-report/**", "**/test-results/**"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:4943",  // change 4943 to ur dfx port, u can get the port by runing `dfx info webserver-port`
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
      interval: 300,
      ignored: ["**/playwright-report/**", "**/test-results/**"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/frontend"),
      $: resolve(__dirname, "src"),
      ...Object.entries(dfxJson.canisters).reduce((acc, [name]) => {
        const networkName = process.env.DFX_NETWORK || "local";
        const outputRoot = join(
          __dirname,
          ".dfx",
          networkName,
          "canisters",
          name,
        );
        return { ...acc, [`canisters/${name}`]: join(outputRoot, "index.js") };
      }, {}),
    },
  },
  define: {
    global: "globalThis",
    ...Object.entries(canisters || {}).reduce(
      (acc, [key, val]) => ({
        ...acc,
        [`process.env.${key.toUpperCase()}_CANISTER_ID`]: JSON.stringify(
          isDevelopment ? val.local : val.ic,
        ),
      }),
      {},
    ),
    "process.env.NODE_ENV": JSON.stringify(
      isDevelopment ? "development" : "production",
    ),
  },
  plugins: [
    react(),
    EnvironmentPlugin("all", { prefix: "CANISTER_" }),
    EnvironmentPlugin("all", { prefix: "DFX_" }),
    EnvironmentPlugin({ BACKEND_CANISTER_ID: "" }),
    VitePWA({
  registerType: "autoUpdate",
  workbox: {
    maximumFileSizeToCacheInBytes: 20971520,
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        },
      },
    ],
  },
  manifest: {
    name: "odoc",
    short_name: "odoc",
    description: "ai job matcher & crypto agreement for freelancers, online work.",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "fullscreen", // Changed from "standalone"
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "icons/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "icons/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "icons/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "icons/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
}),
  ],
  // In your vite.config - add this to optimizeDeps
  optimizeDeps: {
    include: [
      "@emotion/react",
      "@emotion/styled",
      "@mui/material/Tooltip",
      "@mui/x-data-grid-generator",
    ],
    force: true,
  },
});
