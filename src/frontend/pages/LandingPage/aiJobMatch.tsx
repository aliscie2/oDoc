import {
  CalendarMonth,
  Email,
  Facebook,
  People,
  SmartToy,
  Twitter,
  Shield,
  Handshake as HandshakeIcon,
  CheckCircle as CheckCircleIcon,
  YouTube,
  Notifications,
} from "@mui/icons-material";
import { SvgIcon } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  Typography,
  Card,
  TextField,
  CircularProgress,
  Stack,
  Chip,
  Button,
  Avatar,
  IconButton,
  Divider,
  Fade,
  Box,
  Container,
  CardContent,
  Badge,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Instagram } from "lucide-react";
import { LinkedIn } from "@mui/icons-material";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";

// Social Media Sharing Component
const SocialMediaShare = () => {
  const shareMessage = `I just joined the modern online work ${window.location.hostname} you should join too`;
  const shareUrl = window.location.href;
  const imageUrl = `${window.location.origin}/icpjobs_thumnail.png`;

  const handleFacebookShare = () => {
    // Facebook will automatically pull the Open Graph meta tags we added
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(
      facebookUrl,
      "_blank",
      "width=600,height=500,scrollbars=yes,resizable=yes",
    );
  };

  const handleInstagramShare = () => {
    // For Instagram, we'll create a comprehensive sharing experience
    // Since Instagram doesn't support direct URL sharing, we'll use multiple approaches

    // First, try the Web Share API if available (works on mobile)
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [] })
    ) {
      // Try to fetch and share the image along with text
      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const file = new File([blob], "icpjobs_thumbnail.png", {
            type: "image/png",
          });
          return navigator.share({
            title: "Join Modern Online Work",
            text: shareMessage,
            url: shareUrl,
            files: [file],
          });
        })
        .catch((error) => {
          console.log("Error sharing with image:", error);
          // Fallback to text-only sharing
          navigator
            .share({
              title: "Join Modern Online Work",
              text: shareMessage,
              url: shareUrl,
            })
            .catch(() => fallbackInstagramShare());
        });
    } else {
      fallbackInstagramShare();
    }
  };

  const fallbackInstagramShare = () => {
    // Create a more user-friendly sharing experience
    const fullMessage = `${shareMessage}\n\n🔗 ${shareUrl}\n\n#ModernWork #JobMatching #ICP #Blockchain #RemoteWork`;

    // Copy comprehensive message to clipboard
    navigator.clipboard
      .writeText(fullMessage)
      .then(() => {
        console.log("Message copied to clipboard for Instagram sharing");

        // Open Instagram in new tab
        window.open("https://www.instagram.com/", "_blank");

        // Create a better user notification
        const notification = document.createElement("div");
        notification.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 20px; 
          background: linear-gradient(45deg, #F56040, #E1306C, #C13584, #833AB4);
          color: white; 
          padding: 16px 20px; 
          border-radius: 12px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          max-width: 300px;
          animation: slideIn 0.3s ease-out;
        ">
          <div style="font-weight: 600; margin-bottom: 8px;">📋 Copied to clipboard!</div>
          <div style="font-size: 12px; opacity: 0.9;">
            Paste this in your Instagram post or story. 
            <br>💡 Tip: Download the thumbnail image from /icpjobs_thumnail.png
          </div>
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `;

        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.style.animation = "slideIn 0.3s ease-out reverse";
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 300);
          }
        }, 5000);
      })
      .catch((error) => {
        console.error("Failed to copy to clipboard:", error);
        // Fallback: just open Instagram
        window.open("https://www.instagram.com/", "_blank");
      });
  };

  const handleTwitterShare = () => {
    // Twitter will use the Twitter Card meta tags we added for the image
    const tweetText = `${shareMessage} 🚀\n\n#ModernWork #JobMatching #ICP #RemoteWork`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(
      twitterUrl,
      "_blank",
      "width=600,height=500,scrollbars=yes,resizable=yes",
    );
  };

  const handleLinkedInShare = () => {
    // LinkedIn will use the Open Graph meta tags for the preview
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(
      linkedInUrl,
      "_blank",
      "width=600,height=500,scrollbars=yes,resizable=yes",
    );
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
        <IconButton
          onClick={handleFacebookShare}
          sx={{
            bgcolor: "#1877F2",
            color: "white",
            "&:hover": { bgcolor: "#166FE5" },
            width: 56,
            height: 56,
          }}
        >
          <Facebook sx={{ fontSize: 28 }} />
        </IconButton>

        <IconButton
          onClick={handleInstagramShare}
          sx={{
            background:
              "linear-gradient(45deg, #F56040, #E1306C, #C13584, #833AB4)",
            color: "white",
            "&:hover": { opacity: 0.9 },
            width: 56,
            height: 56,
          }}
        >
          <Instagram size={28} />
        </IconButton>

        <IconButton
          onClick={handleTwitterShare}
          sx={{
            bgcolor: "#000000",
            color: "white",
            "&:hover": { bgcolor: "#333333" },
            width: 56,
            height: 56,
          }}
        >
          <XIcon sx={{ fontSize: 28 }} />
        </IconButton>

        <IconButton
          onClick={handleLinkedInShare}
          sx={{
            bgcolor: "#0A66C2",
            color: "white",
            "&:hover": { bgcolor: "#004182" },
            width: 56,
            height: 56,
          }}
        >
          <LinkedIn sx={{ fontSize: 28 }} />
        </IconButton>
      </Stack>

      <Typography
        variant="body2"
        sx={{ mt: 2, opacity: 0.6, fontStyle: "italic" }}
      >
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

// Typing Animation Hook for Hero Section
const useHeroTypingAnimation = (texts: string[], speed = 100) => {
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
        // No waiting time - immediately start deleting
        setIsTyping(false);
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          // Delete from left to right by removing the first character
          setCurrentText(currentText.slice(1));
        }, speed / 2);
      } else {
        // No waiting time - immediately move to next text
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isTyping, texts, speed]);

  return currentText;
};

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
            No manual work anymore. Ask, it is done.
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
          <Box component="span" sx={{ whiteSpace: "pre" }}>
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
      // Animate score increase
      setMatchScore((prev) => (prev === 70 ? 87 : 70));

      // Toggle title
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length);

      // Toggle button visibility
      setShowButton((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            2. Job Matching Card
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
            Stop hunting for jobs, let AI do it for you.
          </Typography>
        </Box>

        <Card sx={{ p: 4, borderRadius: 3, maxWidth: 500, mx: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
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
      </Container>
    </Box>
  );
};

// Step 3: Email Notifications Component
const EmailNotificationsStep = () => {
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);

  const emails = [
    "Looking for AI agents developer",
    "Looking to farming co-founder",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmailIndex((prev) => (prev + 1) % emails.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
            If you don't like current matches, wait for an email alert.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Badge
            badgeContent={1}
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

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            From: alert@{window.location.hostname}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              transition: "opacity 0.5s ease",
              minHeight: "2rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            {emails[currentEmailIndex]}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// Step 4: Calendar Component
const CalendarStep = () => {
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
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            4. Smart Meeting Scheduler
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.7, mb: 2 }}>
            After finding your perfect match, automatically schedule meetings,
            in a time suits you.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Meeting Details Card */}
          <Card
            sx={{
              p: 4,
              borderRadius: 3,
              maxWidth: 450,
              flex: 1,
              minWidth: 350,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <People sx={{ mr: 2, fontSize: 32, color: "secondary.main" }} />
              <Typography variant="h6">Meeting Details</Typography>
            </Box>

            <Fade in={true} key={currentStep}>
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Avatar
                    sx={{ width: 50, height: 50, bgcolor: "secondary.main" }}
                    src={currentMeeting.avatar}
                  >
                    {currentMeeting.participant
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {currentMeeting.participant}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {currentMeeting.role}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    {currentMeeting.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                    📅 December {selectedDate}, 2024
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                    🕐 {currentMeeting.time}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    💻 {currentMeeting.type}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    Meeting Agenda:
                  </Typography>
                  {currentMeeting.agenda.map((item, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{ opacity: 0.8, ml: 2 }}
                    >
                      • {item}
                    </Typography>
                  ))}
                </Box>

                {showConfirmation ? (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ color: "success.main", mb: 2 }}
                    >
                      ✅ Meeting Scheduled!
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Calendar invite sent to both parties
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      background:
                        "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #1976D2 30%, #0288D1 90%)",
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

        {/* Additional Features */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.8 }}>
            Smart Features
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "🤖", text: "AI suggests optimal meeting times" },
              { icon: "🔄", text: "Auto-sync with Google Calendar" },
              { icon: "💬", text: "Pre-meeting chat integration" },
              { icon: "📝", text: "Automated follow-up reminders" },
            ].map((feature, index) => (
              <Box key={index} sx={{ textAlign: "center", maxWidth: 200 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// Step 5: Crypto Agreement Component
const CryptoAgreementStep = () => {
  const [visibleFields, setVisibleFields] = useState(1); // Start with first field visible

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
    // Show first field immediately, then animate the rest
    const fieldInterval = setInterval(() => {
      setVisibleFields((prev) => {
        if (prev < fields.length + 1) return prev + 1; // +1 for completion state
        return 1; // Reset to show first field instead of 0
      });
    }, 1500); // Reduced from 2000ms to 1500ms for faster animation

    return () => {
      clearInterval(fieldInterval);
    };
  }, []);

  const isCompleted = visibleFields > fields.length;

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            5. Create Crypto Agreement
          </Typography>
        </Box>

        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: 500,
            minHeight: 400, // Fixed minimum height
            mx: "auto",
            position: "relative",
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Green Shield Icon - appears when completed */}
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

          <Stack spacing={3} sx={{ flex: 1 }}>
            {/* Amount Field */}
            <Box sx={{ minHeight: 60 }}>
              {visibleFields >= 1 && (
                <Fade in={true} timeout={800}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Amount
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      500 USDC
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Receiver Field */}
            <Box sx={{ minHeight: 70 }}>
              {visibleFields >= 2 && (
                <Fade in={true} timeout={800}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: "primary.main",
                      }}
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    >
                      JS
                    </Avatar>
                    <Box>
                      <Typography variant="body2">Receiver</Typography>
                      <Typography variant="h6">John Smith</Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.7, fontSize: "0.8rem" }}
                      >
                        Senior ICP Developer
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Type Field */}
            <Box sx={{ minHeight: 50 }}>
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
            </Box>

            {/* Staking Time Field */}
            <Box sx={{ minHeight: 50 }}>
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
            </Box>

            {/* Conditions Field */}
            <Box sx={{ minHeight: 60 }}>
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

</Box>
          </Stack>
          
        </Card>
      </Container>
    </Box>
  );
};

