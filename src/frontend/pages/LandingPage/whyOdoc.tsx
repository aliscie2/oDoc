import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Chip,
  useTheme,
  Fade,
  Zoom,
  Collapse,
  alpha,
} from "@mui/material";
import {
  Star,
} from "@mui/icons-material";
import { benefitsData } from "./landingPageData";

interface ODocInfographicProps {
  userType?: "developer" | "business" | "general";
  theme?: "light" | "dark" | "gradient";
  interactive?: boolean;
  showStats?: boolean;
  onCtaClick?: () => void;
}

const ODocInfographic: React.FC<ODocInfographicProps> = ({
  userType = "general",
  theme: themeOverride,
  interactive = true,
  showStats = true,
  onCtaClick,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const muiTheme = useTheme();

  useEffect(() => {
    setIsDarkMode(muiTheme.palette.mode === "dark");
  }, [muiTheme.palette.mode]);

  // Sort benefits based on user type priority
  const sortedBenefits = [...benefitsData].sort(
    (a, b) => a.priority[userType] - b.priority[userType],
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 8,
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box textAlign="center" mb={12}>
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background:
                themeOverride === "gradient" || (!themeOverride && isDarkMode)
                  ? `linear-gradient(45deg, ${muiTheme.palette.primary.main} 30%, ${muiTheme.palette.secondary.main} 90%)`
                  : "inherit",
              backgroundClip:
                themeOverride === "gradient" || (!themeOverride && isDarkMode)
                  ? "text"
                  : "inherit",
              WebkitBackgroundClip:
                themeOverride === "gradient" || (!themeOverride && isDarkMode)
                  ? "text"
                  : "inherit",
              WebkitTextFillColor:
                themeOverride === "gradient" || (!themeOverride && isDarkMode)
                  ? "transparent"
                  : "inherit",
              mb: 2,
            }}
          >
            Why ODoc?
          </Typography>

          <Typography
            variant="h4"
            sx={{
              opacity: 0.9,
              mb: 3,
              fontWeight: 300,
              color: "text.secondary",
            }}
          >
            One Platform. Endless Benefits.
          </Typography>

          {userType !== "general" && (
            <Chip
              icon={<Star />}
              label={`Optimized for ${userType}s`}
              color="secondary"
              variant={isDarkMode ? "outlined" : "filled"}
              sx={{
                mb: 3,
                "& .MuiChip-icon": {
                  color: muiTheme.palette.warning.main,
                },
              }}
            />
          )}
        </Box>

        {/* Benefits Grid */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {sortedBenefits.map((benefit, index) => {
            const isHovered = hoveredCard === benefit.id;
            const isTopPick = benefit.priority[userType] <= 2;

            return (
              <Grid item xs={4} key={benefit.id}>
                <Fade in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: "100%",
                      cursor: interactive ? "pointer" : "default",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isHovered ? "scale(1.03)" : "scale(1)",
                      bgcolor: isDarkMode
                        ? alpha(muiTheme.palette.background.paper, 0.8)
                        : muiTheme.palette.background.paper,
                      backdropFilter: "blur(10px)",
                      border: isHovered
                        ? `2px solid ${benefit.color}`
                        : `1px solid ${alpha(muiTheme.palette.divider, 0.12)}`,
                      position: "relative",
                      overflow: "visible",
                      boxShadow: isHovered
                        ? `0 8px 32px ${alpha(benefit.color, 0.3)}`
                        : muiTheme.shadows[2],
                      "&:hover": {
                        boxShadow: `0 12px 40px ${alpha(benefit.color, 0.2)}`,
                      },
                    }}
                    onMouseEnter={() =>
                      interactive && setHoveredCard(benefit.id)
                    }
                    onMouseLeave={() => interactive && setHoveredCard(null)}
                  >
                    {/* Priority Badge */}
                    {isTopPick && (
                      <Chip
                        label="Top Pick"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: 16,
                          bgcolor: benefit.color,
                          color: "white",
                          fontWeight: "bold",
                          zIndex: 1,
                          fontSize: "0.7rem",
                        }}
                      />
                    )}

                    <CardContent
                      sx={{
                        p: 4,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Icon */}
                      <Box
                        sx={{
                          fontSize: "2.5rem",
                          color: benefit.color,
                          transition: "transform 0.3s ease",
                          transform: isHovered
                            ? "rotate(12deg) scale(1.1)"
                            : "rotate(0deg) scale(1)",
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        {benefit.icon}
                      </Box>

                      {/* Title */}
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{
                          fontWeight: "bold",
                          color: "text.primary",
                          lineHeight: 1.2,
                        }}
                      >
                        {benefit.title}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          flexGrow: 1,
                          whiteSpace: "pre-line",
                          color: "text.secondary",
                          lineHeight: 1.6,
                          fontSize: "1rem",
                        }}
                      >
                        {isHovered
                          ? benefit.expandedContent
                          : benefit.description}
                      </Typography>

                      {/* Stats */}
                      {showStats && benefit.stats && (
                        <Collapse in={isHovered}>
                          <Box mt={2}>
                            <Zoom in={isHovered}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  bgcolor: benefit.color,
                                  borderRadius: 2,
                                  textAlign: "center",
                                  boxShadow: `0 4px 12px ${alpha(benefit.color, 0.3)}`,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight="bold"
                                  sx={{
                                    color: "white",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {benefit.stats}
                                </Typography>
                              </Box>
                            </Zoom>
                          </Box>
                        </Collapse>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default ODocInfographic;
