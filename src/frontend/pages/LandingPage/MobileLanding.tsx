import { backendActor, ckUSDCActor } from "@/utils/backendUtils";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import {
  AttachMoney,
  BarChart,
  CheckCircle,
  Email,
  Handshake,
  Lock,
  Notifications,
  Star,
  Telegram,
  Instagram,
  YouTube,
  Forum,
  GitHub,
  LinkedIn,
} from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  Card,
  Chip,
  Container,
  Divider,
  Fade,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Link } from "react-router-dom";
import getckUsdcBalance from "@/utils/getBalance";
import { canisterId } from "$/declarations/ckusdc_ledger";

const sectionSx = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  py: 2,
  pb: 8,
};

const cardSx = {
  p: 2,
  borderRadius: 4,
  border: "none",
  boxShadow: (theme) =>
    theme.palette.mode === "dark"
      ? "6px 6px 12px rgba(0,0,0,0.4), -6px -6px 12px rgba(60,60,60,0.1)"
      : "6px 6px 12px rgba(163,177,198,0.25), -6px -6px 12px rgba(255,255,255,0.7)",
  bgcolor: "background.paper",
};

const glassSx = {
  ...cardSx,
  backdropFilter: "blur(10px)",
  bgcolor: (theme) =>
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.02)"
      : "rgba(255,255,255,0.5)",
};

const XIcon = (props: unknown) => (
  <SvgIcon {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </SvgIcon>
);

const FeatureSection = ({ title, subtitle, children }) => {
  const theme = useTheme();
  return (
    <Box sx={sectionSx}>
      <Container maxWidth="sm" sx={{ px: 2 }}>
        <Typography
          variant="h3"
          sx={{
            mb: 1.5,
            fontWeight: 600,
            fontSize: "1.5rem",
            textAlign: "center",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 2.5,
            color: theme.palette.text.secondary,
            textAlign: "center",
            fontSize: "0.875rem",
          }}
        >
          {subtitle}
        </Typography>
        {children}
      </Container>
    </Box>
  );
};

const StatCard = ({ value, label }) => (
  <Box sx={{ textAlign: "center" }}>
    <Typography
      variant="h4"
      sx={{ fontWeight: 700, color: "primary.main", mb: 0.5 }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        opacity: 0.7,
        textTransform: "uppercase",
        letterSpacing: 1,
        fontSize: "0.75rem",
      }}
    >
      {label}
    </Typography>
  </Box>
);

const SEOComponent = () => (
  <Helmet>
    <title>{window.location.hostname} - AI Job Matching Platform</title>
    <meta
      name="description"
      content="AI-powered job matching for blockchain developers and Web3 talent"
    />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=5"
    />
    <link rel="canonical" href={window.location.href} />
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does AI job matching work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Our AI analyzes your skills to match you with relevant projects.",
            },
          },
          {
            "@type": "Question",
            name: "What jobs are available?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Developer, blockchain, and technical positions.",
            },
          },
          {
            "@type": "Question",
            name: "How do crypto agreements work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Secure blockchain agreements with escrow and automated payments.",
            },
          },
          {
            "@type": "Question",
            name: "Is it free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, free for job seekers.",
            },
          },
        ],
      })}
    </script>
  </Helmet>
);

