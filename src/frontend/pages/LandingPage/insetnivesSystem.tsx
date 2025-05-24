import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  Button,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  useTheme
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4,}}>
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 4
          }}
        >
          oDoc Karma metrix
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Punishments Section */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={selectedSection === 'punishments' ? 8 : 2}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedSection === 'punishments' ? `2px solid ${theme.palette.error.main}` : 'none',
                '&:hover': { elevation: 4 }
              }}
              onClick={() => handleSectionClick('punishments')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                    <ThumbDown />
                  </Avatar>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    PUNISHMENTS
                  </Typography>
                </Box>
                
                <List>
                  {punishments.map((item, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ color: 'error.main' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{ 
                          variant: 'h6',
                          sx: { fontWeight: 'medium' }
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
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedSection === 'rewards' ? `2px solid ${theme.palette.success.main}` : 'none',
                '&:hover': { elevation: 4 }
              }}
              onClick={() => handleSectionClick('rewards')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <ThumbUp />
                  </Avatar>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    REWARDS
                  </Typography>
                </Box>
                
                <List>
                  {rewards.map((item, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ color: 'success.main' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{ 
                          variant: 'h6',
                          sx: { fontWeight: 'medium' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderWidth: 2 }} />

        <Grid container spacing={4}>
          {/* Bad Behavior Section */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={selectedSection === 'bad-behavior' ? 8 : 2}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedSection === 'bad-behavior' ? `2px solid ${theme.palette.error.main}` : 'none',
                '&:hover': { elevation: 4 }
              }}
              onClick={() => handleSectionClick('bad-behavior')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                    <Close />
                  </Avatar>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    BAD BEHAVIOR
                  </Typography>
                </Box>
                
                <List>
                  {badBehaviors.map((behavior, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ color: 'error.main' }}>
                        {behavior.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={behavior.text}
                        primaryTypographyProps={{ 
                          variant: 'h6',
                          sx: { fontWeight: 'medium' }
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
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedSection === 'good-behavior' ? `2px solid ${theme.palette.success.main}` : 'none',
                '&:hover': { elevation: 4 }
              }}
              onClick={() => handleSectionClick('good-behavior')}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    GOOD BEHAVIOR
                  </Typography>
                </Box>
                
                <List>
                  {goodBehaviors.map((behavior, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ color: 'success.main' }}>
                        {behavior.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={behavior.text}
                        primaryTypographyProps={{ 
                          variant: 'h6',
                          sx: { fontWeight: 'medium' }
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