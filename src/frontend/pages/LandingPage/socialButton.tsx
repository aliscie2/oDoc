import React from "react";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import {
  IconButton,
  SvgIcon,
  Typography,
  Box,
  Container,
  Divider,
} from "@mui/material";
import { useSelector } from "react-redux";

const XIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </SvgIcon>
);

const DiscordIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
  </SvgIcon>
);

const PageFooter = () => {
  const { isDarkMode } = useSelector((state) => state.uiState);

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/aliscie2/oDoc",
      icon: GitHubIcon,
      color: isDarkMode ? "#24292e" : "#1f2328",
    },
    {
      name: "X",
      url: "https://x.com/odoc_ic",
      icon: XIcon,
      color: "#000000",
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@odocic",
      icon: YouTubeIcon,
      color: isDarkMode ? "#FF0000" : "#dc2626",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/odoc_ic",
      icon: InstagramIcon,
      color: isDarkMode ? "#E4405F" : "#db2777",
    },
    {
      name: "Discord",
      url: "https://discord.gg/uxMJHBk8",
      icon: DiscordIcon,
      color: isDarkMode ? "#5865F2" : "#4f46e5",
    },
  ];

  const handleClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleContactClick = () => {
    window.open("https://x.com/odoc_ic", "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: isDarkMode ? "#1a1a1a" : "#f8f9fa",
        borderTop: `1px solid ${isDarkMode ? "#333" : "#e9ecef"}`,
        mt: "auto",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          {/* Brand/Logo Section */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: "2rem",
                fontWeight: "bold",
                mb: 1,
                color: isDarkMode ? "#fff" : "#212529",
              }}
            >
              oDoc
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: isDarkMode ? "#adb5bd" : "#6c757d",
                maxWidth: 400,
                mx: "auto",
              }}
            >
              Connect with us and stay updated on our latest projects and
              updates
            </Typography>
          </Box>

          {/* Social Links */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <IconButton
                  key={social.name}
                  onClick={() => handleClick(social.url)}
                  aria-label={`Visit our ${social.name}`}
                  sx={{
                    width: 48,
                    height: 48,
                    background: social.color,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      background: social.color,
                      transform: "scale(1.1)",
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0,0,0,0.3)"
                        : "0 4px 12px rgba(0,0,0,0.15)",
                      "& .MuiSvgIcon-root": {
                        transform: "rotate(12deg)",
                      },
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#fff",
                      transition: "transform 0.3s ease-in-out",
                      fontSize: social.name === "X" ? 20 : 24,
                    },
                  }}
                >
                  <Icon />
                </IconButton>
              );
            })}
          </Box>

          {/* Contact Section */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? "#adb5bd" : "#6c757d",
                mb: 1,
              }}
            >
              Have questions or want to get in touch?
            </Typography>
            <Typography
              variant="body2"
              onClick={handleContactClick}
              sx={{
                color: isDarkMode ? "#4fc3f7" : "#0d6efd",
                cursor: "pointer",
                textDecoration: "underline",
                "&:hover": {
                  color: isDarkMode ? "#29b6f6" : "#0a58ca",
                },
              }}
            >
              Contact us on Twitter
            </Typography>
          </Box>

          <Divider
            sx={{
              width: "100%",
              bgcolor: isDarkMode ? "#333" : "#dee2e6",
            }}
          />

          {/* Copyright */}
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? "#6c757d" : "#868e96",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} oDoc. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PageFooter;
