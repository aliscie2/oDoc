import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Badge as MuiBadge,
  Fade,
  Zoom
} from '@mui/material';
import {
  Close as CloseIcon,
  Lock as LockIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';

const App = () => {
  const [unlockedBadges, setUnlockedBadges] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentBadge, setCurrentBadge] = useState(null);

  const badges = [
    {
      id: 1,
      title: "First Click",
      description: "Congrats for your first click! 🎉",
      icon: "🐣",
      color: "#ff6b6b",
      gradient: "linear-gradient(135deg, #ff6b6b, #ff5252)"
    },
    {
      id: 2,
      title: "First Friend",
      description: "Second click - You got your first friend! 👥",
      icon: "🐤",
      color: "#4ecdc4",
      gradient: "linear-gradient(135deg, #4ecdc4, #26c6da)"
    },
    {
      id: 3,
      title: "First Post",
      description: "First post on discover! 📱",
      icon: "🐓",
      color: "#45b7d1",
      gradient: "linear-gradient(135deg, #45b7d1, #42a5f5)"
    },
    {
      id: 4,
      title: "Premium User",
      description: "First payment processed! 💳",
      icon: "🎊",
      color: "#96ceb4",
      gradient: "linear-gradient(135deg, #96ceb4, #81c784)"
    },
    {
      id: 5,
      title: "Rising Star",
      description: "Karma level up! ⭐ (2.5/5)",
      icon: "🌟",
      color: "#ffeaa7",
      gradient: "linear-gradient(135deg, #ffeaa7, #ffcc02)",
      karma: 2.5,
      trend: "up"
    },
    {
      id: 6,
      title: "Karma Boost",
      description: "Karma boost! 🚀 (3/5)",
      icon: "✨",
      color: "#dda0dd",
      gradient: "linear-gradient(135deg, #dda0dd, #ba68c8)",
      karma: 3,
      trend: "up"
    },
    {
      id: 7,
      title: "Resilient",
      description: "Oh no! Karma dip 😔 (2.5/5) - stay positive!",
      icon: "💔",
      color: "#fab1a0",
      gradient: "linear-gradient(135deg, #fab1a0, #ff8a65)",
      karma: 2.5,
      trend: "down"
    }
  ];

  const handleUnlockBadge = () => {
    if (unlockedBadges < badges.length) {
      const newBadge = badges[unlockedBadges];
      setCurrentBadge(newBadge);
      setShowCelebration(true);
      setUnlockedBadges(unlockedBadges + 1);
    }
  };

  const openDialog = () => {
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setCurrentBadge(null);
  };

  const progress = (unlockedBadges / badges.length) * 100;

  const BadgeCard = ({ badge, isUnlocked, index }) => {
    const isLocked = !isUnlocked;
    
    return (
      <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
        <Card
          sx={{
            height: 200,
            position: 'relative',
            background: isUnlocked 
              ? badge.gradient
              : 'linear-gradient(135deg, #757575, #616161)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: isUnlocked ? 'scale(1.05)' : 'none',
              boxShadow: isUnlocked ? '0 8px 25px rgba(0,0,0,0.3)' : 'none'
            },
            opacity: isLocked ? 0.6 : 1,
            overflow: 'hidden'
          }}
        >
          {/* Badge Ribbon */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 30,
              height: 20,
              background: isUnlocked ? '#ffd700' : '#9e9e9e',
              borderRadius: '0 0 15px 15px',
              zIndex: 2
            }}
          />
          
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Badge Number */}
            <MuiBadge
              badgeContent={badge.id}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  background: isUnlocked ? '#ffd700' : '#757575',
                  color: '#000',
                  fontWeight: 'bold'
                }
              }}
            >
              {/* Badge Icon */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  mb: 2,
                  position: 'relative',
                  filter: isLocked ? 'grayscale(100%)' : 'none'
                }}
              >
                {isLocked ? <LockIcon sx={{ color: '#757575', fontSize: '2rem' }} /> : badge.icon}
              </Box>
            </MuiBadge>

            {/* Badge Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {isLocked ? '???' : badge.title}
            </Typography>

            {/* Karma Indicator */}
            {badge.karma && isUnlocked && (
              <Chip
                icon={badge.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${badge.karma}/5`}
                size="small"
                sx={{
                  background: badge.trend === 'up' 
                    ? 'rgba(76, 175, 80, 0.9)'
                    : 'rgba(255, 152, 0, 0.9)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </CardContent>
        </Card>
      </Zoom>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
      }}
    >
      {/* Main Button */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          margin: '1rem'
        }}
      >
        <TrophyIcon
          sx={{
            fontSize: '4rem',
            color: '#ffd700',
            mb: 2,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}
        />
        
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            mb: 3,
            fontWeight: 300,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
        >
          Achievement System
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleUnlockBadge}
            disabled={unlockedBadges >= badges.length}
            sx={{
              background: unlockedBadges >= badges.length
                ? 'rgba(255, 255, 255, 0.1)'
                : 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              border: 0,
              borderRadius: '16px',
              boxShadow: unlockedBadges < badges.length
                ? '0 6px 20px rgba(0,0,0,0.2)'
                : 'none',
              color: 'white',
              height: 56,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: unlockedBadges < badges.length ? 'translateY(-2px)' : 'none',
                boxShadow: unlockedBadges < badges.length
                  ? '0 8px 25px rgba(0,0,0,0.3)'
                  : 'none',
              },
              '&:disabled': {
                color: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            {unlockedBadges >= badges.length ? '🎉 Complete!' : `🔓 Unlock Badge`}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={openDialog}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '16px',
              height: 56,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            🏆 View Badges
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1rem'
          }}
        >
          {unlockedBadges} / {badges.length} Badges Unlocked
        </Typography>
      </Box>

      {/* Badge Collection Dialog */}
      <Dialog
        open={showDialog}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            color: 'white',
            minHeight: '80vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            pb: 1
          }}
        >
          🏆 Achievement Badges
        </DialogTitle>

        <IconButton
          onClick={closeDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: 'white',
              background: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ p: 3 }}>
          {/* Progress Section */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{ color: 'white', mb: 2 }}
            >
              Progress: {Math.round(progress)}% Complete
            </Typography>
            
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1)',
                }
              }}
            />
            
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}
            >
              {badges.length - unlockedBadges} badges remaining
            </Typography>
          </Box>

          {/* Badge Grid */}
          <Grid container spacing={3}>
            {badges.map((badge, index) => (
              <Grid item xs={12} sm={6} md={4} key={badge.id}>
                <BadgeCard
                  badge={badge}
                  isUnlocked={index < unlockedBadges}
                  index={index}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Celebration Modal */}
      <Dialog
        open={showCelebration}
        onClose={closeCelebration}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            color: 'white',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <IconButton
            onClick={closeCelebration}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Animated Badge */}
          {currentBadge && (
            <Fade in={showCelebration}>
              <Box>
                <Box
                  sx={{
                    fontSize: '5rem',
                    mb: 3,
                    animation: 'bounce 2s infinite',
                    '@keyframes bounce': {
                      '0%, 20%, 50%, 80%, 100%': {
                        transform: 'translateY(0)',
                      },
                      '40%': {
                        transform: 'translateY(-20px)',
                      },
                      '60%': {
                        transform: 'translateY(-10px)',
                      },
                    }
                  }}
                >
                  {currentBadge.icon}
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    mb: 2,
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  🎉 Badge Unlocked!
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: 400,
                    color: '#ffd700'
                  }}
                >
                  {currentBadge.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6
                  }}
                >
                  {currentBadge.description}
                </Typography>

                {currentBadge.karma && (
                  <Box sx={{ mb: 3 }}>
                    <Chip
                      icon={currentBadge.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={`Karma: ${currentBadge.karma}/5`}
                      sx={{
                        background: currentBadge.trend === 'up'
                          ? 'linear-gradient(45deg, #4caf50, #8bc34a)'
                          : 'linear-gradient(45deg, #ff9800, #ff5722)',
                        color: 'white',
                        fontWeight: 500,
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                  </Box>
                )}

                <Button
                  onClick={closeCelebration}
                  variant="contained"
                  sx={{
                    mt: 3,
                    background: currentBadge.gradient,
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  {unlockedBadges >= badges.length ? '🎊 Journey Complete!' : '➡️ Continue'}
                </Button>
              </Box>
            </Fade>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default App;