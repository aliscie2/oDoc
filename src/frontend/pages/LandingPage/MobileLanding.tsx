
import { backendActor } from "@/utils/backendUtils";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import {
  AttachMoney, BarChart, CheckCircle as CheckCircleIcon, Email, Handshake as HandshakeIcon,
  Instagram, LinkedIn, Lock, Notifications, Search, SmartToy, Star, Telegram, Work, YouTube
} from "@mui/icons-material";
import DiscordIcon from "@mui/icons-material/Forum";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  Avatar, Badge, Box, Card, Chip, Container, Divider,
  Fade,
  IconButton,
  Stack, SvgIcon, Tooltip, Typography, useTheme
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

const XIcon = (props: unknown) => (
  <SvgIcon {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </SvgIcon>
);

const TikTokIcon = (props: unknown) => (
  <SvgIcon {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </SvgIcon>
);

const getButtonStyles = (theme) => ({
  px: 3, py: 1.5, fontSize: "0.95rem", fontWeight: 600,
  background: theme.palette.mode === "dark"
    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
    : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  borderRadius: "28px", textTransform: "none", color: "#ffffff", border: "none",
  boxShadow: theme.palette.mode === "dark" ? `0 4px 16px ${theme.palette.primary.main}40` : `0 2px 12px ${theme.palette.primary.main}25`,
  "&:active": {
    background: theme.palette.mode === "dark"
      ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
      : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: "scale(0.98)"
  },
  transition: "all 0.2s ease",
  minHeight: "44px", minWidth: "44px"
});


const EmailNotificationsStep = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, fontSize: "2rem", textAlign: "center" }}>
          Email Alerts
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, textAlign: "center", fontSize: "0.95rem" }}>
          Get notified when new opportunities match your profile
        </Typography>
        <Card sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "center", gap: 1 }}>
            <Badge badgeContent={2} sx={{ "& .MuiBadge-badge": { backgroundColor: theme.palette.error.main } }}>
              <Email sx={{ fontSize: 20, color: theme.palette.primary.main }} />
            </Badge>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Job Alerts</Typography>
          </Box>
          {[
            { subject: "AI Developer Match", time: "2m" },
            { subject: "Co-founder Opportunity", time: "1h" }
          ].map((email, index) => (
            <Box key={index} sx={{ px: 2, py: 1.5, borderBottom: index === 0 ? `1px solid ${theme.palette.divider}` : "none" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>{email.subject}</Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{email.time}</Typography>
              </Box>
            </Box>
          ))}
        </Card>
      </Container>
    </Box>
  );
};

const CalendarStep = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, fontSize: "2rem", textAlign: "center" }}>
          Smart Calendar
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, textAlign: "center", fontSize: "0.95rem" }}>
          Chat with your calendar to set availability
        </Typography>
        <Card sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "grey.100", borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              I am available Mon-Fri 9 AM - 1 PM
            </Typography>
          </Box>
          <Stack spacing={1}>
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, p: 1, bgcolor: theme.palette.mode === "dark" ? `rgba(76, 175, 80, ${0.1 + i * 0.05})` : `rgba(76, 175, 80, ${0.15 + i * 0.05})`,
                borderRadius: 1, border: `1px solid ${theme.palette.success.main}40` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 30, fontSize: "0.85rem" }}>{day}</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>9-1</Typography>
              </Box>
            ))}
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

const CryptoAgreementStep = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, fontSize: "2rem", textAlign: "center" }}>
          Crypto Agreement
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, textAlign: "center", fontSize: "0.95rem" }}>
          Secure blockchain agreements with escrow
        </Typography>
        <Card sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <HandshakeIcon sx={{ fontSize: 22, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>Agreement Details</Typography>
          </Box>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Amount</Typography>
              <Typography variant="h5" fontWeight="bold">500 USDC</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Receiver</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32 }} src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face">JS</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>John Smith</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Senior ICP Developer</Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Staking Time</Typography>
              <Typography variant="body1" fontWeight={600}>30 days</Typography>
            </Box>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

