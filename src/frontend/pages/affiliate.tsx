import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme,
  Tooltip,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { ContentCopy, Star, Info, MonetizationOn } from "@mui/icons-material";
import { backendActor } from "@/utils/backendUtils";
import { useSelector } from "react-redux";
import { selectProfile } from "../redux/selectors";
import type {
  Affiliate,
  AffiliateStats,
  ReferralPayments,
} from "../../declarations/backend/backend.did";

// Separate components for better organization
const RewardSystemInfo = () => {
  const theme = useTheme();
  return (
    <Card sx={{ mt: 4, backgroundColor: theme.palette.background.paper }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          How Our Affiliate System Works
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <Info color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Persistent Tracking"
              secondary="When users click your affiliate link, your ID is stored in their browser for 30 days. You'll receive rewards even if they register later!"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Star color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Trust Score Rewards"
              secondary="Earn $10 for each referred user who achieves a trust score of 3+ stars"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <MonetizationOn color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Premium Subscription Commissions"
              secondary={
                <React.Fragment>
                  <Typography component="span" display="block">
                    • First 100 users: 50% of their payment
                  </Typography>
                  <Typography component="span" display="block">
                    • Lifetime commission: 15% of all subsequent payments
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

const StatsGrid = React.memo(({ stats }: { stats: AffiliateStats }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid item xs={12} sm={4}>
        <Card sx={{ backgroundColor: theme.palette.background.paper }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Earnings
            </Typography>
            <Typography variant="h4">
              ${(stats?.total_earnings ?? 0).toFixed(2)}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              From {stats?.total_referrals?.toString() ?? "0"} referrals
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card sx={{ backgroundColor: theme.palette.background.paper }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Referrals
            </Typography>
            <Typography variant="h4">
              {stats?.total_referrals?.toString() ?? "0"}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Active users referred
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card sx={{ backgroundColor: theme.palette.background.paper }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Trustworthy Users
            </Typography>
            <Typography variant="h4">
              {stats?.trusted_users?.toString() ?? "0"}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              3+ Star Rating
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

const PaymentHistory = React.memo(
  ({ earnings }: { earnings: ReferralPayments[] }) => {
    const theme = useTheme();

    return (
      <Card sx={{ mt: 4, backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {earnings?.length > 0 ? (
                  earnings.map((payment: ReferralPayments, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(payment.date_created).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        ${payment.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No payment history available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  },
);

const AffiliateDashboard = () => {
  const theme = useTheme();
  const [affiliateData, setAffiliateData] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const profile = useSelector(selectProfile);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchAffiliateData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await backendActor.get_affiliate_data(profile.id);

        if ("Ok" in response) {
          setAffiliateData(response.Ok);
        } else {
          setError(response.Err || "Failed to fetch affiliate data");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateData();
  }, [profile?.id]);

  const handleCopyLink = useCallback(async () => {
    if (!affiliateData?.id) return;

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/f?id=${affiliateData.id}`,
      );
      setCopySuccess(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to copy to clipboard";
      setError(errorMessage);
    }
  }, [affiliateData?.id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!affiliateData) {
    return (
      <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        <Alert severity="info">No affiliate data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom>
        Affiliate Dashboard
      </Typography>

      {/* Affiliate Link Card */}
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Affiliate Link
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{
                bgcolor: theme.palette.action.hover,
                p: 2,
                borderRadius: 1,
                flex: 1,
                fontFamily: "monospace",
              }}
            >
              {window.location.origin}/f?id={affiliateData?.id ?? ""}
            </Typography>
            <Tooltip title="Copy to clipboard">
              <IconButton onClick={handleCopyLink} color="primary">
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <StatsGrid stats={affiliateData.stats} />
      <RewardSystemInfo />
      <PaymentHistory earnings={affiliateData.earnings || []} />

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Affiliate link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AffiliateDashboard;
