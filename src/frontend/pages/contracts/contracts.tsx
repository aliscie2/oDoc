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
import React from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { CPayment, User } from "$/declarations/backend/backend.did";
import { custom_contract, randomString } from "@/DataProcessing/dataSamples";
import {
  ContractWithNotifications,
  useContractsNotifications,
} from "./useContractsNotifications";
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

// ContractCard Component - Simplified and Fixed
const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  profile,
  allFriends,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  if (!contract) return null;

  const promisesCount = contract.promises?.length || 0;
  const promisesAmount =
    contract.promises?.reduce(
      (sum: number, p: CPayment) => sum + p.amount,
      0,
    ) || 0;
  const paymentsCount = contract.payments?.length || 0;
  const paymentsAmount =
    contract.payments?.reduce(
      (sum: number, p: CPayment) => sum + p.amount,
      0,
    ) || 0;
  const unseenCount = contract._unseenCount;

  const promisesForYou =
    contract.promises?.filter(
      (p: CPayment) => p.receiver.toString() === profile.id,
    ) || [];
  const paymentsForYou =
    contract.payments?.filter(
      (p: CPayment) => p.receiver.toString() === profile.id,
    ) || [];
  const isShared = profile?.id !== contract.creator;

  return (
    <Fade in timeout={300}>
      <Box sx={{ position: "relative" }}>
        {unseenCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: -6,
              right: -6,
              zIndex: 10,
              background: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              borderRadius: "50%",
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
              boxShadow: `0 2px 6px ${theme.palette.error.main}40`,
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          >
            {unseenCount > 9 ? "9+" : unseenCount}
          </Box>
        )}

        <Card
          sx={{
            cursor: "pointer",
            transition: "all 0.2s ease",
            transform: isExpanded ? "translateY(-2px)" : "none",
            border:
              unseenCount > 0
                ? `2px solid ${theme.palette.error.main}`
                : `1px solid ${theme.palette.divider}`,
            boxShadow:
              unseenCount > 0
                ? `0 4px 12px ${theme.palette.error.main}30`
                : theme.palette.mode === "dark"
                  ? 1
                  : 0,
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow:
                unseenCount > 0
                  ? `0 6px 16px ${theme.palette.error.main}40`
                  : theme.palette.mode === "dark"
                    ? 3
                    : 2,
            },
          }}
          onClick={() =>
            navigate(
              createShortContractUrl({
                id: contract.id,
                owner: contract.creator?.toString() || "",
              }).replace(window.location.origin, ""),
            )
          }
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            {isShared &&
              (promisesForYou.length > 0 || paymentsForYou.length > 0) && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(58, 141, 255, 0.15)"
                        : "rgba(58, 141, 255, 0.08)",
                    border: `1px solid ${theme.palette.primary.main}40`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Your Summary
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {promisesForYou.length > 0 && (
                      <Chip
                        icon={<HandshakeIcon sx={{ fontSize: 14 }} />}
                        label={`${promisesForYou.length} • $${promisesForYou.reduce((s, p) => s + p.amount, 0)}`}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: "white",
                          fontSize: "0.7rem",
                          height: 24,
                          "& .MuiChip-icon": { color: "white" },
                        }}
                      />
                    )}
                    {paymentsForYou.length > 0 && (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                        label={`${paymentsForYou.length} • $${paymentsForYou.reduce((s, p) => s + p.amount, 0)}`}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.success.main,
                          color: "white",
                          fontSize: "0.7rem",
                          height: 24,
                          "& .MuiChip-icon": { color: "white" },
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              )}

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {contract.name || `Contract ${contract.id.slice(0, 8)}...`}
              </Typography>
              <Chip
                label={
                  isShared
                    ? allFriends.find((f) => f.id === contract.creator)?.name ||
                      "Shared"
                    : "Your Contract"
                }
                size="small"
                sx={{
                  bgcolor: isShared
                    ? theme.palette.info.main
                    : theme.palette.primary.main,
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  height: 22,
                }}
              />
            </Box>

            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HandshakeIcon sx={{ color: "white", fontSize: 18 }} />
                  <Typography variant="body2" fontWeight={500}>
                    Promises
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" fontWeight={600}>
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
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon
                    sx={{ fontSize: 18, color: "success.main" }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    Payments
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" fontWeight={600}>
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

// Main Component - Header and Layout Fixes
const ContractsHistory: React.FC = () => {
  const dispatch = useDispatch();
  const { profile, all_friends } = useSelector(
    (state: RootState) => state.filesState,
  );
  const {
    contracts: contractsList,
    loading,
    error,
    totalUnseenCount,
  } = useContractsNotifications();

  const handleCreateContract = () => {
    if (!profile) return;
    dispatch({
      type: "ADD_CONTRACT",
      contract: {
        ...custom_contract,
        id: randomString(),
        creator: profile.id,
        date_created: Date.now() * 1e6,
      },
    });
  };

  if (!profile) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          m: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Please login to continue
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 }, pb: 4 }}>
      <Helmet>
        <title>Agreements</title>
        <link rel="icon" type="image/png" href="/agreement.png" />
      </Helmet>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "error.light", borderRadius: 1 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      <Box sx={{ mt: { xs: 10, sm: 4 }, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 3,
            p: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2rem" } }}
            >
              Agreements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contractsList.length} contract
              {contractsList.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <Button
            onClick={handleCreateContract}
            variant="contained"
            startIcon={<AddIcon sx={{ color: "white" }} />}
            sx={{ fontWeight: 600, whiteSpace: "nowrap", minWidth: "auto" }}
          >
            New Contract
          </Button>
        </Box>
      </Box>

      {contractsList.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <HandshakeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No contracts yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first contract to get started
          </Typography>
          <Button
            onClick={handleCreateContract}
            variant="outlined"
            startIcon={<AddIcon sx={{ color: "white" }} />}
          >
            Create Contract
          </Button>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {contractsList.map((contract) => (
            <Grid key={contract.id} size={{ xs: 12, sm: 6, lg: 4 }}>
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
