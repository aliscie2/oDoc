import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";

import * as Sentry from "@sentry/react";
import { SnackbarProvider } from "notistack";
import { Helmet, HelmetProvider } from "react-helmet-async";
import ThemeProvider from "./ThemeProvider";
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
              const imageName = window.location.hostname.includes("icpjobs.com")
                ? window.location.hostname+"/icpjobs_thumnail.png"
                : window.location.hostname+"/odoc_thumnail.png";
              return (
                <meta key={property} property={property} content={imageName} />
              );
            })}
          </Helmet>

          <ThemeProvider>
            <SnackbarProvider
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              maxSnack={3}
            >
              <App />
            </SnackbarProvider>
          </ThemeProvider>
        </HelmetProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
