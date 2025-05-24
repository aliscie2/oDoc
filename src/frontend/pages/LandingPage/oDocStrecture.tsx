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
}

const AnimatedBox = styled(Box)({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.2)'
  }
});

const ODOCInfographic: React.FC = () => {
  const theme = useTheme();
  const [hoveredElement, setHoveredElement] = useState<number | null>(null);
  const [pulseActive, setPulseActive] = useState(false);

  const elements: Element[] = [
    {
      id: 1,
      title: "AI Job Matcher",
      description: "Voice-based system finds opportunities instantly",
      icon: <img src={jobMatcherImage} width="60px" />,
      angle: 0,
      color: "from-blue-500 to-cyan-400"
    },
    {
      id: 2,
      title: "AI Auto-Release",
      description: "Conditions met? Payment flows automatically",
      icon: <img src={autoReleaseImage} width="80px" />,
      angle: 60,
      color: "from-yellow-500 to-orange-400"
    },
    {
      id: 3,
      title: "AI Analytics",
      description: "Data-driven suggestions for team and tasks",
      icon: <img src={analyticsImage} width="60px" />,
      angle: 120,
      color: "from-green-500 to-emerald-400"
    },
    {
      id: 4,
      title: "Trust/Karma Score",
      description: "Transparent behavior builds or breaks your score",
      icon: <img src={karmaImage} width="60px" />,
      angle: 180,
      color: "from-purple-500 to-violet-400"
    },
    {
      id: 5,
      title: "SNS DAO",
      description: "Decentralized governance layer for collaboration",
      icon: <img src={snsimage} width="60px" />,
      angle: 240,
      color: "from-pink-500 to-rose-400"
    },
    {
      id: 6,
      title: "Origyn Identity Verification",
      description: "Authenticate users using on-chain identity tech",
      icon: <img src={identityImage} width="60px" />,
      angle: 300,
      color: "from-indigo-500 to-blue-400"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getElementPosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
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
      overflow: 'hidden'
    }}>
      <Box sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '1536px',
        height: '100%',
        maxHeight: '1536px'
      }}>
        {/* Background Grid */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Central Core */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          '&:hover': {
            transform: 'translate(-50%, -50%) scale(1.1)',
            '& img': {
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))',
              animation: 'pulse 1.5s infinite'
            }
          },
          transition: 'all 0.3s ease'
        }}>
          <img 
            src={odocIcon} 
            alt="oDoc Logo" 
            style={{ 
              width: '160px', 
              height: '160px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }} 
            onClick={() => setPulseActive(!pulseActive)}
          />
          <style>{
            `@keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }`
          }</style>
        </Box>

        {/* Connection Lines and Orbital Elements */}
        {elements.map((element) => {
          const position = getElementPosition(element.angle, 280);
          const isHovered = hoveredElement === element.id;
          
          return (
            <React.Fragment key={element.id}>
              {/* Connection Line with Plumbing Animation */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transformOrigin: 'left',
                  height: 12,
                  width: '280px',
                  transform: `rotate(${element.angle}deg)`,
                  overflow: 'hidden',
                  borderRadius: 6,
                  background: '#64748b',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                    animation: 'flow 2s linear infinite',
                    animationDelay: `${element.id * 0.2}s`,
                    opacity: isHovered ? 0.8 : 0.4
                  }
                }}
              />

              {/* Add this to your styles */}
              <style>{
                `@keyframes flow {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }`
              }</style>
              {/* Animated particles */}
              {isHovered && (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 8,
                    height: 8,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    animation: 'ping 1s ease-in-out infinite',
                    transform: `translate(-50%, -50%) rotate(${element.angle}deg) translateX(140px) rotate(-${element.angle}deg)`
                  }}
                />
              )}
              
              {/* Orbital Element */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`
                }}
              >
                <Grow in={true} timeout={500}>
                  <AnimatedBox 
                    onMouseEnter={() => setHoveredElement(element.id)}
                    onMouseLeave={() => setHoveredElement(null)}
                    sx={{
                      transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                    }}
                  >
                    <Card 
                      sx={{
                        width: isHovered ? 200 : 128,
                        height: isHovered ? 200 : 128,
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
                        borderRadius: 4,
                        boxShadow: isHovered ? 24 : 6
                      }}
                    >
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        p: isHovered ? 3 : 2 
                      }}>
                        <Box 
                          sx={{
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 2,
                            borderRadius: 3,
                            background: `linear-gradient(to right, ${
                              element.color?.split(' ')[0]?.replace('from-', '') || '#3b82f6'
                            }, ${
                              element.color?.split(' ')[2]?.replace('to-', '') || '#60a5fa'
                            })`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                          }}
                        >
                          {element.icon}
                        </Box>
                        <Typography variant="h6" color="white" gutterBottom>
                          {element.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {element.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </AnimatedBox>
                </Grow>
              </Box>
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

export default ODOCInfographic;