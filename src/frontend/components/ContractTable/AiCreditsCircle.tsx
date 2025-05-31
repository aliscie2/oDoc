import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
  Fade,
  Popper,
  ClickAwayListener
} from '@mui/material';
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';

interface AiCreditsCircleProps {
  currentAICredits: number;
  maxCredits?: number;
  onBuyCredit: (value: number) => void;
}

const AiCreditsCircle: React.FC<AiCreditsCircleProps> = ({
  currentAICredits,
  maxCredits = 5, // Changed to 5 dollars max
  onBuyCredit
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const theme = useTheme();
  
  const { wallet } = useSelector((state: any) => state.filesState);
  
  // Calculate percentage based on dollar amount (0-5)
  const percentage = Math.max(0, Math.min(100, (currentAICredits / maxCredits) * 100));
  
  const getColor = () => {
    if (percentage >= 75) return theme.palette.success.main; // Green
    if (percentage >= 50) return '#8BC34A'; // Light Green  
    if (percentage >= 35) return '#FFC107'; // Yellow
    if (percentage >= 20) return '#FF9800'; // Orange
    if (percentage >= 10) return '#FF5722'; // Dark Orange
    if (percentage >= 5) return '#F44336'; // Red
    return '#D32F2F'; // Dark Red for critical levels
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setError('');
  };

  const handleSubmit = () => {
    const amount = parseFloat(inputAmount);
    
    if (isNaN(amount) || amount < 1 || amount > 5) {
      setError('Please enter amount between $1-$5');
      return;
    }

    if (wallet.balance < amount) {
      setError('insufficient-balance');
      return;
    }

    onBuyCredit(amount);
    setInputAmount('');
    setAnchorEl(null);
    setError('');
  };

  const open = Boolean(anchorEl);

  return (
    <ClickAwayListener onClickAway={handleMouseLeave}>
      <Box sx={{ position: 'relative' }}>
        {/* Credits Circle */}
        <Box
          onMouseEnter={handleMouseEnter}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.15)',
              boxShadow: `0 6px 20px ${getColor()}50`,
            },
            // Pulsing animation for very low credits
            ...(percentage < 15 && {
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: `0 0 0 0 ${getColor()}40`
                },
                '70%': {
                  boxShadow: `0 0 0 10px ${getColor()}00`
                },
                '100%': {
                  boxShadow: `0 0 0 0 ${getColor()}00`
                }
              }
            })
          }}
        >
          {/* Progress Ring - Donut Chart Style */}
          <svg
            width="40"
            height="40"
            style={{
              position: 'absolute',
              top: -3,
              left: -3,
              transform: 'rotate(-90deg)',
              filter: percentage < 20 ? 'drop-shadow(0 0 4px rgba(244, 67, 54, 0.6))' : undefined
            }}
          >
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke={theme.palette.divider}
              strokeWidth="4"
              opacity="0.15"
            />
            {/* Progress circle */}
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke={getColor()}
              strokeWidth="4"
              strokeDasharray={`${(percentage / 100) * 106.81} 106.81`}
              strokeLinecap="round"
              style={{
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: percentage < 30 ? 'brightness(1.2)' : undefined
              }}
            />
            {/* Inner shadow effect for low credits */}
            {percentage < 40 && (
              <circle
                cx="20"
                cy="20"
                r="13"
                fill="none"
                stroke={getColor()}
                strokeWidth="1"
                opacity="0.3"
                strokeDasharray={`${(percentage / 100) * 81.68} 81.68`}
                strokeLinecap="round"
                style={{
                  transition: 'all 0.5s ease'
                }}
              />
            )}
          </svg>
          
          {/* Payment Amount Text */}
          <Typography
            variant="caption"
            sx={{
              fontSize: '9px',
              fontWeight: 'bold',
              color: getColor(),
              lineHeight: 1,
              textShadow: percentage < 20 ? `0 0 8px ${getColor()}` : undefined,
              transition: 'all 0.3s ease',
              // Make text more prominent when credits are very low
              ...(percentage < 10 && {
                fontSize: '8px',
                fontWeight: 900,
                letterSpacing: '-0.5px'
              })
            }}
          >
            ${currentAICredits.toFixed(currentAICredits % 1 === 0 ? 0 : 2)}
          </Typography>
        </Box>

        {/* Hover Popup */}
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="top"
          transition
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                elevation={8}
                sx={{
                  p: 2,
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: theme.palette.text.primary
                  }}
                >
                  AI Credits: ${currentAICredits.toFixed(2)}/${maxCredits.toFixed(0)}
                </Typography>
                
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 2,
                    color: theme.palette.text.secondary
                  }}
                >
                  Buy more credits ($1-$5)
                </Typography>

                {error === 'insufficient-balance' ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.error.main,
                        mb: 1
                      }}
                    >
                      Please make a deposit first
                    </Typography>
                    <Typography
                      to="/wallet"
                      component={Link}
                      variant="subtitle2"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Deposit here
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="$1-5"
                      value={inputAmount}
                      onChange={(e) => {
                        setInputAmount(e.target.value);
                        setError('');
                      }}
                      inputProps={{
                        min: 1,
                        max: 5,
                        step: 0.01
                      }}
                      sx={{
                        width: 80,
                        '& .MuiOutlinedInput-root': {
                          height: 32
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSubmit}
                      disabled={!inputAmount}
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        height: 32,
                        fontSize: '0.75rem'
                      }}
                    >
                      Buy
                    </Button>
                  </Box>
                )}

                {error && error !== 'insufficient-balance' && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      color: theme.palette.error.main
                    }}
                  >
                    {error}
                  </Typography>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default AiCreditsCircle;