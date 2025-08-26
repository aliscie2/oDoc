import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Handshake as HandshakeIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fade,
  Grid2 as Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  CPayment,
  User,
} from "$/declarations/backend/backend.did";
import { custom_contract, randomString } from "@/DataProcessing/dataSamples";
import { ContractWithNotifications, useContractsNotifications } from "./useContractsNotifications";
import { RootState } from "@/redux/reducers";
import { createShortContractUrl } from "@/utils/urlEncoder";

// Personal Summary Component (for contracts shared with user)
interface PersonalSummaryProps {
  contract: ContractWithNotifications;
  profile: User;
}

const PersonalSummary: React.FC<PersonalSummaryProps> = ({
  contract,
  profile,
}) => {
  const theme = useTheme();

  const promisesForYou =
    contract.promises?.filter(
      (promise: CPayment) => promise.receiver.toString() === profile.id,
    ) || [];

  const paymentsForYou =
    contract.payments?.filter(
      (payment: CPayment) => payment.receiver.toString() === profile.id,
    ) || [];

  const promisesAmount = promisesForYou.reduce(
    (sum, promise) => sum + promise.amount,
    0,
  );
  const paymentsAmount = paymentsForYou.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  if (promisesForYou.length === 0 && paymentsForYou.length === 0) return null;

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.2)",
        color: theme.palette.primary.contrastText,
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, mb: 1, display: "block", opacity: 0.9 }}
      >
        Personal Summary
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {promisesForYou.length > 0 && (
          <Chip
            icon={<HandshakeIcon sx={{ fontSize: 14 }} />}
            label={`${promisesForYou.length} promises • $${promisesAmount}`}
            size="small"
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        )}
        {paymentsForYou.length > 0 && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
            label={`${paymentsForYou.length} received • $${paymentsAmount}`}
            size="small"
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

// Contract Card Component
interface ContractCardProps {
  contract: ContractWithNotifications;
  profile: User;
  allFriends: any[];
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  profile,
  allFriends,
}) => {
  console.log(`🎴 ContractCard rendering for ${contract.id}:`, {
    contractId: contract.id,
    source: contract._source,
    unseenCount: contract._unseenCount,
    creator: contract.creator,
    profileId: profile?.id,
  });

  const [isExpanded, setIsExpanded] = React.useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  if (!contract) return null;

  const promisesCount = contract.promises?.length || 0;
  const promisesAmount =
    contract.promises?.reduce(
      (sum: number, promise: CPayment) => sum + promise.amount,
      0,
    ) || 0;
  const paymentsCount = contract.payments?.length || 0;
  const paymentsAmount =
    contract.payments?.reduce(
      (sum: number, payment: CPayment) => sum + payment.amount,
      0,
    ) || 0;

  // Use the unseen count from the hook
  const unseenCount = contract._unseenCount;

  const handleClick = () => {
    navigate(
      createShortContractUrl({
        id: contract.id,
        owner: contract.creator?.toString() || "",
      }).replace(window.location.origin, ""),
    );
  };

  return (
    <Fade in timeout={300}>
      <Box sx={{ position: "relative" }}>
        {/* Notification Badge */}
        {unseenCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              zIndex: 10,
              background: "linear-gradient(135deg, #ff4444, #cc0000)",
              color: "white",
              borderRadius: "50%",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(255, 68, 68, 0.4)",
              border: "2px solid white",
            }}
          >
            {unseenCount > 9 ? "9+" : unseenCount}
          </Box>
        )}

        <Card
          sx={{
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isExpanded ? "translateY(-4px)" : "translateY(0)",
            position: "relative",
            overflow: "hidden",
            width: "100%",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border:
              unseenCount > 0
                ? "2px solid #ff4444"
                : "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 2,
            boxShadow:
              unseenCount > 0 ? "0 0 20px rgba(255, 68, 68, 0.3)" : "none",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow:
                unseenCount > 0
                  ? "0 8px 25px rgba(255, 68, 68, 0.4)"
                  : "0 8px 25px rgba(0, 0, 0, 0.15)",
            },
          }}
          onClick={handleClick}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Personal Summary for shared contracts */}
            {profile?.id !== contract.creator && (
              <PersonalSummary contract={contract} profile={profile} />
            )}

            {/* Contract Header */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                {contract.name || `Contract ${contract.id.slice(0, 8)}...`}
              </Typography>

              <Chip
                label={
                  profile?.id === contract.creator
                    ? "Created by you"
                    : allFriends.find((f) => f.id === contract.creator)
                        ?.name || "Shared with you"
                }
                size="small"
                variant="filled"
                sx={{
                  background:
                    profile?.id === contract.creator
                      ? `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                      : `linear-gradient(135deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                }}
              />
            </Box>

            {/* Contract Stats */}
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HandshakeIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Promises
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {promisesCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${promisesAmount}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon
                    sx={{ fontSize: 18, color: "success.main" }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Payments
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {paymentsCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${paymentsAmount}
                  </Typography>
                </Box>
              </Box>
            </Stack>


          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

// Main ContractsHistory Component
const ContractsHistory: React.FC = () => {
  const dispatch = useDispatch();
  const { profile, all_friends } = useSelector(
    (state: RootState) => state.filesState,
  );
  
  // Use the centralized contracts notifications hook
  const { contracts: contractsList, loading, error, totalUnseenCount } = useContractsNotifications();

  console.log(
    "ContractsHistory rendered with",
    contractsList.length,
    "contracts, total unseen:",
    totalUnseenCount
  );

  // Mark that user has visited contracts page
  useEffect(() => {
    localStorage.setItem("isVisitedContractsPage", "true");
  }, []);

  const handleCreateContract = () => {
    try {
      if (!profile) {
        throw new Error("Profile is not defined");
      }
      const newContract = {
        ...custom_contract,
        id: randomString(),
        creator: profile.id,
        date_created: Date.now() * 1e6,
      };
      dispatch({ type: "ADD_CONTRACT", contract: newContract });
    } catch (error) {
      console.error("Error creating new contract:", error);
    }
  };

  if (!profile) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 3,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          m: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Please login to see this page
        </Typography>
      </Box>
    );
  }

  // Show error if any
  if (error) {
    console.error("ContractsHistory error:", error);
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 } }}>
      <Helmet>
        <title>Agreements</title>
        <link rel="icon" type="image/png" href="/agreement.png" />
      </Helmet>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Error display */}
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "error.light", borderRadius: 1 }}>
          <Typography color="error">Error loading contracts: {error}</Typography>
        </Box>
      )}

      {/* Header */}
      <Box sx={{ mb: 4, mt: { xs: 8, sm: 4 }, pt: { xs: 2, sm: 0 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            p: 3,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 3,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}
            >
              Agreements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contractsList.length} contract
              {contractsList.length !== 1 ? "s" : ""} total
            </Typography>
          </Box>

          <Button
            onClick={handleCreateContract}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ fontWeight: 600, px: 3, py: 1.5 }}
          >
            New Contract
          </Button>
        </Box>
      </Box>

      {/* Contracts Grid */}
      {contractsList.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: 3,
            border: "2px dashed rgba(255, 255, 255, 0.2)",
          }}
        >
          <HandshakeIcon
            sx={{ fontSize: 48, color: "text.secondary", mb: 2, opacity: 0.5 }}
          />
          <Typography
            variant="h6"
            sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
          >
            No contracts yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first contract to get started with agreements
          </Typography>
          <Button
            onClick={handleCreateContract}
            variant="outlined"
            startIcon={<AddIcon />}
          >
            Create Contract
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {contractsList.map((contract) => (
            <Grid key={contract.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ContractCard
                contract={contract}
                profile={profile}
                allFriends={all_friends}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ContractsHistory;
