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
  Container,
  Chip,
  useTheme,
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

interface KarmaItem {
  text: string;
  icon: React.ReactNode;
}

interface SectionCardProps {
  title: string;
  items: KarmaItem[];
  color: "error" | "success" | "warning" | "info";
  icon: React.ReactNode;
  gradient?: string;
}

const TrustBehaviorSystem = () => {
  const theme = useTheme();

  const SectionCard: React.FC<SectionCardProps> = ({
    title,
    items,
    color,
    icon,
    gradient,
  }) => (
    <Card
      sx={{
        height: "100%",
        mb: 0,
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        background:
          gradient ||
          `linear-gradient(135deg, ${theme.palette[color].light}15, ${theme.palette[color].main}08)`,
        border: `2px solid ${theme.palette[color].main}20`,
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
          borderRadius: "3px 3px 0 0",
        },
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 28px ${theme.palette[color].main}25`,
          border: `2px solid ${theme.palette[color].main}40`,
        },
      }}
    >
      <CardContent
        sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              mr: 2,
              width: 50,
              height: 50,
              boxShadow: `0 4px 12px ${theme.palette[color].main}40`,
              "& .MuiSvgIcon-root": {
                fontSize: "1.5rem",
              },
            }}
          >
            {icon}
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.mode === "dark" ? "white" : "text.primary",
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </Typography>
        </Box>
        <List
          dense
          sx={{ "& .MuiListItem-root": { borderRadius: 1 }, flex: 1 }}
        >
          {items.map((item: KarmaItem, index: number) => (
            <ListItem
              key={index}
              sx={{
                pl: 0,
                py: 1,
                borderRadius: 2,
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: `${color}.main`,
                  color: "white",
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                  "& .MuiTypography-root": {
                    color: "white",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: `${color}.main`,
                  minWidth: 40,
                  transition: "color 0.2s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
            fontWeight: 800,
            background: "linear-gradient(45deg, #2196F3, #21CBF3)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Karma System
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 600,
            mx: "auto",
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          Build trust and reputation through positive actions and behaviors
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            <SectionCard
              title="BAD BEHAVIOR"
              items={badBehaviors}
              color="error"
              icon={<Close />}
              gradient="linear-gradient(135deg, #ff5252, #f44336)"
            />
            <SectionCard
              title="PUNISHMENTS"
              items={punishments}
              color="error"
              icon={<ThumbDown />}
              gradient="linear-gradient(135deg, #e57373, #ef5350)"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            <SectionCard
              title="GOOD BEHAVIOR"
              items={goodBehaviors}
              color="success"
              icon={<CheckCircle />}
              gradient="linear-gradient(135deg, #66bb6a, #4caf50)"
            />
            <SectionCard
              title="REWARDS"
              items={rewards}
              color="success"
              icon={<ThumbUp />}
              gradient="linear-gradient(135deg, #81c784, #66bb6a)"
            />
          </Box>
        </Grid>
      </Grid>

      {/* Additional decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.05) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
    </Container>
  );
};

export default TrustBehaviorSystem;
