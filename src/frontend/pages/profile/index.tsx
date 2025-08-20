import React, { useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
  Box,
  Button,
  Card,
  CardContent,
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

import { formatRelativeTime } from "../../utils/time";
import EditProfile from "./editeProfile";
import CopyButton from "../../components/MuiComponents/copyButton";
import EmailComposer from "./sendEmail";
interface ProfilePageProps {
  profile: any;
  history: any;
  friends: any;
  friendButton: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  history,
  friends,
  friendButton,
}) => {
  const { isDarkMode } = useSelector((state) => state.uiState);
  const currentUser = useSelector((state) => state.filesState.profile);
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = currentUser?.id === profile?.id;
  const safeProfile = profile || {};
  const safeHistory = history || {};

  const {
    id = "",
    name = "Anonymous",
    description = "",
    email = "",
    photo = new Uint8Array(),
  } = safeProfile;

  const {
    rates_by_actions = [],
    rates_by_others = [],
    actions_rate = 0,
    users_rate = 0,
  } = safeHistory;

  const safeRatesByActions = Array.isArray(rates_by_actions)
    ? rates_by_actions
    : [];
  const safeRatesByOthers = Array.isArray(rates_by_others)
    ? rates_by_others
    : [];

  const actionRatingsData = safeRatesByActions.map((rating) => ({
    date: new Date(rating?.date || 0).toLocaleDateString(),
    rating: rating?.rating || 0,
    spent: rating?.spent || 0,
    received: rating?.received || 0,
    promises: rating?.promises || 0,
  }));

  const totalSpent = rates_by_actions[rates_by_actions.length - 1]?.spent;
  const totalReceived = rates_by_actions[rates_by_actions.length - 1]?.received;

  const chartOptions = {
    title: {
      text: "Actions history",
      fontSize: 18,
      color: isDarkMode ? "#ffffff" : "#000000",
    },
    data: actionRatingsData,
    background: { fill: isDarkMode ? "#1e1e1e" : "#fefefe" },
    theme: (isDarkMode ? "ag-dark" : "ag-default") as any,
    series: [
      {
        type: "line",
        xKey: "date",
        yKey: "rating",
        yName: "Rating",
        stroke: isDarkMode ? "#F44336" : "#D32F2F",
        marker: {
          enabled: true,
          fill: isDarkMode ? "#F44336" : "#D32F2F",
          stroke: isDarkMode ? "#ffffff" : "#000000",
        },
        tooltip: { enabled: true },
      },
      {
        type: "line",
        xKey: "date",
        yKey: "spent",
        yName: "Spent",
        stroke: isDarkMode ? "#4FC3F7" : "#0288D1",
        marker: {
          enabled: true,
          fill: isDarkMode ? "#4FC3F7" : "#0288D1",
          stroke: isDarkMode ? "#ffffff" : "#000000",
        },
        tooltip: { enabled: true },
      },
      {
        type: "line",
        xKey: "date",
        yKey: "received",
        yName: "Received",
        stroke: isDarkMode ? "#81C784" : "#388E3C",
        marker: {
          enabled: true,
          fill: isDarkMode ? "#81C784" : "#388E3C",
          stroke: isDarkMode ? "#ffffff" : "#000000",
        },
        tooltip: { enabled: true },
      },
      {
        type: "line",
        xKey: "date",
        yKey: "promises",
        yName: "Promises",
        stroke: isDarkMode ? "#FFD54F" : "#FBC02D",
        marker: {
          enabled: true,
          fill: isDarkMode ? "#FFD54F" : "#FBC02D",
          stroke: isDarkMode ? "#ffffff" : "#000000",
        },
        tooltip: { enabled: true },
      },
    ],
    axes: [
      {
        type: "category",
        position: "bottom",
        line: { color: isDarkMode ? "#aaaaaa" : "#000000" },
        tick: { color: isDarkMode ? "#aaaaaa" : "#000000" },
        label: { color: isDarkMode ? "#ffffff" : "#000000" },
      },
      {
        type: "number",
        position: "left",
        line: { color: isDarkMode ? "#aaaaaa" : "#000000" },
        tick: { color: isDarkMode ? "#aaaaaa" : "#000000" },
        label: { color: isDarkMode ? "#ffffff" : "#000000" },
      },
    ],
    legend: {
      position: "bottom",
      item: { label: { color: isDarkMode ? "#ffffff" : "#000000" } },
    },
  };

  const founderOfOdoc =
    "tgwpc-6xuon-k3a6y-ey7lt-xksjs-qx22h-ikhbt-4yp3a-6stco-rymbe-pqe";

  return (
    <Container key={JSON.stringify(profile)} maxWidth="lg" sx={{ py: 4 }}>
      {currentUser?.id == founderOfOdoc && <EmailComposer />}

      {/* User Header - Mobile Friendly */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-start" },
                gap: { xs: 2, sm: 3 },
                textAlign: { xs: "center", sm: "left" },
                ...(isEditing && {
                  px: { xs: 0, sm: 3 },
                  gap: { xs: 0, sm: 3 },
                  alignItems: { xs: "stretch", sm: "flex-start" },
                }),
              }}
            >
              {profile && !isEditing && (
                <UserAvatarMenu
                  hide={["Profile"]}
                  sx={{ width: { xs: 80, sm: 96 }, height: { xs: 80, sm: 96 } }}
                  user={profile}
                />
              )}

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  ...(isEditing && { width: "100%" }),
                }}
              >
                {isEditing ? (
                  <EditProfile
                    setIsEditing={setIsEditing}
                    profile={safeProfile}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <Stack spacing={1}>
                    <Typography
                      variant="h4"
                      sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
                    >
                      {name}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                    >
                      {email}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ wordBreak: "break-all" }}
                    >
                      {id}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {description}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      {friendButton}
                      <CopyButton
                        title="Copy Profile Link"
                        value={`${window.location.host}/user?id=${profile?.id}`}
                      />
                    </Box>
                  </Stack>
                )}
              </Box>
            </Box>

            {canEdit && !isEditing && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", sm: "flex-end" },
                }}
              >
                <Button
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                  size="small"
                >
                  Edit Profile
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: "Trust Score",
            value: actions_rate,
            rating: true,
            icon: "🛡️",
            color: "success",
          },
          {
            title: "User Rating",
            value: users_rate,
            rating: true,
            icon: "⭐",
            color: "warning",
          },
          {
            title: "Total Spent",
            value: `$${Number(totalSpent || 0)}`,
            icon: "💸",
            color: "error",
          },
          {
            title: "Total Received",
            value: `$${totalReceived?.toFixed(2) || 0}`,
            icon: "💰",
            color: "primary",
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                borderLeft: 4,
                borderColor: `${stat.color}.main`,
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
                  }}
                >
                  {stat.icon} {stat.title}
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
                    variant="h3"
                    color={`${stat.color}.main`}
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    {stat.value}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ height: { xs: 300, sm: 400 } }}>
            {actionRatingsData.length > 0 ? (
              <AgCharts options={chartOptions} />
            ) : (
              <Box
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="text.secondary">
                  No transaction history available
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Friends Section */}
      {friends.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Friends
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

      {/* Recent Ratings */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Ratings
          </Typography>
          {safeRatesByOthers.length > 0 ? (
            <Stack divider={<Divider />}>
              {safeRatesByOthers.slice(0, 5).map((rating, index) => (
                <Box key={rating?.id || index} py={2}>
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
                      sx={{ alignSelf: { xs: "flex-start", sm: "flex-end" } }}
                    >
                      {formatRelativeTime(rating?.date)}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box py={2} textAlign="center">
              <Typography color="text.secondary">
                No ratings available
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};
export default ProfilePage;
