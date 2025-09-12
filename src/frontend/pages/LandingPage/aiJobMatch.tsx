import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import {
  CheckCircle as CheckCircleIcon,
  Email,
  Facebook,
  Handshake as HandshakeIcon,
  LinkedIn,
  People,
  Shield,
  Twitter,
  YouTube,
} from "@mui/icons-material";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Fade,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

// Social Media Sharing Component
const SocialMediaShare = () => {
  const shareMessage = `I just joined the modern online work ${window.location.hostname} you should join too`;
  const shareUrl = window.location.href;

  const handleShare = (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage + " 🚀\n\n#ModernWork #JobMatching #ICP #RemoteWork")}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(
        urls[platform],
        "_blank",
        "width=600,height=500,scrollbars=yes,resizable=yes",
      );
    }
  };

  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Share with Friends
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
        Spread the word about this modern online work platform
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        flexWrap="wrap"
      >
        {[
          { key: "facebook", icon: Facebook, color: "#1877F2" },
          { key: "twitter", icon: XIcon, color: "#000000" },
          { key: "linkedin", icon: LinkedIn, color: "#0A66C2" },
        ].map(({ key, icon: Icon, color }) => (
          <IconButton
            key={key}
            onClick={() => handleShare(key)}
            sx={{
              bgcolor: color,
              color: "white",
              "&:hover": { opacity: 0.9 },
              width: 56,
              height: 56,
            }}
          >
            <Icon sx={{ fontSize: 28 }} />
          </IconButton>
        ))}
      </Stack>

      <Typography variant="body2" sx={{ mt: 2, opacity: 0.6 }}>
        Click any icon to share on social media
      </Typography>
    </Box>
  );
};

