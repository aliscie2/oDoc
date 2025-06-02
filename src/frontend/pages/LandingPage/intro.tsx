import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Fade,
  useTheme,
  useMediaQuery,
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

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

export default function Intro() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const { profile, profile_history, wallet, friends } = useSelector(
    (state: any) => state.filesState,
  );
  const { isNavOpen, isDarkMode, isFetching, isLoggedIn, searchTool } =
    useSelector((state: RootState) => state.uiState);

  // Create a ref for the container element
  const ref = React.useRef(null);
  
  // Check if the element is in view
  const isInView = useInView(ref, {
    once: false,
    amount: isMobile ? 0.1 : 0.2,
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
        threshold: isMobile ? 0.1 : 0.2,
        rootMargin: isMobile ? '-30px 0px -30px 0px' : '-50px 0px -50px 0px'
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
  }, [isMobile]);

  // Progressive animation variants based on screen size
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: isMobile ? 0.4 : 0.6,
        staggerChildren: isMobile ? 0.1 : 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 10 : 20,
      x: isMobile ? 0 : -20
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: isMobile ? 0.4 : 0.6,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      icon: <Speed sx={{ color: '#3b82f6', fontSize: isMobile ? 28 : 32 }} />,
      title: "Save Time",
      description: "Streamline contracts, tasks, and payments in one platform"
    },
    {
      icon: <AccountBalance sx={{ color: '#10b981', fontSize: isMobile ? 28 : 32 }} />,
      title: "No Middlemen", 
      description: "Direct crypto payments, zero commissions"
    },
    {
      icon: <Security sx={{ color: '#8b5cf6', fontSize: isMobile ? 28 : 32 }} />,
      title: "Blockchain Security",
      description: "Enterprise-level protection with encryption"
    }
  ];

  const trustIndicators = [
    {
      icon: <TrendingUp sx={{ fontSize: isMobile ? 16 : 18 }} />,
      label: "Crypto-Native",
      color: "rgba(16, 185, 129, 0.1)"
    },
    {
      icon: <Code sx={{ fontSize: isMobile ? 16 : 18 }} />,
      label: "Open Source",
      color: "rgba(59, 130, 246, 0.1)",
      link: "https://github.com/aliscie2/oDoc"
    },
    {
      icon: <Hub sx={{ fontSize: isMobile ? 16 : 18 }} />,
      label: "Decentralized",
      color: "rgba(147, 51, 234, 0.1)"
    },
    {
      icon: <Public sx={{ fontSize: isMobile ? 16 : 18 }} />,
      label: "Global",
      color: "rgba(239, 68, 68, 0.1)"
    }
  ];

  return (
    <Box
      ref={sectionRef}
      sx={{
        position: "relative",
        width: "100%",
        minHeight: { 
          xs: '100vh', 
          sm: '95vh', 
          md: '90vh',
          lg: '100vh' 
        },
        maxHeight: { 
          xs: 'none', 
          md: '100vh' 
        },
        overflow: "hidden",
        display: 'flex',
        alignItems: 'center',
        background: 'inherit',
        color: 'inherit',
        py: { xs: 2, sm: 3, md: 0 }
      }}
    >
      {/* Progressive Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isMobile ? `
            radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
          ` : `
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
          py: { xs: 2, sm: 3, md: 4, lg: 6 },
          px: { xs: 2, sm: 3 }
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
            spacing={{ xs: 3, sm: 4, md: 4 }} 
            alignItems="center" 
            sx={{ 
              minHeight: { xs: 'auto', md: '80vh' },
              flexDirection: { xs: 'column', md: 'row' }
            }}
          >
            {/* Main Content */}
            <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 1 } }}>
              <Fade in={isVisible} timeout={isMobile ? 800 : 1000}>
                <Box
                  sx={{
                    transform: isVisible ? 'translateY(0)' : `translateY(${isMobile ? '30px' : '50px'})`,
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.8s ease-out',
                    textAlign: { xs: 'center', md: 'left' }
                  }}
                >
                  {/* Logo and Brand */}
                  <MotionBox
                    variants={itemVariants}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      mb: { xs: 2, md: 3 },
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
                        width: isMobile ? "50px" : "60px",
                        height: isMobile ? "50px" : "60px",
                        borderRadius: "12px",
                        marginRight: "1rem",
                      }}
                    />
                    <MotionTypography
                      variant="h1"
                      variants={itemVariants}
                      sx={{
                        fontSize: { 
                          xs: "2rem", 
                          sm: "2.5rem", 
                          md: "3rem",
                          lg: "3.5rem" 
                        },
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
                      fontSize: { 
                        xs: '1.5rem', 
                        sm: '1.8rem',
                        md: '2.2rem',
                        lg: '2.5rem' 
                      },
                      lineHeight: 1.2,
                      mb: { xs: 1.5, md: 2 },
                      color: isDarkMode ? '#ffffff' : '#1a1a1a',
                      transform: isVisible ? 'translateX(0)' : `translateX(${isMobile ? '0' : '-100px'})`,
                      opacity: isVisible ? 1 : 0,
                      transition: 'all 1s ease-out 0.2s'
                    }}
                  >
                    <Box component="span" sx={{ 
                      fontSize: { 
                        xs: '1.2rem', 
                        sm: '1.4rem',
                        md: '1.6rem',
                        lg: '1.8rem' 
                      },
                      display: 'block',
                      mb: 0.5
                    }}>
                      Crypto Agreement Platform{' '}
                    </Box>
                    <Box component="span" sx={{ 
                      color: '#3b82f6',
                      display: 'block',
                      fontSize: { 
                        xs: '1.4rem', 
                        sm: '1.6rem',
                        md: '1.8rem',
                        lg: '2.2rem' 
                      }
                    }}>
                      Limitless Collaboration
                    </Box>
                  </Typography>

                  {/* Target Audience */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: { xs: 2, md: 3 },
                      fontWeight: 500,
                      color: '#10b981',
                      opacity: isVisible ? 0.9 : 0,
                      fontSize: { 
                        xs: '0.9rem', 
                        sm: '1rem',
                        md: '1.1rem' 
                      },
                      transform: isVisible ? 'translateX(0)' : `translateX(${isMobile ? '0' : '-80px'})`,
                      transition: 'all 1s ease-out 0.4s'
                    }}
                  >
                    {isMobile ? (
                      <>
                        Freelancers • Crypto Enthusiasts
                        <br />
                        Global Teams
                      </>
                    ) : (
                      'Built for Freelancers • Crypto Enthusiasts • Global Teams'
                    )}
                  </Typography>
                  
                  {/* Value Proposition */}
                  <Typography
                    variant="body1"
                    sx={{
                      mb: { xs: 2, md: 3 },
                      fontSize: { 
                        xs: '0.9rem', 
                        sm: '1rem',
                        md: '1.1rem' 
                      },
                      lineHeight: 1.6,
                      color: isDarkMode ? '#e5e7eb' : '#4b5563',
                      opacity: isVisible ? 0.9 : 0,
                      transform: isVisible ? 'translateY(0)' : `translateY(${isMobile ? '20px' : '30px'})`,
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

                  {/* Features Grid - Progressive Layout */}
                  <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, md: 4 } }}>
                    {features.map((feature, index) => (
                      <Grid item xs={12} sm={4} key={index}>
                        <Box 
                          sx={{ 
                            textAlign: 'center',
                            p: { xs: 1, sm: 1.5 },
                            transform: isVisible ? 'scale(1) translateY(0)' : `scale(0.9) translateY(${isMobile ? '20px' : '40px'})`,
                            opacity: isVisible ? 1 : 0,
                            transition: `all 0.6s ease-out ${0.8 + index * 0.2}s`
                          }}
                        >
                          <Box sx={{ mb: { xs: 0.5, sm: 1 } }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 0.5,
                            color: isDarkMode ? '#ffffff' : '#1a1a1a',
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            opacity: 0.7,
                            color: isDarkMode ? '#d1d5db' : '#6b7280',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            display: { xs: 'none', sm: 'block' }
                          }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Trust Indicators - Progressive Design */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap',
                      gap: { xs: 0.5, sm: 1 }, 
                      alignItems: 'center', 
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      mb: { xs: 3, md: 3 },
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
                          size={isMobile ? "small" : "medium"}
                          sx={{ 
                            backgroundColor: indicator.color,
                            color: isDarkMode ? '#ffffff' : '#1a1a1a',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            cursor: indicator.link ? 'pointer' : 'default',
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            height: { xs: 28, sm: 32 },
                            '& .MuiChip-icon': {
                              color: 'inherit'
                            },
                            '& .MuiChip-label': {
                              px: { xs: 1, sm: 1.5 }
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

            {/* Feature Highlight Cards - Progressive Layout */}
            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 2 } }}>
              <Box 
                sx={{ 
                  pl: { md: 4 },
                  transform: isVisible ? 'translateX(0)' : `translateX(${isMobile ? '0' : '100px'})`,
                  opacity: isVisible ? 1 : 0,
                  transition: 'all 1s ease-out 0.5s',
                  mt: { xs: 2, md: 0 }
                }}
              >
                {/* Success Stats - Progressive Design */}
                <Card
                  sx={{
                    mb: { xs: 2, md: 3 },
                    background: isDarkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(0,0,0,0.02)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: { xs: 2, md: 3 },
                    transform: isVisible ? 'rotateY(0deg)' : `rotateY(${isMobile ? '0deg' : '-15deg'})`,
                    transformOrigin: 'left center',
                    transition: 'all 0.8s ease-out 0.8s'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Grid container spacing={{ xs: 2, md: 3 }} textAlign="center">
                      <Grid item xs={4}>
                        <Typography 
                          variant={isMobile ? "h5" : "h4"}
                          sx={{ 
                            fontWeight: 700, 
                            color: '#3b82f6',
                            transform: isVisible ? 'scale(1)' : 'scale(0)',
                            transition: 'all 0.6s ease-out 1.2s',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                          }}
                        >
                          0%
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isDarkMode ? '#d1d5db' : '#6b7280',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          Commission Fees
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography 
                          variant={isMobile ? "h5" : "h4"}
                          sx={{ 
                            fontWeight: 700, 
                            color: '#10b981',
                            transform: isVisible ? 'scale(1)' : 'scale(0)',
                            transition: 'all 0.6s ease-out 1.4s',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                          }}
                        >
                          24/7
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isDarkMode ? '#d1d5db' : '#6b7280',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          Global Access
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography 
                          variant={isMobile ? "h5" : "h4"}
                          sx={{ 
                            fontWeight: 700, 
                            color: '#f59e0b',
                            transform: isVisible ? 'scale(1)' : 'scale(0)',
                            transition: 'all 0.6s ease-out 1.6s',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
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
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
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

                {/* Feature Highlight Cards - Progressive Layout */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
                  <Card
                    sx={{
                      background: isDarkMode 
                        ? 'rgba(255,255,255,0.03)' 
                        : 'rgba(0,0,0,0.02)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      borderRadius: { xs: 2, md: 3 },
                      '&:hover': {
                        transform: `translateY(${isMobile ? '-2px' : '-4px'})`,
                        boxShadow: isDarkMode 
                          ? '0 8px 25px rgba(0,0,0,0.3)' 
                          : '0 8px 25px rgba(0,0,0,0.1)'
                      },
                      transform: isVisible ? 'translateY(0) rotateX(0deg)' : `translateY(${isMobile ? '30px' : '50px'}) rotateX(${isMobile ? '0deg' : '-10deg'})`,
                      opacity: isVisible ? 1 : 0,
                      transition: 'all 0.8s ease-out 1.2s'
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, md: 2 } }}>
                        <Psychology sx={{ 
                          mr: { xs: 1.5, md: 2 }, 
                          color: '#3b82f6', 
                          fontSize: { xs: 24, sm: 28, md: 32 }
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a',
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                        }}>
                          AI-Powered Matching
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ 
                        opacity: 0.8, 
                        lineHeight: 1.6,
                        color: isDarkMode ? '#d1d5db' : '#4b5563',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
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
                      borderRadius: { xs: 2, md: 3 },
                      '&:hover': {
                        transform: `translateY(${isMobile ? '-2px' : '-4px'})`,
                        boxShadow: isDarkMode 
                          ? '0 8px 25px rgba(0,0,0,0.3)' 
                          : '0 8px 25px rgba(0,0,0,0.1)'
                      },
                      transform: isVisible ? 'translateY(0) rotateX(0deg)' : `translateY(${isMobile ? '40px' : '70px'}) rotateX(${isMobile ? '0deg' : '-15deg'})`,
                      opacity: isVisible ? 1 : 0,
                      transition: 'all 0.8s ease-out 1.4s'
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, md: 2 } }}>
                        <Security sx={{ 
                          mr: { xs: 1.5, md: 2 }, 
                          color: '#10b981', 
                          fontSize: { xs: 24, sm: 28, md: 32 }
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a',
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                        }}>
                          Secure Crypto Escrow
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ 
                        opacity: 0.8, 
                        lineHeight: 1.6,
                        color: isDarkMode ? '#d1d5db' : '#4b5563',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
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