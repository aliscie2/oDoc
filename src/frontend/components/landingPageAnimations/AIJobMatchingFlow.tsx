import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  Container,
  Fade,
  Grid2,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

const useTypingAnimation = (texts: string[], speed = 50) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      const targetText = texts[currentTextIndex];
      if (currentText.length < targetText.length) {
        timeout = setTimeout(() => {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        }, speed);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(1));
        }, speed / 2);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isTyping, texts, speed]);

  return currentText;
};

const AIJobMatchingFlow = () => {
  const theme = useTheme();
  const [visibleCandidates, setVisibleCandidates] = useState<number>(0);

  const searchQueries = [
    "Senior React developer with 5+ years",
    "Marketing manager in tech",
    "Full-stack engineer familiar with Web3",
  ];

  const typedText = useTypingAnimation(searchQueries, 60);

  const candidates = [
    {
      name: "Sarah Mitchell",
      role: "Senior Full-Stack Engineer • 8 years",
      match: 96,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Marcus Chen",
      role: "Product Marketing Lead • Ex-Meta",
      match: 92,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Alex Rivera",
      role: "Blockchain Developer • Smart Contracts",
      match: 89,
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
  ];

  useEffect(() => {
    const isComplete = searchQueries.some((query) => query === typedText);

    if (isComplete && visibleCandidates === 0) {
      candidates.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCandidates(index + 1);
        }, index * 350);
      });
    } else if (typedText.length === 0) {
      setVisibleCandidates(0);
    }
  }, [typedText, searchQueries, visibleCandidates]);

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: theme.palette.mode === "dark" ? "#0a0a0a" : "grey.50",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 600,
              fontSize: { xs: "1.75rem", md: "2.75rem" },
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Find Matches in Seconds
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 400,
              maxWidth: 560,
              mx: "auto",
              opacity: 0.8,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.6,
            }}
          >
            Just describe who you&apos;re looking for.
          </Typography>
        </Box>

        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            bgcolor: theme.palette.mode === "dark" ? "#1a1a1a" : "white",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 8px 32px rgba(0,0,0,0.6)"
                : "0 8px 32px rgba(0,0,0,0.08)",
          }}
        >
          <Grid2 container>
            <Grid2
              xs={12}
              md={6}
              sx={{
                borderRight: {
                  md: `1px solid ${theme.palette.mode === "dark" ? "#2a2a2a" : theme.palette.divider}`,
                },
                borderBottom: {
                  xs: `1px solid ${theme.palette.mode === "dark" ? "#2a2a2a" : theme.palette.divider}`,
                  md: "none",
                },
              }}
            >
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  minHeight: { xs: "280px", md: "400px" },
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "#667eea",
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      fontSize: "0.7rem",
                    }}
                  >
                    STEP 1: ASK
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: "relative",
                    bgcolor:
                      theme.palette.mode === "dark" ? "#252525" : "grey.100",
                    borderRadius: "16px",
                    p: 2.5,
                    minHeight: "56px",
                    display: "flex",
                    alignItems: "center",
                    border: `2px solid`,
                    borderColor:
                      theme.palette.mode === "dark" ? "#333" : "grey.200",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color:
                        theme.palette.mode === "dark" ? "#e0e0e0" : "grey.900",
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      fontWeight: 500,
                      flex: 1,
                    }}
                  >
                    {typedText}
                    <Box
                      component="span"
                      sx={{
                        width: "2px",
                        height: "20px",
                        bgcolor: "#667eea",
                        display: "inline-block",
                        animation: "blink 1s infinite",
                        ml: 0.5,
                        verticalAlign: "middle",
                        "@keyframes blink": {
                          "0%, 50%": { opacity: 1 },
                          "51%, 100%": { opacity: 0 },
                        },
                      }}
                    />
                  </Typography>
                </Box>

                <Box
                  sx={{ mt: 3, display: "flex", gap: 1.5, flexWrap: "wrap" }}
                >
                  {["Frontend Dev", "Marketing", "Design", "Backend"].map(
                    (tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#252525"
                              : "grey.100",
                          fontSize: "0.75rem",
                          height: "28px",
                          "&:hover": { bgcolor: "#667eea", color: "white" },
                        }}
                      />
                    ),
                  )}
                </Box>
              </Box>
            </Grid2>

            <Grid2 xs={12} md={6}>
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  minHeight: { xs: "280px", md: "400px" },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color:
                        visibleCandidates > 0 ? "#4caf50" : "text.secondary",
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      fontSize: "0.7rem",
                    }}
                  >
                    STEP 2: GET MATCHES
                  </Typography>
                  {visibleCandidates > 0 && (
                    <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 18 }} />
                  )}
                </Box>

                {visibleCandidates > 0 ? (
                  <Stack spacing={1.5}>
                    {candidates
                      .slice(0, visibleCandidates)
                      .map((candidate, index) => (
                        <Fade in={true} timeout={500} key={index}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "12px",
                              border: `1px solid`,
                              borderColor:
                                theme.palette.mode === "dark"
                                  ? "#2a2a2a"
                                  : "grey.200",
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "#252525"
                                  : "grey.50",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                              "&:hover": {
                                borderColor: "#667eea",
                                transform: "translateY(-2px)",
                                boxShadow:
                                  "0 4px 12px rgba(102, 126, 234, 0.2)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                src={candidate.avatar}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  border: `2px solid ${theme.palette.mode === "dark" ? "#1a1a1a" : "white"}`,
                                }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                    mb: 0.25,
                                  }}
                                >
                                  {candidate.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    opacity: 0.7,
                                    display: "block",
                                    fontSize: "0.75rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {candidate.role}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${candidate.match}%`}
                                size="small"
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  height: "24px",
                                  minWidth: "48px",
                                }}
                              />
                            </Box>
                          </Box>
                        </Fade>
                      ))}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      minHeight: "200px",
                      opacity: 0.4,
                    }}
                  >
                    <Typography variant="body2" sx={{ textAlign: "center" }}>
                      Waiting for your search...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid2>
          </Grid2>
        </Box>
      </Container>
    </Box>
  );
};

export default AIJobMatchingFlow;