const XIcon = (props: any) => (
  <SvgIcon {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </SvgIcon>
);

// Typing Animation Hook for other components
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
          // Delete from left to right by removing the first character
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

// Step 1: AI Conversation Component
const AIConversationStep = () => {
  const texts = [
    "I am rust developer looking for small startup",
    "I am building new startup looking for marketing expert",
  ];
  const typedText = useTypingAnimation(texts);

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            1. Talk to AI
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.8,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            No manual work anymore. Ask, and it is done.
          </Typography>
        </Box>

        <RunawayJellyfish />
        <Box
          sx={{
            width: "100%",
            minHeight: "56px",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            padding: "16px 14px",
            fontSize: "1.1rem",
            fontFamily: "monospace",
            display: "flex",
            alignItems: "center",
            backgroundColor: "background.paper",
            "&:hover": {
              borderColor: "text.primary",
            },
            "&:focus-within": {
              borderColor: "primary.main",
              borderWidth: "2px",
              padding: "15px 13px", // Adjust padding to account for thicker border
            },
          }}
        >
          <Box
            component="span"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {typedText || (
              <Box component="span" sx={{ color: "text.secondary" }}>
                Describe your needs...
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 2,
              height: 20,
              bgcolor: "primary.main",
              animation: "blink 1s infinite",
              marginLeft: "2px",
              "@keyframes blink": {
                "0%, 50%": { opacity: 1 },
                "51%, 100%": { opacity: 0 },
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

// Step 2: Job Matching Component
const JobMatchingStep = () => {
  const [matchScore, setMatchScore] = useState(70);
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [showButton, setShowButton] = useState(true);

  const titles = [
    "Looking ICP canisters developer",
    "I am Looking for mature company for full time job",
    "Seeking AI/ML Engineer for startup",
    "Frontend Developer needed for Web3 project",
    "Looking for co-founder with business experience",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchScore((prev) => (prev === 70 ? 87 : 70));
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
      setShowButton((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 4, md: 8 },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              2. Job Matching
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 4, fontWeight: 400, lineHeight: 1.4, opacity: 0.9 }}
            >
              Stop hunting for jobs, let AI do it for you.
            </Typography>
          </Box>

          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Card sx={{ p: 4, borderRadius: 3, maxWidth: 400, width: "100%" }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}
              >
                <Box sx={{ position: "relative" }}>
                  <CircularProgress
                    variant="determinate"
                    value={matchScore}
                    size={80}
                    thickness={6}
                    sx={{
                      color: matchScore > 80 ? "success.main" : "warning.main",
                      transition: "all 0.8s ease",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {matchScore}%
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Fade in={true} key={currentTitleIndex} timeout={600}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        minHeight: "3rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {titles[currentTitleIndex]}
                    </Typography>
                  </Fade>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Web3 Company • Remote
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                {["Rust", "TypeScript", "ICP"].map((skill) => (
                  <Chip key={skill} label={skill} size="small" />
                ))}
              </Stack>

              <Fade in={showButton} timeout={500}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    transition: "all 0.3s ease",
                    transform: showButton ? "scale(1)" : "scale(0.95)",
                  }}
                >
                  {(() => {
                    switch (currentTitleIndex) {
                      case 0:
                        return "Apply for Job";
                      case 1:
                        return "Contact Talent";
                      case 2:
                        return "Join Startup";
                      case 3:
                        return "View Project";
                      case 4:
                        return "Connect with Founder";
                      default:
                        return "Apply for Job";
                    }
                  })()}
                </Button>
              </Fade>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// Email Inbox Component
const EmailInboxItem = ({
  from,
  subject,
  preview,
  time,
  isUnread = false,
}: {
  from: string;
  subject: string;
  preview: string;
  time: string;
  isUnread?: boolean;
}) => {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          From: {from}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {time}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {subject}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {preview}
      </Typography>
    </Box>
  );
};

// Step 3: Email Notifications Component
const EmailNotificationsStep = () => {
  const emails = [
    {
      from: `alert@${window.location.hostname}`,
      subject: "Looking for AI agents developer",
      preview:
        "New job match found! A startup is seeking an experienced AI developer for their autonomous agent platform...",
      time: "2 min ago",
    },
    {
      from: `alert@${window.location.hostname}`,
      subject: "Looking for farming co-founder",
      preview:
        "Perfect match alert! An agricultural tech startup needs a co-founder with your background...",
      time: "1 hour ago",
    },
  ];

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            3. Email Notifications
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.7 }}>
            If you don't like current matches, wait for an email alert when a
            good match is found.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Badge
            badgeContent={2}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#f44336",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.75rem",
                minWidth: "20px",
                height: "20px",
                borderRadius: "10px",
              },
              mr: 2,
            }}
          >
            <Email sx={{ fontSize: 32, color: "primary.main" }} />
          </Badge>
          <Typography variant="h6">Inbox</Typography>
        </Box>

        <Box>
          {emails.map((email, index) => (
            <EmailInboxItem
              key={index}
              from={email.from}
              subject={email.subject}
              preview={email.preview}
              time={email.time}
            />
          ))}
        </Box>

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            {emails.length} messages
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const CalendarStep = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(15);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const meetingTypes = [
    {
      title: "Technical Interview",
      participant: "Sarah Chen",
      role: "Senior Rust Developer",
      time: "2:00 PM - 3:00 PM",
      type: "Video Call",
      agenda: ["Code review", "Architecture discussion", "Team fit"],
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      title: "Founder Meeting",
      participant: "Alex Rodriguez",
      role: "Startup Founder",
      time: "10:00 AM - 11:00 AM",
      type: "Coffee Chat",
      agenda: ["Vision alignment", "Equity discussion", "Growth plans"],
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const currentMeeting = meetingTypes[currentStep];

  useEffect(() => {
    const interval = setInterval(() => {
      if (showConfirmation) {
        setShowConfirmation(false);
        setCurrentStep((prev) => (prev + 1) % meetingTypes.length);
        setSelectedDate((prev) => (prev === 15 ? 22 : 15));
      } else {
        setShowConfirmation(true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [showConfirmation]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(0,0,0,0.3)"
            : "rgba(0,0,0,0.05)",
        color: theme.palette.text.primary,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          background: showConfirmation
            ? `linear-gradient(135deg, ${theme.palette.success.main}08, transparent)`
            : `linear-gradient(135deg, ${theme.palette.primary.main}08, transparent)`,
          transition: "background 0.8s ease",
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 4, md: 8 },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              4. Smart Meeting Scheduler
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                fontWeight: 400,
                lineHeight: 1.4,
                opacity: 0.9,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                color: theme.palette.text.primary,
              }}
            >
              After finding your perfect match, automatically schedule meetings
              with AI precision
            </Typography>

            <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 4 }}>
              {[
                { icon: "🤖", text: "AI scheduling" },
                { icon: "🔄", text: "Auto-sync" },
                { icon: "💬", text: "Chat integration" },
                { icon: "📝", text: "Follow-ups" },
              ].map((feature, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Typography variant="h5">{feature.icon}</Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.7,
                      fontWeight: 500,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              transform: showConfirmation ? "scale(1.02)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          >
            <Card
              sx={{
                p: 4,
                borderRadius: 3,
                maxWidth: 400,
                width: "100%",
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: showConfirmation
                  ? `2px solid ${theme.palette.success.main}30`
                  : `2px solid ${theme.palette.primary.main}30`,
                transition: "all 0.5s ease",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}
              >
                <People
                  sx={{ fontSize: 24, color: theme.palette.primary.main }}
                />
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
                >
                  Meeting Details
                </Typography>
              </Box>

              <Fade in={true} key={currentStep} timeout={600}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Avatar
                      sx={{ width: 50, height: 50 }}
                      src={currentMeeting.avatar}
                    >
                      {currentMeeting.participant
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                        }}
                      >
                        {currentMeeting.participant}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.7,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {currentMeeting.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {currentMeeting.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                      opacity: 0.8,
                      color: theme.palette.text.primary,
                    }}
                  >
                    📅 Dec {selectedDate} • 🕐 {currentMeeting.time}
                    <br />
                    💻 {currentMeeting.type}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mb: 3,
                      opacity: 0.7,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <strong>Agenda:</strong> {currentMeeting.agenda.join(" • ")}
                  </Typography>

                  {showConfirmation ? (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 3,
                        background: `${theme.palette.success.main}10`,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.success.main}30`,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: theme.palette.success.main,
                          mb: 1,
                          fontWeight: 600,
                        }}
                      >
                        ✅ Meeting Scheduled!
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.7,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        Calendar invite sent
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 1.5,
                        background: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: "1rem",
                        "&:hover": {
                          background: theme.palette.primary.dark,
                        },
                      }}
                    >
                      Schedule Meeting
                    </Button>
                  )}
                </Box>
              </Fade>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const CryptoAgreementStep = () => {
  const [visibleFields, setVisibleFields] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const fields = [
    { id: "amount", label: "Amount", value: "500 USDC" },
    { id: "receiver", label: "Receiver", value: "John Smith" },
    { id: "type", label: "Type", value: "Escrow" },
    { id: "stakingTime", label: "Staking Time", value: "30 days" },
    {
      id: "conditions",
      label: "Conditions",
      value: "Build AI job match ICP canister in 30 days",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleFields((prev) => {
        if (prev <= fields.length) {
          const next = prev + 1;
          if (next > fields.length) setIsCompleted(true);
          return next;
        }
        setIsCompleted(false);
        return 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 4, md: 8 },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              5. Create Crypto Agreement
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 4, fontWeight: 400, lineHeight: 1.4, opacity: 0.9 }}
            >
              After finding your match, create a secure blockchain agreement
              with built-in escrow and milestone tracking
            </Typography>
          </Box>

          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Card
              sx={{
                p: 4,
                borderRadius: 3,
                maxWidth: 400,
                minHeight: 400,
                width: "100%",
                position: "relative",
                overflow: "visible",
                transform: isCompleted ? "scale(1.02)" : "scale(1)",
                transition: "transform 0.5s ease",
                // Add margin to prevent clipping
                mt: 3,
                mr: 3,
              }}
            >
              {isCompleted && (
                <Fade in={true} timeout={1000}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      zIndex: 10,
                    }}
                  >
                    <Shield
                      sx={{
                        fontSize: 60,
                        color: "success.main",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                      }}
                    />
                  </Box>
                </Fade>
              )}

              <Box
                sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}
              >
                <HandshakeIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Agreement Details
                </Typography>
              </Box>

              <Stack spacing={3}>
                {visibleFields >= 1 && (
                  <Fade in={true} timeout={800}>
                    <Box sx={{ minHeight: 60 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Amount
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        500 USDC
                      </Typography>
                    </Box>
                  </Fade>
                )}

                {visibleFields >= 2 && (
                  <Fade in={true} timeout={800}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{ width: 50, height: 50 }}
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                      >
                        JS
                      </Avatar>
                      <Box>
                        <Typography variant="body2">Receiver</Typography>
                        <Typography variant="h6">John Smith</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Senior ICP Developer
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                )}
                {visibleFields >= 3 && (
                  <Fade in={true} timeout={800}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Type
                      </Typography>
                      <Chip label="Escrow" variant="outlined" />
                    </Box>
                  </Fade>
                )}

                {visibleFields >= 4 && (
                  <Fade in={true} timeout={800}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Staking Time
                      </Typography>
                      <Typography variant="h6">30 days</Typography>
                    </Box>
                  </Fade>
                )}

                {visibleFields >= 5 && (
                  <Fade in={true} timeout={800}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Conditions
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                        "Build AI job match ICP canister in 30 days"
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Stack>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const CryptoAgreementProofsStep = () => {
  const [activeSection, setActiveSection] = useState(0);
  const theme = useTheme();

  const proofs = [
    {
      title: "Proof of Existence",
      subtitle: "You can't promise what you haven't deposited first",
      description: "Deposit funds before making promises",
      icon: "💰",
      color: "#4CAF50",
    },
    {
      title: "Proof of Stake",
      subtitle:
        "After 3 cancellations, your 4th promise will be staked for a long time",
      description: "Build instant trust with upfront staking",
      icon: "🔒",
      color: "#FF9800",
    },
    {
      title: "Proof of Cap",
      subtitle:
        "New users or frequent cancellers can't create oversized promises",
      description: "Smart limits prevent oversized commitments",
      icon: "📊",
      color: "#2196F3",
    },
    {
      title: "Proof of Reputation",
      subtitle:
        "Your Karma Score shows completed work, canceled jobs, and disputes resolved",
      description: "Transparent reputation system",
      icon: "⭐",
      color: "#9C27B0",
    },
  ];

  const handleScroll = (e) => {
    const sections = document.querySelectorAll(".proof-section");
    const scrollY = window.scrollY + window.innerHeight / 2;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = sectionTop + rect.height;

      if (scrollY >= sectionTop && scrollY <= sectionBottom) {
        setActiveSection(index);
      }
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", py: { xs: 8, md: 12 }, px: 3 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            mb: 3,
            fontSize: { xs: "2.5rem", md: "4rem" },
          }}
        >
          Crypto Agreement Proofs
        </Typography>
        <Typography
          variant="h5"
          sx={{ opacity: 0.7, maxWidth: 600, mx: "auto", fontWeight: 300 }}
        >
          The blockchain proof system that'll take you places
        </Typography>
      </Box>

      {/* Proof Sections */}
      {proofs.map((proof, index) => (
        <Box
          key={index}
          className="proof-section"
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            px: 3,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${proof.color}15, transparent)`
                  : `linear-gradient(135deg, ${proof.color}08, transparent)`,
              opacity: activeSection === index ? 1 : 0,
              transition: "opacity 0.8s ease",
            },
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 4, md: 8 },
                flexDirection: {
                  xs: "column",
                  md: index % 2 === 0 ? "row" : "row-reverse",
                },
              }}
            >
              {/* Icon Side */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  transform:
                    activeSection === index ? "scale(1)" : "scale(0.9)",
                  opacity: activeSection === index ? 1 : 0.5,
                  transition: "all 0.8s ease",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 120, md: 200 },
                    height: { xs: 120, md: 200 },
                    borderRadius: "50%",
                    background:
                      theme.palette.mode === "dark"
                        ? `linear-gradient(135deg, ${proof.color}25, ${proof.color}10)`
                        : `linear-gradient(135deg, ${proof.color}20, ${proof.color}08)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: { xs: "3rem", md: "5rem" },
                    border: `2px solid ${proof.color}30`,
                    backdropFilter: "blur(10px)",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? `0 10px 30px ${proof.color}20`
                        : `0 10px 30px ${proof.color}15`,
                  }}
                >
                  {proof.icon}
                </Box>
              </Box>

              {/* Content Side */}
              <Box
                sx={{
                  flex: 1,
                  transform:
                    activeSection === index
                      ? "translateY(0)"
                      : "translateY(20px)",
                  opacity: activeSection === index ? 1 : 0.6,
                  transition: "all 0.8s ease",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: proof.color,
                    fontSize: { xs: "2rem", md: "3rem" },
                  }}
                >
                  {proof.title}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    opacity: 0.9,
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                  }}
                >
                  {proof.subtitle}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.7,
                    fontSize: { xs: "1rem", md: "1.125rem" },
                  }}
                >
                  {proof.description}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      ))}

      {/* Bottom Features */}
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          borderTop:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h4" sx={{ mb: 6, fontWeight: 600 }}>
          Built on Blockchain Technology
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 4, md: 8 },
            flexWrap: "wrap",
            maxWidth: 800,
            mx: "auto",
          }}
        >
          {[
            { icon: "🔐", text: "Immutable Records" },
            { icon: "⚡", text: "Instant Verification" },
            { icon: "🌐", text: "Decentralized Trust" },
            { icon: "📈", text: "Transparent Metrics" },
          ].map((feature, index) => (
            <Box key={index} sx={{ textAlign: "center" }}>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {feature.icon}
              </Typography>
              <Typography
                variant="body1"
                sx={{ opacity: 0.7, fontWeight: 500 }}
              >
                {feature.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// Step 7: Project Management Component
const ProjectManagementStep = () => {
  const [currentContract, setCurrentContract] = useState(0);
  const [animatingPromises, setAnimatingPromises] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [promiseCount, setPromiseCount] = useState(3);
  const [promiseAmount, setPromiseAmount] = useState(1500);

  const contracts = [
    {
      id: "1",
      name: "AI Agent Development",
      status: "Active",
      promises: 3,
      amount: 1500,
      payments: 1,
      paidAmount: 500,
      creator: "Sarah Chen",
      role: "Project Manager",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "ICP Canister Integration",
      status: "Pending",
      promises: 2,
      amount: 2000,
      payments: 0,
      paidAmount: 0,
      creator: "Alex Rodriguez",
      role: "Tech Lead",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentContract((prev) => (prev + 1) % contracts.length);
      setAnimatingPromises(true);
      setPromiseCount((prev) => (prev === 3 ? 2 : 3));
      setPromiseAmount((prev) => (prev === 1500 ? 2000 : 1500));
      setNotificationVisible(true);

      setTimeout(() => {
        setAnimatingPromises(false);
        setNotificationVisible(false);
      }, 2000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentContractData = contracts[currentContract];

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 6,
            alignItems: "center",
          }}
        >
          {/* Left: Text Content */}
          <Box>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
              7. Project Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.7, mb: 4 }}>
              Manage team tasks, payments, and contracts A-Z with help of AI
            </Typography>

            {/* AI Features */}
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.8 }}>
              AI-Powered Management
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              {[
                { icon: "🤖", text: "Smart task allocation" },
                { icon: "💰", text: "Automated payment tracking" },
                { icon: "📊", text: "Progress analytics" },
                { icon: "🔔", text: "Real-time notifications" },
              ].map((feature, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Typography variant="h5">{feature.icon}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right: Contract Card */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box sx={{ position: "relative", width: "100%", maxWidth: 350 }}>
              <Fade in={notificationVisible} timeout={500}>
                <Box
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    zIndex: 10,
                    background: "linear-gradient(135deg, #ff4444, #cc0000)",
                    color: "white",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(255, 68, 68, 0.4)",
                    border: "2px solid white",
                    animation: "bounce 0.5s ease-in-out",
                    "@keyframes bounce": {
                      "0%": { transform: "scale(0)" },
                      "50%": { transform: "scale(1.2)" },
                      "100%": { transform: "scale(1)" },
                    },
                  }}
                >
                  {currentContract + 1}
                </Box>
              </Fade>

              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: notificationVisible
                    ? "2px solid #ff4444"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: notificationVisible
                    ? "0 0 20px rgba(255, 68, 68, 0.3)"
                    : "none",
                  transition: "all 0.3s ease",
                  transform: animatingPromises ? "scale(1.02)" : "scale(1)",
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 1,
                      transition: "opacity 0.5s ease",
                    }}
                  >
                    {currentContractData.name}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                      src={currentContractData.avatar}
                    >
                      {currentContractData.creator
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {currentContractData.creator}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {currentContractData.role}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.5s ease",
                      transform: animatingPromises ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HandshakeIcon
                        sx={{ fontSize: 18, color: "primary.main" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Promises
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          transition: "all 0.5s ease",
                          color: animatingPromises
                            ? "primary.main"
                            : "text.primary",
                        }}
                      >
                        {promiseCount}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          transition: "all 0.5s ease",
                          color: animatingPromises
                            ? "primary.main"
                            : "text.secondary",
                        }}
                      >
                        ${promiseAmount}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon
                        sx={{ fontSize: 18, color: "success.main" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Payments
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {currentContractData.payments}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${currentContractData.paidAmount}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={currentContractData.status}
                    size="small"
                    variant="filled"
                    sx={{
                      background:
                        currentContractData.status === "Active"
                          ? "linear-gradient(135deg, #4caf50, #2e7d32)"
                          : "linear-gradient(135deg, #ff9800, #f57c00)",
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Card>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// Enhanced Footer Component
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
      sx={{
        mt: 12,
        py: 8,
        backgroundColor: "background.paper",
        borderTop: "2px solid",
        borderColor: "divider",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-start" },
            gap: 4,
            mb: 6,
          }}
        >
          {/* Brand Section */}
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
              {window.location.hostname}
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 2, opacity: 0.8, maxWidth: 300 }}
            >
              The complete online work toolkit for the Web3 era.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              AI-powered job matching • Smart contracts • Team management
            </Typography>
          </Box>

          {/* Links Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 3, sm: 6 },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Platform
              </Typography>
              <Stack spacing={1}>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Find Jobs
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Find Talent
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  AI Matching
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Resources
              </Typography>
              <Stack spacing={1}>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Documentation
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  API
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Support
                </Typography>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Community
              </Typography>
              <Stack spacing={1}>
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Box
                      key={social.name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                        opacity: 0.7,
                        "&:hover": { opacity: 1 },
                        justifyContent: { xs: "center", md: "flex-start" },
                      }}
                      onClick={() => window.open(social.url, "_blank")}
                    >
                      <Icon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{social.name}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Bottom Section */}
        <Divider sx={{ mb: 4, opacity: 0.3 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} Made by oDoc.app team. All rights
            reserved.
          </Typography>

          <Box sx={{ display: "flex", gap: 3 }}>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.6,
                cursor: "pointer",
                "&:hover": { opacity: 1 },
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.6,
                cursor: "pointer",
                "&:hover": { opacity: 1 },
              }}
            >
              Terms of Service
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const texts = [
    "Your AI Workforce Copilot",
    "AI Job match",
    "Crypto agreements",
    "Team mangment",
  ];
  const typedText = useTypingAnimation(texts);

  return (
    <Box sx={{ position: "relative" }}>
      {/* Animated Grid Background */}

      <Helmet>
        <title>
          {window.location.hostname} - AI-Powered Job Matching for ICP Ecosystem
        </title>
        <meta
          name="description"
          content="Find your perfect job or talent in the Internet Computer Protocol ecosystem with AI-powered matching, smart scheduling, and crypto agreements."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta
          property="og:title"
          content={`${window.location.hostname} - AI-Powered Job Matching for ICP Ecosystem`}
        />
        <meta
          property="og:description"
          content="Find your perfect job or talent in the Internet Computer Protocol ecosystem with AI-powered matching, smart scheduling, and crypto agreements."
        />
        <meta
          property="og:image"
          content={`${window.location.origin}/thumnail.png`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={window.location.hostname} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta
          name="twitter:title"
          content={`${window.location.hostname} - AI-Powered Job Matching for ICP Ecosystem`}
        />
        <meta
          name="twitter:description"
          content="Find your perfect job or talent in the Internet Computer Protocol ecosystem with AI-powered matching, smart scheduling, and crypto agreements."
        />
        <meta
          name="twitter:image"
          content={`${window.location.origin}/thumnail.png`}
        />

        {/* LinkedIn */}
        <meta property="linkedin:card" content="summary_large_image" />
        <meta
          property="linkedin:title"
          content={`${window.location.hostname} - AI-Powered Job Matching for ICP Ecosystem`}
        />
        <meta
          property="linkedin:description"
          content="Find your perfect job or talent in the Internet Computer Protocol ecosystem with AI-powered matching, smart scheduling, and crypto agreements."
        />
        <meta
          property="linkedin:image"
          content={`${window.location.origin}/thumnail.png`}
        />
      </Helmet>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              mb: 3,
              fontWeight: 700,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              minHeight: { xs: "3.5rem", md: "4.5rem" },
            }}
          >
            {typedText}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.8,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Smart talent matching • Crypto-native payments • Zero-friction team
            ops. Build your dream team in the Web3 era.
          </Typography>
        </Container>
      </Box>

      {/* Journey Steps */}

      <AIConversationStep />

      <JobMatchingStep />

      <EmailNotificationsStep />

      <CalendarStep />

      <CryptoAgreementStep />

      <CryptoAgreementProofsStep />

      <ProjectManagementStep />

      <SocialMediaShare />
      {/* Footer */}
      <SimpleFooter />
    </Box>
  );
};

export default LandingPage;
