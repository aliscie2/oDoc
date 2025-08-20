import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  LinearProgress,
  Avatar,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Button,
  Divider,
  Collapse,
  Container,
  Card,
} from "@mui/material";
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Google as GoogleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import useProgress, { type BadgeType } from "./useProgress";

import { useGoogleCalendar } from "@/pages/calendar/googleAccounts/useGoogleCalendar";
import { Link } from "react-router-dom";

// ODOC Reward Tier System
const getRewardTier = (score: number) => {
  if (score >= 4.5) return { percentage: 0.2, level: "Platinum", icon: "💎" };
  if (score >= 4) return { percentage: 0.15, level: "Gold", icon: "🏆" };
  if (score >= 3.5) return { percentage: 0.1, level: "Silver", icon: "🥈" };
  if (score >= 3) return { percentage: 0.05, level: "Bronze", icon: "🥉" };
  return { percentage: 0, level: "Starter", icon: "🌱" };
};

const levels = [
  { threshold: 0, color: "#F44336", label: "Starter", icon: "🌱" },
  { threshold: 2, color: "#FF5722", label: "Beginner", icon: "🔥" },
  { threshold: 3, color: "#FFC107", label: "Bronze", icon: "🥉" },
  { threshold: 3.5, color: "#8BC34A", label: "Silver", icon: "🥈" },
  { threshold: 4, color: "#4CAF50", label: "Gold", icon: "🏆" },
  { threshold: 4.5, color: "#2E7D32", label: "Platinum", icon: "💎" },
];

const categoryColors = {
  social: "#2196F3",
  growth: "#4CAF50",
  trust: "#FF9800",
  milestone: "#9C27B0",
  setup: "#673AB7",
};

// Email Setup Component
const EmailSetup: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const {
    emailInput,
    setEmailInput,
    verificationCode,
    setVerificationCode,
    showVerification,
    setShowVerification,
    loading,
    error,
    connectGoogleCalendar,
    handleSendVerification,
    handleVerifyCode,
  } = useGoogleCalendar();

  const handleGoogleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await connectGoogleCalendar();
      onClose();
    },
    [connectGoogleCalendar, onClose],
  );

  const handleSendCode = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await handleSendVerification();
    },
    [handleSendVerification],
  );

  const handleVerify = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const success = await handleVerifyCode();
      if (success) onClose();
    },
    [handleVerifyCode, onClose],
  );

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      setEmailInput(e.target.value);
    },
    [setEmailInput],
  );

  const handleVerificationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      setVerificationCode(e.target.value);
    },
    [setVerificationCode],
  );

  return (
    <Box
      sx={{ mt: 2, p: 2, borderRadius: 2 }}
      onClick={(e) => e.stopPropagation()}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
          {error}
        </Alert>
      )}

      {!showVerification ? (
        <>
          <Button
            variant="contained"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleClick}
            sx={{ mb: 2 }}
          >
            Connect with Gmail
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="textSecondary">
              OR
            </Typography>
          </Divider>

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={emailInput}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onFocus={handleInputClick}
            size="small"
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            fullWidth
            onClick={handleSendCode}
            disabled={loading || !emailInput}
            startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </>
      ) : (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Verification code sent to <strong>{emailInput}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={handleVerificationChange}
            onClick={handleInputClick}
            onFocus={handleInputClick}
            inputProps={{ maxLength: 6 }}
            size="small"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleVerify}
            disabled={verificationCode.length !== 6}
            sx={{ mb: 1 }}
          >
            Verify Code
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              setShowVerification(false);
            }}
          >
            Back to Email Entry
          </Button>
        </>
      )}
    </Box>
  );
};

// Calendar Setup Component
const CalendarSetup: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <Box
      sx={{ mt: 2, p: 2, borderRadius: 2 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Typography variant="body2" sx={{ mb: 2 }}>
        Set up your availability schedule for optimal appointment booking.
      </Typography>
      <Button
        component={Link}
        to="/calendar"
        variant="contained"
        fullWidth
        startIcon={<CalendarIcon />}
      >
        Go to Calendar Setup
      </Button>
    </Box>
  );
};

