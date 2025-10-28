import React, { useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import Friends from "./friends";
import { useSelector } from "react-redux";

import UserAvatarMenu from "../../components/MainComponents/UserAvatarMenu";
import ActivityLevelIcon from "../../components/MainComponents/topNavBar/ActivityLevelIcon";

import { formatRelativeTime } from "../../utils/time";
import EditProfile from "./editeProfile";
import CopyButton from "../../components/MuiComponents/copyButton";
import EmailComposer from "./sendEmail";
import { User, UserProfile } from "$/declarations/backend/backend.did";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProfilePageProps {
  profile: User;
  history: UserProfile;
  friends: User[];
  friendButton: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  history,
  friends,
  friendButton,
}) => {
  // IMPORTANT: All hooks must be called before any conditional returns.
  // React requires hooks to be called in the same order on every render.
  // Moving the early return above these hooks will break React's rules of hooks.
  const { isDarkMode } = useSelector((state: unknown) => state.uiState);
  const currentUser = useSelector((state: any) => state.filesState.profile);
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = currentUser?.id === profile?.id;
  const safeProfile = profile || {};
  const {
    rates_by_actions = [],
    rates_by_others = [],
    actions_rate = 0,
    users_rate = 0,
  } = history || {};

  const hasData = rates_by_actions.length > 0 || rates_by_others.length > 0;
  const latestAction = rates_by_actions[rates_by_actions.length - 1];
  const totalSpent = latestAction?.spent || 0;
  const totalReceived = latestAction?.received || 0;

  const founderOfOdoc =
    "tgwpc-6xuon-k3a6y-ey7lt-xksjs-qx22h-ikhbt-4yp3a-6stco-rymbe-pqe";

  // Early return after all hooks have been called
  if (!profile) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }
  return (
    <Container key={JSON.stringify(profile)} maxWidth="lg" sx={{ py: 4 }}>
      {currentUser?.id === founderOfOdoc && <EmailComposer />}

      <Card sx={{ mb: 4, borderRadius: 1 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-start" },
                gap: { xs: 3, sm: 4 },
              }}
            >
              {profile && !isEditing && (
                <UserAvatarMenu
                  variant="h4"
                  hide={["Profile"]}
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: { xs: 100, sm: 120 },
                  }}
                  user={profile}
                  forceDisplayName
                  displayDescription
                  displayId
                />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {isEditing && (
                  <EditProfile
                    setIsEditing={setIsEditing}
                    profile={safeProfile}
                    onCancel={() => setIsEditing(false)}
                  />
                )}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                pt: 2,
                borderTop: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              }}
            >
              {friendButton}
              <CopyButton
                title="Copy Profile Link"
                value={`${window.location.origin}/user?id=${profile?.id}`}
              />
              {canEdit && !isEditing && (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  variant="contained"
                  size="small"
                  sx={{ ml: "auto" }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {hasData && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  borderLeft: 3,
                  borderColor: "primary.main",
                  borderRadius: 1,
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    Activity Level
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 80,
                    }}
                  >
                    <ActivityLevelIcon level={actions_rate} size={64} />
                  </Box>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                    {actions_rate.toFixed(1)} / 5.0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {[
              {
                title: "Trust Score",
                value: actions_rate,
                rating: true,
                color: "success",
              },
              {
                title: "User Rating",
                value: users_rate,
                rating: true,
                color: "warning",
              },
              {
                title: "Total Spent",
                value: Number(totalSpent).toFixed(0),
                color: "error",
              },
              {
                title: "Total Received",
                value: Number(totalReceived).toFixed(0),
                color: "primary",
              },
            ].map((stat, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card
                  sx={{
                    height: "100%",
                    borderLeft: 3,
                    borderColor: `${stat.color}.main`,
                    borderRadius: 1,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}
                    >
                      {stat.title}
                    </Typography>
                    {stat.rating ? (
                      <Rating
                        value={stat.value}
                        precision={0.1}
                        readOnly
                        size="large"
                        sx={{ mb: 1 }}
                      />
                    ) : (
                      <Typography
                        variant="h4"
                        color={`${stat.color}.main`}
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        {stat.value}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {rates_by_actions.length > 0 && (
            <ProfileHistory
              actions={rates_by_actions}
              isDarkMode={isDarkMode}
            />
          )}

          {rates_by_others.length > 0 && (
            <Card sx={{ mt: 4, borderRadius: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Recent Ratings ({rates_by_others.length})
                </Typography>
                <Stack divider={<Divider />}>
                  {rates_by_others
                    .slice(-5)
                    .reverse()
                    .map((rating, idx) => (
                      <Box key={rating?.id || idx} py={2}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                          justifyContent="space-between"
                        >
                          <Box>
                            <Rating
                              value={rating?.rating || 0}
                              precision={0.1}
                              readOnly
                              size="small"
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              {rating?.comment || "No comment"}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              alignSelf: { xs: "flex-start", sm: "flex-end" },
                            }}
                          >
                            {formatRelativeTime(rating?.date)}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {friends.length > 0 && (
        <Card sx={{ mt: 4, borderRadius: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Friends ({friends.length})
            </Typography>
            <Friends
              currentUser={profile}
              friends={friends}
              onAcceptFriend={() => {}}
              onRejectFriend={() => {}}
              onCancelRequest={() => {}}
              onUnfriend={() => {}}
              onSendMessage={() => {}}
              onRateUser={() => {}}
            />
          </CardContent>
        </Card>
      )}

      {!hasData && (
        <Card sx={{ borderRadius: 1 }}>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Activity Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start interacting to build your profile history
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

const ProfileHistory: React.FC<{ actions: any[]; isDarkMode: boolean }> = ({
  actions,
  isDarkMode,
}) => {
  const recentActions = actions.slice(-10).reverse();

  // Determine time scale based on data range
  const timestamps = actions.map((a) => Number(a?.date || 0) / 1e6);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeRangeMs = maxTime - minTime;

  // Time ranges in milliseconds
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;

  // Determine appropriate format and grouping
  let formatDate: (ts: number) => string;
  let groupingKey: (ts: number) => string;

  if (timeRangeMs < HOUR) {
    formatDate = (ts) =>
      new Date(ts).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    groupingKey = (ts) =>
      new Date(ts).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
  } else if (timeRangeMs < DAY) {
    formatDate = (ts) =>
      new Date(ts).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    groupingKey = (ts) => {
      const d = new Date(ts);
      return `${d.getHours()}:00`;
    };
  } else if (timeRangeMs < WEEK) {
    formatDate = (ts) =>
      new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      });
    groupingKey = (ts) =>
      new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
  } else if (timeRangeMs < MONTH * 3) {
    formatDate = (ts) =>
      new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    groupingKey = (ts) =>
      new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
  } else {
    formatDate = (ts) =>
      new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    groupingKey = (ts) =>
      new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
  }

  // Group and aggregate data
  const dataMap = new Map<
    string,
    {
      date: string;
      rating: number[];
      spent: number;
      received: number;
      promises: number;
      count: number;
    }
  >();

  actions.forEach((a) => {
    const ts = Number(a?.date || 0) / 1e6;
    const key = groupingKey(ts);
    const display = formatDate(ts);

    if (!dataMap.has(key)) {
      dataMap.set(key, {
        date: display,
        rating: [],
        spent: 0,
        received: 0,
        promises: 0,
        count: 0,
      });
    }

    const entry = dataMap.get(key)!;
    entry.rating.push(a?.rating || 0);
    entry.spent += a?.spent || 0;
    entry.received += a?.received || 0;
    entry.promises += a?.promises || 0;
    entry.count += 1;
  });

  // Convert to chart data with averaged ratings
  const chartData = Array.from(dataMap.values()).map((d) => ({
    date: d.date,
    rating: Number(
      (d.rating.reduce((sum, r) => sum + r, 0) / d.rating.length).toFixed(2),
    ),
    spent: d.spent,
    received: d.received,
    promises: d.promises,
    transactions: d.count,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: isDarkMode ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)",
            p: 2,
            borderRadius: 1,
            border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`,
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
          {payload.map((entry: unknown, index: number) => (
            <Typography
              key={index}
              variant="caption"
              sx={{ color: entry.color, display: "block" }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <>
      <Card sx={{ mb: 4, borderRadius: 1 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Activity History ({actions.length} transaction
            {actions.length !== 1 ? "s" : ""})
          </Typography>
          <Box sx={{ height: { xs: 300, sm: 400 }, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                  }
                />
                <XAxis
                  dataKey="date"
                  stroke={isDarkMode ? "#fff" : "#000"}
                  angle={chartData.length > 5 ? -45 : 0}
                  textAnchor={chartData.length > 5 ? "end" : "middle"}
                  height={chartData.length > 5 ? 80 : 30}
                  tick={{ fill: isDarkMode ? "#fff" : "#000", fontSize: 12 }}
                />
                <YAxis
                  stroke={isDarkMode ? "#fff" : "#000"}
                  tick={{ fill: isDarkMode ? "#fff" : "#000", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: isDarkMode ? "#fff" : "#000" }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="spent"
                  name="Spent"
                  stroke={isDarkMode ? "#4FC3F7" : "#0288D1"}
                  strokeWidth={3}
                  dot={{ fill: isDarkMode ? "#4FC3F7" : "#0288D1", r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="received"
                  name="Received"
                  stroke={isDarkMode ? "#81C784" : "#388E3C"}
                  strokeWidth={3}
                  dot={{ fill: isDarkMode ? "#81C784" : "#388E3C", r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  name="Avg Rating"
                  stroke={isDarkMode ? "#F44336" : "#D32F2F"}
                  strokeWidth={3}
                  dot={{ fill: isDarkMode ? "#F44336" : "#D32F2F", r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          {chartData.length === 1 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", mt: 2 }}
            >
              All transactions occurred at the same time. More transactions will
              show trends over time.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Recent Transactions ({actions.length})
          </Typography>
          <Stack spacing={2}>
            {recentActions.map((action, idx) => {
              const actionTime = Number(action?.date || 0) / 1e6;
              const displayTime = new Date(actionTime).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Box
                  key={action?.id || idx}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: isDarkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.02)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {displayTime}
                      </Typography>
                      <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="caption" color="error.main">
                          Spent: {Number(action?.spent || 0).toFixed(0)}
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          Received: {Number(action?.received || 0).toFixed(0)}
                        </Typography>
                        {action?.promises > 0 && (
                          <Typography variant="caption" color="warning.main">
                            Promises: {action.promises}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    <Rating
                      value={action?.rating || 0}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

export default ProfilePage;
