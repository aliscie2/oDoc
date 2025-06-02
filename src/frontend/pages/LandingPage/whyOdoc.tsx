import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Fab,
  Container,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Collapse,
  IconButton,
  alpha,
} from '@mui/material';
import {
  AccessTime,
  Security,
  Gavel,
  Psychology,
  Code,
  AccountTree,
  KeyboardArrowUp,
  ExpandMore,
  ExpandLess,
  Star,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

interface BenefitData {
  id: string;
  title: string;
  description: string;
  expandedContent: string;
  icon: React.ReactNode;
  priority: {
    developer: number;
    business: number;
    general: number;
  };
  color: string;
  stats?: string;
}

interface ODocInfographicProps {
  userType?: 'developer' | 'business' | 'general';
  theme?: 'light' | 'dark' | 'gradient';
  interactive?: boolean;
  showStats?: boolean;
  onCtaClick?: () => void;
}

const benefitsData: BenefitData[] = [
  {
    id: 'save-time',
    title: 'Save Time & Money',
    description: 'Replace 3+ apps with one.\nNo more PayPal, Upwork, Jira — ODoc handles it all.',
    expandedContent: 'Cut operational costs by 60% and reduce tool switching by 80%. Single subscription replaces multiple SaaS tools, streamlining your entire workflow and boosting productivity.',
    icon: <AccessTime />,
    priority: { developer: 3, business: 1, general: 2 },
    color: '#4CAF50',
    stats: '60% cost reduction'
  },
  {
    id: 'blockchain',
    title: 'Built on Blockchain',
    description: 'Privacy that doesn\'t change overnight.\nTransparent, secure, and censorship-resistant.',
    expandedContent: 'Immutable smart contracts ensure your agreements can\'t be altered. Full transparency with on-chain verification and decentralized architecture for ultimate security.',
    icon: <Security />,
    priority: { developer: 1, business: 4, general: 3 },
    color: '#2196F3',
    stats: '256-bit encryption'
  },
  {
    id: 'control',
    title: 'You\'re in Control',
    description: 'Vote on features and updates.\nNo more forced changes — you decide.',
    expandedContent: 'DAO governance model means community decides platform direction. Your voice matters in every update and feature decision through democratic voting.',
    icon: <Gavel />,
    priority: { developer: 2, business: 5, general: 4 },
    color: '#FF9800',
    stats: '10K+ active voters'
  },
  {
    id: 'ai-assistant',
    title: 'Smart AI Assistant',
    description: 'Get instant insights.\nLet AI analyze data and guide your decisions.',
    expandedContent: 'ML-powered analytics provide actionable insights. Predictive models help optimize your workflow efficiency and decision-making process with real-time guidance.',
    icon: <Psychology />,
    priority: { developer: 4, business: 2, general: 1 },
    color: '#9C27B0',
    stats: '95% accuracy rate'
  },
  {
    id: 'open-source',
    title: 'Open Source',
    description: 'See the code. Trust the platform.\nYou know exactly where your data goes.',
    expandedContent: 'Full code transparency on GitHub. Community-driven development with regular security audits and open contribution model for maximum trust.',
    icon: <Code />,
    priority: { developer: 1, business: 6, general: 5 },
    color: '#607D8B',
    stats: '50K+ GitHub stars'
  },
  {
    id: 'workflow',
    title: 'All-in-One Workflow',
    description: 'Payments, hiring, tasks, and contracts — unified.\nNo switching. Everything in one place.',
    expandedContent: 'Seamless integration across all business functions. Single dashboard for complete project lifecycle management and team coordination without context switching.',
    icon: <AccountTree />,
    priority: { developer: 5, business: 3, general: 2 },
    color: '#E91E63',
    stats: '5 tools in 1'
  }
];

const ODocInfographic: React.FC<ODocInfographicProps> = ({
  userType = 'general',
  theme: themeOverride,
  interactive = true,
  showStats = true,
  onCtaClick
}) => {
  const { isDarkMode } = useSelector((state: any) => state.uiState);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedMobileCard, setExpandedMobileCard] = useState<string | null>(null);
  
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('md', 'lg'));

  // Sort benefits based on user type priority
  const sortedBenefits = [...benefitsData].sort((a, b) => 
    a.priority[userType] - b.priority[userType]
  );




  const handleMobileCardClick = (cardId: string) => {
    if (isMobile) {
      setExpandedMobileCard(expandedMobileCard === cardId ? null : cardId);
    }
  };

  const getGridColumns = () => {
    if (isMobile) return 12;
    if (isTablet) return 6;
    return 4;
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        py: { xs: 4, md: 8 },
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
    >
      <Container maxWidth="lg">
        
        {/* Hero Section - Progressive Enhancement */}
        <Box textAlign="center" mb={{ xs: 6, md: 8, lg: 12 }}>
          <Typography
            variant={isMobile ? 'h3' : isTablet ? 'h2' : 'h1'}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: themeOverride === 'gradient' || (!themeOverride && isDarkMode)
                ? `linear-gradient(45deg, ${muiTheme.palette.primary.main} 30%, ${muiTheme.palette.secondary.main} 90%)`
                : 'inherit',
              backgroundClip: themeOverride === 'gradient' || (!themeOverride && isDarkMode) ? 'text' : 'inherit',
              WebkitBackgroundClip: themeOverride === 'gradient' || (!themeOverride && isDarkMode) ? 'text' : 'inherit',
              WebkitTextFillColor: themeOverride === 'gradient' || (!themeOverride && isDarkMode) ? 'transparent' : 'inherit',
              mb: 2
            }}
          >
            Why ODoc?
          </Typography>
          
          <Typography 
            variant={isMobile ? 'h6' : isTablet ? 'h5' : 'h4'} 
            sx={{ 
              opacity: 0.9, 
              mb: 3,
              fontWeight: 300,
              color: 'text.secondary'
            }}
          >
            One Platform. Endless Benefits.
          </Typography>
          
          {userType !== 'general' && (
            <Chip
              icon={<Star />}
              label={`Optimized for ${userType}s`}
              color="secondary"
              variant={isDarkMode ? 'outlined' : 'filled'}
              sx={{ 
                mb: 3,
                '& .MuiChip-icon': {
                  color: muiTheme.palette.warning.main
                }
              }}
            />
          )}
        </Box>

        {/* Benefits Grid - Responsive Layout */}
        <Grid container spacing={{ xs: 2, md: 3, lg: 4 }} sx={{ mb: { xs: 6, md: 8 } }}>
          {sortedBenefits.map((benefit, index) => {
            const isExpanded = expandedMobileCard === benefit.id;
            const isHovered = hoveredCard === benefit.id;
            const isTopPick = benefit.priority[userType] <= 2;
            
            return (
              <Grid item xs={12} md={getGridColumns()} key={benefit.id}>
                <Fade in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: interactive ? 'pointer' : 'default',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: !isMobile && isHovered ? 'scale(1.03)' : 'scale(1)',
                      bgcolor: isDarkMode 
                        ? alpha(muiTheme.palette.background.paper, 0.8)
                        : muiTheme.palette.background.paper,
                      backdropFilter: 'blur(10px)',
                      border: isHovered || (isMobile && isExpanded)
                        ? `2px solid ${benefit.color}` 
                        : `1px solid ${alpha(muiTheme.palette.divider, 0.12)}`,
                      position: 'relative',
                      overflow: 'visible',
                      boxShadow: isHovered || (isMobile && isExpanded)
                        ? `0 8px 32px ${alpha(benefit.color, 0.3)}`
                        : muiTheme.shadows[2],
                      '&:hover': !isMobile ? {
                        boxShadow: `0 12px 40px ${alpha(benefit.color, 0.2)}`,
                      } : {}
                    }}
                    onMouseEnter={() => !isMobile && interactive && setHoveredCard(benefit.id)}
                    onMouseLeave={() => !isMobile && interactive && setHoveredCard(null)}
                    onClick={() => handleMobileCardClick(benefit.id)}
                  >
                    
                    {/* Priority Badge */}
                    {isTopPick && (
                      <Chip
                        label="Top Pick"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: 16,
                          bgcolor: benefit.color,
                          color: 'white',
                          fontWeight: 'bold',
                          zIndex: 1,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ 
                      p: { xs: 3, md: 4 }, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column' 
                    }}>
                      
                      {/* Header with Icon and Mobile Expand Button */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box
                          sx={{
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: benefit.color,
                            transition: 'transform 0.3s ease',
                            transform: (isHovered && !isMobile) || (isExpanded && isMobile) 
                              ? 'rotate(12deg) scale(1.1)' 
                              : 'rotate(0deg) scale(1)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {benefit.icon}
                        </Box>
                        
                        {isMobile && (
                          <IconButton
                            size="small"
                            sx={{ 
                              color: 'text.secondary',
                              bgcolor: alpha(muiTheme.palette.action.hover, 0.1)
                            }}
                          >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        )}
                      </Box>

                      {/* Title */}
                      <Typography
                        variant={isMobile ? 'h6' : 'h5'}
                        component="h3"
                        gutterBottom
                        sx={{
                          fontWeight: 'bold',
                          color: 'text.primary',
                          lineHeight: 1.2
                        }}
                      >
                        {benefit.title}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          flexGrow: 1,
                          whiteSpace: 'pre-line',
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          fontSize: { xs: '0.875rem', md: '1rem' }
                        }}
                      >
                        {/* Mobile: Show expanded content when clicked, Desktop: Show on hover */}
                        {isMobile 
                          ? (isExpanded ? benefit.expandedContent : benefit.description)
                          : (isHovered ? benefit.expandedContent : benefit.description)
                        }
                      </Typography>

                      {/* Stats with Progressive Enhancement */}
                      {showStats && benefit.stats && (
                        <Collapse in={(isHovered && !isMobile) || (isExpanded && isMobile)}>
                          <Box mt={2}>
                            <Zoom in={(isHovered && !isMobile) || (isExpanded && isMobile)}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  bgcolor: benefit.color,
                                  borderRadius: 2,
                                  textAlign: 'center',
                                  boxShadow: `0 4px 12px ${alpha(benefit.color, 0.3)}`
                                }}
                              >
                                <Typography 
                                  variant="caption" 
                                  fontWeight="bold"
                                  sx={{ 
                                    color: 'white',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {benefit.stats}
                                </Typography>
                              </Box>
                            </Zoom>
                          </Box>
                        </Collapse>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default ODocInfographic;