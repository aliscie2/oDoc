import LoginButton from "@/components/MainComponents/topNavBar/loginButton";
import { canisterId } from "$/declarations/backend";
import AIJobMatchingFlow from "@/components/landingPageAnimations";
import { backendActor, ckUSDCActor } from "@/utils/backendUtils";
import getckUsdcBalance from "@/utils/getBalance";
import {
  AttachMoney, BarChart, CheckCircle as CheckCircleIcon, Email, Handshake as HandshakeIcon,
  Instagram, LinkedIn, Lock, Notifications, Search, SmartToy, Star, Telegram, Work, YouTube
} from "@mui/icons-material";
import DiscordIcon from "@mui/icons-material/Forum";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  Avatar, Badge, Box, Card, Chip, Container, Divider, Fade, Grid2, Grow,
  IconButton, Paper, Stack, SvgIcon, Typography, useTheme
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";

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

const getButtonStyles = (theme, variant = "contained") => ({
  contained: {
    px: 4, py: 1.5, fontSize: "1rem", fontWeight: 600,
    background: theme.palette.mode === "dark"
      ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
      : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    borderRadius: "28px", textTransform: "none", color: "#ffffff", border: "none",
    boxShadow: theme.palette.mode === "dark" ? `0 4px 16px ${theme.palette.primary.main}40` : `0 2px 12px ${theme.palette.primary.main}25`,
    "&:hover": {
      background: theme.palette.mode === "dark"
        ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
        : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      transform: "translateY(-1px)",
      boxShadow: theme.palette.mode === "dark" ? `0 6px 20px ${theme.palette.primary.main}50` : `0 4px 16px ${theme.palette.primary.main}35`,
    },
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  outlined: {
    px: 4, py: 1.5, fontSize: "1rem", fontWeight: 600,
    background: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
    borderRadius: "28px", textTransform: "none",
    color: theme.palette.mode === "dark" ? theme.palette.text.primary : theme.palette.primary.main,
    border: theme.palette.mode === "dark" ? `2px solid ${theme.palette.divider}` : `2px solid ${theme.palette.primary.main}30`,
    backdropFilter: "blur(10px)",
    boxShadow: theme.palette.mode === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "0 2px 8px rgba(37, 99, 235, 0.08)",
    "&:hover": {
      background: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : theme.palette.primary.main,
      color: theme.palette.mode === "dark" ? theme.palette.text.primary : "#ffffff",
      borderColor: theme.palette.mode === "dark" ? theme.palette.primary.main : theme.palette.primary.main,
      transform: "translateY(-1px)",
      boxShadow: theme.palette.mode === "dark" ? `0 4px 12px ${theme.palette.primary.main}30` : `0 4px 12px ${theme.palette.primary.main}25`,
    },
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
});

const AISecretaryChat = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  const candidatePhotos = ['https://i.pravatar.cc/150?img=47', 'https://i.pravatar.cc/150?img=13', 'https://i.pravatar.cc/150?img=32'];

  useEffect(() => {
    const sequence = [
      { id: 1, type: 'user', text: 'Find full-stack developers', delay: 0 },
      { id: 2, type: 'bot', text: 'Found 3 candidates', delay: 1200, candidates: [
        { name: 'Sarah Chen', skills: 'React • Node • Web3', rate: '$120/hr', avatar: candidatePhotos[0] },
        { name: 'Alex Kumar', skills: 'Python • Django • AWS', rate: '$110/hr', avatar: candidatePhotos[1] },
        { name: 'Maria Silva', skills: 'Vue • PHP • Docker', rate: '$105/hr', avatar: candidatePhotos[2] }
      ]},
      { id: 3, type: 'user', text: 'Find a suitable time to meet Sarah', delay: 2000 },
      { id: 4, type: 'bot', text: '', delay: 1200, meeting: { time: 'Tomorrow 9 AM', attendees: 'You & Sarah Chen' } },
      { id: 5, type: 'user', text: 'Make $100 escrow for Sarah', delay: 2000 },
      { id: 6, type: 'bot', text: '', delay: 1200, contract: { amount: '$100', recipient: 'Sarah Chen', type: 'Full-Stack Dev Contract' } }
    ];

    const runSequence = () => {
      setMessages([]);
      let timeoutIds = [];
      let totalDelay = 0;

      sequence.forEach((msg) => {
        totalDelay += msg.delay;
        const timeoutId = setTimeout(() => setMessages(prev => [...prev, msg]), totalDelay);
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
    <Box sx={{ width: '100%', maxWidth: 450, height: 320, display: 'flex', flexDirection: 'column', border: 1, borderColor: 'divider', borderRadius: 3, overflow: 'hidden',
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
      <Box ref={scrollRef} sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5,
        '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 } }}>
        {messages.map((msg,index) => (
          <Grow key={msg.id} in timeout={400}>
            <Box sx={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.type === 'bot' ? (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '90%' }}>
                  <Avatar src={["/job.png","","/calendar.png"][index-1]||"/contract.png"}  />
                  <Box>
                    {msg.text && (
                      <Paper elevation={0} sx={{ px: 2, py: 1, bgcolor: 'transparent', border: 1, borderColor: 'divider', borderRadius: 2.5,
                        mb: msg.candidates || msg.meeting || msg.contract ? 1 : 0 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{msg.text}</Typography>
                      </Paper>
                    )}
                    {msg.candidates && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {msg.candidates.map((c, i) => (
                          <Paper key={i} elevation={1} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, borderRadius: 2,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                            <Avatar src={c.avatar} sx={{ width: 28, height: 28 }} />
                            <Box>
                              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{c.name}</Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'success.main', fontWeight: 500, display: 'block' }}>95% match</Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}
                    {msg.meeting && (
                      <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                        border: 1, borderColor: 'success.main' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                          <Typography variant="body2" fontWeight={600}>Meeting Scheduled</Typography>
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary">{msg.meeting.time}</Typography>
                        <Typography variant="caption" color="text.secondary">{msg.meeting.attendees}</Typography>
                      </Paper>
                    )}
                    {msg.contract && (
                      <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.1)',
                        border: 1, borderColor: 'primary.main' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="body2" fontWeight={600}>Escrow Created</Typography>
                        </Box>
                        <Typography variant="caption" display="block" fontWeight={600} color="primary.main">{msg.contract.amount} → {msg.contract.recipient}</Typography>
                        <Typography variant="caption" color="text.secondary">{msg.contract.type}</Typography>
                      </Paper>
                    )}
                  </Box>
                </Box>
              ) : (
                <Paper elevation={0} sx={{ px: 2, py: 1, maxWidth: '75%', bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{msg.text}</Typography>
                </Paper>
              )}
            </Box>
          </Grow>
        ))}
      </Box>
    </Box>
  );
};

const HeroSection = () => {
  const theme = useTheme();
  const buttonStyles = getButtonStyles(theme);
  const [stats, setStats] = useState({ users: 0, activeUsers: 0, totalDeposit: 0, jobsCount: 0, talentsCount: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

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

    const fetchStats = async () => {
      try {
        const [snsResponse, balance] = await Promise.all([backendActor.get_sns_status(), getckUsdcBalance(ckUSDCActor, canisterId)]);
        if (snsResponse.Ok) {
          const { number_users, active_users, jobs_count, talents_count } = snsResponse.Ok;
          animateCount(number_users, (val) => setStats((prev) => ({ ...prev, users: val })));
          animateCount(active_users, (val) => setStats((prev) => ({ ...prev, activeUsers: val })));
          animateCount(Number(balance) / 1000000, (val) => setStats((prev) => ({ ...prev, totalDeposit: val })));
          animateCount(jobs_count, (val) => setStats((prev) => ({ ...prev, jobsCount: val })));
          animateCount(talents_count, (val) => setStats((prev) => ({ ...prev, talentsCount: val })));
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [isVisible]);

  return (
    <Box ref={statsRef} sx={{ height: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden",
      "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(circle at 30% 20%, ${theme.palette.primary.main}08 0%, transparent 50%)`, pointerEvents: "none" } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Box sx={{ flex: "1 1 50%" }}>
            <Typography variant="h1" sx={{ fontSize: "4rem", fontWeight: 400, mb: 2, lineHeight: 1.2,
              fontFamily: "Google Sans, -apple-system, BlinkMacSystemFont, sans-serif" }}>
              Your AI<br />
              <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>Personal Secretary</Box>
            </Typography>
            <Typography variant="h5" sx={{ mb: 3, color: theme.palette.text.secondary, fontWeight: 400, lineHeight: 1.6, fontSize: "1.25rem" }}>
              The first and only AI personal secretary on Web3. Find jobs and talent, schedule meetings, manage teams & payments.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <LoginButton variant="contained" size="large" userType={"JOB"} sx={buttonStyles.contained} isMobile={false}>
                <Search sx={{ mr: 1, fontSize: "1.2rem" }} />Find Talent
              </LoginButton>
              <LoginButton variant="outlined" size="large" userType={"TALENT"} sx={buttonStyles.outlined} isMobile={false}>
                <Work sx={{ mr: 1, fontSize: "1.2rem" }} />Find Job
              </LoginButton>
            </Stack>
          </Box>
          <Box sx={{ flex: "1 1 50%", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <AISecretaryChat />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const CalendarStep = () => {
  const theme = useTheme();
  const [phase, setPhase] = useState(0);
  const [typedText, setTypedText] = useState("");

  const phases = [
    { type: "availability", text: "I am available Mon-Fri 9 AM - 1 PM" },
    { type: "event", text: "Find me a good time to meet Sarah tomorrow." }
  ];

  useEffect(() => {
    const currentPhase = phases[phase % 2];
    const targetText = currentPhase.text;

    if (typedText.length < targetText.length) {
      const timer = setTimeout(() => setTypedText(targetText.slice(0, typedText.length + 1)), 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => { setTypedText(""); setPhase((prev) => prev + 1); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [typedText, phase]);

  const currentPhase = phases[phase % 2];
  const isComplete = typedText === currentPhase.text;
  const calendarSlots = [{ day: "Mon", hours: "9-1" }, { day: "Tue", hours: "9-1" }, { day: "Wed", hours: "9-1" }, { day: "Thu", hours: "9-1" }, { day: "Fri", hours: "9-1" }];

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={4} alignItems="center">
          <Grid2 xs={6}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, fontSize: "2.5rem" }}>Talk to Your Calendar</Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.6 }}>Set availability and schedule events through simple chat commands</Typography>
          </Grid2>
          <Grid2 xs={6}>
            <Card sx={{ p: 3, borderRadius: 3, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, minHeight: 320 }}>
              <Box sx={{ mb: 2, p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "grey.100",
                borderRadius: 2, minHeight: 56, display: "flex", alignItems: "center" }}>
                <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                  {typedText}
                  <Box component="span" sx={{ display: "inline-block", width: 2, height: 20, bgcolor: "primary.main", ml: 0.5,
                    animation: "blink 1s infinite", "@keyframes blink": { "0%, 50%": { opacity: 1 }, "51%, 100%": { opacity: 0 } } }} />
                </Typography>
              </Box>
              <Box sx={{ minHeight: 200 }}>
                {isComplete && (
                  <Fade in={true} timeout={600}>
                    <Box>
                      {currentPhase.type === "availability" ? (
                        <Stack spacing={1}>
                          {calendarSlots.map((slot, i) => (
                            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5,
                              bgcolor: theme.palette.mode === "dark" ? `rgba(76, 175, 80, ${0.1 + i * 0.1})` : `rgba(76, 175, 80, ${0.15 + i * 0.08})`,
                              borderRadius: 1, color: theme.palette.mode === "dark" ? "success.light" : "success.dark",
                              border: `1px solid ${theme.palette.success.main}40` }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>{slot.day}</Typography>
                              <Typography variant="body2">{slot.hours}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? `${theme.palette.primary.dark}90` : `${theme.palette.primary.main}`,
                          borderRadius: 2, color: "white" }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Tomorrow • 10:00 AM</Typography>
                          <Typography variant="body2">Meeting with Sarah</Typography>
                        </Box>
                      )}
                    </Box>
                  </Fade>
                )}
              </Box>
            </Card>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};

const FunnelOverviewSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const services = [
    { title: "AI Job Match", description: "AI-powered matching connects you with opportunities that perfectly align with your skills", icon: "/job.png" },
    { title: "Smart Calendar", description: "Smart scheduling system coordinates interviews and meetings at optimal times", icon: "/calendar.png" },
    { title: "Crypto Agreements", description: "Secure platform handles projects, teams, tasks, payments, and contract management", icon: "/contract.png" }
  ];

  const cardStyles = {
    textAlign: "center", p: 2, borderRadius: "12px", background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`,
    transition: "all 0.3s ease", position: "relative", overflow: "hidden", minWidth: "240px", maxWidth: "280px",
    "&::before": { content: '""', position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%",
      background: isDark ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" : "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
      transition: "left 0.5s ease" },
    "&:hover": { transform: "translateY(-2px)", boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.6)' : '0 8px 24px rgba(0, 0, 0, 0.12)', "&::before": { left: "100%" } }
  };

  const imgStyles = {
    width: "64px", height: "64px", objectFit: "contain",
    filter: isDark ? 'brightness(0.85) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))' : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))',
    transition: "all 0.3s ease"
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 600, fontSize: "2.5rem", textAlign: "center" }}>We offer an A to Z system.</Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
          {services.map((service, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={cardStyles}>
                <Box sx={{ mb: 1, display: "flex", justifyContent: "center", zIndex: 1, position: "relative" }}>
                  <img src={service.icon} alt={service.title} style={imgStyles}
                    onMouseEnter={(e) => e.currentTarget.style.filter = isDark ? 'brightness(1.15) drop-shadow(0 4px 12px rgba(255, 255, 255, 0.3))' : 'brightness(1.05) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.5))'}
                    onMouseLeave={(e) => e.currentTarget.style.filter = imgStyles.filter} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, fontSize: "1.1rem", zIndex: 1, position: "relative" }}>{service.title}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.4, fontSize: "0.875rem", zIndex: 1, position: "relative" }}>
                  {service.description}
                </Typography>
              </Box>
              {index < services.length - 1 && <Typography sx={{ fontSize: "1.5rem", color: theme.palette.primary.main, fontWeight: "bold", mx: 2 }}>→</Typography>}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

const EmailNotificationsStep = () => {
  const theme = useTheme();
  const emails = [
    { subject: "AI Developer Position Match", preview: "Perfect match found! A startup needs an AI developer for autonomous agents...", time: "2m" },
    { subject: "Co-founder Opportunity", preview: "Agricultural tech startup seeking co-founder with your expertise...", time: "1h" }
  ];

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={4} alignItems="center">
          <Grid2 xs={6}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, fontSize: "2.5rem" }}>Email Notifications</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, fontSize: "1.1rem" }}>
              Don&apos;t like the current matches? No problem. Get email alerts when new opportunities match your profile.
            </Typography>
          </Grid2>
          <Grid2 xs={6}>
            <Box sx={{ width: "420px", maxWidth: "420px", background: theme.palette.background.paper, borderRadius: "8px",
              border: `1px solid ${theme.palette.divider}`, overflow: "hidden", mx: "auto" }}>
              <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Badge badgeContent={2} sx={{ "& .MuiBadge-badge": { backgroundColor: theme.palette.error.main, color: theme.palette.error.contrastText, fontWeight: "500", fontSize: "0.7rem" } }}>
                    <Email sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                  </Badge>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>Job Alerts</Typography>
                </Box>
              </Box>
              <Box>
                {emails.map((email, index) => (
                  <Box key={index} sx={{ py: 2, px: 3, borderBottom: index < emails.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                    "&:hover": { backgroundColor: theme.palette.action.hover }, transition: "background-color 0.2s" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, fontSize: "0.95rem", lineHeight: 1.3 }}>{email.subject}</Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.75rem", ml: 2 }}>{email.time}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem", lineHeight: 1.4 }}>{email.preview}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};

const CryptoAgreementStep = () => {
  const theme = useTheme();
  const [visibleFields, setVisibleFields] = useState(0);

  useEffect(() => {
    const fields = 5;
    let timer;
    if (visibleFields < fields) {
      timer = setTimeout(() => setVisibleFields((prev) => prev + 1), 600);
    } else {
      timer = setTimeout(() => setVisibleFields(0), 3000);
    }
    return () => clearTimeout(timer);
  }, [visibleFields]);

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={4} alignItems="center">
          <Grid2 xs={6}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 2, fontSize: "2.5rem" }}>Create Crypto Agreement</Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6, opacity: 0.8 }}>Set amount, staking time, and conditions. Lock your agreement securely on blockchain.</Typography>
          </Grid2>
          <Grid2 xs={6}>
            <Card sx={{ p: 3, borderRadius: 3, maxWidth: 480, mx: "auto", border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                <HandshakeIcon sx={{ fontSize: 24, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Agreement Details</Typography>
              </Box>
              <Grid2 container spacing={2}>
                <Grid2 xs={6}>
                  <Fade in={visibleFields >= 1} timeout={600}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.7, fontSize: "0.8rem" }}>Amount</Typography>
                      <Typography variant="h5" fontWeight="bold">500 USDC</Typography>
                    </Box>
                  </Fade>
                </Grid2>
                <Grid2 xs={6}>
                  <Fade in={visibleFields >= 2} timeout={600}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.7, fontSize: "0.8rem" }}>Type</Typography>
                      <Chip label="Escrow" variant="outlined" size="small" />
                    </Box>
                  </Fade>
                </Grid2>
                <Grid2 xs={12}>
                  <Fade in={visibleFields >= 3} timeout={600}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.7, fontSize: "0.8rem" }}>Receiver</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36 }} src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face">JS</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>John Smith</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>Senior ICP Developer</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Fade>
                </Grid2>
                <Grid2 xs={6}>
                  <Fade in={visibleFields >= 4} timeout={600}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.7, fontSize: "0.8rem" }}>Staking Time</Typography>
                      <Typography variant="body1" fontWeight={600}>30 days</Typography>
                    </Box>
                  </Fade>
                </Grid2>
                <Grid2 xs={12}>
                  <Fade in={visibleFields >= 5} timeout={600}>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.7, fontSize: "0.8rem" }}>Conditions</Typography>
                      <Typography variant="body2" sx={{ fontStyle: "italic", lineHeight: 1.4, fontSize: "0.875rem" }}>
                        &quot;Build AI job match ICP canister in 30 days&quot;
                      </Typography>
                    </Box>
                  </Fade>
                </Grid2>
              </Grid2>
            </Card>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};

const CryptoAgreementProofsStep = () => {
  const proofs = [
    { title: "Proof of Existence", subtitle: "Deposit funds before making promises", icon: <AttachMoney sx={{ fontSize: "2.5rem", color: "primary.main" }} /> },
    { title: "Proof of Stake", subtitle: "Build trust with upfront staking", icon: <Lock sx={{ fontSize: "2.5rem", color: "primary.main" }} /> },
    { title: "Proof of Cap", subtitle: "Smart limits prevent oversized commitments", icon: <BarChart sx={{ fontSize: "2.5rem", color: "primary.main" }} /> },
    { title: "Proof of Reputation", subtitle: "Your track record shows transparently", icon: <Star sx={{ fontSize: "2.5rem", color: "primary.main" }} /> }
  ];

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 600, fontSize: "2.5rem" }}>Crypto Agreement Proofs</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {proofs.map((proof, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", backgroundColor: "background.paper" }}>
              <Box sx={{ fontSize: "2.5rem", flexShrink: 0 }}>{proof.icon}</Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 600, fontSize: "1.5rem" }}>{proof.title}</Typography>
                <Typography variant="body1" sx={{ opacity: 0.8, fontSize: "1rem" }}>{proof.subtitle}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};



const CardAlertAnimation = ({ contract, notificationVisible, animatingPromises, currentContract, promiseCount, promiseAmount }) => (
  <Box sx={{ display: "flex", justifyContent: "center", position: "relative", width: "100%", maxWidth: 350, mx: "auto" }}>
    <Fade in={notificationVisible} timeout={500}>
      <Box sx={{ position: "absolute", top: -8, right: -8, zIndex: 10, background: "linear-gradient(135deg, #ff4444, #cc0000)", color: "white",
        borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem",
        fontWeight: 700, border: "2px solid white", animation: "bounce 0.5s ease-in-out",
        "@keyframes bounce": { "0%": { transform: "scale(0)" }, "50%": { transform: "scale(1.2)" }, "100%": { transform: "scale(1)" } } }}>
        {currentContract + 1}
      </Box>
    </Fade>
    <Card sx={{ p: 3, borderRadius: 3, border: notificationVisible ? "2px solid #ff4444" : `1px solid rgba(255, 255, 255, 0.2)`,
      transition: "all 0.3s", transform: animatingPromises ? "scale(1.02)" : "scale(1)", width: "100%" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{contract.name}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }} src={contract.avatar}>{contract.creator.split(" ").map((n) => n[0]).join("")}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>{contract.creator}</Typography>
            <Typography variant="caption" color="text.secondary">{contract.role}</Typography>
          </Box>
        </Box>
      </Box>
      <Stack spacing={1.5}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 2, border: `1px solid rgba(255, 255, 255, 0.2)`,
          transition: "all 0.5s", transform: animatingPromises ? "scale(1.05)" : "scale(1)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HandshakeIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" fontWeight={500}>Promises</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: animatingPromises ? "primary.main" : "text.primary" }}>{promiseCount}</Typography>
            <Typography variant="caption" sx={{ color: animatingPromises ? "primary.main" : "text.secondary" }}>${promiseAmount}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 2, border: `1px solid rgba(255, 255, 255, 0.2)` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
            <Typography variant="body2" fontWeight={500}>Payments</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" fontWeight={600}>{contract.payments}</Typography>
            <Typography variant="caption" color="text.secondary">${contract.paidAmount}</Typography>
          </Box>
        </Box>
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Chip label={contract.status} size="small" variant="filled"
          sx={{ background: contract.status === "Active" ? "linear-gradient(135deg, #4caf50, #2e7d32)" : "linear-gradient(135deg, #ff9800, #f57c00)",
            color: "white", fontWeight: 500 }} />
      </Box>
    </Card>
  </Box>
);




const ProjectManagementStep = () => {
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
    { icon: <SmartToy sx={{ fontSize: "1.5rem", color: "primary.main" }} />, text: "Smart task allocation" },
    { icon: <AttachMoney sx={{ fontSize: "1.5rem", color: "primary.main" }} />, text: "Automated payment tracking" },
    { icon: <BarChart sx={{ fontSize: "1.5rem", color: "primary.main" }} />, text: "Progress analytics" },
    { icon: <Notifications sx={{ fontSize: "1.5rem", color: "primary.main" }} />, text: "Real-time notifications" }
  ];

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center", px: 3 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={6} alignItems="center">
          <Grid2 xs={12} md={6}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 600, fontSize: "2.5rem", lineHeight: 1.2 }}>
              Project Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 4, fontSize: "1.1rem", lineHeight: 1.6 }}>
              Manage team tasks, payments, and contracts A-Z with the help of AI
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, fontSize: "1.2rem", fontWeight: 500 }}>
              AI-Powered Management
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
              {features.map((feature, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {feature.icon}
                  <Typography variant="body2" sx={{ opacity: 0.7, fontSize: "0.95rem" }}>
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid2>
          <Grid2 xs={12} md={6} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <CardAlertAnimation 
              contract={contracts[currentContract]}
              notificationVisible={notificationVisible}
              animatingPromises={animatingPromises}
              currentContract={currentContract}
              promiseCount={promiseCount}
              promiseAmount={promiseAmount}
            />
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};



const SocialMediaShare = () => {
  return (
    <Box sx={{ textAlign: "center", py: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>Join Our Community</Typography>
      <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" alignItems="center">
        {[
          { key: "telegram", icon: Telegram, color: "#0088cc", url: "https://t.me/odoc_ic", primary: true },
          { key: "x", icon: XIcon, color: "#000000", url: "https://x.com/odoc_ic", primary: true },
          { key: "discord", icon: DiscordIcon, color: "#5865F2", url: "https://discord.gg/HbaFQXDD", primary: true },
          { key: "youtube", icon: YouTube, color: "#FF0000", url: "https://www.youtube.com/@odoc_ic", primary: false },
          { key: "instagram", icon: Instagram, color: "#E4405F", url: "https://www.instagram.com/odoc_ic", primary: false },
          { key: "tiktok", icon: TikTokIcon, color: "#000000", url: "https://www.tiktok.com/@odoc.app", primary: false },
          { key: "linkedin", icon: LinkedIn, color: "#0A66C2", url: "https://www.linkedin.com/company/odocic", primary: false }
        ].map(({ key, icon: Icon, color, url, primary }) => (
          <IconButton key={key} onClick={() => window.open(url, "_blank")}
            sx={{ bgcolor: primary ? color : "transparent", color: primary ? "white" : color, border: primary ? "none" : `2px solid ${color}`,
              "&:hover": { bgcolor: primary ? color : `${color}15`, opacity: primary ? 0.85 : 1 }, width: primary ? 44 : 38, height: primary ? 44 : 38 }}>
            <Icon sx={{ fontSize: primary ? 22 : 20 }} />
          </IconButton>
        ))}
      </Stack>
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
    <Box component="footer" sx={{ py: 4, backgroundColor: "background.paper", borderTop: "1px solid", borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 3, mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>{window.location.hostname}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 280, fontSize: "0.875rem" }}>AI-powered job matching • Smart contracts • Team management</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: "0.875rem" }}>Resources</Typography>
              <Typography variant="body2" sx={{ opacity: 0.6, cursor: "pointer", "&:hover": { opacity: 1 }, fontSize: "0.8rem" }} component={Link} to="/white_paper">White Paper</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, fontSize: "0.875rem" }}>Community</Typography>
              <Stack spacing={0.5}>
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Box key={social.name} sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", opacity: 0.6, "&:hover": { opacity: 1 } }}
                      onClick={() => window.open(social.url, "_blank")}>
                      <Icon sx={{ fontSize: 14 }} />
                      <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>{social.name}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mb: 2, opacity: 0.2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.5, fontSize: "0.75rem" }}>© {new Date().getFullYear()} oDoc.app. All rights reserved.</Typography>
          <Typography variant="body2" sx={{ opacity: 0.5, cursor: "pointer", "&:hover": { opacity: 1 }, fontSize: "0.75rem" }} component={Link} to="/privacy">Privacy Policy</Typography>
        </Box>
      </Container>
    </Box>
  );
};

const SEOComponent = () => {
  const seoData = {
    title: `${window.location.hostname} - ICP Jobs & Blockchain Developer Careers | AI Job Matching`,
    description: "Find blockchain developer jobs, ICP careers, and Web3 talent. AI-powered job matching platform for Internet Computer Protocol ecosystem. Smart contracts, remote positions, DeFinity careers.",
    keywords: "ICP jobs, blockchain developer jobs, DeFinity careers, Web3 jobs, Internet Computer Protocol jobs, blockchain engineer, smart contract developer, Rust developer, canister development, Web3 talent, blockchain recruitment, ICP project manager, crypto jobs, decentralized jobs, blockchain careers",
    structuredData: {
      "@context": "https://schema.org", "@type": "WebSite", name: window.location.hostname, url: window.location.origin,
      description: "AI-powered job matching platform for blockchain developers and Web3 talent in the ICP ecosystem",
      potentialAction: { "@type": "SearchAction", target: `${window.location.origin}/search?q={search_term_string}`, "query-input": "required name=search_term_string" }
    },
    jobPostingData: {
      "@context": "https://schema.org", "@type": "JobPosting", title: "Blockchain Developer - ICP Ecosystem",
      description: "Join the Internet Computer Protocol ecosystem. Remote blockchain development positions available.",
      hiringOrganization: { "@type": "Organization", name: window.location.hostname },
      employmentType: "FULL_TIME", workHours: "Remote", skills: ["Rust", "TypeScript", "Blockchain", "Smart Contracts", "ICP", "Web3"]
    }
  };

  return (
    <Helmet>
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <link rel="canonical" href={window.location.href} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={`${window.location.origin}/thumbnail.png`} />
      <meta property="og:site_name" content={window.location.hostname} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={`${window.location.origin}/thumbnail.png`} />
      <script type="application/ld+json">{JSON.stringify(seoData.structuredData)}</script>
      <script type="application/ld+json">{JSON.stringify(seoData.jobPostingData)}</script>
    </Helmet>
  );
};

const FAQSection = () => {
  const faqs = [
    { q: "How does AI job matching work for blockchain developers?", a: "Our AI analyzes your skills, experience, and preferences to match you with relevant ICP projects, blockchain startups, and Web3 companies. The system learns from successful matches to improve recommendations." },
    { q: "What types of ICP jobs are available?", a: "We feature Rust developers, canister engineers, full-stack Web3 developers, blockchain architects, project managers, and technical leads specializing in Internet Computer Protocol development." },
    { q: "How do crypto agreements and smart contracts work?", a: "Our platform creates secure blockchain-based employment agreements with built-in escrow, milestone tracking, and automated payments. All contracts are transparent and immutable on the blockchain." },
    { q: "Is the platform free for job seekers?", a: "Yes, job seekers can create profiles, receive AI matches, and apply to positions completely free. Premium features include priority matching and advanced filtering options." },
    { q: "What makes this different from other job boards?", a: "We're built specifically for the Web3 ecosystem with AI-powered matching, integrated smart contracts, automated scheduling, and native crypto payments - eliminating traditional hiring friction." },
    { q: "How do I get started as a blockchain developer?", a: "Simply create your profile, describe your Web3 experience and interests, and our AI will immediately start finding relevant opportunities in the ICP ecosystem and broader blockchain space." }
  ];

  const structuredFAQ = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } }))
  };

  return <Helmet><script type="application/ld+json">{JSON.stringify(structuredFAQ)}</script></Helmet>;
};

const DesktopLanding = () => {
  useEffect(() => {
    document.documentElement.style.scrollSnapType = "y mandatory";
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollSnapType = "";
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <Box>
      <SEOComponent />
      <FAQSection />
      <Box sx={{ scrollSnapAlign: "start" }}><HeroSection /></Box>
      <Box sx={{ scrollSnapAlign: "start" }}><FunnelOverviewSection /></Box>
      <Box sx={{ scrollSnapAlign: "start" }}><AIJobMatchingFlow /></Box>
      <Box sx={{ scrollSnapAlign: "start" }}><EmailNotificationsStep /></Box>
      <Box sx={{ scrollSnapAlign: "start" }}><CalendarStep /></Box>
      <Box sx={{ scrollSnapAlign: "start" }}><CryptoAgreementStep /></Box>
      <Box sx={{ scrollSnapAlign: "start" }}><CryptoAgreementProofsStep /></Box>
      <Box sx={{ scrollSnapAlign: "start" }}><ProjectManagementStep /></Box>
      <Box sx={{ scrollSnapAlign: "start" }}><SocialMediaShare /></Box>
      <Box sx={{ scrollSnapAlign: "start" }}><SimpleFooter /></Box>
    </Box>
  );
};

export default DesktopLanding;