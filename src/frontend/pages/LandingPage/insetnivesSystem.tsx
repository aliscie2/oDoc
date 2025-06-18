import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
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
  Gavel,
} from "@mui/icons-material";
import {
  badBehaviors,
  goodBehaviors,
  punishments,
  rewards,
} from "./landingPageData";

const TrustBehaviorSystem = () => {
  const SectionCard = ({ title, items, color, icon }) => (
    <Card sx={{ height: "100%", mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{ bgcolor: `${color}.main`, mr: 2, width: 40, height: 40 }}
          >
            {icon}
          </Avatar>
          <Typography
            variant="h6"
            sx={{ color: `${color}.main`, fontWeight: "bold" }}
          >
            {title}
          </Typography>
        </Box>
        <List dense>
          {items.map((item, index) => (
            <ListItem key={index} sx={{ pl: 0 }}>
              <ListItemIcon sx={{ color: `${color}.main`, minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: "auto" }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ mb: 3, fontWeight: "bold" }}
      >
        oDoc Karma metrix
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <SectionCard
            title="PUNISHMENTS"
            items={punishments}
            color="error"
            icon={<ThumbDown />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <SectionCard
            title="REWARDS"
            items={rewards}
            color="success"
            icon={<ThumbUp />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <SectionCard
            title="BAD BEHAVIOR"
            items={badBehaviors}
            color="error"
            icon={<Close />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <SectionCard
            title="GOOD BEHAVIOR"
            items={goodBehaviors}
            color="success"
            icon={<CheckCircle />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrustBehaviorSystem;
