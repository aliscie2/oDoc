import { canisterId } from "$/declarations/backend";
import AIJobMatchingFlow from "@/components/landingPageAnimations";
import LoginButton from "@/components/MainComponents/topNavBar/loginButton";
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
  IconButton, Paper, Stack, SvgIcon, Typography, useMediaQuery, useTheme
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
  const timeoutsRef = useRef([]);

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
      let totalDelay = 0;

      sequence.forEach((msg) => {
        totalDelay += msg.delay;
        const tid = setTimeout(() => setMessages(prev => [...prev, msg]), totalDelay);
        timeoutsRef.current.push(tid);
      });

      const loopTid = setTimeout(() => runSequence(), totalDelay + 2000);
      timeoutsRef.current.push(loopTid);
    };

    runSequence();

    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
    };
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
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setIsVisible(true);
        setHasAnimated(true);
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!isVisible || hasAnimated === false) return;

    const animateCount = (target, key) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setStats(prev => ({ ...prev, [key]: Math.floor(target) }));
          clearInterval(timer);
        } else {
          setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, 30);
      return timer;
    };

    const fetchStats = async () => {
      try {
        const [snsResponse, balance] = await Promise.all([backendActor.get_sns_status(), getckUsdcBalance(ckUSDCActor, canisterId)]);
        if (snsResponse.Ok) {
          const { number_users, active_users, jobs_count, talents_count } = snsResponse.Ok;
          const timers = [
            animateCount(number_users, 'users'),
            animateCount(active_users, 'activeUsers'),
            animateCount(Number(balance) / 1000000, 'totalDeposit'),
            animateCount(jobs_count, 'jobsCount'),
            animateCount(talents_count, 'talentsCount')
          ];
          return () => timers.forEach(t => clearInterval(t));
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    return fetchStats();
  }, [isVisible, hasAnimated]);

  return (
    <Box ref={statsRef} sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      position: "relative", 
      overflow: "hidden",
      py: 8,
      "&::before": { 
        content: '""', 
        position: "absolute", 
        top: -200, 
        right: -200, 
        width: 500, 
        height: 500,
        background: `radial-gradient(circle, ${theme.palette.mode === 'dark' ? 'rgba(58,141,255,0.08)' : 'rgba(255,255,255,0.6)'} 0%, transparent 70%)`,
        pointerEvents: "none" 
      } 
    }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Box sx={{ flex: "1 1 50%" }}>
            <Typography variant="h1" sx={{ fontSize: "3.5rem", fontWeight: 400, mb: 2, lineHeight: 1.2 }}>
              Your AI<br />
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>Personal Secretary</Box>
            </Typography>
            <Typography variant="h5" sx={{ mb: 3, color: 'text.secondary', fontWeight: 400, lineHeight: 1.6, fontSize: "1.15rem" }}>
              The first and only AI personal secretary on Web3. Find jobs and talent, schedule meetings, manage teams & payments.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
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

  const phases = [
    { type: "availability", text: "Set me available Mon-Wed 9 AM - 1 PM" },
    { type: "event", text: "Find me a good time to meet Sarah tomorrow." }
  ];

  const currentPhase = phases[phase % 2];
  const calendarSlots = [
    { day: "Mon", hours: "9:00 AM - 1:00 PM" },
    { day: "Tue", hours: "9:00 AM - 1:00 PM" },
    { day: "Wed", hours: "9:00 AM - 1:00 PM" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setPhase(prev => prev + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 8 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={6} alignItems="center">
          <Grid2 xs={6}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, fontSize: "2.25rem" }}>Smart Calendar</Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "1.05rem" }}>
              Chat with your calendar to set availability and schedule meetings naturally.
            </Typography>
          </Grid2>
          <Grid2 xs={6}>
            <Box sx={{ 
              width: "100%", 
              maxWidth: 520, 
              bgcolor: "background.paper", 
              borderRadius: 4,
              boxShadow: theme.palette.mode === 'dark'
                ? '12px 12px 24px rgba(0,0,0,0.5), -12px -12px 24px rgba(60,60,60,0.1)'
                : '12px 12px 24px rgba(163,177,198,0.3), -12px -12px 24px rgba(255,255,255,0.8)',
              p: 3 
            }}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Box sx={{ 
                    px: 2.5, py: 1.5, maxWidth: "80%", 
                    bgcolor: "primary.main", 
                    color: "primary.contrastText", 
                    borderRadius: 3,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '4px 4px 8px rgba(0,0,0,0.4), -2px -2px 6px rgba(60,60,60,0.1)'
                      : '4px 4px 8px rgba(58,141,255,0.25), -2px -2px 6px rgba(255,255,255,0.7)'
                  }}>
                    <Typography variant="body1">{currentPhase.text}</Typography>
                  </Box>
                </Box>

                <Fade in timeout={600} key={phase}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <Avatar src="/calendar.png" sx={{ width: 36, height: 36, bgcolor: "primary.main" }} />
                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      {currentPhase.type === "availability" ? (
                        <>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>Availability set</Typography>
                          {calendarSlots.map((slot, i) => (
                            <Box key={i} sx={{ 
                              display: "flex", alignItems: "center", gap: 2, p: 1.5,
                              borderRadius: 2,
                              boxShadow: theme.palette.mode === 'dark'
                                ? 'inset 3px 3px 6px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(60,60,60,0.15)'
                                : 'inset 3px 3px 6px rgba(163,177,198,0.25), inset -3px -3px 6px rgba(255,255,255,0.8)',
                              bgcolor: 'background.paper'
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>{slot.day}</Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>{slot.hours}</Typography>
                            </Box>
                          ))}
                        </>
                      ) : (
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: "primary.main", 
                          borderRadius: 3, 
                          color: "white",
                          boxShadow: theme.palette.mode === 'dark'
                            ? '4px 4px 8px rgba(58,141,255,0.4), -2px -2px 6px rgba(60,60,60,0.1)'
                            : '4px 4px 8px rgba(58,141,255,0.3), -2px -2px 6px rgba(255,255,255,0.7)'
                        }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>Tomorrow • 10:00 AM</Typography>
                          <Typography variant="body2">Meeting with Sarah</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Fade>
              </Stack>
            </Box>
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
    { subject: "Co-founder Opportunity", preview: "Agricultural tech startup seeking co-founder with your expertise...", time: "1h" },
  ];

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={6} alignItems="center">
          <Grid2 xs={6}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 600, fontSize: "2.5rem" }}>Email Alerts</Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "1.1rem" }}>
              Get notified when new opportunities match your profile. Never miss the perfect job or talent again.
            </Typography>
          </Grid2>
          <Grid2 xs={6}>
            <Box sx={{ width: "100%", maxWidth: 520, bgcolor: "background.paper", borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
              <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Email sx={{ fontSize: 22, color: "text.secondary" }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>Inbox</Typography>
                </Box>
                <Badge badgeContent={2} sx={{ "& .MuiBadge-badge": {color:'white', bgcolor: "#ff3b30", fontWeight: 600 } }}>
                  <Box sx={{ width: 24 }} />
                </Badge>
              </Box>
              {emails.map((email, i) => (
                <Box key={i} sx={{ py: 2.5, px: 3, borderBottom: i < emails.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                  "&:hover": { bgcolor: "action.hover" }, transition: "background-color 0.2s", cursor: "pointer" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.75 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.4, pr: 2 }}>{email.subject}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", flexShrink: 0 }}>{email.time}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>{email.preview}</Typography>
                </Box>
              ))}
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
    const fields = 4;
    let timer;
    if (visibleFields < fields) {
      timer = setTimeout(() => setVisibleFields(prev => prev + 1), 600);
    } else {
      timer = setTimeout(() => setVisibleFields(0), 3000);
    }
    return () => clearTimeout(timer);
  }, [visibleFields]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", pt: 10 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={8} alignItems="center">
          <Grid2 xs={5}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, fontSize: "2.75rem", lineHeight: 1.2 }}>
              Secure Escrow Agreements
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, fontSize: "1.125rem" }}>
              Create transparent blockchain contracts with automated escrow protection. Define terms, lock funds, and release upon completion.
            </Typography>
          </Grid2>

          <Grid2 xs={7}>
            <Box sx={{ 
              bgcolor: "background.paper", 
              borderRadius: 3, 
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.palette.mode === "dark" ? "0 8px 32px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.08)"
            }}>
              <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar src="/contract.png" sx={{ width: 36, height: 36 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>Escrow Contract</Typography>
              </Box>

              <Box sx={{ px: 3, pb: 3 }}>
                <Grid2 container spacing={2.5}>
                  <Grid2 xs={7}>
                    <Fade in={visibleFields >= 1} timeout={600}>
                      <Box sx={{ 
                        p: 2.5, 
                        borderRadius: 2, 
                        bgcolor: theme.palette.mode === "dark" ? "rgba(33, 150, 243, 0.1)" : "rgba(33, 150, 243, 0.05)",
                        border: `1px solid ${theme.palette.primary.main}20`
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: "text.secondary", 
                          textTransform: "uppercase", 
                          letterSpacing: 1, 
                          fontWeight: 700, 
                          fontSize: "0.65rem", 
                          mb: 1, 
                          display: "block" 
                        }}>
                          Amount
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main", fontSize: "2.5rem" }}>
                          500 USDC
                        </Typography>
                      </Box>
                    </Fade>
                  </Grid2>

                  <Grid2 xs={5}>
                    <Fade in={visibleFields >= 2} timeout={600}>
                      <Box sx={{ 
                        p: 2.5, 
                        borderRadius: 2, 
                        bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${theme.palette.divider}`,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center"
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: "text.secondary", 
                          textTransform: "uppercase", 
                          letterSpacing: 1, 
                          fontWeight: 700, 
                          fontSize: "0.65rem", 
                          mb: 1, 
                          display: "block" 
                        }}>
                          Staking
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>30 days</Typography>
                      </Box>
                    </Fade>
                  </Grid2>

                  <Grid2 xs={12}>
                    <Fade in={visibleFields >= 3} timeout={600}>
                      <Box sx={{ 
                        p: 2.5, 
                        borderRadius: 2, 
                        bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${theme.palette.divider}`
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: "text.secondary", 
                          textTransform: "uppercase", 
                          letterSpacing: 1, 
                          fontWeight: 700, 
                          fontSize: "0.65rem", 
                          mb: 1.5, 
                          display: "block" 
                        }}>
                          Recipient
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar sx={{ width: 44, height: 44 }} src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.25, fontSize: "0.95rem" }}>John Smith</Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>Senior ICP Developer</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Fade>
                  </Grid2>

                </Grid2>
              </Box>
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};



