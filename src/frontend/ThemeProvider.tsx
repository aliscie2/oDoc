import React, { ReactNode, useMemo } from "react";
import { useSelector } from "react-redux";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "./theme";

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isDarkMode } = useSelector((state: any) => state.uiState);
  
  // 🚀 PERFORMANCE FIX: Memoize theme creation
  const theme = useMemo(() => createTheme(isDarkMode), [isDarkMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default React.memo(ThemeProvider);
