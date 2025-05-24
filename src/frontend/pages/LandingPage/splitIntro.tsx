import React, { useState } from "react";
import { Box, Typography, Grid, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

const SplitIntro = () => {
  const theme = useTheme();
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const { isDarkMode } = useSelector((state: any) => state.uiState);

  const freelancerFeatures = [
    "Trustless contracts - Get paid automatically when work is approved",
    "No more payment scams - Funds held securely in blockchain escrow",
    "AI-powered job matching - Find perfect projects for your skills"
  ];

  const businessFeatures = [
    "Automated talent matching - Our AI finds top freelancers for you",
    "One-click payments - Manage all contracts & payments in one place",
    "Performance tracking - See freelancer history & ratings"
  ];

  return (
    <Box sx={{ 
      height: "80vh",
      position: "relative",
      overflow: "hidden"
    }}>
      <Grid container sx={{ height: "100%" }}>
        {/* Left Side - Freelancer */}
        <Grid item xs={6}>
          <Box
            component={motion.div}
            initial={{ 
              backgroundColor: isDarkMode ? "#1b5e20" : "#e6f7e6",
              color: isDarkMode ? "#ffffff" : "#000000",
              flex: 1,
              opacity: 1,
              scale: 1
            }}
            animate={{
              backgroundColor: hoveredSide === "left" 
                ? (isDarkMode ? "#2e7d32" : "#c8e6c9")
                : (isDarkMode ? "#1b5e20" : "#e6f7e6"),
              flex: hoveredSide === "left" ? 2 : hoveredSide === "right" ? 0.5 : 1,
              opacity: hoveredSide === "right" ? 0.7 : 1,
              scale: hoveredSide === "right" ? 0.98 : 1
            }}
            transition={{ 
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1]
            }}
            sx={{
              p: 8,
              height: "100%",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
            onMouseEnter={() => setHoveredSide("left")}
            onMouseLeave={() => setHoveredSide(null)}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: hoveredSide === "left" ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h2" gutterBottom sx={{ 
                fontWeight: "bold", 
                mb: 4,
                textAlign: "center",
                color: isDarkMode ? "#ffffff" : "#000000"
              }}>
                I'm a Freelancer
              </Typography>
            </motion.div>
            
            <AnimatePresence>
              <Box sx={{ maxWidth: "60%" }}>
                {freelancerFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.8, y: 10 }}
                    animate={{ 
                      opacity: hoveredSide === "left" ? 1 : 0.8,
                      y: hoveredSide === "left" ? 0 : 10,
                      fontSize: hoveredSide === "left" ? "1.2rem" : "1rem"
                    }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ 
                        mb: 3,
                        transition: "all 0.3s ease",
                        color: isDarkMode ? "#ffffff" : "#000000"
                      }}
                    >
                      {feature}
                    </Typography>
                  </motion.div>
                ))}
              </Box>
            </AnimatePresence>
          </Box>
        </Grid>

        {/* Right Side - Business Owner */}
        <Grid item xs={6}>
          <Box
            component={motion.div}
            initial={{ 
              backgroundColor: isDarkMode ? "#4a148c" : "#f3e5f6",
              color: isDarkMode ? "#ffffff" : "#000000",
              flex: 1,
              opacity: 1,
              scale: 1
            }}
            animate={{
              backgroundColor: hoveredSide === "right" 
                ? (isDarkMode ? "#7b1fa2" : "#e1bee7")
                : (isDarkMode ? "#4a148c" : "#f3e5f6"),
              flex: hoveredSide === "right" ? 2 : hoveredSide === "left" ? 0.5 : 1,
              opacity: hoveredSide === "left" ? 0.7 : 1,
              scale: hoveredSide === "left" ? 0.98 : 1
            }}
            transition={{ 
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1]
            }}
            sx={{
              p: 8,
              height: "100%",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
            onMouseEnter={() => setHoveredSide("right")}
            onMouseLeave={() => setHoveredSide(null)}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: hoveredSide === "right" ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h2" gutterBottom sx={{ 
                fontWeight: "bold", 
                mb: 4,
                textAlign: "center",
                color: isDarkMode ? "#ffffff" : "#000000"
              }}>
                I'm a Business Owner
              </Typography>
            </motion.div>
            
            <AnimatePresence>
              <Box sx={{ maxWidth: "60%" }}>
                {businessFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.8, y: 10 }}
                    animate={{ 
                      opacity: hoveredSide === "right" ? 1 : 0.8,
                      y: hoveredSide === "right" ? 0 : 10,
                      fontSize: hoveredSide === "right" ? "1.2rem" : "1rem"
                    }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ 
                        mb: 3,
                        transition: "all 0.3s ease",
                        color: isDarkMode ? "#ffffff" : "#000000"
                      }}
                    >
                      {feature}
                    </Typography>
                  </motion.div>
                ))}
              </Box>
            </AnimatePresence>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SplitIntro;