// Step 6: Project Management Component
const ProjectManagementStep = () => {
  const [currentContract, setCurrentContract] = useState(0);
  const [animatingPromises, setAnimatingPromises] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [promiseCount, setPromiseCount] = useState(3);
  const [promiseAmount, setPromiseAmount] = useState(1500);

  // Mock contracts data
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
      // Switch between contracts
      setCurrentContract((prev) => (prev + 1) % contracts.length);

      // Animate promises and amounts
      setAnimatingPromises(true);
      setPromiseCount((prev) => (prev === 3 ? 2 : 3));
      setPromiseAmount((prev) => (prev === 1500 ? 2000 : 1500));

      // Show notification
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
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            6. Project Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.7 }}>
            Manage team tasks, payments, and contracts A-Z with help of AI
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Active Contract Card with Animation */}
          <Box sx={{ position: "relative" }}>
            {/* Notification Badge */}
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
                maxWidth: 350,
                flex: 1,
                minWidth: 300,
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
              {/* Contract Header */}
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

              {/* Contract Stats with Animation */}
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
                      color="text.primary"
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
                      color="text.secondary"
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

              {/* Status Chip */}
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

        {/* AI Features */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.8 }}>
            AI-Powered Management
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "🤖", text: "Smart task allocation" },
              { icon: "💰", text: "Automated payment tracking" },
              { icon: "📊", text: "Progress analytics" },
              { icon: "🔔", text: "Real-time notifications" },
            ].map((feature, index) => (
              <Box key={index} sx={{ textAlign: "center", maxWidth: 200 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// Step 7: Social Sharing Component
const SocialSharingStep = () => {
  const [currentPlatform, setCurrentPlatform] = useState(0);

  const platforms = [
    { name: "Twitter", icon: Twitter },
    { name: "LinkedIn", icon: LinkedIn },
    { name: "Facebook", icon: Facebook },
    { name: "Instagram", icon: Instagram },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlatform((prev) => (prev + 1) % platforms.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Share with Friends
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.7 }}>
            Share {window.location.hostname} with your friends to grow your and
            our community.
          </Typography>
        </Box>

        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: 400,
            mx: "auto",
            textAlign: "center",
          }}
        >
          <Box sx={{ mb: 4 }}>
            {platforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <IconButton
                  key={platform.name}
                  sx={{
                    m: 1,
                    width: 60,
                    height: 60,
                    transform:
                      index === currentPlatform ? "scale(1.2)" : "scale(1)",
                    opacity: index === currentPlatform ? 1 : 0.5,
                    transition: "all 0.3s ease",
                  }}
                >
                  <Icon sx={{ fontSize: 32 }} />
                </IconButton>
              );
            })}
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Share on {platforms[currentPlatform].name}
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

// Simple Footer Component
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
    <Box component="footer" sx={{ py: 6, textAlign: "center" }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          {window.location.hostname}
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, opacity: 0.7 }}>
          The online work tool kit.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <IconButton
                key={social.name}
                onClick={() => window.open(social.url, "_blank")}
                sx={{
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              >
                <Icon />
              </IconButton>
            );
          })}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          © {new Date().getFullYear()} Made by oDoc.app team.
        </Typography>
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
    <Box>
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
          content={`${window.location.origin}/icpjobs_thumnail.png`}
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
          content={`${window.location.origin}/icpjobs_thumnail.png`}
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
          content={`${window.location.origin}/icpjobs_thumnail.png`}
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
      <ProjectManagementStep />
      <SocialMediaShare />

      {/* Footer */}
      <SimpleFooter />
    </Box>
  );
};

export default LandingPage;
