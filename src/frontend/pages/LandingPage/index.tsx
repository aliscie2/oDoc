import { useMediaQuery } from "@mui/material";
import { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

const DesktopLanding = lazy(() => import("./DesktopLanding"));
const MobileLanding = lazy(() => import("./MobileLanding"));

const LandingPage = () => {
  const isMobile = useMediaQuery("(max-width:900px)");

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      {isMobile ? <MobileLanding /> : <DesktopLanding />}
    </Suspense>
  );
};

export default LandingPage;
