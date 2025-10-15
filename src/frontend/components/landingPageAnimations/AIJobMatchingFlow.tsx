import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  Container,
  Grid2,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { backendActor } from "@/utils/backendUtils";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
const useTypingAnimation = (texts: string[], speed = 50) => {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!texts.length) return;
    const target = texts[idx];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (text.length < target.length) {
        timeout = setTimeout(() => setText(target.slice(0, text.length + 1)), speed);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 3000);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), speed / 3);
      } else {
        setIdx((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, idx, isTyping, texts.length, speed]);

  return text;
};

const AIJobMatchingFlow = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({ users: 0, jobsCount: 0, talentsCount: 0 });
  const [displayStats, setDisplayStats] = useState({ users: 0, jobsCount: 0, talentsCount: 0 });
  const [opportunities, setOpportunities] = useState<Array<{ id: string; user_id?: string; job_titles?: string[]; skills?: string[]; category?: Record<string, null> }>>([]);
  const [scrollPos, setScrollPos] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const queries = useMemo(() => ["Senior React developer with 5+ years", "Marketing manager in tech", "Rust backend Job in ICP eco system"], []);
  const typedText = useTypingAnimation(queries, 60);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await backendActor.get_sns_status();
        if (res.Ok) {
          const { number_users, jobs_count, talents_count, latest_jobs, latest_talents } = res.Ok;
          setStats({ users: Math.floor(number_users), jobsCount: Math.floor(jobs_count), talentsCount: Math.floor(talents_count) });
          const combined = [...(latest_jobs || []), ...(latest_talents || [])];
          if (combined.length) setOpportunities([...combined, ...combined, ...combined]);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (hasAnimated || (!stats.users && !stats.jobsCount && !stats.talentsCount)) return;
    
    const duration = 2000, steps = 60, stepDur = duration / steps;
    const timers: NodeJS.Timeout[] = [];
    
    (Object.keys(stats) as Array<keyof typeof stats>).forEach(key => {
      const target = stats[key];
      const inc = target / steps;
      let curr = 0, step = 0;
      const timer = setInterval(() => {
        step++;
        curr = Math.min(curr + inc, target);
        setDisplayStats(prev => ({ ...prev, [key]: Math.floor(curr) }));
        if (step >= steps || curr >= target) {
          setDisplayStats(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        }
      }, stepDur);
      timers.push(timer);
    });
    
    setHasAnimated(true);
    return () => timers.forEach(t => clearInterval(t));
  }, [stats, hasAnimated]);

  useEffect(() => {
    if (!opportunities.length) return;
    const interval = setInterval(() => setScrollPos(prev => prev + 0.5), 20);
    return () => clearInterval(interval);
  }, [opportunities.length]);

  const statBoxes = useMemo(() => [
    { value: displayStats.users, label: "Users", color: theme.palette.primary.main },
    { value: displayStats.jobsCount, label: "Jobs", color: theme.palette.primary.main },
    { value: displayStats.talentsCount, label: "Talents", color: theme.palette.primary.main }
  ], [displayStats, theme.palette.primary.main]);

  return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 600, fontSize: "2.5rem", textAlign: "center", color: theme.palette.primary.main }}>
          Find Matches in Seconds
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: 560, mx: "auto", textAlign: "center", lineHeight: 1.6, color: "text.secondary" }}>
          Just describe who you&apos;re looking for.
        </Typography>

        <Box sx={{ maxWidth: 900, mx: "auto", bgcolor: "background.paper", borderRadius: 3, overflow: "hidden", border: `1px solid ${theme.palette.divider}` }}>
          <Grid2 container>
            <Grid2 size={{ xs: 12, md: 6 }} sx={{ borderRight: { md: `1px solid ${theme.palette.divider}` }, borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: "none" } }}>
              <Box sx={{ p: 4, minHeight: 400 }}>
                <Typography variant="overline" sx={{ color: "text.primary", fontWeight: 600, letterSpacing: 1, mb: 3, display: "block" }}>
                  STEP 1: ASK
                </Typography>

                <Box sx={{ bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "grey.100", borderRadius: 2, p: 2.5, minHeight: 56, display: "flex", alignItems: "center", border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body1" sx={{ fontSize: "1rem", fontWeight: 500, flex: 1 }}>
                    I am looking for {typedText}
                    <Box component="span" sx={{ width: 2, height: 20, bgcolor: "primary.main", display: "inline-block", animation: "blink 1s infinite", ml: 0.5, verticalAlign: "middle",
                      "@keyframes blink": { "0%, 50%": { opacity: 1 }, "51%, 100%": { opacity: 0 } } }} />
                  </Typography>
                </Box>

                <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
                  {statBoxes.map((stat, i) => (
                    <Box key={i} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "grey.100", border: `1px solid ${theme.palette.divider}`, textAlign: "center",
                      transition: "all 0.3s", "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" } }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, fontSize: "2rem", mb: 0.5 }}>{stat.value}</Typography>
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid2>

            <Grid2 size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 4, minHeight: 400 }}>
                <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="overline" sx={{ color: "text.primary", fontWeight: 600, letterSpacing: 1 }}>
                    STEP 2: GET MATCHES
                  </Typography>
                  {opportunities.length > 0 && <CheckCircleIcon sx={{ color: "success.main", fontSize: 18 }} />}
                </Box>

                {opportunities.length > 0 ? (
                  <Box sx={{ height: 280, overflow: "hidden", position: "relative" }}>
                    <Box sx={{ transform: `translateY(-${scrollPos % ((opportunities.length / 3) * 70)}px)`, willChange: "transform" }}>
                      <Stack spacing={1.5}>
                        {opportunities.map((job, i) => {
                          const category = job.category ? Object.keys(job.category)[0] : "Job";
                          return (
                            <Box key={`${job.id}-${i}`} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper", transition: "all 0.3s", cursor: "pointer",
                              "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)", boxShadow: `0 4px 12px ${theme.palette.primary.main}20` } }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box sx={{ pointerEvents: "none" }}>
                                  {job.user_id ? (
                                    <UserAvatarMenu user_id={job.user_id} hide={["Profile", "Message", "Review"]} sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.background.paper}` }} />
                                  ) : (
                                    <Avatar sx={{ width: 40, height: 40, bgcolor: category === "Talent" ? "success.main" : "primary.main", border: `2px solid ${theme.palette.background.paper}` }}>
                                      {job.job_titles?.[0]?.[0]?.toUpperCase() || category[0]}
                                    </Avatar>
                                  )}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.25 }}>
                                    {job.job_titles?.[0] || `${category} Position`}
                                  </Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.7, display: "block", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {job.skills?.slice(0, 3).join(", ") || "Skills not specified"}
                                  </Typography>
                                </Box>
                                <Chip label={category} size="small" sx={{ bgcolor: category === "Talent" ? "success.main" : "primary.main", color: "white", fontWeight: 700, fontSize: "0.7rem", height: 24, minWidth: 48 }} />
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 200, opacity: 0.4 }}>
                    <Typography variant="body2">Loading opportunities...</Typography>
                  </Box>
                )}
              </Box>
            </Grid2>
          </Grid2>
        </Box>
      </Container>
    </Box>
  );
};

export default AIJobMatchingFlow;