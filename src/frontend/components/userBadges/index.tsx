import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Tooltip,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Button,
  Divider,
  Collapse,
} from "@mui/material";
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Google as GoogleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import useProgress, { type BadgeType } from "./useProgress";
import { useSetup } from "./setUpConnect";
import FullscreenDialog from "@/pages/dash_board_v1/FullscreenDialog";


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
    handleGoogleAuth,
    handleSendVerification,
    handleVerifyCode,
  } = useSetup();

  const handleGoogleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await handleGoogleAuth();
      onClose();
    },
    [handleGoogleAuth, onClose],
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
  const handleCalendarClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.location.href = "/calendar";
      onClose();
    },
    [onClose],
  );

  return (
    <Box
      sx={{ mt: 2, p: 2, borderRadius: 2 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Typography variant="body2" sx={{ mb: 2 }}>
        Set up your availability schedule for optimal appointment booking.
      </Typography>
      <Button
        variant="contained"
        fullWidth
        startIcon={<CalendarIcon />}
        onClick={handleCalendarClick}
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
      {/* Green checkmark for completed items */}
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
          pl: badge.unlocked ? 2.5 : 1.5, // Add left padding when completed to make room for checkmark
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

        {/* Expandable setup content */}
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

// Main Achievement Card Component
const AchievementCard: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  const { karmaScore, badges, recentAchievements } = useProgress();

  const { emailCompleted, availabilityCompleted } = useSetup();

  // Create setup badges
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

  // Calculate current level and reward tier
  const currentLevel = levels.reduce((prev, level) =>
    karmaScore >= level.threshold ? level : prev,
  );

  const nextLevel = levels.find((level) => level.threshold > karmaScore);
  const rewardTier = getRewardTier(karmaScore);

  const handleVideoClick = (badge: BadgeType) => {
    setSelectedBadge(badge);
    setVideoDialogOpen(true);
  };

  const renderBadgeIcon = (badge: BadgeType) => (
    <Avatar
      sx={{
        width: 32,
        height: 32,
        fontSize: "1rem",
        backgroundColor: badge.unlocked ? "transparent" : "grey.200",
        filter: badge.unlocked ? "none" : "grayscale(100%)",
        opacity: badge.unlocked ? 1 : 0.5,
      }}
    >
      {badge.icon}
    </Avatar>
  );

  return (
    <>
      {/* Compact Achievement Card */}
      <Card
        sx={{
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": { boxShadow: 3 },
        }}
        onClick={() => setDialogOpen(true)}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                fontSize: "1.5rem",
                backgroundColor: "transparent",
                mr: 2,
              }}
            >
              {currentLevel.icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {currentLevel.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Karma: {karmaScore.toFixed(1)} • {allUnlockedBadges.length}{" "}
                badges
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Chip
                label={`${rewardTier.icon} ${rewardTier.level}`}
                size="small"
                sx={{
                  backgroundColor: currentLevel.color + "20",
                  color: currentLevel.color,
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              />
              <Typography
                variant="caption"
                color="success.main"
                sx={{ display: "block", fontWeight: "bold" }}
              >
                +{(rewardTier.percentage * 100).toFixed(0)}% ODOC
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Setup:
            </Typography>
            {createSetupBadges().map((badge) => (
              <Tooltip key={badge.id} title={badge.title}>
                {renderBadgeIcon(badge)}
              </Tooltip>
            ))}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Recent:
            </Typography>
            {recentAchievements.slice(0, 3).map((badge) => (
              <Tooltip key={badge.id} title={badge.title}>
                {renderBadgeIcon(badge)}
              </Tooltip>
            ))}
            {badges.length > 3 && (
              <Typography variant="body2" color="text.secondary">
                +{badges.length - 3} more
              </Typography>
            )}
          </Box>

          {nextLevel && (
            <Box sx={{ mt: 2 }}>
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
        </CardContent>
      </Card>

      {/* Detailed Achievement Fullscreen Dialog */}
      <FullscreenDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Your Achievements"
        showTitle={true}
      >
        <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
          {/* Current Status Overview */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              background: `linear-gradient(135deg, ${currentLevel.color}20, ${currentLevel.color}10)`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 56, height: 56, fontSize: "1.8rem" }}>
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
            
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color={currentLevel.color}
                  >
                    {karmaScore.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Karma Score
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h3" fontWeight="bold">
                    {allUnlockedBadges.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Badges Earned
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color="success.main"
                  >
                    +{(rewardTier.percentage * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ODOC Rewards
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{ fontSize: "2rem" }}
                  >
                    {rewardTier.icon}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rewardTier.level} Tier
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* All Badges without categories */}
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
        </Box>
      </FullscreenDialog>

      {/* Video Tutorial Fullscreen Dialog */}
      <FullscreenDialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        title={`${selectedBadge?.title} - Tutorial`}
        showTitle={true}
      >
        <Box sx={{ p: 3, height: "100%" }}>
          {selectedBadge?.videoUrl && (
            <Box
              sx={{ 
                position: "relative", 
                paddingBottom: "56.25%", 
                height: 0,
                mb: 2
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
          )}
          <Typography variant="body2" color="text.secondary">
            {selectedBadge?.description}
          </Typography>
        </Box>
      </FullscreenDialog>
    </>
  );
};

export default AchievementCard;