const HeroWithDemo = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  const candidatePhotos = [
    "https://i.pravatar.cc/150?img=47",
    "https://i.pravatar.cc/150?img=13",
    "https://i.pravatar.cc/150?img=32",
  ];

  useEffect(() => {
    const sequence = [
      { id: 1, type: "user", text: "Find full-stack developers", delay: 0 },
      {
        id: 2,
        type: "bot",
        text: "Found 3 candidates",
        delay: 1200,
        avatar: "/job.png",
        candidates: [
          {
            name: "Sarah Chen",
            skills: "React • Node • Web3",
            avatar: candidatePhotos[0],
          },
          {
            name: "Alex Kumar",
            skills: "Python • Django • AWS",
            avatar: candidatePhotos[1],
          },
          {
            name: "Maria Silva",
            skills: "Vue • PHP • Docker",
            avatar: candidatePhotos[2],
          },
        ],
      },
      { id: 3, type: "user", text: "Schedule meeting with Sarah", delay: 2000 },
      {
        id: 4,
        type: "bot",
        delay: 1200,
        avatar: "/calendar.png",
        meeting: { time: "Tomorrow 9 AM", attendees: "You & Sarah Chen" },
      },
      {
        id: 5,
        type: "user",
        text: "Create $100 escrow for Sarah",
        delay: 2000,
      },
      {
        id: 6,
        type: "bot",
        delay: 1200,
        avatar: "/contract.png",
        contract: { amount: "$100", recipient: "Sarah Chen" },
      },
    ];

    const runSequence = () => {
      setMessages([]);
      let totalDelay = 0;
      const timeouts = sequence.map((msg) => {
        totalDelay += msg.delay;
        return setTimeout(
          () => setMessages((prev) => [...prev, msg]),
          totalDelay,
        );
      });
      timeouts.push(setTimeout(runSequence, totalDelay + 2000));
      return () => timeouts.forEach(clearTimeout);
    };

    return runSequence();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <Box sx={sectionSx}>
      <Container maxWidth="sm" sx={{ px: 2 }}>
        <Box sx={{ textAlign: "center", mb: 2.5 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: "1.75rem",
              fontWeight: 400,
              mb: 1.5,
              lineHeight: 1.2,
            }}
          >
            Your AI
            <br />
            <Box
              component="span"
              sx={{ color: "primary.main", fontWeight: 500 }}
            >
              Personal Secretary
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: "text.secondary",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            Find talent, schedule meetings, manage payments
          </Typography>
        </Box>

        <Box
          sx={{
            ...glassSx,
            height: 340,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "divider",
                borderRadius: 2,
              },
            }}
          >
            {messages.map((msg) => (
              <Fade key={msg.id} in timeout={400}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.type === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.type === "bot" ? (
                    <Box sx={{ display: "flex", gap: 1, maxWidth: "90%" }}>
                      <Avatar
                        src={msg.avatar}
                        sx={{ width: 28, height: 28, bgcolor: "primary.main" }}
                      />
                      <Box>
                        {msg.text && (
                          <Box
                            sx={{
                              px: 2,
                              py: 1,
                              borderRadius: 3,
                              boxShadow:
                                theme.palette.mode === "dark"
                                  ? "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(60,60,60,0.1)"
                                  : "inset 2px 2px 4px rgba(163,177,198,0.2), inset -2px -2px 4px rgba(255,255,255,0.7)",
                              bgcolor: "background.paper",
                              mb:
                                msg.candidates || msg.meeting || msg.contract
                                  ? 1
                                  : 0,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              {msg.text}
                            </Typography>
                          </Box>
                        )}
                        {msg.candidates && (
                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            {msg.candidates.map((c, i) => (
                              <Box
                                key={i}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  px: 1.5,
                                  py: 0.75,
                                  borderRadius: 3,
                                  boxShadow:
                                    theme.palette.mode === "dark"
                                      ? "3px 3px 6px rgba(0,0,0,0.4), -2px -2px 4px rgba(60,60,60,0.1)"
                                      : "3px 3px 6px rgba(163,177,198,0.2), -2px -2px 4px rgba(255,255,255,0.7)",
                                  bgcolor: "background.paper",
                                }}
                              >
                                <Avatar
                                  src={c.avatar}
                                  sx={{ width: 24, height: 24 }}
                                />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{ fontSize: "0.75rem" }}
                                  >
                                    {c.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: "primary.main",
                                      display: "block",
                                    }}
                                  >
                                    95% match
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                        {msg.meeting && (
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              boxShadow:
                                theme.palette.mode === "dark"
                                  ? "4px 4px 8px rgba(58,141,255,0.25), -2px -2px 6px rgba(60,60,60,0.1)"
                                  : "4px 4px 8px rgba(58,141,255,0.2), -2px -2px 6px rgba(255,255,255,0.7)",
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(58,141,255,0.1)"
                                  : "rgba(58,141,255,0.05)",
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ mb: 0.5 }}
                            >
                              Meeting Scheduled
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              {msg.meeting.time}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {msg.meeting.attendees}
                            </Typography>
                          </Box>
                        )}
                        {msg.contract && (
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              boxShadow:
                                theme.palette.mode === "dark"
                                  ? "4px 4px 8px rgba(58,141,255,0.25), -2px -2px 6px rgba(60,60,60,0.1)"
                                  : "4px 4px 8px rgba(58,141,255,0.2), -2px -2px 6px rgba(255,255,255,0.7)",
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(58,141,255,0.1)"
                                  : "rgba(58,141,255,0.05)",
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ mb: 0.5 }}
                            >
                              Escrow Created
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              fontWeight={600}
                              color="primary.main"
                            >
                              {msg.contract.amount} → {msg.contract.recipient}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        maxWidth: "75%",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        borderRadius: 3,
                        boxShadow:
                          theme.palette.mode === "dark"
                            ? "4px 4px 8px rgba(0,0,0,0.4), -2px -2px 6px rgba(60,60,60,0.1)"
                            : "4px 4px 8px rgba(58,141,255,0.25), -2px -2px 6px rgba(255,255,255,0.7)",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                        {msg.text}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Fade>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const SocialProofSection = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    users: 0,
    activeUsers: 0,
    totalDeposit: 0,
    jobsCount: 0,
    talentsCount: 0,
  });
  const [opportunities, setOpportunities] = useState([]);
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, balance] = await Promise.all([
          backendActor.get_sns_status(),
          getckUsdcBalance(ckUSDCActor, canisterId),
        ]);
        if (res.Ok) {
          const {
            number_users,
            active_users,
            jobs_count,
            talents_count,
            latest_jobs,
            latest_talents,
          } = res.Ok;
          setStats({
            users: Math.floor(number_users),
            activeUsers: Math.floor(active_users),
            totalDeposit: Math.floor(Number(balance) / 1000000),
            jobsCount: Math.floor(jobs_count),
            talentsCount: Math.floor(talents_count),
          });
          const combined = [...(latest_jobs || []), ...(latest_talents || [])];
          setOpportunities([...combined, ...combined, ...combined]);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (opportunities.length === 0) return;
    const interval = setInterval(() => setScrollPos((prev) => prev + 0.5), 20);
    return () => clearInterval(interval);
  }, [opportunities]);

  return (
    <Box sx={sectionSx}>
      <Container maxWidth="sm" sx={{ px: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          <StatCard value={stats.users} label="Users" />
          <StatCard value={stats.activeUsers} label="Active" />
          <StatCard value={`$${stats.totalDeposit}`} label="Value" />
          <StatCard value={stats.jobsCount} label="Jobs" />
          <StatCard value={stats.talentsCount} label="Talents" />
        </Box>

        {opportunities.length > 0 && (
          <Box sx={{ height: 320, overflow: "hidden", position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 40,
                background: `linear-gradient(to bottom, ${theme.palette.background.default}, transparent)`,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
                background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                transform: `translateY(-${scrollPos % ((opportunities.length / 3) * 70)}px)`,
                willChange: "transform",
              }}
            >
              <Stack spacing={1.5}>
                {opportunities.map((job, i) => {
                  const category = job.category
                    ? Object.keys(job.category)[0]
                    : "Job";
                  return (
                    <Box
                      key={`${job.id}-${i}`}
                      sx={{
                        ...cardSx,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      {job.user_id ? (
                        <UserAvatarMenu
                          user_id={job.user_id}
                          hide={["Profile", "Message", "Review"]}
                          sx={{ width: 36, height: 36, pointerEvents: "none" }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "primary.main",
                          }}
                        >
                          {job.job_titles?.[0]?.[0]?.toUpperCase() ||
                            category[0]}
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            mb: 0.25,
                          }}
                        >
                          {job.job_titles?.[0] || `${category} Position`}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            fontSize: "0.75rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
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
                          bgcolor: "primary.main",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 22,
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};
const EmailNotificationsStep = () => {
  const theme = useTheme();

  return (
    <FeatureSection
      title="Email Alerts"
      subtitle="Get notified when opportunities match your profile"
    >
      <Box sx={{ mt: 4 }}>
        <Card sx={cardSx}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Email sx={{ fontSize: 20, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Inbox
              </Typography>
            </Box>
            <Badge
              badgeContent={2}
              sx={{
                "& .MuiBadge-badge": {
                  color: "white",
                  bgcolor: "#ff3b30",
                  fontSize: "0.7rem",
                },
              }}
            >
              <Box sx={{ width: 20 }} />
            </Badge>
          </Box>

          {[
            {
              subject: "AI Developer Match",
              preview: "We found a perfect match for your profile...",
              time: "2m",
              unread: true,
            },
            {
              subject: "Co-founder Opportunity",
              preview: "Startup looking for technical co-founder...",
              time: "1h",
              unread: true,
            },
          ].map((email, i) => (
            <Box
              key={i}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: i < 1 ? 1 : 0,
                borderColor: "divider",
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: email.unread ? "#ff3b30" : "transparent",
                  mt: 0.75,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: email.unread ? 600 : 400,
                      fontSize: "0.875rem",
                    }}
                  >
                    {email.subject}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                      ml: 1,
                      flexShrink: 0,
                    }}
                  >
                    {email.time}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    fontSize: "0.75rem",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {email.preview}
                </Typography>
              </Box>
            </Box>
          ))}
        </Card>
      </Box>
    </FeatureSection>
  );
};

const CalendarStep = () => {
  const theme = useTheme();

  return (
    <FeatureSection
      title="Smart Calendar"
      subtitle="Chat with your calendar to set availability"
    >
      <Box sx={{ ...glassSx, p: 2 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Box
              sx={{
                px: 2,
                py: 1,
                maxWidth: "85%",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                Set me available Mon-Fri 9 AM - 1 PM
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Avatar
              src="/calendar.png"
              sx={{
                width: 28,
                height: 28,
                bgcolor: "primary.main",
                opacity: theme.palette.mode === "dark" ? 0.85 : 1,
              }}
            />
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 0.5 }}
              >
                Availability set
              </Typography>
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                <Box
                  key={day}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, minWidth: 30, fontSize: "0.875rem" }}
                  >
                    {day}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "0.875rem", opacity: 0.7 }}
                  >
                    9:00 AM - 1:00 PM
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </FeatureSection>
  );
};

const CryptoAgreementStep = () => {
  const theme = useTheme();

  return (
    <FeatureSection
      title="Crypto Agreement"
      subtitle="Secure blockchain agreements with escrow"
    >
      <Box sx={{ ...glassSx, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <Avatar
            src="/contract.png"
            sx={{
              width: 32,
              height: 32,
              opacity: theme.palette.mode === "dark" ? 0.85 : 1,
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            Escrow Contract
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontSize: "0.75rem" }}
            >
              Escrow Amount
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "primary.main" }}
            >
              500 USDC
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                fontSize: "0.75rem",
                mb: 1,
                display: "block",
              }}
            >
              Receiver
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{ width: 32, height: 32 }}
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
              >
                JS
              </Avatar>
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ fontSize: "0.875rem" }}
                >
                  John Smith
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.7, fontSize: "0.75rem" }}
                >
                  Senior Developer
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontSize: "0.75rem" }}
            >
              Lock Period
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              30 days
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: "primary.main",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(25, 118, 210, 0.1)"
                  : "rgba(25, 118, 210, 0.05)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                fontSize: "0.75rem",
                mb: 0.5,
                display: "block",
              }}
            >
              Status
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: "primary.main" }}
            >
              🔒 Funds Secured in Escrow
            </Typography>
          </Box>
        </Stack>
      </Box>
    </FeatureSection>
  );
};
const CryptoAgreementProofsStep = () => {
  const proofs = [
    {
      title: "Proof of Existence",
      subtitle: "Deposit funds first",
      icon: <AttachMoney />,
    },
    {
      title: "Proof of Stake",
      subtitle: "Build trust upfront",
      icon: <Lock />,
    },
    { title: "Proof of Cap", subtitle: "Smart limits", icon: <BarChart /> },
    {
      title: "Proof of Reputation",
      subtitle: "Transparent record",
      icon: <Star />,
    },
  ];

  return (
    <FeatureSection
      title="Agreement Proofs"
      subtitle="Built-in security mechanisms"
    >
      <Stack spacing={1.5}>
        {proofs.map((proof, i) => (
          <Card key={i} sx={cardSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ color: "text.secondary", fontSize: "1.5rem" }}>
                {proof.icon}
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                >
                  {proof.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.7, fontSize: "0.75rem" }}
                >
                  {proof.subtitle}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Stack>
    </FeatureSection>
  );
};

const ProjectManagementStep = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const contracts = [
    {
      name: "AI Agent Development",
      promises: 3,
      amount: 1500,
      payments: 1,
      paidAmount: 500,
      creator: "Sarah Chen",
      role: "Project Manager",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
    {
      name: "ICP Canister Integration",
      promises: 2,
      amount: 2000,
      payments: 0,
      paidAmount: 0,
      creator: "Alex Rodriguez",
      role: "Tech Lead",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % contracts.length);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const contract = contracts[current];

  return (
    <FeatureSection
      title="Project Management"
      subtitle="AI-powered team and payment management"
    >
      <Card
        sx={{
          ...cardSx,
          transition: "transform 0.3s",
          transform: animating ? "scale(1.02)" : "scale(1)",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, fontSize: "1rem", mb: 1 }}
          >
            {contract.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28 }} src={contract.avatar}>
              {contract.creator[0]}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{ fontSize: "0.875rem" }}
              >
                {contract.creator}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                {contract.role}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Handshake sx={{ fontSize: 16, color: "primary.main" }} />
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{ fontSize: "0.875rem" }}
              >
                Promises
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ fontSize: "0.875rem" }}
              >
                {contract.promises}
              </Typography>
              <Typography variant="caption">${contract.amount}</Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle sx={{ fontSize: 16, color: "primary.main" }} />
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{ fontSize: "0.875rem" }}
              >
                Payments
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ fontSize: "0.875rem" }}
              >
                {contract.payments}
              </Typography>
              <Typography variant="caption">${contract.paidAmount}</Typography>
            </Box>
          </Box>
        </Stack>
      </Card>
      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.5,
        }}
      >
        {[
          { icon: <Email sx={{ fontSize: 18 }} />, text: "Smart tasks" },
          {
            icon: <AttachMoney sx={{ fontSize: 18 }} />,
            text: "Auto payments",
          },
          { icon: <BarChart sx={{ fontSize: 18 }} />, text: "Analytics" },
          {
            icon: <Notifications sx={{ fontSize: 18 }} />,
            text: "Real-time alerts",
          },
        ].map((f, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ color: "primary.main" }}>{f.icon}</Box>
            <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
              {f.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </FeatureSection>
  );
};

