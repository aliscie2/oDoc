import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  useMediaQuery,
  Stack,
  Paper,
  Divider,
  IconButton,
  SvgIcon,
} from "@mui/material";
import {
  Search,
  Analytics,
  Star,
  CheckCircle,
  TrendingUp,
  Speed,
  People,
  Work,
  SmartToy,
  Notifications,
  CalendarMonth,
  Code,
  Rocket,
} from "@mui/icons-material";
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import LOGOSVG from "@/components/creature/logoSVG";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useBackendContext } from "@/contexts/BackendContext";
import { useSelector } from "react-redux";

const DiscordIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
  </SvgIcon>
);
const XIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
     url: "https://x.com/icpjob",
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
   window.open("https://x.com/icpjob", "_blank", "noopener,noreferrer");
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
             ICPJobs.com
           </Typography>
           <Typography
             variant="body1"
             sx={{
               color: isDarkMode ? "#adb5bd" : "#6c757d",
               maxWidth: 400,
               mx: "auto",
             }}
           >
             AI-powered job matching for the ICP ecosystem. Find your perfect role or talent today.
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
           © {new Date().getFullYear()} ICPJobs.com. Made by oDoc.app team. All rights reserved.
         </Typography>
       </Box>
     </Container>
   </Box>
 );
};
const StatsSection = () => {
  const [stats, setStats] = useState({
    users: 0,
    jobs: 0,
    talents: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const { backendActor } = useBackendContext();
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const fetchStats = async () => {
      try {
        const response = await backendActor.get_sns_status();
        if (response.Ok) {
          const { number_users, jobs_count, talents_count } = response.Ok;

          const animateCount = (target, setter) => {
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                setter(Math.floor(target));
                clearInterval(timer);
              } else {
                setter(Math.floor(current));
              }
            }, 30);
          };

          animateCount(number_users, (val) => setStats(prev => ({ ...prev, users: val })));
          animateCount(jobs_count || 0, (val) => setStats(prev => ({ ...prev, jobs: val })));
          animateCount(talents_count || 0, (val) => setStats(prev => ({ ...prev, talents: val })));
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [isVisible, backendActor]);

  return (
    <Box
      ref={statsRef}
      sx={{
        width: "100%",
        p: 3,
        mb: 4,
        background: "linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(156,39,176,0.1) 100%)",
        borderRadius: 3,
      }}
    >
      <Grid container spacing={3} textAlign="center">
        {[
          { value: stats.users, label: "Active Users", icon: <People /> },
          { value: stats.jobs, label: "ICP Jobs", icon: <Work /> },
          { value: stats.talents, label: "ICP Talents", icon: <Code /> },
        ].map((stat, i) => (
          <Grid item xs={4} key={i}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              {stat.icon}
              <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                {stat.value.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const FeatureCard = ({ title, description, icon, features }) => (
  <Card sx={{ h: "100%", borderRadius: 3, p: 2 }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {icon}
        <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        {description}
      </Typography>
      <List dense>
        {features.map((feature, index) => (
          <ListItem key={index} sx={{ pl: 0 }}>
            <CheckCircle sx={{ color: "success.main", mr: 1, fontSize: 20 }} />
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

export default function ICPJobsLandingPage() {
  const isMobile = useMediaQuery("(max-width:900px)");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", py: 8, mb: 6 }}>
          <RunawayJellyfish
            LogoSvg={LOGOSVG}
            jellyfishOffsetX={-135}
            jellyfishOffsetY={5}
            scale={1.3}
          />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: "linear-gradient(45deg, #1976d2, #9c27b0)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ICPJobs.com
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
            AI-Powered Job Matching for the ICP Ecosystem
          </Typography>
          <Stack direction="row" spacing={1} sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1 }}>
            {["AI Matching", "ICP Focused", "Smart Calendar", "Instant Alerts"].map((label) => (
              <Chip key={label} label={label} variant="outlined" />
            ))}
          </Stack>
          <Box sx={{ mt: 4 }}>
            <StatsSection />
          </Box>
        </Box>

        {/* ICP Ecosystem Growth */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            The Fastest Growing Web3 Ecosystem
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Internet Computer Protocol is revolutionizing decentralized development
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                <Rocket sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" gutterBottom>40x Developer Growth</Typography>
                <Typography variant="body2" color="text.secondary">
                  Since 2018, full-time ICP developers grew 40x, making it one of the fastest-growing ecosystems
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                <ConnectWithoutContactIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" gutterBottom>30+ Job Boards</Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected to major crypto VC job boards specifically for Web3 professionals
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                <TrendingUp sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" gutterBottom>Developer's Haven</Typography>
                <Typography variant="body2" color="text.secondary">
                  A secure, scalable network that's attracting top talent from around the world
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Main Features */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Why Choose ICPJobs.com?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <FeatureCard
                title="AI Job Matching"
                description="Our advanced AI analyzes your skills and matches you with perfect ICP opportunities"
                icon={<SmartToy sx={{ color: "primary.main", fontSize: 30 }} />}
                features={[
                  "Intelligent skill matching algorithm",
                  "Personalized job recommendations",
                  "Cover letter generation",
                  "Resume optimization suggestions"
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FeatureCard
                title="Smart Calendar Integration"
                description="Talk to your calendar AI and never miss important meetings or deadlines"
                icon={<CalendarMonth sx={{ color: "primary.main", fontSize: 30 }} />}
                features={[
                  "AI-powered scheduling assistant",
                  "Meeting conflict detection",
                  "Automatic reminder system",
                  "Integration with popular calendar apps"
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FeatureCard
                title="Instant Notifications"
                description="Get alerted immediately when we find your perfect match"
                icon={<Notifications sx={{ color: "primary.main", fontSize: 30 }} />}
                features={[
                  "Real-time email alerts",
                  "High-quality match filtering",
                  "Spam prevention system",
                  "Customizable notification preferences"
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FeatureCard
                title="ICP-Focused Network"
                description="Exclusively designed for the Internet Computer Protocol ecosystem"
                icon={<Code sx={{ color: "primary.main", fontSize: 30 }} />}
                features={[
                  "Specialized ICP job board",
                  "Curated talent pool",
                  "Web3 and DeFi opportunities",
                  "Canister development roles"
                ]}
              />
            </Grid>
          </Grid>
        </Box>

        {/* How It Works */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Tell us about your ICP skills, experience, and career goals"
              },
              {
                step: "2",
                title: "AI Analysis",
                description: "Our AI analyzes your profile and the job market to find perfect matches"
              },
              {
                step: "3",
                title: "Get Matched",
                description: "If you find good match click on connect button or, wait to receive email notifications when high-quality matches are found"
              },
              {
                step: "4",
                title: "Schedule & Connect",
                description: "Use our smart calendar to schedule interviews and meetings"
              }
            ].map((item, index) => (
              <Grid item xs={12} md={3} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2
                    }}
                  >
                    <Typography variant="h5" color="white" fontWeight="bold">
                      {item.step}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: "center", py: 6, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Ready to Find Your Perfect ICP Role?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Join the fastest-growing Web3 ecosystem today
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            Built by the oDoc.app team - Connecting talent with opportunity in the ICP ecosystem
          </Typography>
        </Box>
      </Container>

      <PageFooter />
    </Box>
  );
}