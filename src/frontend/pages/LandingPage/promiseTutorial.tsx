import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import HandshakeIcon from "@mui/icons-material/Handshake";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

const styles = `
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
  @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(-5px); } 100% { opacity: 1; transform: translateY(0px); } }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const ProgressiveTutorialDesktop = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [promiseData, setPromiseData] = useState({
    amount: "",
    receiver: { name: "Select Receiver", avatar: "" },
    status: "Promise",
    conditions: [],
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [currentConditionIndex, setCurrentConditionIndex] = useState(-1);
  const [isTypingField, setIsTypingField] = useState(true);

  const steps = [
    { title: "Create Agreement" },
    { title: "Select Receiver" },
    { title: "Set Amount" },
    { title: "Choose Status" },
    { title: "Add Conditions" },
    { title: "Agreement Secured" },
  ];

  const dummyReceivers = [
    {
      name: "Carol Davis",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "David Wilson",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Emma Brown",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const statusOptions = [
    { value: "Promise", label: "🤝 Promise" },
    { value: "Escrow", label: "🔒 Escrow" },
    { value: "Released", label: "✅ Released" },
  ];

  const conditionTemplates = [
    {
      field: "Delivery_Date",
      value: "Product must be delivered by March 15th, 2024",
    },
    {
      field: "Quality_Standards",
      value:
        "Product must meet all agreed specifications and quality standards",
    },
  ];

  const typeText = useCallback((text, callback, speed = 100) => {
    setTypingText("");
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setTypingText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => callback?.(), 500);
      }
    }, speed);
    return timer;
  }, []);

  useEffect(() => {
    let timer;

    const stepActions = {
      0: () => {
        setPromiseData({
          amount: "",
          receiver: { name: "Select Receiver", avatar: "" },
          status: "Promise",
          conditions: [],
        });
        setShowDropdown(false);
        setShowStatusDropdown(false);
        setCurrentConditionIndex(-1);
        timer = setTimeout(() => setCurrentStep(1), 2000);
      },
      1: () => {
        timer = setTimeout(() => {
          setShowDropdown(true);
          setPromiseData((prev) => ({ ...prev, receiver: dummyReceivers[0] }));
          setTimeout(() => {
            setShowDropdown(false);
            setTimeout(() => setCurrentStep(2), 1000);
          }, 2000);
        }, 1000);
      },
      2: () => {
        timer = setTimeout(() => {
          typeText("500", () => {
            setPromiseData((prev) => ({ ...prev, amount: "500" }));
            setTimeout(() => setCurrentStep(3), 1000);
          });
        }, 1000);
      },
      3: () => {
        timer = setTimeout(() => {
          setShowStatusDropdown(true);
          setTimeout(() => {
            setPromiseData((prev) => ({ ...prev, status: "Escrow" }));
            setShowStatusDropdown(false);
            setTimeout(() => setCurrentStep(4), 1000);
          }, 2000);
        }, 1000);
      },
      4: () => {
        timer = setTimeout(() => {
          let conditionIndex = 0;
          const addNextCondition = () => {
            if (conditionIndex < conditionTemplates.length) {
              const currentTemplate = conditionTemplates[conditionIndex];
              setCurrentConditionIndex(conditionIndex);
              setIsTypingField(true);
              typeText(currentTemplate.field.replace(/_/g, " "), () => {
                setIsTypingField(false);
                typeText(
                  currentTemplate.value,
                  () => {
                    setPromiseData((prev) => ({
                      ...prev,
                      conditions: [
                        ...prev.conditions,
                        {
                          id: `${conditionIndex}_${Date.now()}`,
                          field: currentTemplate.field,
                          value: currentTemplate.value,
                        },
                      ],
                    }));
                    setCurrentConditionIndex(-1);
                    conditionIndex++;
                    conditionIndex < conditionTemplates.length
                      ? setTimeout(addNextCondition, 1000)
                      : setTimeout(() => setCurrentStep(5), 1500);
                  },
                  50,
                );
              });
            }
          };
          addNextCondition();
        }, 1000);
      },
      5: () => (timer = setTimeout(() => setCurrentStep(0), 4000)),
    };

    stepActions[currentStep]?.();
    return () => clearTimeout(timer);
  }, [currentStep, typeText]);

  const getFieldStyle = (step) => ({
    opacity: currentStep === step ? 1 : 0.3,
    transform: currentStep === step ? "scale(1.02)" : "scale(1)",
    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    filter:
      currentStep === step
        ? "drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))"
        : "none",
  });

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Progress Steps */}
      <Box sx={{ maxWidth: 900, mx: "auto", mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            gap: 1,
          }}
        >
          {steps.map((step, index) => (
            <Box key={index} sx={{ textAlign: "center", flex: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor:
                    index === currentStep
                      ? "primary.main"
                      : index < currentStep
                        ? "success.main"
                        : "grey.300",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1,
                  fontWeight: 600,
                  transform: index === currentStep ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.4s ease",
                  animation:
                    index === currentStep ? "pulse 2s infinite" : "none",
                }}
              >
                {index < currentStep ? "✓" : index + 1}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color:
                    index === currentStep
                      ? "primary.main"
                      : index < currentStep
                        ? "success.main"
                        : "text.secondary",
                  fontWeight: index === currentStep ? 600 : 400,
                }}
              >
                {step.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Card
          elevation={currentStep === 5 ? 12 : 3}
          sx={{
            border: "2px solid",
            borderColor: currentStep === 5 ? "success.main" : "grey.200",
            transform: currentStep === 5 ? "scale(1.03)" : "scale(1)",
            transition: "all 0.8s ease",
          }}
        >
          <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: "primary.main", mb: 2, textAlign: "center" }}
            >
              My crypto Agreement
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {/* Status Field */}
              <Box sx={getFieldStyle(3)}>
                <TextField
                  label="Status"
                  select
                  size="small"
                  value={promiseData.status}
                  disabled
                  sx={{ minWidth: 140 }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Receiver Field */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{ width: 36, height: 36, bgcolor: "primary.main" }}
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                >
                  Y
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  You
                </Typography>
                <Box sx={{ mx: 1 }}>→</Box>
                <Box sx={getFieldStyle(1)}>
                  <TextField
                    label="Receiver"
                    select
                    size="small"
                    value={promiseData.receiver.name}
                    disabled
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="Select Receiver">Select Receiver</MenuItem>
                    {dummyReceivers.map((receiver) => (
                      <MenuItem key={receiver.name} value={receiver.name}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            src={receiver.avatar}
                            sx={{ width: 24, height: 24 }}
                          >
                            {receiver.name[0]}
                          </Avatar>
                          {receiver.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>

              {/* Amount Field */}
              <Box
                sx={{
                  ...getFieldStyle(2),
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AccountBalanceWalletIcon color="success" fontSize="small" />
                <TextField
                  label="Amount"
                  size="small"
                  value={
                    currentStep === 2 ? typingText : promiseData.amount || "0"
                  }
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    },
                  }}
                  sx={{ minWidth: 100 }}
                />
              </Box>
            </Box>
          </Box>

          {/* Dropdowns */}
          {showDropdown && (
            <Box
              sx={{
                position: "absolute",
                top: "120px",
                right: "240px",
                zIndex: 1004,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 1,
                boxShadow: 3,
                minWidth: 200,
                animation: "fadeInUp 0.2s ease-out",
              }}
            >
              {dummyReceivers.map((receiver, index) => (
                <Box
                  key={receiver.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    bgcolor: index === 0 ? "primary.50" : "transparent",
                  }}
                >
                  <Avatar src={receiver.avatar} sx={{ width: 24, height: 24 }}>
                    {receiver.name[0]}
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: index === 0 ? 600 : 400 }}
                  >
                    {receiver.name}
                  </Typography>
                  {index === 0 && (
                    <Typography
                      variant="caption"
                      sx={{ ml: "auto", color: "primary.main" }}
                    >
                      ✓
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {showStatusDropdown && (
            <Box
              sx={{
                position: "absolute",
                top: "120px",
                left: "50px",
                zIndex: 1004,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 1,
                boxShadow: 3,
                minWidth: 180,
                animation: "fadeInUp 0.2s ease-out",
              }}
            >
              {statusOptions.map((option, index) => (
                <Box
                  key={option.value}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    bgcolor:
                      option.value === "Escrow" ? "warning.50" : "transparent",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: option.value === "Escrow" ? 600 : 400 }}
                  >
                    {option.label}
                  </Typography>
                  {option.value === "Escrow" && (
                    <Typography
                      variant="caption"
                      sx={{ ml: "auto", color: "warning.main" }}
                    >
                      ✓
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          <CardContent>
            <Box sx={getFieldStyle(4)}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <DescriptionIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Agreement Conditions
                </Typography>
                {currentStep === 4 && (
                  <Chip
                    label="Adding..."
                    size="small"
                    color="primary"
                    sx={{ ml: 2, animation: "pulse 1s infinite" }}
                  />
                )}
              </Box>

              {promiseData.conditions.length > 0 && (
                <List
                  sx={{ width: "100%", bgcolor: "background.paper", mb: 3 }}
                >
                  {promiseData.conditions.map((condition, index) => (
                    <Box
                      key={condition.id}
                      sx={{ animation: "fadeInUp 0.5s ease" }}
                    >
                      <ListItem>
                        <ListItemAvatar>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "success.main",
                              borderRadius: "50%",
                              color: "white",
                            }}
                          >
                            ✓
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600, color: "success.main" }}
                            >
                              {condition.field?.replace(/_/g, " ")}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", mt: 1 }}
                            >
                              {condition.value}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < promiseData.conditions.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </Box>
                  ))}
                </List>
              )}

              {promiseData.conditions.length === 0 && currentStep !== 4 && (
                <Box
                  sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
                >
                  <DescriptionIcon sx={{ fontSize: 64, opacity: 0.2, mb: 1 }} />
                  <Typography variant="body2">
                    No conditions defined yet.
                  </Typography>
                </Box>
              )}

              {currentStep === 4 && currentConditionIndex >= 0 && (
                <List
                  sx={{ width: "100%", bgcolor: "background.paper", mb: 3 }}
                >
                  <ListItem
                    sx={{
                      border: "2px dashed",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    <ListItemAvatar>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "primary.main",
                          borderRadius: "50%",
                          color: "white",
                          animation: "pulse 1s infinite",
                        }}
                      >
                        <AddIcon />
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          {isTypingField
                            ? `${typingText}|`
                            : conditionTemplates[
                                currentConditionIndex
                              ]?.field?.replace(/_/g, " ")}
                        </Typography>
                      }
                      secondary={
                        !isTypingField && (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", mt: 1 }}
                          >
                            {typingText}|
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                </List>
              )}
            </Box>
          </CardContent>

          {/* Success Overlay */}
          {currentStep === 5 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(34,197,94,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                animation: "fadeInUp 0.6s ease-out",
              }}
            >
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.95)",
                  borderRadius: "50%",
                  p: 4,
                  boxShadow: 12,
                  animation: "pulse 2s infinite",
                }}
              >
                <HandshakeIcon sx={{ fontSize: 100, color: "success.main" }} />
              </Box>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default ProgressiveTutorialDesktop;