const SocialMediaShare = () => {
  const socials = [
    { icon: Telegram, url: "https://t.me/odoc_ic" },
    { icon: Forum, url: "https://discord.gg/HbaFQXDD" },
    { icon: YouTube, url: "https://www.youtube.com/@odoc_ic" },
    { icon: Instagram, url: "https://www.instagram.com/odoc_ic" },
    { icon: LinkedIn, url: "https://www.linkedin.com/company/odocic" },
    { icon: GitHub, url: "https://github.com/aliscie2/oDoc" },
  ];

  return (
    <Box sx={{ py: 3, pb: 12, textAlign: "center" }}>
      <Container maxWidth="sm" sx={{ px: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Join Our Community
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            maxWidth: 280,
            mx: "auto",
          }}
        >
          {socials.map(({ icon: Icon, url }, i) => (
            <IconButton
              key={i}
              onClick={() => window.open(url, "_blank")}
              sx={{
                bgcolor: "action.hover",
                width: 56,
                height: 56,
                "&:active": { opacity: 0.7 },
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </IconButton>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

const SimpleFooter = () => {
  const socialLinks = [
    {
      name: "GitHub",
      icon: GitHubIcon,
      url: "https://github.com/aliscie2/oDoc",
    },
    { name: "X", icon: XIcon, url: "https://x.com/odoc_ic" },
    { name: "YouTube", icon: YouTube, url: "https://www.youtube.com/@odoc_ic" },
  ];

  return (
    <Box
      component="footer"
      sx={{ py: 3, pb: 12, borderTop: 1, borderColor: "divider" }}
    >
      <Container maxWidth="sm" sx={{ px: 2 }}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
            {window.location.hostname}
          </Typography>
          <Typography
            variant="body2"
            sx={{ opacity: 0.7, fontSize: "0.75rem" }}
          >
            AI job matching • Smart contracts
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mb: 2 }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.75rem",
              cursor: "pointer",
              opacity: 0.6,
              "&:hover": { opacity: 1 },
            }}
            component={Link}
            to="/white_paper"
          >
            White Paper
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.75rem",
              cursor: "pointer",
              opacity: 0.6,
              "&:hover": { opacity: 1 },
            }}
            component={Link}
            to="/privacy"
          >
            Privacy
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mb: 2 }}
        >
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Icon
                key={social.name}
                sx={{
                  fontSize: 18,
                  cursor: "pointer",
                  opacity: 0.6,
                  "&:hover": { opacity: 1 },
                }}
                onClick={() => window.open(social.url, "_blank")}
              />
            );
          })}
        </Stack>

        <Divider sx={{ mb: 1.5, opacity: 0.2 }} />
        <Typography
          variant="caption"
          sx={{
            opacity: 0.5,
            fontSize: "0.7rem",
            textAlign: "center",
            display: "block",
          }}
        >
          © {new Date().getFullYear()} oDoc.app
        </Typography>
      </Container>
    </Box>
  );
};

