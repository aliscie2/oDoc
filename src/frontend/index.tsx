import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";

import * as Sentry from "@sentry/react";
import { SnackbarProvider } from "notistack";
import ThemeProvider from "./ThemeProvider";
import { BackendProvider } from "./contexts/BackendContext";
import store from "./redux/reducers";

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
