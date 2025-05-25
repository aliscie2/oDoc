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
} from '@mui/material';
import {
  AccessTime,
  Security,
  Gavel,
  Psychology,
  Code,
  AccountTree,
  TrendingUp,
  KeyboardArrowUp,
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
    expandedContent: 'Cut operational costs by 60% and reduce tool switching by 80%. Single subscription replaces multiple SaaS tools.',
    icon: <AccessTime />,
    priority: { developer: 3, business: 1, general: 2 },
    color: '#4CAF50',
    stats: '60% cost reduction'
  },
  {
    id: 'blockchain',
    title: 'Built on Blockchain',
    description: 'Privacy that doesn\'t change overnight.\nTransparent, secure, and censorship-resistant.',
    expandedContent: 'Immutable smart contracts ensure your agreements can\'t be altered. Full transparency with on-chain verification.',
    icon: <Security />,
    priority: { developer: 1, business: 4, general: 3 },
    color: '#2196F3',
    stats: '256-bit encryption'
  },
  {
    id: 'control',
    title: 'You\'re in Control',
    description: 'Vote on features and updates.\nNo more forced changes — you decide.',
    expandedContent: 'DAO governance model means community decides platform direction. Your voice matters in every update.',
    icon: <Gavel />,
    priority: { developer: 2, business: 5, general: 4 },
    color: '#FF9800',
    stats: '10K+ active voters'
  },
  {
    id: 'ai-assistant',
    title: 'Smart AI Assistant',
    description: 'Get instant insights.\nLet AI analyze data and guide your decisions.',
    expandedContent: 'ML-powered analytics provide actionable insights. Predictive models help optimize your workflow efficiency.',
    icon: <Psychology />,
    priority: { developer: 4, business: 2, general: 1 },
    color: '#9C27B0',
    stats: '95% accuracy rate'
  },
  {
    id: 'open-source',
    title: 'Open Source',
    description: 'See the code. Trust the platform.\nYou know exactly where your data goes.',
    expandedContent: 'Full code transparency on GitHub. Community-driven development with regular security audits.',
    icon: <Code />,
    priority: { developer: 1, business: 6, general: 5 },
    color: '#607D8B',
    stats: '50K+ GitHub stars'
  },
  {
    id: 'workflow',
    title: 'All-in-One Workflow',
    description: 'Payments, hiring, tasks, and contracts — unified.\nNo switching. Everything in one place.',
    expandedContent: 'Seamless integration across all business functions. Single dashboard for complete project lifecycle management.',
    icon: <AccountTree />,
    priority: { developer: 5, business: 3, general: 2 },
    color: '#E91E63',
    stats: '5 tools in 1'
  }
];

const ODocInfographic: React.FC<ODocInfographicProps> = ({
  userType = 'general',
  theme = 'gradient',
  interactive = true,
  showStats = true,
  onCtaClick
}) => {
  const { isDarkMode } = useSelector((state: any) => state.uiState);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showFab, setShowFab] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));


  // Sort benefits based on user type priority
  const sortedBenefits = [...benefitsData].sort((a, b) => 
    a.priority[userType] - b.priority[userType]
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowFab(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: theme === 'gradient' 
                ? 'linear-gradient(45deg, #FFF 30%, #FFD700 90%)'
                : 'inherit',
              backgroundClip: theme === 'gradient' ? 'text' : 'inherit',
              WebkitBackgroundClip: theme === 'gradient' ? 'text' : 'inherit',
              WebkitTextFillColor: theme === 'gradient' ? 'transparent' : 'inherit',
              mb: 2
            }}
          >
            Why ODoc?
          </Typography>
          <Typography variant="h4" sx={{ opacity: 0.9, mb: 2 }}>
            One Platform. Endless Benefits.
          </Typography>
          {userType !== 'general' && (
            <Chip
              label={`Optimized for ${userType}s`}
              color="secondary"
              sx={{ mb: 2 }}
            />
          )}
        </Box>

        {/* Benefits Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {sortedBenefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={benefit.id}>
              <Fade in timeout={300 + index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: interactive ? 'pointer' : 'default',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredCard === benefit.id ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: hoveredCard === benefit.id ? 6 : 2,
                   
                    backdropFilter: theme === 'gradient' ? 'blur(10px)' : 'none',
                    border: hoveredCard === benefit.id 
                      ? `2px solid ${benefit.color}` 
                      : '2px solid transparent',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                  onMouseEnter={() => interactive && setHoveredCard(benefit.id)}
                  onMouseLeave={() => interactive && setHoveredCard(null)}
                >
                  {/* Priority Badge for personalization */}
                  {benefit.priority[userType] <= 2 && (
                    <Chip
                      label="Top Pick"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: 16,
                        bgcolor: benefit.color,
                        zIndex: 1
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        mb: 2,
                        fontSize: '2.5rem',
                        transition: 'transform 0.3s ease',
                        transform: hoveredCard === benefit.id ? 'rotate(10deg)' : 'rotate(0deg)'
                      }}
                    >
                      {benefit.icon}
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
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
                        opacity: 0.8,
                        
                  }}
                  >
                    {hoveredCard === benefit.id ? benefit.expandedContent : benefit.description}
                  </Typography>

                    {/* Stats */}
                    {showStats && benefit.stats && hoveredCard === benefit.id && (
                      <Zoom in>
                        <Box
                          sx={{
                            mt: 2,
                            p: 1,
                            bgcolor: benefit.color,
                            borderRadius: 1,
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="caption" fontWeight="bold">
                            {benefit.stats}
                          </Typography>
                        </Box>
                      </Zoom>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>


      </Container>
    </Box>
  );
};

export default ODocInfographic;