const MobileLanding = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const sections = container.querySelectorAll("[data-section]");
        const scrollTop = container.scrollTop;
        let closest = sections[0];
        let minDist = Math.abs(sections[0].offsetTop - scrollTop);

        sections.forEach((section) => {
          const dist = Math.abs(section.offsetTop - scrollTop);
          if (dist < minDist) {
            minDist = dist;
            closest = section;
          }
        });

        closest.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
      }}
    >
      <SEOComponent />
      <Box data-section sx={{ scrollSnapAlign: "start" }}>
        <HeroWithDemo />
      </Box>
      <Box data-section sx={{ scrollSnapAlign: "start" }}>
        <SocialProofSection />
      </Box>
      <Box data-section sx={{ scrollSnapAlign: "start" }}>
        <EmailNotificationsStep />
      </Box>
      <Box data-section sx={{ scrollSnapAlign: "start" }}>
        <CalendarStep />
      </Box>
      <Box data-section sx={{ scrollSnapAlign: "start" }}>
        <CryptoAgreementStep />
      </Box>
      <Box data-section sx={{ scrollSnapAlign: "start" }}>
        <CryptoAgreementProofsStep />
      </Box>
      <Box data-section sx={{ scrollSnapAlign: "start" }}>
        <ProjectManagementStep />
      </Box>
      <Box data-section sx={{ scrollSnapAlign: "start" }}>
        <SocialMediaShare />
      </Box>
      <Box data-section sx={{ scrollSnapAlign: "start" }}>
        <SimpleFooter />
      </Box>
    </Box>
  );
};

export default MobileLanding;