// Badge Component
const BadgeCard: React.FC<{
  badge: BadgeType;
  onVideoClick: (badge: BadgeType) => void;
}> = ({ badge, onVideoClick }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (badge.id === "email-setup" || badge.id === "calendar-setup") {
      if (!badge.unlocked) {
        e.stopPropagation();
        setExpanded(!expanded);
      }
    } else if (badge.videoUrl && !badge.unlocked) {
      onVideoClick(badge);
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ position: "relative" }}>
      {badge.unlocked && (
        <CheckCircleIcon
          sx={{
            position: "absolute",
            top: 4,
            left: 4,
            color: "success.main",
            fontSize: "1rem",
            zIndex: 1,
            borderRadius: "50%",
          }}
        />
      )}

      <Paper
        sx={{
          p: 1.5,
          pl: badge.unlocked ? 2.5 : 1.5,
          cursor:
            !badge.unlocked &&
            (badge.id === "email-setup" ||
              badge.id === "calendar-setup" ||
              badge.videoUrl)
              ? "pointer"
              : "default",
          transition: "all 0.2s ease",
          border: badge.unlocked
            ? `2px solid ${categoryColors[badge.category]}40`
            : "1px solid",
          borderColor: badge.unlocked
            ? categoryColors[badge.category]
            : "grey.300",
          backgroundColor: badge.unlocked
            ? `${categoryColors[badge.category]}08`
            : "background.paper",
          "&:hover":
            !badge.unlocked &&
            (badge.id === "email-setup" ||
              badge.id === "calendar-setup" ||
              badge.videoUrl)
              ? {
                  transform: "translateY(-2px)",
                  boxShadow: 2,
                }
              : {},
        }}
        onClick={handleClick}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: "1rem",
              backgroundColor: badge.unlocked ? "transparent" : "grey.200",
              filter: badge.unlocked ? "none" : "grayscale(100%)",
              opacity: badge.unlocked ? 1 : 0.5,
              mr: 1,
            }}
          >
            {badge.icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              fontSize="0.875rem"
            >
              {badge.title}
            </Typography>
          </Box>
          {(badge.id === "email-setup" || badge.id === "calendar-setup") &&
            !badge.unlocked && (
              <IconButton size="small" onClick={handleExpandClick}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          {badge.videoUrl &&
            !badge.unlocked &&
            badge.id !== "email-setup" &&
            badge.id !== "calendar-setup" && <PlayIcon color="primary" />}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: expanded ? 0 : 0.5, fontSize: "0.75rem" }}
        >
          {badge.description}
        </Typography>

        <Collapse in={expanded}>
          {badge.id === "email-setup" && (
            <EmailSetup onClose={() => setExpanded(false)} />
          )}
          {badge.id === "calendar-setup" && (
            <CalendarSetup onClose={() => setExpanded(false)} />
          )}
        </Collapse>
      </Paper>
    </Box>
  );
};

// Main Achievement Page Component
const AchievementPage: React.FC = () => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  const { karmaScore, badges, recentAchievements } = useProgress();
  const { emailCompleted, availabilityCompleted } = useGoogleCalendar();

  const createSetupBadges = (): BadgeType[] => [
    {
      id: "email-setup",
      title: "Email Connected",
      description: "Successfully connected your email for calendar integration",
      icon: "📧",
      category: "setup" as any,
      unlocked: emailCompleted,
      videoUrl: emailCompleted
        ? undefined
        : "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: "calendar-setup",
      title: "Availability Set",
      description:
        "Configured your availability schedule for optimal scheduling",
      icon: "📅",
      category: "setup" as any,
      unlocked: availabilityCompleted,
      videoUrl: availabilityCompleted
        ? undefined
        : "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  ];

  const allBadges = [...createSetupBadges(), ...badges];
  const allUnlockedBadges = allBadges.filter((badge) => badge.unlocked);

  const currentLevel = levels.reduce((prev, level) =>
    karmaScore >= level.threshold ? level : prev,
  );
  const nextLevel = levels.find((level) => level.threshold > karmaScore);
  const rewardTier = getRewardTier(karmaScore);

  const handleVideoClick = (badge: BadgeType) => {
    setSelectedBadge(badge);
    setVideoOpen(true);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2 } }}
    >
      {/* Header Section */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: `linear-gradient(135deg, ${currentLevel.color}20, ${currentLevel.color}10)`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              fontSize: { xs: "1.5rem", sm: "1.8rem" },
            }}
          >
            {currentLevel.icon}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Your Achievements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentLevel.label} Level
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={currentLevel.color}
                sx={{ fontSize: { xs: "1.5rem", sm: "3rem" } }}
              >
                {karmaScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Karma Score
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.5rem", sm: "3rem" } }}
              >
                {allUnlockedBadges.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Badges Earned
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                color="success.main"
                sx={{ fontSize: { xs: "1.5rem", sm: "3rem" } }}
              >
                +{(rewardTier.percentage * 100).toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ODOC Rewards
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.2rem", sm: "2rem" } }}
              >
                {rewardTier.icon}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {rewardTier.level} Tier
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {nextLevel && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                Next: {nextLevel.label} {nextLevel.icon}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(nextLevel.threshold - karmaScore).toFixed(1)} points to go
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={
                ((karmaScore - currentLevel.threshold) /
                  (nextLevel.threshold - currentLevel.threshold)) *
                100
              }
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: currentLevel.color,
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* All Badges */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          All Badges
        </Typography>
        <Grid container spacing={1.5}>
          {allBadges.map((badge) => (
            <Grid item xs={12} sm={6} md={4} key={badge.id}>
              <BadgeCard badge={badge} onVideoClick={handleVideoClick} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Video Modal */}
      {videoOpen && selectedBadge?.videoUrl && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
          onClick={() => setVideoOpen(false)}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 800,

              borderRadius: 2,
              p: 3,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              sx={{ position: "absolute", top: 8, right: 8 }}
              onClick={() => setVideoOpen(false)}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mb: 2, pr: 5 }}>
              {selectedBadge.title} - Tutorial
            </Typography>
            <Box
              sx={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                mb: 2,
              }}
            >
              <iframe
                src={selectedBadge.videoUrl}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
                allowFullScreen
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {selectedBadge.description}
            </Typography>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default AchievementPage;