const CryptoAgreementProofsStep = () => {
  const theme = useTheme();
  const proofs = [
    { title: "Proof of Existence", subtitle: "Deposit funds first", icon: <AttachMoney sx={{ fontSize: "2rem" }} /> },
    { title: "Proof of Stake", subtitle: "Build trust upfront", icon: <Lock sx={{ fontSize: "2rem" }} /> },
    { title: "Proof of Cap", subtitle: "Smart limits", icon: <BarChart sx={{ fontSize: "2rem" }} /> },
    { title: "Proof of Reputation", subtitle: "Transparent record", icon: <Star sx={{ fontSize: "2rem" }} /> }
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h3" sx={{ mb: 3, fontWeight: 600, fontSize: "2rem", textAlign: "center" }}>
          Agreement Proofs
        </Typography>
        <Stack spacing={1.5}>
          {proofs.map((proof, index) => (
            <Card key={index} sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ color: "primary.main" }}>{proof.icon}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>{proof.title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: "0.85rem" }}>{proof.subtitle}</Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};



const ProjectManagementStep = () => {
  const theme = useTheme();
  const [currentContract, setCurrentContract] = useState(0);
  const [animatingPromises, setAnimatingPromises] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [promiseCount, setPromiseCount] = useState(3);
  const [promiseAmount, setPromiseAmount] = useState(1500);

  const contracts = [
    { id: "1", name: "AI Agent Development", status: "Active", promises: 3, amount: 1500, payments: 1, paidAmount: 500, creator: "Sarah Chen", role: "Project Manager",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
    { id: "2", name: "ICP Canister Integration", status: "Pending", promises: 2, amount: 2000, payments: 0, paidAmount: 0, creator: "Alex Rodriguez", role: "Tech Lead",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentContract((prev) => (prev + 1) % contracts.length);
      setAnimatingPromises(true);
      setPromiseCount((prev) => (prev === 3 ? 2 : 3));
      setPromiseAmount((prev) => (prev === 1500 ? 2000 : 1500));
      setNotificationVisible(true);
      setTimeout(() => { setAnimatingPromises(false); setNotificationVisible(false); }, 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <SmartToy sx={{ fontSize: "1.25rem" }} />, text: "Smart tasks" },
    { icon: <AttachMoney sx={{ fontSize: "1.25rem" }} />, text: "Auto payments" },
    { icon: <BarChart sx={{ fontSize: "1.25rem" }} />, text: "Analytics" },
    { icon: <Notifications sx={{ fontSize: "1.25rem" }} />, text: "Real-time alerts" }
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, fontSize: "2rem", textAlign: "center" }}>
          Project Management
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, textAlign: "center", fontSize: "0.95rem" }}>
          AI-powered team and payment management
        </Typography>
        <CardAlertAnimation 
          contract={contracts[currentContract]}
          notificationVisible={notificationVisible}
          animatingPromises={animatingPromises}
          currentContract={currentContract}
          promiseCount={promiseCount}
          promiseAmount={promiseAmount}
          mobile
        />
        <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <Box sx={{ color: "primary.main" }}>{feature.icon}</Box>
              <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>{feature.text}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

const CardAlertAnimation = ({ contract, notificationVisible, animatingPromises, currentContract, promiseCount, promiseAmount, mobile }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ position: "relative", width: "100%", mx: mobile ? 0 : "auto", maxWidth: mobile ? "100%" : 350 }}>
      <Fade in={notificationVisible} timeout={500}>
        <Box sx={{ position: "absolute", top: -8, right: -8, zIndex: 10, background: "linear-gradient(135deg, #ff4444, #cc0000)", color: "white",
          borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem",
          fontWeight: 700, border: "2px solid white", animation: "bounce 0.5s ease-in-out",
          "@keyframes bounce": { "0%": { transform: "scale(0)" }, "50%": { transform: "scale(1.2)" }, "100%": { transform: "scale(1)" } } }}>
          {currentContract + 1}
        </Box>
      </Fade>
      <Card sx={{ p: mobile ? 2 : 3, borderRadius: mobile ? 2 : 3, 
        border: notificationVisible ? "2px solid #ff4444" : `1px solid ${mobile ? theme.palette.divider : 'rgba(255, 255, 255, 0.2)'}`,
        transition: "all 0.3s", transform: animatingPromises ? "scale(1.02)" : "scale(1)" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: mobile ? "1.1rem" : "1.25rem", mb: 1 }}>{contract.name}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: mobile ? 28 : 32, height: mobile ? 28 : 32 }} src={contract.avatar}>
              {contract.creator.split(" ").map((n) => n[0]).join("")}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: mobile ? "0.85rem" : "0.875rem" }}>{contract.creator}</Typography>
              <Typography variant="caption" sx={{ fontSize: mobile ? "0.75rem" : "0.75rem" }}>{contract.role}</Typography>
            </Box>
          </Box>
        </Box>
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: mobile ? 1 : 2, 
            border: `1px solid ${mobile ? theme.palette.divider : 'rgba(255, 255, 255, 0.2)'}`,
            transition: "all 0.5s", transform: animatingPromises ? "scale(1.05)" : "scale(1)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HandshakeIcon sx={{ fontSize: mobile ? 16 : 18, color: "primary.main" }} />
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: mobile ? "0.85rem" : "0.875rem" }}>Promises</Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: mobile ? "0.85rem" : "0.875rem", color: animatingPromises ? "primary.main" : "text.primary" }}>
                {promiseCount}
              </Typography>
              <Typography variant="caption" sx={{ color: animatingPromises ? "primary.main" : "text.secondary" }}>${promiseAmount}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: mobile ? 1 : 2, 
            border: `1px solid ${mobile ? theme.palette.divider : 'rgba(255, 255, 255, 0.2)'}` }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon sx={{ fontSize: mobile ? 16 : 18, color: "success.main" }} />
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: mobile ? "0.85rem" : "0.875rem" }}>Payments</Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: mobile ? "0.85rem" : "0.875rem" }}>{contract.payments}</Typography>
              <Typography variant="caption">${contract.paidAmount}</Typography>
            </Box>
          </Box>
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Chip label={contract.status} size="small" 
            sx={{ background: contract.status === "Active" ? "linear-gradient(135deg, #4caf50, #2e7d32)" : "linear-gradient(135deg, #ff9800, #f57c00)",
              color: "white", fontWeight: 500 }} />
        </Box>
      </Card>
    </Box>
  );
};


