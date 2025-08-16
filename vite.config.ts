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
  canisters = network !== "ic" || localEnv ? localCanisters : prodCanisters;

  for (const canister in canisters) {
    process.env[canister.toUpperCase() + "_CANISTER_ID"] =
      canisters[canister][network];
  }
}

const isDevelopment = process.env.NODE_ENV !== "production" || localEnv;
initCanisterIds();
export default defineConfig({
  base: process.env.VITE_DFX_NETWORK === 'staging' ? '/oDoc/' : '/',
  publicDir: 'public', // Changed from 'public'
  assetsInclude: ["**/*.md"],
  build: {
    outDir: "build",
    target: "esnext",
    minify: "terser",
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      external: ["@excalidraw/excalidraw"],
      output: {
        manualChunks: (id) => {
          // Heavy AI libraries
          if (id.includes('@huggingface/transformers')) return 'huggingface';
          if (id.includes('@xenova/transformers')) return 'xenova';
          if (id.includes('langchain')) return 'langchain';
          if (id.includes('@langchain/core')) return 'langchain-core';
          if (id.includes('@langchain/openai')) return 'langchain-openai';
          
          // Charts - split AG Grid components
          if (id.includes('ag-grid-enterprise')) return 'ag-grid-enterprise';
          if (id.includes('ag-grid-community')) return 'ag-grid-community';
          if (id.includes('ag-grid-react')) return 'ag-grid-react';
          if (id.includes('ag-charts')) return 'ag-charts';
          
          // MUI - split by component groups
          if (id.includes('@mui/material')) return 'mui-material';
          if (id.includes('@mui/icons-material')) return 'mui-icons';
          if (id.includes('@mui/lab')) return 'mui-lab';
          if (id.includes('@mui/x-date-pickers')) return 'mui-pickers';
          if (id.includes('@emotion')) return 'emotion';
          
          // React ecosystem
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('react') && !id.includes('react-')) return 'react';
          if (id.includes('react-router')) return 'react-router';
          if (id.includes('react-redux')) return 'react-redux';
          
          // Dfinity - split by functionality
          if (id.includes('@dfinity/agent')) return 'dfinity-agent';
          if (id.includes('@dfinity/auth-client')) return 'dfinity-auth';
          if (id.includes('@dfinity/ledger')) return 'dfinity-ledger';
          if (id.includes('@dfinity')) return 'dfinity-core';
          
          // Editor components
          if (id.includes('react-ace')) return 'ace-editor';
          if (id.includes('odoc_editor')) return 'odoc-editor';
          
          // Media and UI libraries
          if (id.includes('framer-motion')) return 'framer-motion';
          if (id.includes('react-player')) return 'react-player';
          if (id.includes('flowbite')) return 'flowbite';
          
          // Utility libraries
          if (id.includes('date-fns')) return 'date-utils';
          if (id.includes('mathjs')) return 'math-utils';
          if (id.includes('uuid')) return 'uuid';
          if (id.includes('lodash')) return 'lodash';
          
          // Development and testing
          if (id.includes('@sentry')) return 'sentry';
          
          // Remaining node_modules - split by size
          if (id.includes('node_modules')) {
            // Large libraries get their own chunks
            if (id.includes('openai')) return 'openai';
            if (id.includes('@google/generative-ai')) return 'google-ai';
            if (id.includes('sanitize-html')) return 'sanitize-html';
            if (id.includes('compromise')) return 'compromise';
            if (id.includes('natural')) return 'natural';
            if (id.includes('mathjs')) return 'mathjs';
            if (id.includes('jsonrepair')) return 'jsonrepair';
            
            // Split vendor into smaller chunks
            const hash = id.split('node_modules/')[1]?.split('/')[0];
            if (hash && hash.length > 0) {
              // Group by first letter to create smaller vendor chunks
              const firstChar = hash[0].toLowerCase();
              return `vendor-${firstChar}`;
            }
            
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500,
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
      (acc, [key, val]: [string, any]) => ({
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
    // Don't cache large JS files immediately
    globIgnores: ["**/index-*.js"],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        },
      },
      // Cache images with stale-while-revalidate
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 30 }, // 30 days
        },
      },
      // Cache JS chunks on demand
      {
        urlPattern: /\.js$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "js-cache",
          expiration: { maxEntries: 20, maxAgeSeconds: 86400 * 7 }, // 7 days
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
    exclude: [
      // Exclude heavy AI libraries from pre-bundling
      "@huggingface/transformers",
      "@xenova/transformers",
      "langchain",
      "@langchain/core",
      "@langchain/openai"
    ],
    force: true,
  },
});
