import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Fade,
  Container,
} from "@mui/material";
import {
  TrendingUp,
  Speed,
  Security,
  Hub,
  Code,
  AccountBalance,
  Psychology,
  Public,
} from '@mui/icons-material';
import { motion, useInView } from "framer-motion";
import { useSelector } from "react-redux";
import Link from "@mui/material/Link";
import logo from "../../public/logo.png";
import GetStartedButton from "./getStartedButton";
import { introFeatures, trustIndicators } from './landingPageData';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

export default function Intro() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const { profile, profile_history, wallet, friends } = useSelector(
    (state: any) => state.filesState,
  );
  const { isNavOpen, isDarkMode, isFetching, isLoggedIn, searchTool } =
    useSelector((state: RootState) => state.uiState);

  const ref = React.useRef(null);
  const isInView = useInView(ref, {
    once: false,
    amount: 0.2,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.2,
        rootMargin: '-50px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      x: -20
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  

  return (
    <Box
      ref={sectionRef}
      sx={{
        position: "relative",
        width: "100%",
        minHeight: '100vh',
        overflow: "hidden",
        display: 'flex',
        alignItems: 'center',
        background: 'inherit',
        color: 'inherit',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)
          `,
          zIndex: 0,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s ease-in-out'
        }}
      />

      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 1, 
          py: 6,
          px: 3
        }}
      >
        <MotionBox
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <Grid 
            container 
            spacing={4} 
            alignItems="center" 
            sx={{ 
              minHeight: '80vh'
            }}
          >
            {/* Main Content */}
            <Grid item xs={6}>
              <Fade in={isVisible} timeout={1000}>
                <Box
                  sx={{
                    transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.8s ease-out',
                    textAlign: 'left'
                  }}
                >
                  {/* Logo and Brand */}
                  <MotionBox
                    variants={itemVariants}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: 'flex-start',
                      mb: 3,
                    }}
                  >
                    <motion.img
                      src={logo}
                      alt="ODOC Logo"
                      variants={{
                        hidden: { scale: 0.8, opacity: 0 },
                        visible: {
                          scale: 1,
                          opacity: 1,
                          transition: { duration: 0.5 }
                        }
                      }}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "12px",
                        marginRight: "1rem",
                      }}
                    />
                    <MotionTypography
                      variant="h1"
                      variants={itemVariants}
                      sx={{
                        fontSize: "3.5rem",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      oDoc
                    </MotionTypography>
                  </MotionBox>

                  {/* Main Headline */}
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      fontSize: '2.5rem',
                      lineHeight: 1.2,
                      mb: 2,
                      color: isDarkMode ? '#ffffff' : '#1a1a1a',
                      transform: isVisible ? 'translateX(0)' : 'translateX(-100px)',
                      opacity: isVisible ? 1 : 0,
                      transition: 'all 1s ease-out 0.2s'
                    }}
                  >
                    <Box component="span" sx={{ 
                      fontSize: '1.8rem',
                      display: 'block',
                      mb: 0.5
                    }}>
                      Crypto Agreement Platform{' '}
                    </Box>
                    <Box component="span" sx={{ 
                      color: '#3b82f6',
                      display: 'block',
                      fontSize: '2.2rem'
                    }}>
                      Limitless Collaboration
                    </Box>
                  </Typography>

                  {/* Target Audience */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontWeight: 500,
                      color: '#10b981',
                      opacity: isVisible ? 0.9 : 0,
                      fontSize: '1.1rem',
                      transform: isVisible ? 'translateX(0)' : 'translateX(-80px)',
                      transition: 'all 1s ease-out 0.4s'
                    }}
                  >
                    Built for Freelancers • Crypto Enthusiasts • Global Teams
                  </Typography>
                  
                  {/* Value Proposition */}
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      color: isDarkMode ? '#e5e7eb' : '#4b5563',
                      opacity: isVisible ? 0.9 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                      transition: 'all 1s ease-out 0.6s'
                    }}
                  >
                    Eliminate middlemen, spreadsheets, and task managers. 
                    Streamline contracts, payments, escrow, and collaboration 
                    into one seamless crypto-native platform. Powered by AI & {" "}
                    <Link
                      href="https://internetcomputer.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontWeight: 500,
                        "&:hover": { textDecoration: 'underline' },
                      }}
                    >
                      Internet Computer
                    </Link>
                  </Typography>

                  {/* Features Grid */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {introFeatures.map((feature, index) => (
                      <Grid item xs={4} key={index}>
                        <Box 
                          sx={{ 
                            textAlign: 'center',
                            p: 1.5,
                            transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(40px)',
                            opacity: isVisible ? 1 : 0,
                            transition: `all 0.6s ease-out ${0.8 + index * 0.2}s`
                          }}
                        >
                          <Box sx={{ mb: 1 }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 0.5,
                            color: isDarkMode ? '#ffffff' : '#1a1a1a',
                            fontSize: '0.875rem'
                          }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            opacity: 0.7,
                            color: isDarkMode ? '#d1d5db' : '#6b7280',
                            fontSize: '0.75rem'
                          }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Trust Indicators */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap',
                      gap: 1, 
                      alignItems: 'center', 
                      justifyContent: 'flex-start',
                      mb: 3,
                      '& > *': {
                        transform: isVisible ? 'scale(1)' : 'scale(0)',
                        opacity: isVisible ? 1 : 0,
                        transition: 'all 0.5s ease-out 1.6s',
                      }
                    }}
                  >
                    {trustIndicators.map((indicator, index) => {
                      const ChipContent = (
                        <Chip
                          key={index}
                          icon={indicator.icon}
                          label={indicator.label}
                          size="medium"
                          sx={{ 
                            backgroundColor: indicator.color,
                            color: isDarkMode ? '#ffffff' : '#1a1a1a',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            cursor: indicator.link ? 'pointer' : 'default',
                            fontSize: '0.8rem',
                            height: 32,
                            '& .MuiChip-icon': {
                              color: 'inherit'
                            },
                            '& .MuiChip-label': {
                              px: 1.5
                            },
                            '&:hover': indicator.link ? {
                              backgroundColor: indicator.color.replace('0.1', '0.2'),
                              transform: 'scale(1.05)'
                            } : {}
                          }}
                        />
                      );

                      return indicator.link ? (
                        <Link
                          key={index}
                          href={indicator.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textDecoration: 'none' }}
                        >
                          {ChipContent}
                        </Link>
                      ) : (
                        ChipContent
                      );
                    })}
                  </Box>

                  <GetStartedButton key={profile?.id} />
                </Box>
              </Fade>
            </Grid>

            {/* Feature Highlight Cards */}
            <Grid item xs={6}>
              <Box 
                sx={{ 
                  pl: 4,
                  transform: isVisible ? 'translateX(0)' : 'translateX(100px)',
                  opacity: isVisible ? 1 : 0,
                  transition: 'all 1s ease-out 0.5s'
                }}
              >
                {/* Success Stats */}
                <Card
                  sx={{
                    mb: 3,
                    background: isDarkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(0,0,0,0.02)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: 3,
                    transform: isVisible ? 'rotateY(0deg)' : 'rotateY(-15deg)',
                    transformOrigin: 'left center',
                    transition: 'all 0.8s ease-out 0.8s'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} textAlign="center">
                      <Grid item xs={4}>
                        <Typography 
                          variant="h4"
                          sx={{ 
                            fontWeight: 700, 
                            color: '#3b82f6',
                            transform: isVisible ? 'scale(1)' : 'scale(0)',
                            transition: 'all 0.6s ease-out 1.2s',
                            fontSize: '2.125rem'
                          }}
                        >
                          0%
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isDarkMode ? '#d1d5db' : '#6b7280',
                            fontSize: '0.75rem'
                          }}
                        >
                          Commission Fees
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography 
                          variant="h4"
                          sx={{ 
                            fontWeight: 700, 
                            color: '#10b981',
                            transform: isVisible ? 'scale(1)' : 'scale(0)',
                            transition: 'all 0.6s ease-out 1.4s',
                            fontSize: '2.125rem'
                          }}
                        >
                          24/7
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isDarkMode ? '#d1d5db' : '#6b7280',
                            fontSize: '0.75rem'
                          }}
                        >
                          Global Access
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography 
                          variant="h4"
                          sx={{ 
                            fontWeight: 700, 
                            color: '#f59e0b',
                            transform: isVisible ? 'scale(1)' : 'scale(0)',
                            transition: 'all 0.6s ease-out 1.6s',
                            fontSize: '2.125rem'
                          }}
                        >
                          100%
                        </Typography>
                        
                        <Link
                          href="https://github.com/aliscie2/oDoc"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          <Typography
                            variant="caption" 
                            sx={{ 
                              color: isDarkMode ? '#d1d5db' : '#6b7280',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Open Source
                          </Typography>
                        </Link>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Feature Highlight Cards */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Card
                    sx={{
                      background: isDarkMode 
                        ? 'rgba(255,255,255,0.03)' 
                        : 'rgba(0,0,0,0.02)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      borderRadius: 3,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDarkMode 
                          ? '0 8px 25px rgba(0,0,0,0.3)' 
                          : '0 8px 25px rgba(0,0,0,0.1)'
                      },
                      transform: isVisible ? 'translateY(0) rotateX(0deg)' : 'translateY(50px) rotateX(-10deg)',
                      opacity: isVisible ? 1 : 0,
                      transition: 'all 0.8s ease-out 1.2s'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Psychology sx={{ 
                          mr: 2, 
                          color: '#3b82f6', 
                          fontSize: 32
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a',
                          fontSize: '1.25rem'
                        }}>
                          AI-Powered Matching
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ 
                        opacity: 0.8, 
                        lineHeight: 1.6,
                        color: isDarkMode ? '#d1d5db' : '#4b5563',
                        fontSize: '0.875rem'
                      }}>
                        Smart contract templates and automated matching between freelancers and clients based on skills, budget, and project requirements.
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      background: isDarkMode 
                        ? 'rgba(255,255,255,0.03)' 
                        : 'rgba(0,0,0,0.02)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      borderRadius: 3,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDarkMode 
                          ? '0 8px 25px rgba(0,0,0,0.3)' 
                          : '0 8px 25px rgba(0,0,0,0.1)'
                      },
                      transform: isVisible ? 'translateY(0) rotateX(0deg)' : 'translateY(70px) rotateX(-15deg)',
                      opacity: isVisible ? 1 : 0,
                      transition: 'all 0.8s ease-out 1.4s'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Security sx={{ 
                          mr: 2, 
                          color: '#10b981', 
                          fontSize: 32
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a',
                          fontSize: '1.25rem'
                        }}>
                          Secure Crypto Escrow
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ 
                        opacity: 0.8, 
                        lineHeight: 1.6,
                        color: isDarkMode ? '#d1d5db' : '#4b5563',
                        fontSize: '0.875rem'
                      }}>
                        Automated escrow system with milestone-based payments in cryptocurrency. Guarantee your payment before start working. No banks, no borders, no restrictions.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  );
}