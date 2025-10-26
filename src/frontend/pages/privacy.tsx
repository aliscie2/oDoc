import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme,
  Link,
} from "@mui/material";
import {
  Security,
  Storage,
  Share,
  Delete,
  CalendarMonth,
  Shield,
  Info,
  Telegram,
} from "@mui/icons-material";
import XIcon from "@mui/icons-material/X";
import { Helmet } from "react-helmet-async";

const PrivacyPage = () => {
  const theme = useTheme();

  const sections = [
    {
      title: "Data We Access",
      icon: <Info color="primary" />,
      content: [
        "Google Calendar events and metadata",
        "Basic Google account information (name, email)",
        "Calendar permissions for read, write, update, and delete operations",
        "Event details including titles, descriptions, attendees, and timing",
      ],
    },
    {
      title: "How We Use Your Data",
      icon: <Security color="success" />,
      content: [
        "Automate meeting scheduling and calendar management",
        "Create, update, and delete calendar events on your behalf",
        "Sync job interviews and work-related meetings",
        "Provide AI-powered scheduling recommendations",
        "Send email notifications about calendar events",
      ],
    },
    {
      title: "Data Sharing",
      icon: <Share color="warning" />,
      content: [
        "We do NOT share your personal data with third parties",
        "We do NOT sell your information to advertisers",
        "Calendar data is only used for automation purposes",
        "Your Google account data remains private and secure",
      ],
    },
    {
      title: "Data Storage & Protection",
      icon: <Storage color="info" />,
      content: [
        "All data is encrypted in transit and at rest",
        "We use industry-standard security measures",
        "Access to your data is limited to essential operations only",
        "Regular security audits and monitoring",
      ],
    },
    {
      title: "Data Retention & Deletion",
      icon: <Delete color="error" />,
      content: [
        "You can revoke calendar access at any time through Google settings",
        "Account deletion removes all associated data within 30 days",
        "Calendar sync data is retained only while actively using the service",
        "Contact us to request immediate data deletion",
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy - {window.location.origin}</title>
        <meta
          name="description"
          content="Privacy policy for oDoc.app - Learn how we handle your Google Calendar data and protect your privacy."
        />
      </Helmet>

      <Box
        sx={{
          minHeight: "100vh",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 400,
                mb: 3,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                maxWidth: 800,
                mx: "auto",
                lineHeight: 1.6,
                color: "text.secondary",
              }}
            >
              We take your privacy seriously. This policy explains how we handle
              your data when you connect your Google Calendar to our platform.
            </Typography>
            <Chip
              label="Last Updated: December 2024"
              color="primary"
              variant="outlined"
              sx={{ mt: 2 }}
            />
          </Box>

          {/* Google Calendar Integration Notice */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 6,
              borderRadius: "16px",
              bgcolor: "action.hover",
              border: 1,
              borderColor: "primary.main",
              borderOpacity: 0.2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CalendarMonth
                sx={{ color: "primary.main", mr: 2, fontSize: 32 }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                }}
              >
                Google Calendar Integration
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              When you connect your Google Calendar to our platform, we gain
              access to your calendar data to provide automated scheduling
              services. This includes the ability to:
            </Typography>
            <List dense>
              {[
                "Read your existing calendar events",
                "Create new events for job interviews and meetings",
                "Update event details and scheduling",
                "Delete events when necessary",
                "Access event metadata (titles, descriptions, attendees)",
              ].map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Shield sx={{ fontSize: 16, color: "primary.main" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    slotProps={{
                      primary: {
                        variant: "body2",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Privacy Sections */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sections.map((section, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: "16px",
                  border: 1,
                  borderColor: "divider",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    elevation: 4,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  {section.icon}
                  <Typography
                    variant="h5"
                    sx={{
                      ml: 2,
                      fontWeight: 600,
                    }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                <List>
                  {section.content.map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        slotProps={{
                          primary: {
                            variant: "body1",
                            lineHeight: 1.6,
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))}
          </Box>

          {/* Contact Section */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mt: 6,
              textAlign: "center",
              borderRadius: "16px",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "success.dark"
                  : "success.light",
              border: 1,
              borderColor: "success.main",
              borderOpacity: 0.3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: 600,
              }}
            >
              Questions About Your Privacy?
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              If you have any questions about this privacy policy or how we
              handle your data, please don&apos;t hesitate to contact us.
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                mb: 3,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="https://t.me/odoc_ic"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textDecoration: "none",
                  color: "primary.main",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                <Telegram />
                <Typography variant="body1">Join our Telegram group</Typography>
              </Link>
              <Link
                href="https://x.com/odoc_ic"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textDecoration: "none",
                  color: "primary.main",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                <XIcon />
                <Typography variant="body1">Ask us on X</Typography>
              </Link>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontStyle: "italic" }}
            >
              We&apos;re committed to transparency and protecting your privacy
              every step of the way.
            </Typography>
          </Paper>

          <Divider sx={{ my: 6 }} />

          {/* Footer Note */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              This privacy policy is compliant with Google API Services User
              Data Policy and Google APIs Terms of Service.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default PrivacyPage;
