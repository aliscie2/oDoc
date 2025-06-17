import React, { useRef, useState, useEffect } from "react";
import {
  
  useMediaQuery,
  useTheme,
} from "@mui/material";

import DekstopLandingPage from "./desktopLanding";
import MobileLandingPage from "./mobileLanding";

export default function LandingPage() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  if (isMobile){
    return <MobileLandingPage/>
  }

  return <DekstopLandingPage/>
}