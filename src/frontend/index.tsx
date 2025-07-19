import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import store from "./redux/store";
import ThemeProvider from "./ThemeProvider";
import { BackendProvider } from "./contexts/BackendContext";
import { SnackbarProvider } from "notistack";
import  { Helmet } from "react-helmet-async"
import ShareThumnail from "@/public/icpjobs_thumnail.png";
import { _SERVICE } from "$/declarations/backend/backend.did";
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_DFX_NETWORK === "ic") {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DNS,
    sendDefaultPii: true,
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element with id "root" not found in the document');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      
      <ThemeProvider>
        <BackendProvider>
          <SnackbarProvider
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            maxSnack={3}
          >
            <App />
          </SnackbarProvider>
        </BackendProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