const CryptoAgreementProofsStep = () => {
  const theme = useTheme();
  const proofs = [
    { title: "Proof of Existence", subtitle: "Deposit funds before making promises", icon: <AttachMoney sx={{ fontSize: "2rem", color: "primary.main" }} /> },
    { title: "Proof of Stake", subtitle: "Build trust with upfront staking", icon: <Lock sx={{ fontSize: "2rem", color: "primary.main" }} /> },
    { title: "Proof of Cap", subtitle: "Smart limits prevent oversized commitments", icon: <BarChart sx={{ fontSize: "2rem", color: "primary.main" }} /> },
    { title: "Proof of Reputation", subtitle: "Your track record shows transparently", icon: <Star sx={{ fontSize: "2rem", color: "primary.main" }} /> }
  ];

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 5, fontWeight: 600, fontSize: "2.5rem", textAlign: "center" }}>Agreement Proofs</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 3, maxWidth: 900, mx: "auto" }}>
          {proofs.map((proof, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 2.5, p: 3, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper",
              transition: "all 0.3s", "&:hover": { borderColor: "primary.main", transform: "translateY(-4px)", boxShadow: `0 8px 24px ${theme.palette.primary.main}20` } }}>
              <Box sx={{ flexShrink: 0, mt: 0.5 }}>{proof.icon}</Box>
              <Box>
                <Typography variant="h6" sx={{ mb: 0.75, fontWeight: 600, fontSize: "1.25rem" }}>{proof.title}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>{proof.subtitle}</Typography>
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
  const [promiseData, setPromiseData] = useState({ count: 3, amount: 1500 });

  const contracts = [
    { id: "1", name: "AI Agent Development", status: "Active", promises: 3, amount: 1500, payments: 1, paidAmount: 500, creator: "Sarah Chen", role: "Project Manager",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
    { id: "2", name: "ICP Canister Integration", status: "Pending", promises: 2, amount: 2000, payments: 0, paidAmount: 0, creator: "Alex Rodriguez", role: "Tech Lead",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIdx = (currentContract + 1) % contracts.length;
      setCurrentContract(nextIdx);
      setPromiseData({ count: contracts[nextIdx].promises, amount: contracts[nextIdx].amount });
      setNotificationVisible(true);
      setAnimatingPromises(true);
      
      setTimeout(() => {
        setAnimatingPromises(false);
        setNotificationVisible(false);
      }, 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentContract]);

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
              promiseCount={promiseData.count}
              promiseAmount={promiseData.amount}
            />
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};


export const SocialMediaShare = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const socials = [
    { icon: Telegram, url: "https://t.me/odoc_ic" },
    { icon: XIcon, url: "https://x.com/odoc_ic" },
    { icon: DiscordIcon, url: "https://discord.gg/HbaFQXDD" },
    { icon: YouTube, url: "https://www.youtube.com/@odoc_ic" },
    { icon: Instagram, url: "https://www.instagram.com/odoc_ic" },
    { icon: TikTokIcon, url: "https://www.tiktok.com/@odoc.app" },
    { icon: LinkedIn, url: "https://www.linkedin.com/company/odocic" }
  ];

  return (
    <Box sx={{ py: isMobile ? 4 : 3, bgcolor: isMobile ? 'background.paper' : 'transparent', textAlign: 'center' }}>
      <Container maxWidth={isMobile ? 'sm' : 'lg'}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: isMobile ? 600 : 500 }}>
          Join Our Community
        </Typography>
        <Box sx={isMobile 
          ? { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, maxWidth: 320, mx: 'auto' }
          : { display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }
        }>
          {socials.map(({ icon: Icon, url }, i) => (
            <IconButton 
              key={i} 
              onClick={() => window.open(url, "_blank")}
              sx={{ 
                bgcolor: 'action.hover',
                color: 'text.secondary',
                width: isMobile ? 56 : 42,
                height: isMobile ? 56 : 42,
                '&:hover': { bgcolor: 'action.selected' },
                '&:active': { opacity: 0.8 }
              }}
            >
              <Icon sx={{ fontSize: isMobile ? 24 : 20 }} />
            </IconButton>
          ))}
        </Box>
      </Container>
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