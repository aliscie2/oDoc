import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grow,
  Typography,
  useTheme,
  styled
} from '@mui/material';
import snsimage from '@/assets/infograph/SNS.png';
import analyticsImage from '@/assets/infograph/analytics.png';
import autoReleaseImage from '@/assets/infograph/autoRlease.png';
import jobMatcherImage from '@/assets/infograph/jobMatcher.png';
import karmaImage from '@/assets/infograph/karma.png';
import identityImage from '@/assets/infograph/identityVerfication.png';
import odocIcon from '@/assets/infograph/odocIcon.png';

interface Element {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  angle: number;
  color: string;
  glowColor: string;
}

const AnimatedBox = styled(Box)({
  transition: 'all 0.4s ease',
  '&:hover': {
    transform: 'scale(1.3)',
    zIndex: 100
  }
});

const ODOCInfographic: React.FC = () => {
  const theme = useTheme();
  const [hoveredElement, setHoveredElement] = useState<number | null>(null);
  const [pulseActive, setPulseActive] = useState(false);
  const [coreActive, setCoreActive] = useState(false);

  const elements: Element[] = [
    {
      id: 1,
      title: "AI Job Matcher",
      description: "Match-based system finds opportunities instantly, or get alerted later.",
      icon: <img src={jobMatcherImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.8))' }} />,
      angle: 228,
      color: "from-blue-500 to-cyan-400",
      glowColor: "rgba(0, 212, 255, 0.8)"
    },
    {
      id: 2,
      title: "AI Auto-Release",
      description: "Conditions met? Payment flows automatically",
      icon: <img src={autoReleaseImage} width="60px" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 149, 0, 0.8))' }} />,
      angle: 40.5,
      color: "from-yellow-500 to-orange-400",
      glowColor: "rgba(255, 149, 0, 0.8)"
    },
    {
      id: 3,
      title: "AI Analytics",
      description: "Data-driven suggestions for team and tasks",
      icon: <img src={analyticsImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.8))' }} />,
      angle: 143,
      color: "from-green-500 to-emerald-400",
      glowColor: "rgba(0, 255, 136, 0.8)"
    },
    {
      id: 4,
      title: "Trust/Karma Score",
      description: "Transparent behavior builds or breaks your score",
      icon: <img src={karmaImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(184, 76, 255, 0.8))' }} />,
      angle: 312,
      color: "from-purple-500 to-violet-400",
      glowColor: "rgba(184, 76, 255, 0.8)"
    },
    {
      id: 5,
      title: "SNS DAO",
      description: "Decentralized governance layer for collaboration",
      icon: <img src={snsimage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 76, 139, 0.8))' }} />,
      angle: 0,
      color: "from-pink-500 to-rose-400",
      glowColor: "rgba(255, 76, 139, 0.8)"
    },
    {
      id: 6,
      title: "Origyn Identity Verification",
      description: "Authenticate users using on-chain identity tech",
      icon: <img src={identityImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(76, 154, 255, 0.8))' }} />,
      
      angle: 180,
      color: "from-indigo-500 to-blue-400",
      glowColor: "rgba(76, 154, 255, 0.8)"
    }
  ];

  useEffect(() => {
    const coreInterval = setInterval(() => {
      setCoreActive(prev => !prev);
    }, 2000);

    const pulseInterval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 1500);

    return () => {
      clearInterval(coreInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const getElementPosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  // Calculate adjusted position to prevent overflow
  const getAdjustedCardPosition = (angle: number, radius: number) => {
    const basePosition = getElementPosition(angle, radius);
    const cardWidth = 280;
    const cardHeight = 200;
    const padding = 20;
    
    // Get viewport dimensions (assuming container is full viewport)
    const viewportWidth = window.innerWidth || 1536;
    const viewportHeight = window.innerHeight || 1536;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    
    // Calculate actual position relative to viewport
    let actualX = centerX + basePosition.x;
    let actualY = centerY + basePosition.y;
    
    // Adjust X position if card would overflow
    if (actualX + cardWidth/2 + padding > viewportWidth) {
      actualX = viewportWidth - cardWidth/2 - padding;
    } else if (actualX - cardWidth/2 - padding < 0) {
      actualX = cardWidth/2 + padding;
    }
    
    // Adjust Y position if card would overflow
    if (actualY + cardHeight/2 + padding > viewportHeight) {
      actualY = viewportHeight - cardHeight/2 - padding;
    } else if (actualY - cardHeight/2 - padding < 0) {
      actualY = cardHeight/2 + padding;
    }
    
    // Convert back to relative position
    return {
      x: actualX - centerX,
      y: actualY - centerY
    };
  };

  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      overflow: 'hidden',
      background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 50%, #0a0a23 100%)',
      position: 'relative'
    }}>
      {/* Sci-Fi Background Effects */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        opacity: 0.3,
        background: 'radial-gradient(circle at 30% 70%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 0, 255, 0.1) 0%, transparent 50%)',
      }} />
      
      {/* Animated Grid */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        opacity: 0.15,
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        animation: 'gridPulse 4s ease-in-out infinite'
      }} />

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Box key={i} sx={{
          position: 'absolute',
          width: '2px',
          height: '2px',
          bgcolor: i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ffff00',
          borderRadius: '50%',
          left: `${10 + (i * 80) % 90}%`,
          top: `${5 + (i * 60) % 90}%`,
          opacity: 0.6,
          animation: `float ${2 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`
        }} />
      ))}

      <Box sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '1536px',
        height: '100%',
        maxHeight: '1536px'
      }}>
        {/* Central Core - Enhanced */}
        <Box sx={{
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 10,
  cursor: 'pointer'
}}
onMouseEnter={() => setCoreActive(true)}
onMouseLeave={() => setCoreActive(false)}>
     
           

          {/* Core Container */}
          <Box sx={{
  }}>
             <img 
      src={odocIcon} 
      alt="ODOC Logo" 
      style={{ 
        width: '200px',
        filter: `drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) ${coreActive ? 'brightness(1.2)' : 'brightness(1)'}`,
        transition: 'all 0.3s ease'
      }} 
    />
          </Box>

        
        </Box>

        {/* Connection Lines and Orbital Elements */}
        {elements.map((element) => {
          const position = getElementPosition(element.angle, 300);
          const adjustedPosition = getAdjustedCardPosition(element.angle, 300);
          const isHovered = hoveredElement === element.id;
          
          return (
            <React.Fragment key={element.id}>
              {/* Enhanced Energy Pipes with hover area */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transformOrigin: 'left center',
                  height: '16px',
                  width: '300px',
                  transform: `rotate(${element.angle}deg)`,
                  overflow: 'hidden',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #1a1a1a, #2a2a2a, #1a1a1a)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isHovered ? `0 0 20px ${element.glowColor}` : 'none',
                  cursor: 'pointer',
                  zIndex: 5,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '2px',
                    left: 0,
                    right: 0,
                    bottom: '2px',
                    background: `linear-gradient(90deg, transparent, ${element.glowColor}, ${element.glowColor}, transparent)`,
                    borderRadius: '6px',
                    animation: 'energyFlow 2.5s ease-in-out infinite',
                    animationDelay: `${element.id * 0.4}s`,
                    opacity: isHovered ? 1 : 0.6,
                    filter: 'blur(1px)'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '6px',
                    left: 0,
                    right: 0,
                    bottom: '6px',
                    background: `linear-gradient(90deg, transparent, white, transparent)`,
                    borderRadius: '2px',
                    animation: 'coreFlow 1.8s linear infinite',
                    animationDelay: `${element.id * 0.3}s`,
                    opacity: isHovered ? 0.8 : 0.4
                  }
                }}
                onMouseEnter={() => setHoveredElement(element.id)}
                onMouseLeave={() => setHoveredElement(null)}
              />

              {/* Smoke Effects */}
              {isHovered && (
                <>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Box key={i} sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '3px',
                      height: '3px',
                      borderRadius: '50%',
                      bgcolor: element.glowColor.replace('0.8', '0.6'),
                      transform: `rotate(${element.angle}deg) translateX(${120 + i * 20}px) rotate(-${element.angle}deg) translateY(${Math.sin(Date.now() * 0.01 + i) * 8}px)`,
                      animation: `smoke ${1.5 + i * 0.1}s ease-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                      filter: 'blur(1px)'
                    }} />
                  ))}
                </>
              )}
              
              {/* Enhanced Orbital Elements */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${isHovered ? adjustedPosition.x : position.x}px, ${isHovered ? adjustedPosition.y : position.y}px)`,
                transition: 'transform 0.4s ease',
                zIndex: isHovered ? 200 : 20
              }}>
                <Grow in={true} timeout={800}>
                  <AnimatedBox 
                    onMouseEnter={() => setHoveredElement(element.id)}
                    onMouseLeave={() => setHoveredElement(null)}
                    sx={{
                      transform: isHovered ? 'scale(1)' : 'scale(1)', // Override the default hover transform
                      '&:hover': {
                        transform: 'scale(1)', // Prevent additional scaling
                        zIndex: 200
                      }
                    }}
                  >
                    {/* Element Glow */}
                    <Box sx={{
                      position: 'absolute',
                      inset: '-20px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${element.glowColor} 0%, transparent 70%)`,
                      opacity: isHovered ? 0.8 : 0.3,
                      filter: 'blur(15px)',
                      transition: 'all 0.4s ease',
                      transform: isHovered ? 'scale(1.5)' : 'scale(1)'
                    }} />

                    {/* Show only icon when not hovered */}
                    {!isHovered ? (
                      <Box sx={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.9) 100%)',
                        border: `2px solid ${element.glowColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.4s ease',
                        cursor: 'pointer',
                        boxShadow: `0 0 20px ${element.glowColor}`
                      }}>
                        {element.icon}
                      </Box>
                    ) : (
                      /* Show expanded card when hovered */
                      <Card sx={{
                        width: '280px',
                        height: '200px',  
                        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(45, 45, 45, 0.9))',
                        borderRadius: '16px',
                        border: `2px solid ${element.glowColor}`,
                        boxShadow: `0 0 40px ${element.glowColor}, inset 0 0 20px rgba(255, 255, 255, 0.1)`,
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.4s ease',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        {/* Card Glow Effect */}
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: `linear-gradient(90deg, transparent, ${element.glowColor}, transparent)`,
                          animation: 'shimmer 2s ease-in-out infinite'
                        }} />
                        
                        <CardContent sx={{ 
                          textAlign: 'center', 
                          p: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <Box sx={{
                            width: '70px',
                            height: '70px',
                            mx: 'auto',
                            mb: 2,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${element.glowColor}20, transparent)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${element.glowColor}`,
                            animation: 'iconPulse 2s ease-in-out infinite'
                          }}>
                            {element.icon}
                          </Box>
                          <Typography variant="h6" sx={{ 
                            color: element.glowColor,
                            fontWeight: 'bold',
                            mb: 1,
                            textShadow: `0 0 10px ${element.glowColor}`
                          }}>
                            {element.title}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.9rem',
                            lineHeight: 1.4
                          }}>
                            {element.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </AnimatedBox>
                </Grow>
              </Box>
            </React.Fragment>
          );
        })}
      </Box>

      {/* Keyframe Animations */}
      <style>{`
      @keyframes simplePulse {
      0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }


        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes corePulse {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(0, 255, 255, 0.8)) brightness(1); }
          50% { filter: drop-shadow(0 0 20px rgba(0, 255, 255, 1)) brightness(1.4); }
        }
        
        @keyframes energyPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes energyFlow {
          0% { transform: translateX(-100%) scaleX(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateX(0%) scaleX(1); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100%) scaleX(0); opacity: 0; }
        }
        
        @keyframes coreFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        @keyframes smoke {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-40px) scale(0); opacity: 0; }
        }
        
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes gridPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </Box>
  );
};

export default ODOCInfographic;