const SimpleFooter = () => {
  const socialLinks = [
    { name: "GitHub", icon: GitHubIcon, url: "https://github.com/aliscie2/oDoc" },
    { name: "X", icon: XIcon, url: "https://x.com/odoc_ic" },
    { name: "YouTube", icon: YouTube, url: "https://www.youtube.com/@odoc_ic" }
  ];

  return (
    <Box component="footer" sx={{ py: 3, backgroundColor: "background.paper", borderTop: "1px solid", borderColor: "divider" }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>{window.location.hostname}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, fontSize: "0.8rem" }}>AI job matching • Smart contracts</Typography>
        </Box>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Box key={social.name} sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", opacity: 0.6, "&:active": { opacity: 1 } }}
                onClick={() => window.open(social.url, "_blank")}>
                <Icon sx={{ fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>{social.name}</Typography>
              </Box>
            );
          })}
        </Stack>
        <Divider sx={{ mb: 2, opacity: 0.2 }} />
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="caption" sx={{ opacity: 0.5, fontSize: "0.7rem" }}>© {new Date().getFullYear()} oDoc.app</Typography>
        </Box>
      </Container>
    </Box>
  );
};

const SEOComponent = () => {
  const seoData = {
    title: `${window.location.hostname} - ICP Jobs & Blockchain Developer Careers | AI Job Matching`,
    description: "Find blockchain developer jobs, ICP careers, and Web3 talent. AI-powered job matching platform for Internet Computer Protocol ecosystem.",
    keywords: "ICP jobs, blockchain developer jobs, Web3 jobs, Internet Computer Protocol jobs, smart contract developer, Rust developer",
    structuredData: {
      "@context": "https://schema.org", "@type": "WebSite", name: window.location.hostname, url: window.location.origin,
      description: "AI-powered job matching platform for blockchain developers and Web3 talent",
      potentialAction: { "@type": "SearchAction", target: `${window.location.origin}/search?q={search_term_string}`, "query-input": "required name=search_term_string" }
    }
  };

  return (
    <Helmet>
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <link rel="canonical" href={window.location.href} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={`${window.location.origin}/thumbnail.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={`${window.location.origin}/thumbnail.png`} />
      <script type="application/ld+json">{JSON.stringify(seoData.structuredData)}</script>
    </Helmet>
  );
};

const FAQSection = () => {
  const faqs = [
    { q: "How does AI job matching work?", a: "Our AI analyzes your skills to match you with relevant ICP projects and Web3 companies." },
    { q: "What jobs are available?", a: "Rust developers, Web3 developers, blockchain architects, and technical leads." },
    { q: "How do crypto agreements work?", a: "Secure blockchain agreements with escrow, milestones, and automated payments." },
    { q: "Is it free?", a: "Yes, job seekers can create profiles and apply completely free." }
  ];

  const structuredFAQ = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } }))
  };

  return <Helmet><script type="application/ld+json">{JSON.stringify(structuredFAQ)}</script></Helmet>;
};


const SocialMediaShare = () => {
  const socials = [
    { icon: Telegram, color: "#0088cc", url: "https://t.me/odoc_ic" },
    { icon: XIcon, color: "#000000", url: "https://x.com/odoc_ic" },
    { icon: DiscordIcon, color: "#5865F2", url: "https://discord.gg/HbaFQXDD" },
    { icon: YouTube, color: "#FF0000", url: "https://www.youtube.com/@odoc_ic" },
    { icon: Instagram, color: "#E4405F", url: "https://www.instagram.com/odoc_ic" },
    { icon: TikTokIcon, color: "#000000", url: "https://www.tiktok.com/@odoc.app" },
    { icon: LinkedIn, color: "#0A66C2", url: "https://www.linkedin.com/company/odocic" }
  ];

  return (
    <Box sx={{ py: 4, bgcolor: 'background.paper' }}>
      <Container maxWidth="sm">
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}>Join Our Community</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, maxWidth: 320, mx: 'auto' }}>
          {socials.map(({ icon: Icon, color, url }, i) => (
            <IconButton key={i} onClick={() => window.open(url, "_blank")}
              sx={{ bgcolor: color, color: "white", width: 56, height: 56, '&:active': { opacity: 0.8 } }}>
              <Icon sx={{ fontSize: 24 }} />
            </IconButton>
          ))}
        </Box>
      </Container>
    </Box>
  );
};



const HeroWithDemo = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ users: 0, jobsCount: 0, talentsCount: 0 });
  const [displayStats, setDisplayStats] = useState({ users: 0, jobsCount: 0, talentsCount: 0 });
  const [activeFeature, setActiveFeature] = useState<'match' | 'calendar' | 'contract' | null>(null);
  const scrollRef = useRef(null);

  const candidatePhotos = ['https://i.pravatar.cc/150?img=47', 'https://i.pravatar.cc/150?img=13', 'https://i.pravatar.cc/150?img=32'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snsResponse = await backendActor.get_sns_status();
        if (snsResponse.Ok) {
          const { number_users, jobs_count, talents_count } = snsResponse.Ok;
          setStats({
            users: Math.floor(number_users),
            jobsCount: Math.floor(jobs_count),
            talentsCount: Math.floor(talents_count),
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const animateValue = (key: keyof typeof stats) => {
      const target = stats[key];
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(current + increment, target);
        setDisplayStats((prev) => ({ ...prev, [key]: Math.floor(current) }));
        if (step >= steps || current >= target) {
          setDisplayStats((prev) => ({ ...prev, [key]: target }));
          clearInterval(timer);
        }
      }, stepDuration);
      return timer;
    };

    if (stats.users > 0 || stats.jobsCount > 0 || stats.talentsCount > 0) {
      const timers = [animateValue("users"), animateValue("jobsCount"), animateValue("talentsCount")];
      return () => timers.forEach((timer) => clearInterval(timer));
    }
  }, [stats]);

  useEffect(() => {
    const sequence = [
      { id: 1, type: 'user', text: 'Find full-stack developers', delay: 0, feature: 'match' },
      { id: 2, type: 'bot', text: 'Found 3 candidates', delay: 1200, feature: 'match', candidates: [
        { name: 'Sarah Chen', skills: 'React • Node • Web3', rate: '$120/hr', avatar: candidatePhotos[0] },
        { name: 'Alex Kumar', skills: 'Python • Django • AWS', rate: '$110/hr', avatar: candidatePhotos[1] },
        { name: 'Maria Silva', skills: 'Vue • PHP • Docker', rate: '$105/hr', avatar: candidatePhotos[2] }
      ]},
      { id: 3, type: 'user', text: 'Find a suitable time to meet Sarah', delay: 2000, feature: 'calendar' },
      { id: 4, type: 'bot', text: '', delay: 1200, feature: 'calendar', meeting: { time: 'Tomorrow 9 AM', attendees: 'You & Sarah Chen' } },
      { id: 5, type: 'user', text: 'Make $100 escrow for Sarah', delay: 2000, feature: 'contract' },
      { id: 6, type: 'bot', text: '', delay: 1200, feature: 'contract', contract: { amount: '$100', recipient: 'Sarah Chen', type: 'Full-Stack Dev Contract' } }
    ];

    const runSequence = () => {
      setMessages([]);
      setActiveFeature(null);
      let timeoutIds = [];
      let totalDelay = 0;

      sequence.forEach((msg) => {
        totalDelay += msg.delay;
        const timeoutId = setTimeout(() => {
          setMessages(prev => [...prev, msg]);
          setActiveFeature(msg.feature);
        }, totalDelay);
        timeoutIds.push(timeoutId);
      });

      const loopTimeout = setTimeout(() => runSequence(), totalDelay + 2000);
      timeoutIds.push(loopTimeout);
      return () => timeoutIds.forEach(id => clearTimeout(id));
    };

    return runSequence();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);


  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6, position: "relative", overflow: "hidden" }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h2" sx={{ fontSize: "2.5rem", fontWeight: 400, mb: 2, lineHeight: 1.2 }}>
            Your AI<br />
            <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>Personal Secretary</Box>
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, fontSize: "1rem", lineHeight: 1.6, px: 2 }}>
            Find talent, schedule meetings, manage payments - all in one chat
          </Typography>
        </Box>

        <Box sx={{ position: "relative", mb: 4 }}>

          <Box sx={{ 
            width: '100%', 
            height: 400, 
            display: 'flex', 
            flexDirection: 'column', 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 3, 
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)', 
            backdropFilter: 'blur(10px)',
            boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.08)'
          }}>
            <Box ref={scrollRef} sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5,
              '&::-webkit-scrollbar': { width: 5 }, 
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 } 
            }}>
              {messages.map((msg, index) => (
                <Fade key={msg.id} in timeout={400}>
                  <Box sx={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.type === 'bot' ? (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '90%' }}>
                        <Avatar src={["/job.png","","/calendar.png"][index-1]||"/contract.png"} sx={{ width: 32, height: 32, mt: 0.5 }} />
                        <Box>
                          {msg.text && (
                            <Box sx={{ 
                              px: 2, 
                              py: 1, 
                              bgcolor: 'transparent', 
                              border: 1, 
                              borderColor: 'divider', 
                              borderRadius: 2.5,
                              mb: msg.candidates || msg.meeting || msg.contract ? 1 : 0 
                            }}>
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{msg.text}</Typography>
                            </Box>
                          )}
                          {msg.candidates && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {msg.candidates.map((c, i) => (
                                <Box key={i} sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1, 
                                  px: 1.5, 
                                  py: 0.75, 
                                  borderRadius: 2,
                                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                  border: 1,
                                  borderColor: 'divider'
                                }}>
                                  <Avatar src={c.avatar} sx={{ width: 28, height: 28 }} />
                                  <Box>
                                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{c.name}</Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'success.main', fontWeight: 500, display: 'block' }}>95% match</Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                          {msg.meeting && (
                            <Box sx={{ 
                              p: 1.5, 
                              borderRadius: 2, 
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                              border: 1, 
                              borderColor: 'success.main' 
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                <Typography variant="body2" fontWeight={600}>Meeting Scheduled</Typography>
                              </Box>
                              <Typography variant="caption" display="block" color="text.secondary">{msg.meeting.time}</Typography>
                              <Typography variant="caption" color="text.secondary">{msg.meeting.attendees}</Typography>
                            </Box>
                          )}
                          {msg.contract && (
                            <Box sx={{ 
                              p: 1.5, 
                              borderRadius: 2, 
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.1)',
                              border: 1, 
                              borderColor: 'primary.main' 
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                <Typography variant="body2" fontWeight={600}>Escrow Created</Typography>
                              </Box>
                              <Typography variant="caption" display="block" fontWeight={600} color="primary.main">{msg.contract.amount} → {msg.contract.recipient}</Typography>
                              <Typography variant="caption" color="text.secondary">{msg.contract.type}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        px: 2, 
                        py: 1, 
                        maxWidth: '75%', 
                        bgcolor: 'primary.main', 
                        color: 'primary.contrastText', 
                        borderRadius: 2.5 
                      }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{msg.text}</Typography>
                      </Box>
                    )}
                  </Box>
                </Fade>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};






const SocialProofSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, jobsCount: 0, talentsCount: 0 });
  const [allOpportunities, setAllOpportunities] = useState<Array<{
    id: string;
    user_id?: string;
    job_titles?: string[];
    skills?: string[];
    category?: Record<string, null>;
  }>>([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snsResponse = await backendActor.get_sns_status();
        if (snsResponse.Ok) {
          const { number_users, jobs_count, talents_count, latest_jobs, latest_talents } = snsResponse.Ok;
          setStats({
            users: Math.floor(number_users),
            jobsCount: Math.floor(jobs_count),
            talentsCount: Math.floor(talents_count),
          });

          const combined = [];
          if (latest_jobs && latest_jobs.length > 0) combined.push(...latest_jobs);
          if (latest_talents && latest_talents.length > 0) combined.push(...latest_talents);
          if (combined.length > 0) setAllOpportunities([...combined, ...combined, ...combined]);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (allOpportunities.length === 0) return;
    const interval = setInterval(() => setScrollPosition(prev => prev + 0.5), 20);
    return () => clearInterval(interval);
  }, [allOpportunities]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 6, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 0.5 }}>
                {stats.users}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" }}>
                Active Users
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main, mb: 0.5 }}>
                {stats.jobsCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" }}>
                Open Jobs
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main, mb: 0.5 }}>
                {stats.talentsCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" }}>
                Talents
              </Typography>
            </Box>
          </Box>

          {allOpportunities.length > 0 && (
            <Box sx={{ height: "360px", overflow: "hidden", position: "relative", mb: 6 }}>
              <Box sx={{ transform: `translateY(-${scrollPosition % ((allOpportunities.length / 3) * 70)}px)`, willChange: "transform" }}>
                <Stack spacing={1.5}>
                  {allOpportunities.map((job, index) => {
                    const category = job.category ? Object.keys(job.category)[0] : "Job";
                    return (
                      <Box key={`${job.id}-${index}`} sx={{
                        p: 1.5, borderRadius: "12px", border: `1px solid`,
                        borderColor: theme.palette.mode === "dark" ? "#2a2a2a" : "grey.200",
                        bgcolor: theme.palette.mode === "dark" ? "#252525" : "grey.50",
                        transition: "all 0.3s ease", cursor: "pointer",
                        "&:hover": { borderColor: "#667eea", transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)" },
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ pointerEvents: "none", cursor: "default" }}>
                            {job.user_id ? (
                              <UserAvatarMenu user_id={job.user_id} hide={["Profile", "Message", "Review"]}
                                sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.mode === "dark" ? "#1a1a1a" : "white"}` }} />
                            ) : (
                              <Avatar sx={{ width: 40, height: 40, bgcolor: category === "Talent" ? "#4caf50" : "#667eea",
                                border: `2px solid ${theme.palette.mode === "dark" ? "#1a1a1a" : "white"}` }}>
                                {job.job_titles?.[0]?.[0]?.toUpperCase() || category[0]}
                              </Avatar>
                            )}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.25 }}>
                              {job.job_titles?.[0] || `${category} Position`}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, display: "block", fontSize: "0.75rem",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {job.skills?.slice(0, 3).join(", ") || "Skills not specified"}
                            </Typography>
                          </Box>
                          <Chip label={category} size="small" sx={{
                            bgcolor: category === "Talent" ? "#4caf50" : "#2196f3",
                            color: "white", fontWeight: 700, fontSize: "0.7rem", height: "24px", minWidth: "48px",
                          }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2.5 }}>
            {/* <Tooltip title="Jobs">
              <IconButton onClick={() => navigate("/")} sx={{ 
                width: 64, height: 64,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
                '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', transform: 'scale(1.05)' },
                transition: 'all 0.3s ease'
              }}>
                <img src="/job.png" alt="Work" style={{ width: 36, height: 36 }} />
              </IconButton>
              Jobs
            </Tooltip>
            <Tooltip title="Calendar">
              <IconButton onClick={() => navigate("/calendar")} sx={{ 
                width: 64, height: 64,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', transform: 'scale(1.05)' },
                transition: 'all 0.3s ease'
              }}>
                <img src="/calendar.png" alt="Calendar" style={{ width: 36, height: 36 }} />
              </IconButton>
              Calendar
            </Tooltip>
            <Tooltip title="Contracts">
              <IconButton onClick={() => navigate("/contracts")} sx={{ 
                width: 64, height: 64,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', transform: 'scale(1.05)' },
                transition: 'all 0.3s ease'
              }}>
                <img src="/contract.png" alt="Contract" style={{ width: 36, height: 36 }} />
              </IconButton>
              Agreements
            </Tooltip> */}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};





const MobileLanding = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling;
    const handleScroll = () => {
      clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        const sections = container.querySelectorAll('[data-section]');
        const scrollTop = container.scrollTop;
        const viewportHeight = window.innerHeight;
        
        let closestSection = sections[0];
        let minDistance = Math.abs(sections[0].offsetTop - scrollTop);
        
        sections.forEach((section) => {
          const distance = Math.abs(section.offsetTop - scrollTop);
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = section;
          }
        });
        
        closestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box ref={containerRef} sx={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}>
      <SEOComponent />
      <FAQSection />
      <Box data-section sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}><HeroWithDemo /></Box>
      <Box data-section sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}><SocialProofSection /></Box>
      <Box data-section sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}><EmailNotificationsStep /></Box>
      <Box data-section sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}><CalendarStep /></Box>
      <Box data-section sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}><CryptoAgreementStep /></Box>
      <Box data-section sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}><CryptoAgreementProofsStep /></Box>
      <Box data-section sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}><ProjectManagementStep /></Box>
      <Box data-section sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}><SocialMediaShare /></Box>
      <Box data-section sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}><SimpleFooter /></Box>
    </Box>
  );
};
export default MobileLanding;