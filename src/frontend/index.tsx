import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";

import * as Sentry from "@sentry/react";
import { SnackbarProvider } from "notistack";
import { Helmet, HelmetProvider } from "react-helmet-async";
import ThemeProvider from "./ThemeProvider";
import { BackendProvider } from "./contexts/BackendContext";
import store from "./redux/reducers";
import { BrowserRouter } from "react-router-dom";

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
      <BrowserRouter>
        <HelmetProvider>
          <Helmet>
            {["twitter:image", "og:image"].map((property: string) => {
              const basePath =
                import.meta.env.VITE_DFX_NETWORK === "staging" ? "/oDoc/" : "/";
              const imageName = window.location.hostname.includes("icpjobs")
                ? "https://raw.githubusercontent.com/aliscie2/oDoc/refs/heads/dev2/public/icpjobs_thumnail.png"
                : "https://raw.githubusercontent.com/aliscie2/oDoc/refs/heads/dev2/public/odoc_thumnail.png";

              return (
                <meta
                  key={property}
                  property={property}
                  content={`${basePath}${imageName}`}
                />
              );
            })}
          </Helmet>

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
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
