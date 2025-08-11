import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from "@mui/icons-material/Description";
import LockIcon from "@mui/icons-material/Lock";

import { Avatar, Box, Button, Card, CardContent, Chip, Grid, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

const ProgressiveTutorialDesktop = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [promiseData, setPromiseData] = useState({
    amount: "",
    receiver: { name: "Select Receiver", avatar: "" },
    status: "Promise",
    conditions: []
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [currentConditionIndex, setCurrentConditionIndex] = useState(-1);
  const [isTypingField, setIsTypingField] = useState(true);

  const steps = [
    { title: "Create Promise", description: "Click the 'New Agreement' button" },
    { title: "Select Receiver", description: "Choose who will receive the payment" },
    { title: "Set Amount", description: "Enter $500 as the payment amount" },
    { title: "Choose Status", description: "Select 'Escrow' for secure payment" },
    { title: "Add Conditions", description: "Add agreement conditions one by one" },
    { title: "Promise Secured", description: "Your promise is now in escrow" }
  ];

  const dummyReceivers = [
    { 
      name: "Alice Johnson", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
    },
    { 
      name: "Bob Smith", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
    },
    { 
      name: "Carol Davis", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" 
    }
  ];

  const conditionTemplates = [
    { field: "Delivery Date", value: "Product must be delivered by March 15th, 2024" },
    { field: "Quality Check", value: "Product must meet all agreed specifications and quality standards" }
  ];

  const typeText = useCallback((text, callback, speed = 100) => {
    let index = 0;
    const timer = setInterval(() => {
      setTypingText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
        setTimeout(() => {
          callback && callback();
        }, 500);
      }
    }, speed);
    return timer;
  }, []);

  useEffect(() => {
    let timer;
    
    switch(currentStep) {
      case 0:
        setPromiseData({
          amount: "",
          receiver: { name: "Select Receiver", avatar: "" },
          status: "Promise",
          conditions: []
        });
        setShowDropdown(false);
        setTypingText("");
        setCurrentConditionIndex(-1);
        timer = setTimeout(() => setCurrentStep(1), 2000);
        break;

      case 1:
        timer = setTimeout(() => {
          setShowDropdown(true);
          setTimeout(() => {
            setPromiseData(prev => ({ ...prev, receiver: dummyReceivers[0] }));
            setShowDropdown(false);
            setTimeout(() => setCurrentStep(2), 1000);
          }, 2000);
        }, 1000);
        break;

      case 2:
        timer = setTimeout(() => {
          typeText("500", () => {
            setPromiseData(prev => ({ ...prev, amount: "500" }));
            setTimeout(() => setCurrentStep(3), 1000);
          });
        }, 1000);
        break;

      case 3:
        timer = setTimeout(() => {
          setPromiseData(prev => ({ ...prev, status: "Escrow" }));
          setTimeout(() => setCurrentStep(4), 2000);
        }, 1000);
        break;

      case 4:
        timer = setTimeout(() => {
          let conditionIndex = 0;
          
          const addNextCondition = () => {
            if (conditionIndex < 2) {
              setCurrentConditionIndex(conditionIndex);
              setIsTypingField(true);
              setTypingText("");
              
              typeText(conditionTemplates[conditionIndex].field, () => {
                setIsTypingField(false);
                typeText(conditionTemplates[conditionIndex].value, () => {
                  setPromiseData(prev => ({
                    ...prev,
                    conditions: [...prev.conditions, {
                      id: `condition_${conditionIndex}_${Date.now()}`,
                      field: conditionTemplates[conditionIndex]?.field,
                      value: conditionTemplates[conditionIndex]?.value
                    }]
                  }));
                  setCurrentConditionIndex(-1);
                  conditionIndex++;
                  if (conditionIndex < 2) {
                    setTimeout(addNextCondition, 1000);
                  } else {
                    setTimeout(() => setCurrentStep(5), 1500);
                  }
                }, 50);
              });
            }
          };
          
          addNextCondition();
        }, 1000);
        break;

      case 5:
        timer = setTimeout(() => {
          setCurrentStep(0);
        }, 4000);
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep, typeText]);

  const getStatusConfig = (status) => {
    const configs = {
      Promise: { color: "#0284c7", bg: "#eff6ff", icon: "💫" },
      Escrow: { color: "#ea580c", bg: "#fff7ed", icon: "🔒" },
      Released: { color: "#059669", bg: "#ecfdf5", icon: "✅" }
    };
    return configs[status] || configs.Promise;
  };

  const statusConfig = getStatusConfig(promiseData.status);

  const isStepFocused = (stepNumber) => currentStep === stepNumber || currentStep === 0;

  return (
    <Box sx={{ position: "relative", p: { xs: 1, sm: 2, md: 4 }, minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Progress Bar */}
      <Box sx={{ maxWidth: { xs: '100%', md: 800 }, mx: "auto", mb: { xs: 2, md: 4 }, position: "relative", zIndex: 1001 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: { xs: 0.5, sm: 1 } }}>
          {steps.map((step, index) => (
            <Box key={index} sx={{ textAlign: "center", flex: 1 }}>
              <Box
                sx={{
                  width: { xs: 24, sm: 32, md: 40 },
                  height: { xs: 24, sm: 32, md: 40 },
                  borderRadius: "50%",
                  bgcolor: index === currentStep ? "primary.main" : 
                          index < currentStep ? "success.main" : "grey.300",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: { xs: 0.5, md: 1 },
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                  transform: index === currentStep ? "scale(1.2)" : "scale(1)",
                  transition: "all 0.3s ease",
                  border: index === currentStep ? "3px solid" : "none",
                  borderColor: "primary.light"
                }}
              >
                {index < currentStep ? "✓" : index + 1}
              </Box>
              <Typography 
                variant="caption" 
                sx={{
                  fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem' },
                  color: index === currentStep ? "primary.main" : 
                         index < currentStep ? "success.main" : "text.secondary",
                  fontWeight: index === currentStep ? 600 : 400,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {step.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Promise Card */}
      <Box sx={{ maxWidth: { xs: '100%', md: 800 }, mx: "auto", position: "relative", zIndex: 999 }}>
        <Card
          elevation={currentStep === 5 ? 8 : 4}
          sx={{
            border: "2px solid",
            borderColor: currentStep === 5 ? "warning.main" : "grey.200",
            transform: currentStep === 5 ? "scale(1.02)" : "scale(1)",
            transition: "all 0.5s ease",
            position: "relative"
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              background: promiseData.status === "Escrow" ? 
                "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)" :
                "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              borderBottom: "1px solid",
              borderColor: "divider",
              opacity: isStepFocused(1) || currentStep === 5 ? 1 : 0.3,
              transition: "opacity 0.5s ease"
            }}
          >
            <Grid container alignItems="center" spacing={{ xs: 1, md: 2 }}>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2 }} sx={{ flexWrap: 'wrap' }}>
                  <Chip
                    label={`${statusConfig.icon} ${promiseData.status}`}
                    size={window.innerWidth < 600 ? "small" : "medium"}
                    sx={{
                      bgcolor: statusConfig.bg,
                      color: statusConfig.color,
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', md: '0.875rem' },
                      transform: promiseData.status === "Escrow" ? "scale(1.1)" : "scale(1)",
                      transition: "all 0.3s ease"
                    }}
                  />
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Avatar 
                      sx={{ width: { xs: 24, md: 36 }, height: { xs: 24, md: 36 }, bgcolor: "primary.main" }}
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    >
                      Y
                    </Avatar>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, fontWeight: 600 }}>
                      You
                    </Typography>
                    <Box sx={{ mx: 0.5, fontSize: { xs: '0.9rem', md: '1.2rem' } }}>→</Box>
                    <Avatar 
                      sx={{ 
                        width: { xs: 24, md: 36 }, 
                        height: { xs: 24, md: 36 }, 
                        border: currentStep === 1 ? "2px solid" : "none",
                        borderColor: "primary.main"
                      }}
                      src={promiseData.receiver.avatar}
                    >
                      {!promiseData.receiver.avatar && "?"}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, fontWeight: 600 }}>
                      {promiseData.receiver.name}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
                  <AccountBalanceWalletIcon color="success" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
                  <Typography
                    variant={window.innerWidth < 600 ? "h6" : "h5"}
                    sx={{
                      fontWeight: 700,
                      color: "success.main",
                      fontFamily: "monospace",
                      fontSize: { xs: '1.1rem', md: '1.5rem' },
                      transform: currentStep === 2 ? "scale(1.2)" : "scale(1)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    ${currentStep === 2 ? typingText : promiseData.amount || "0"}
                  </Typography>
                  {currentStep === 2 && (
                    <Box 
                      component="span" 
                      sx={{ 
                        ml: 1, 
                        animation: "blink 1s infinite",
                        fontSize: { xs: '1.1rem', md: '1.5rem' },
                        color: "success.main"
                      }}
                    >
                      |
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Card Content */}
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Status"
                  select
                  fullWidth
                  size="small"
                  value={promiseData.status}
                  sx={{ 
                    opacity: isStepFocused(3) || currentStep === 5 ? 1 : 0.3,
                    transition: "opacity 0.5s ease",
                    position: "relative",
                    '& .MuiOutlinedInput-root': {
                      bgcolor: currentStep === 3 ? 'warning.50' : 'transparent',
                      border: currentStep === 3 ? "2px solid" : "1px solid",
                      borderColor: currentStep === 3 ? "warning.main" : "grey.300"
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.8rem', md: '1rem' }
                    }
                  }}
                >
                  <MenuItem value="Promise">💫 Promise</MenuItem>
                  <MenuItem value="Escrow">🔒 Escrow</MenuItem>
                  <MenuItem value="Released">✅ Released</MenuItem>
                </TextField>
                {currentStep === 3 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 40,
                      height: 40,
                      border: "3px solid",
                      borderColor: "warning.main",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                      animation: "clickPulse 2s infinite",
                      zIndex: 10
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Amount"
                  type="text"
                  fullWidth
                  size="small"
                  value={currentStep === 2 ? typingText : promiseData.amount}
                  sx={{ 
                    opacity: isStepFocused(2) || currentStep === 5 ? 1 : 0.3,
                    transition: "opacity 0.5s ease",
                    position: "relative",
                    '& .MuiOutlinedInput-root': {
                      bgcolor: currentStep === 2 ? 'success.50' : 'transparent',
                      border: currentStep === 2 ? "2px solid" : "1px solid",
                      borderColor: currentStep === 2 ? "success.main" : "grey.300"
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.8rem', md: '1rem' }
                    }
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
                {currentStep === 2 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 40,
                      height: 40,
                      border: "3px solid",
                      borderColor: "success.main",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                      animation: "clickPulse 2s infinite",
                      zIndex: 10
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ position: "relative" }}>
                  <TextField
                    label="Receiver"
                    select
                    fullWidth
                    size="small"
                    value={promiseData.receiver.name}
                    open={showDropdown}
                    sx={{ 
                      opacity: isStepFocused(1) || currentStep === 5 ? 1 : 0.3,
                      transition: "opacity 0.5s ease",
                      '& .MuiOutlinedInput-root': {
                        bgcolor: currentStep === 1 ? 'primary.50' : 'transparent',
                        border: currentStep === 1 ? "2px solid" : "1px solid",
                        borderColor: currentStep === 1 ? "primary.main" : "grey.300"
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.8rem', md: '1rem' }
                      }
                    }}
                  >
                    <MenuItem value="Select Receiver">Select Receiver</MenuItem>
                    {dummyReceivers.map((receiver) => (
                      <MenuItem key={receiver.name} value={receiver.name}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar src={receiver.avatar} sx={{ width: 24, height: 24 }}>
                            {receiver.name[0]}
                          </Avatar>
                          {receiver.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                  {currentStep === 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 40,
                        height: 40,
                        border: "3px solid",
                        borderColor: "primary.main",
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        animation: "clickPulse 2s infinite",
                        zIndex: 10
                      }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Conditions Section */}
            <Box sx={{ 
              bgcolor: currentStep === 4 ? 'primary.50' : 'transparent',
              p: currentStep === 4 ? { xs: 1, md: 2 } : 0,
              borderRadius: 2,
              border: currentStep === 4 ? "2px dashed" : "none",
              borderColor: "primary.main",
              transition: 'all 0.3s ease',
              opacity: isStepFocused(4) || currentStep === 5 ? 1 : 0.3,
              position: "relative"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <DescriptionIcon color="primary" sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: 600 }}>
                  Agreement Conditions
                </Typography>
                {currentStep === 4 && (
                  <Chip 
                    label="Adding..." 
                    size="small" 
                    color="primary"
                    sx={{ ml: 2, animation: "pulse 1s infinite", fontSize: { xs: '0.6rem', md: '0.75rem' } }}
                  />
                )}
              </Box>

              <Stack spacing={2}>
                {promiseData.conditions.map((condition) => (
                  <Paper 
                    key={condition.id} 
                    elevation={2} 
                    sx={{ 
                      border: "2px solid", 
                      borderColor: "success.main",
                      transform: "scale(1.02)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: "success.main", fontSize: { xs: '0.8rem', md: '0.875rem' }, fontWeight: 600 }}>
                        ✓ {condition.field}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                        {condition.value}
                      </Typography>
                    </Box>
                  </Paper>
                ))}

                {currentStep === 4 && currentConditionIndex >= 0 && (
                  <Paper elevation={1} sx={{ border: "2px dashed", borderColor: "primary.main" }}>
                    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontSize: { xs: '0.8rem', md: '0.875rem' }, fontWeight: 600 }}>
                        {isTypingField ? (
                          <>
                            {typingText}
                            <Box component="span" sx={{ animation: "blink 1s infinite", ml: 0.5 }}>|</Box>
                          </>
                        ) : (
                          conditionTemplates[currentConditionIndex].field
                        )}
                      </Typography>
                      {!isTypingField && (
                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                          {typingText}
                          <Box component="span" sx={{ animation: "blink 1s infinite", ml: 0.5 }}>|</Box>
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                )}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />}
                  sx={{ 
                    borderStyle: "dashed", 
                    py: { xs: 1, md: 1.5 },
                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                    transform: currentStep === 4 ? "scale(1.05)" : "scale(1)",
                    bgcolor: currentStep === 4 ? "primary.50" : "transparent",
                    transition: "all 0.3s ease"
                  }}
                >
                  Add New Condition
                </Button>

                {promiseData.conditions.length === 0 && currentStep !== 4 && (
                  <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                    <DescriptionIcon sx={{ fontSize: { xs: 32, md: 48 }, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                      No conditions defined yet.
                    </Typography>
                  </Box>
                )}
              </Stack>

              {currentStep === 4 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 60,
                    height: 60,
                    border: "3px solid",
                    borderColor: "primary.main",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    animation: "clickPulse 2s infinite",
                    zIndex: 10
                  }}
                />
              )}
            </Box>
          </CardContent>

          {/* Final Lock Overlay */}
          {currentStep === 5 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(255,193,7,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1
              }}
            >
              <Box sx={{
                bgcolor: "rgba(255,255,255,0.95)",
                borderRadius: "50%",
                p: { xs: 2, md: 4 },
                boxShadow: 8,
                animation: "pulse 1s infinite"
              }}>
                <LockIcon sx={{ fontSize: { xs: 60, md: 100 }, color: "warning.main" }} />
              </Box>
            </Box>
          )}
        </Card>
      </Box>

      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          @keyframes clickPulse {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
            100% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </Box>
  );
};
export default ProgressiveTutorialDesktop;