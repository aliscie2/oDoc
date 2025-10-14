import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  Container,
  Grid2,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { backendActor } from "@/utils/backendUtils";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";

const useTypingAnimation = (texts: string[], speed = 50) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    const targetText = texts[currentTextIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (currentText.length < targetText.length) {
        timeout = setTimeout(() => {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        }, speed);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, speed / 3);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentText, currentTextIndex, isTyping, texts.length, speed]);

  return currentText;
};

const AIJobMatchingFlow = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    users: 0,
    jobsCount: 0,
    talentsCount: 0,
  });
  const [displayStats, setDisplayStats] = useState({
    users: 0,
    jobsCount: 0,
    talentsCount: 0,
  });
  const [allOpportunities, setAllOpportunities] = useState<
    Array<{
      id: string;
      user_id?: string;
      job_titles?: string[];
      skills?: string[];
      category?: Record<string, null>;
    }>
  >([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  const searchQueries = [
    "Senior React developer with 5+ years",
    "Marketing manager in tech",
    "Rust backend Job in ICP eco system",
  ];

  const typedText = useTypingAnimation(searchQueries, 60);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snsResponse = await backendActor.get_sns_status();
        if (snsResponse.Ok) {
          const {
            number_users,
            jobs_count,
            talents_count,
            latest_jobs,
            latest_talents,
          } = snsResponse.Ok;
          setStats({
            users: Math.floor(number_users),
            jobsCount: Math.floor(jobs_count),
            talentsCount: Math.floor(talents_count),
          });

          // Combine jobs and talents
          const combined = [];
          if (latest_jobs && latest_jobs.length > 0) {
            combined.push(...latest_jobs);
          }
          if (latest_talents && latest_talents.length > 0) {
            combined.push(...latest_talents);
          }

          // Duplicate for infinite scroll effect
          if (combined.length > 0) {
            setAllOpportunities([...combined, ...combined, ...combined]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchData();
  }, []);

  // Animate numbers counting up
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const animateValue = (key: keyof typeof stats) => {
      const target = stats[key];
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(current + increment, target);
        setDisplayStats((prev) => ({
          ...prev,
          [key]: Math.floor(current),
        }));

        if (step >= steps || current >= target) {
          setDisplayStats((prev) => ({
            ...prev,
            [key]: target,
          }));
          clearInterval(timer);
        }
      }, stepDuration);

      return timer;
    };

    if (stats.users > 0 || stats.jobsCount > 0 || stats.talentsCount > 0) {
      const timers = [
        animateValue("users"),
        animateValue("jobsCount"),
        animateValue("talentsCount"),
      ];

      return () => {
        timers.forEach((timer) => clearInterval(timer));
      };
    }
  }, [stats]);

  // Infinite scroll animation - continuous smooth scrolling
  useEffect(() => {
    if (allOpportunities.length === 0) return;

    const interval = setInterval(() => {
      setScrollPosition((prev) => prev + 0.5); // Smooth continuous scroll
    }, 20);

    return () => clearInterval(interval);
  }, [allOpportunities]);

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
              size={{ xs: 12, md: 6 }}
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
                    I am looking for {typedText}
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
                  sx={{ 
                    mt: 3, 
                    display: "grid", 
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      bgcolor:
                        theme.palette.mode === "dark" ? "#252525" : "grey.100",
                      border: `1px solid`,
                      borderColor:
                        theme.palette.mode === "dark" ? "#333" : "grey.200",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#667eea",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#667eea",
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        mb: 0.5,
                      }}
                    >
                      {displayStats.users}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.75rem",
                        opacity: 0.7,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Users
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      bgcolor:
                        theme.palette.mode === "dark" ? "#252525" : "grey.100",
                      border: `1px solid`,
                      borderColor:
                        theme.palette.mode === "dark" ? "#333" : "grey.200",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#2196f3",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#2196f3",
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        mb: 0.5,
                      }}
                    >
                      {displayStats.jobsCount}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.75rem",
                        opacity: 0.7,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Jobs
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      bgcolor:
                        theme.palette.mode === "dark" ? "#252525" : "grey.100",
                      border: `1px solid`,
                      borderColor:
                        theme.palette.mode === "dark" ? "#333" : "grey.200",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#4caf50",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#4caf50",
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        mb: 0.5,
                      }}
                    >
                      {displayStats.talentsCount}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.75rem",
                        opacity: 0.7,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Talents
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid2>

            <Grid2 size={{ xs: 12, md: 6 }}>
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
                        allOpportunities.length > 0
                          ? "#4caf50"
                          : "text.secondary",
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      fontSize: "0.7rem",
                    }}
                  >
                    STEP 2: GET MATCHES
                  </Typography>
                  {allOpportunities.length > 0 && (
                    <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 18 }} />
                  )}
                </Box>

                {allOpportunities.length > 0 ? (
                  <Box
                    sx={{
                      height: "280px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        transform: `translateY(-${scrollPosition % ((allOpportunities.length / 3) * 70)}px)`,
                        willChange: "transform",
                      }}
                    >
                      <Stack spacing={1.5}>
                        {allOpportunities.map((job, index) => {
                          const category = job.category
                            ? Object.keys(job.category)[0]
                            : "Job";
                          return (
                            <Box
                              key={`${job.id}-${index}`}
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
                                <Box
                                  sx={{
                                    pointerEvents: "none",
                                    cursor: "default",
                                  }}
                                >
                                  {job.user_id ? (
                                    <UserAvatarMenu
                                      user_id={job.user_id}
                                      hide={["Profile", "Message", "Review"]}
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        border: `2px solid ${theme.palette.mode === "dark" ? "#1a1a1a" : "white"}`,
                                      }}
                                    />
                                  ) : (
                                    <Avatar
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor:
                                          category === "Talent"
                                            ? "#4caf50"
                                            : "#667eea",
                                        border: `2px solid ${theme.palette.mode === "dark" ? "#1a1a1a" : "white"}`,
                                      }}
                                    >
                                      {job.job_titles?.[0]?.[0]?.toUpperCase() ||
                                        category[0]}
                                    </Avatar>
                                  )}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "0.9rem",
                                      mb: 0.25,
                                    }}
                                  >
                                    {job.job_titles?.[0] ||
                                      `${category} Position`}
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
                                    {job.skills?.slice(0, 3).join(", ") ||
                                      "Skills not specified"}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={category}
                                  size="small"
                                  sx={{
                                    bgcolor:
                                      category === "Talent"
                                        ? "#4caf50"
                                        : "#2196f3",
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: "0.7rem",
                                    height: "24px",
                                    minWidth: "48px",
                                  }}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Box>
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
                      Loading opportunities...
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
