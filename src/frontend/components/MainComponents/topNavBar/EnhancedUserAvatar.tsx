import React, { useEffect, useState } from 'react';
import { styled, keyframes } from '@mui/material/styles';
import { Box, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import { Person } from '@mui/icons-material';
import ODOCTokenImage from "@/assets/ODOCTOKEN.png";

const appear = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const growCircle = keyframes`
  0% { clip-path: polygon(50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%); }
  100% { clip-path: var(--final-clip-path); }
`;

const TrustCircle = styled(Box)(({ score }) => {
  const finalClipPath = score === 5 ? 'circle(50%)' : 
                        score >= 4 ? 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 0)' :
                        score >= 3 ? 'polygon(50% 0%, 100% 0%, 100% 75%, 50% 75%, 50% 0)' :
                        score >= 2 ? 'polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%, 50% 0)' :
                                    'polygon(50% 0%, 100% 0%, 100% 25%, 50% 25%, 50% 0)';
  
  return {
    position: 'relative',
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '--final-clip-path': finalClipPath,
    
    '&:hover': { transform: 'scale(1.05)' },
    
    '&::before': {
      content: '""',
      position: 'absolute',
      width: 'calc(100% + 6px)',
      height: 'calc(100% + 6px)',
      borderRadius: '50%',
      border: `2px solid ${getTrustColor(score)}`,
      boxShadow: `0 0 8px ${getTrustColor(score)}`,
      animation: `${appear} 1s ease, ${growCircle} 1.2s ease forwards`,
      clipPath: 'var(--final-clip-path)',
    },
  };
});

const Avatar = styled(Box)({
  width: 26,
  height: 26,
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const AvatarImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const FallbackAvatar = styled(Box)(({ score }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${getTrustColor(score)}20, ${getTrustColor(score)}40)`,
  color: getTrustColor(score),
  fontSize: '0.75rem',
  fontWeight: 'bold',
}));

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(15, 15, 25, 0.98)',
    color: '#ffffff',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: '20px',
    maxWidth: 280,
    fontSize: '0.9rem',
    backdropFilter: 'blur(20px)',
    background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.98) 0%, rgba(25, 25, 40, 0.95) 100%)',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(15, 15, 25, 0.98)',
  },
}));

const getTrustColor = (score: number) => {
  if (score >= 4.5) return '#4CAF50';
  if (score >= 4) return '#8BC34A';
  if (score >= 3.5) return '#FFC107';
  if (score >= 3) return '#FF9800';
  return '#F44336';
};

const getRewardTier = (score: number) => {
  if (score >= 4.5) return { percentage: 0.2, level: 'Platinum', icon: '💎', emoji: '👑' };
  if (score >= 4) return { percentage: 0.15, level: 'Gold', icon: '🏆', emoji: '⭐' };
  if (score >= 3.5) return { percentage: 0.1, level: 'Silver', icon: '🥈', emoji: '🌟' };
  if (score >= 3) return { percentage: 0.05, level: 'Bronze', icon: '🥉', emoji: '⚡' };
  return { percentage: 0, level: 'Starter', icon: '🌱', emoji: '🎯' };
};

const generateInitials = (email = '', name = '') => {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (email) {
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : email[0].toUpperCase();
  }
  return 'U';
};

interface EnhancedUserAvatarProps {
  actions_rate: number;
  photo?: string;
  email?: string;
  name?: string;
  style?: React.CSSProperties;
}

const EnhancedUserAvatar: React.FC<EnhancedUserAvatarProps> = ({
  actions_rate,
  photo,
  email,
  name,
  style,
}) => {
  const [imgError, setImgError] = useState(!photo);
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(actions_rate), 300);
    return () => clearTimeout(timer);
  }, [actions_rate]);
  
  useEffect(() => {
    setImgError(!photo);
  }, [photo]);
  
  const { percentage, level, icon, emoji } = getRewardTier(actions_rate);
  const initials = generateInitials(email, name);
  
  const levels = [
    { threshold: 0, color: '#F44336', label: 'Starter', icon: '🌱' },
    { threshold: 2, color: '#FF5722', label: 'Beginner', icon: '🔥' },
    { threshold: 3, color: '#FFC107', label: 'Bronze', icon: '🥉' },
    { threshold: 3.5, color: '#8BC34A', label: 'Silver', icon: '🥈' },
    { threshold: 4, color: '#4CAF50', label: 'Gold', icon: '🏆' },
    { threshold: 4.5, color: '#2E7D32', label: 'Platinum', icon: '💎' }
  ];

  const getCurrentLevelIndex = (score) => {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (score >= levels[i].threshold) return i;
    }
    return 0;
  };

  const currentLevelIndex = getCurrentLevelIndex(actions_rate);

  const tooltipContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'center' }}>
      {/* Header with level icon */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ fontSize: '2rem' }}>{icon}</Box>
        <Box sx={{ 
          fontSize: '1.1rem',
          fontWeight: 'bold',
          background: `linear-gradient(45deg, ${getTrustColor(actions_rate)}, ${getTrustColor(actions_rate)}80)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {level} TIER
        </Box>
      </Box>
      
      {/* Karma Score */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 1,
        padding: '8px 16px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: `1px solid ${getTrustColor(actions_rate)}40`
      }}>
        <span style={{ opacity: 0.8 }}>Karma Score</span>
        <Box sx={{ 
          fontWeight: 'bold', 
          fontSize: '1.1rem',
          color: getTrustColor(actions_rate)
        }}>
          {actions_rate.toFixed(1)}
        </Box>
      </Box>

      {/* Level Progress Chart */}
      <Box sx={{ 
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Box sx={{ fontSize: '0.8rem', opacity: 0.8, mb: 1 }}>Progress</Box>
        <Box sx={{ display: 'flex', gap: '2px', height: '20px', mb: 1 }}>
          {levels.map((lvl, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                backgroundColor: index <= currentLevelIndex ? lvl.color : 'rgba(255,255,255,0.1)',
                opacity: index <= currentLevelIndex ? 1 : 0.3,
                borderRadius: '2px',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 1,
                  transform: 'scaleY(1.2)'
                }
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', opacity: 0.6 }}>
          <span>0</span>
          <span>2</span>
          <span>3</span>
          <span>3.5</span>
          <span>4</span>
          <span>4.5+</span>
        </Box>
      </Box>
      
      {/* Rewards */}
      <Box sx={{ 
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {percentage > 0 ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1,
            color: '#4CAF50', 
            fontWeight: '600'
          }}>
            <span>{emoji}</span>
            <span>+{percentage}% ODOC Rewards</span>
          </Box>
        ) : (
          <Box sx={{ opacity: 0.7, fontSize: '0.85rem' }}>
            🎯 Reach 3.0 to unlock rewards
          </Box>
        )}
      </Box>
      
      {/* Progress hint */}
      <Box sx={{ 
        fontSize: '0.75rem', 
        opacity: 0.6,
        fontStyle: 'italic'
      }}>
        Level up with more transactions
      </Box>
    </Box>
  );
  
  return (
    <StyledTooltip title={tooltipContent} arrow placement="bottom">
      <TrustCircle score={animatedScore} style={style}>
        <Avatar>
          {!imgError && photo ? (
            <AvatarImage 
              src={photo} 
              alt="Avatar"
              onError={() => setImgError(true)}
            />
          ) : (
            <FallbackAvatar score={actions_rate}>
              {initials !== 'U' ? initials : <Person sx={{ fontSize: 16 }} />}
            </FallbackAvatar>
          )}
        </Avatar>
      </TrustCircle>
    </StyledTooltip>
  );
};

export default EnhancedUserAvatar;