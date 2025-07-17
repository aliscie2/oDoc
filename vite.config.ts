import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

import dfxJson from "./dfx.json";

let localCanisters: any, prodCanisters: any, canisters;

let localEnv = true;
let network = "local";

function initCanisterIds() {
  try {
    localCanisters = require(
      path.resolve(".dfx", "local", "canister_ids.json"),
    );
  } catch (error) {
    console.log("No local canister_ids.json found. Continuing production");
  }
  try {
    prodCanisters = require(path.resolve("canister_ids.json"));
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

// const asset_entry = path.join("src", "frontend", "assets", "frontend", "index.html");

// List of all aliases for canisters
// This will allow us to: import { canisterName } from "canisters/canisterName"
const aliases = Object.entries(dfxJson.canisters).reduce(
  (acc, [name, _value]) => {
    // Get the network name, or `local` by default.
    const networkName = process.env["DFX_NETWORK"] || "local";
    const outputRoot = path.join(
      __dirname,
      ".dfx",
      networkName,
      "canisters",
      name,
    );

    return {
      ...acc,
      ["canisters/" + name]: path.join(outputRoot, "index" + ".js"),
    };
  },
  {},
);

// Generate canister ids, required by the generated canister code in .dfx/local/canisters/*
// This strange way of JSON.stringifying the value is required by vite
const canisterDefinitions = Object.entries(canisters).reduce(
  (acc, [key, val]) => ({
    ...acc,
    [`process.env.${key.toUpperCase()}_CANISTER_ID`]: isDevelopment
      ? JSON.stringify(val.local)
      : JSON.stringify(val.ic),
  }),
  {},
);

export default defineConfig({
  assetsInclude: ["**/*.md"],
  build: {
    outDir: "build",
    include: ["src/frontend/.well-known"],
    external: ["@excalidraw/excalidraw"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/frontend"),
      $: path.resolve(__dirname, "src"),
      ...aliases,
    },
  },
  server: {
    fs: { allow: ["."] },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5173",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  define: {
    global: "window",
    ...canisterDefinitions,
    "process.env.NODE_ENV": JSON.stringify(
      isDevelopment ? "development" : "production",
    ),
  },
  plugins: [
    EnvironmentPlugin("all", { prefix: "CANISTER_" }),
    EnvironmentPlugin("all", { prefix: "DFX_" }),
    EnvironmentPlugin({ BACKEND_CANISTER_ID: "" }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20MB
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
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
    {
      "src": "icons/manifest-icon-192.maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/manifest-icon-192.maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/manifest-icon-512.maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/manifest-icon-512.maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: [
      "@emotion/react",
      "@emotion/styled",
      "@mui/material/Tooltip",
      "@mui/x-data-grid-generator",
    ],
  },
});
