import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Divider,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ThumbDown,
  ThumbUp,
  Close,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Lock,
  LockOpen,
  AccountBalance,
  SwapHoriz,
  Refresh,
  Group,
  Assignment,
  Payment,
  Gavel
} from '@mui/icons-material';

interface BehaviorItem {
  icon: React.ReactNode;
  text: string;
  color: 'error' | 'success';
}

interface ConsequenceItem {
  icon: React.ReactNode;
  text: string;
  type: 'punishment' | 'reward';
}

const TrustBehaviorSystem: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const badBehaviors: BehaviorItem[] = [
    { icon: <Refresh />, text: 'Repeated cancellations', color: 'error' },
    { icon: <Gavel />, text: 'Excessive disputes', color: 'error' },
    { icon: <Close />, text: 'Breaking contract terms', color: 'error' }
  ];

  const goodBehaviors: BehaviorItem[] = [
    { icon: <Payment />, text: 'Releasing payments', color: 'success' },
    { icon: <Assignment />, text: 'Creating contracts', color: 'success' },
    { icon: <Group />, text: 'Interacting with many users', color: 'success' },
    { icon: <TrendingUp />, text: 'High transaction volume', color: 'success' }
  ];

  const punishments: ConsequenceItem[] = [
    { icon: <TrendingDown />, text: 'Trust score drops', type: 'punishment' },
    { icon: <AccountBalance />, text: 'Funds staked', type: 'punishment' },
    { icon: <Lock />, text: 'Transaction cap', type: 'punishment' }
  ];

  const rewards: ConsequenceItem[] = [
    { icon: <TrendingUp />, text: 'Higher trust score', type: 'reward' },
    { icon: <LockOpen />, text: 'Transaction freedom', type: 'reward' },
    { icon: <SwapHoriz />, text: 'Refund old escrow', type: 'reward' }
  ];

  const handleSectionClick = (section: string) => {
    setSelectedSection(selectedSection === section ? null : section);
  };

  const getCardStyles = (section: string, colorType: 'error' | 'success') => ({
    height: '100%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: selectedSection === section ? `2px solid ${theme.palette[colorType].main}` : 'none',
    '&:hover': { 
      elevation: 4,
      transform: isMobile ? 'none' : 'translateY(-2px)',
      boxShadow: theme.shadows[4]
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
    // Improve touch targets on mobile
    minHeight: isMobile ? '200px' : 'auto',
  });

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: isMobile ? 2 : 4,
          backgroundColor: 'inherit'
        }}
      >
        <Typography 
          variant={isSmallMobile ? "h4" : isMobile ? "h3" : "h3"}
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: isMobile ? 3 : 4,
            px: 1
          }}
        >
          oDoc Karma metrix
        </Typography>

        <Grid container spacing={isMobile ? 2 : 4} sx={{ mb: isMobile ? 4 : 6 }}>
          {/* Punishments Section */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={selectedSection === 'punishments' ? 8 : 2}
              sx={getCardStyles('punishments', 'error')}
              onClick={() => handleSectionClick('punishments')}
            >
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  mb={2}
                  flexDirection={isSmallMobile ? 'column' : 'row'}
                  textAlign={isSmallMobile ? 'center' : 'left'}
                >
                  <Avatar sx={{ 
                    bgcolor: 'error.main', 
                    mr: isSmallMobile ? 0 : 2,
                    mb: isSmallMobile ? 1 : 0,
                    width: isMobile ? 48 : 56,
                    height: isMobile ? 48 : 56
                  }}>
                    <ThumbDown sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }} />
                  </Avatar>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'error.main',
                      fontSize: isSmallMobile ? '1.25rem' : undefined
                    }}
                  >
                    PUNISHMENTS
                  </Typography>
                </Box>
                
                <List sx={{ pt: 0 }}>
                  {punishments.map((item, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        pl: 0,
                        py: isMobile ? 0.5 : 1,
                        flexDirection: isSmallMobile ? 'column' : 'row',
                        alignItems: isSmallMobile ? 'center' : 'flex-start',
                        textAlign: isSmallMobile ? 'center' : 'left'
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'error.main',
                        minWidth: isSmallMobile ? 'auto' : 56,
                        mb: isSmallMobile ? 0.5 : 0,
                        mr: isSmallMobile ? 0 : undefined
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{ 
                          variant: isMobile ? 'body1' : 'h6',
                          sx: { 
                            fontWeight: 'medium',
                            fontSize: isSmallMobile ? '0.9rem' : undefined
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Rewards Section */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={selectedSection === 'rewards' ? 8 : 2}
              sx={getCardStyles('rewards', 'success')}
              onClick={() => handleSectionClick('rewards')}
            >
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  mb={2}
                  flexDirection={isSmallMobile ? 'column' : 'row'}
                  textAlign={isSmallMobile ? 'center' : 'left'}
                >
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mr: isSmallMobile ? 0 : 2,
                    mb: isSmallMobile ? 1 : 0,
                    width: isMobile ? 48 : 56,
                    height: isMobile ? 48 : 56
                  }}>
                    <ThumbUp sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }} />
                  </Avatar>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'success.main',
                      fontSize: isSmallMobile ? '1.25rem' : undefined
                    }}
                  >
                    REWARDS
                  </Typography>
                </Box>
                
                <List sx={{ pt: 0 }}>
                  {rewards.map((item, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        pl: 0,
                        py: isMobile ? 0.5 : 1,
                        flexDirection: isSmallMobile ? 'column' : 'row',
                        alignItems: isSmallMobile ? 'center' : 'flex-start',
                        textAlign: isSmallMobile ? 'center' : 'left'
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'success.main',
                        minWidth: isSmallMobile ? 'auto' : 56,
                        mb: isSmallMobile ? 0.5 : 0,
                        mr: isSmallMobile ? 0 : undefined
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{ 
                          variant: isMobile ? 'body1' : 'h6',
                          sx: { 
                            fontWeight: 'medium',
                            fontSize: isSmallMobile ? '0.9rem' : undefined
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: isMobile ? 3 : 4, 
          borderWidth: 2,
          mx: isMobile ? -1 : 0
        }} />

        <Grid container spacing={isMobile ? 2 : 4}>
          {/* Bad Behavior Section */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={selectedSection === 'bad-behavior' ? 8 : 2}
              sx={getCardStyles('bad-behavior', 'error')}
              onClick={() => handleSectionClick('bad-behavior')}
            >
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  mb={2}
                  flexDirection={isSmallMobile ? 'column' : 'row'}
                  textAlign={isSmallMobile ? 'center' : 'left'}
                >
                  <Avatar sx={{ 
                    bgcolor: 'error.main', 
                    mr: isSmallMobile ? 0 : 2,
                    mb: isSmallMobile ? 1 : 0,
                    width: isMobile ? 48 : 56,
                    height: isMobile ? 48 : 56
                  }}>
                    <Close sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }} />
                  </Avatar>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'error.main',
                      fontSize: isSmallMobile ? '1.25rem' : undefined
                    }}
                  >
                    BAD BEHAVIOR
                  </Typography>
                </Box>
                
                <List sx={{ pt: 0 }}>
                  {badBehaviors.map((behavior, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        pl: 0,
                        py: isMobile ? 0.5 : 1,
                        flexDirection: isSmallMobile ? 'column' : 'row',
                        alignItems: isSmallMobile ? 'center' : 'flex-start',
                        textAlign: isSmallMobile ? 'center' : 'left'
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'error.main',
                        minWidth: isSmallMobile ? 'auto' : 56,
                        mb: isSmallMobile ? 0.5 : 0,
                        mr: isSmallMobile ? 0 : undefined
                      }}>
                        {behavior.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={behavior.text}
                        primaryTypographyProps={{ 
                          variant: isMobile ? 'body1' : 'h6',
                          sx: { 
                            fontWeight: 'medium',
                            fontSize: isSmallMobile ? '0.9rem' : undefined
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Good Behavior Section */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={selectedSection === 'good-behavior' ? 8 : 2}
              sx={getCardStyles('good-behavior', 'success')}
              onClick={() => handleSectionClick('good-behavior')}
            >
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  mb={2}
                  flexDirection={isSmallMobile ? 'column' : 'row'}
                  textAlign={isSmallMobile ? 'center' : 'left'}
                >
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mr: isSmallMobile ? 0 : 2,
                    mb: isSmallMobile ? 1 : 0,
                    width: isMobile ? 48 : 56,
                    height: isMobile ? 48 : 56
                  }}>
                    <CheckCircle sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }} />
                  </Avatar>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'success.main',
                      fontSize: isSmallMobile ? '1.25rem' : undefined
                    }}
                  >
                    GOOD BEHAVIOR
                  </Typography>
                </Box>
                
                <List sx={{ pt: 0 }}>
                  {goodBehaviors.map((behavior, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        pl: 0,
                        py: isMobile ? 0.5 : 1,
                        flexDirection: isSmallMobile ? 'column' : 'row',
                        alignItems: isSmallMobile ? 'center' : 'flex-start',
                        textAlign: isSmallMobile ? 'center' : 'left'
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: 'success.main',
                        minWidth: isSmallMobile ? 'auto' : 56,
                        mb: isSmallMobile ? 0.5 : 0,
                        mr: isSmallMobile ? 0 : undefined
                      }}>
                        {behavior.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={behavior.text}
                        primaryTypographyProps={{ 
                          variant: isMobile ? 'body1' : 'h6',
                          sx: { 
                            fontWeight: 'medium',
                            fontSize: isSmallMobile ? '0.9rem' : undefined
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TrustBehaviorSystem;