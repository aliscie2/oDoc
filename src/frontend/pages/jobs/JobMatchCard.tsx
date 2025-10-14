import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Tooltip,
} from "@mui/material";
import { Job, Match } from "$/declarations/backend/backend.did";
import ConnectButton from "./ConnectButton";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";

interface JobMatchCardProps {
  job: Job;
  match: Match;
  score: number;
  onViewDetails: () => void;
}

const getScoreColor = (score: number): string => {
  if (score >= 70) return "#4caf50";
  if (score >= 30) return "#ff9800";
  return "#f44336";
};


const JobMatchCard: React.FC<JobMatchCardProps> = ({ 
  job, 
  match, 
  score, 
  onViewDetails 
}) => {
  const scoreColor = getScoreColor(score);
  const description = job.description || "";
  const fallbackText = description || (
    job.skills?.length > 0
      ? `Skills: ${job.skills.slice(0, 5).join(", ")}${job.skills.length > 5 ? "..." : ""}`
      : ""
  );

  return (
    <Card
      data-testid={`job-match-card-${job.id}`}
      sx={{
        transition: "all 0.2s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          {/* Avatar */}
          <Box sx={{ flexShrink: 0 }}>
            <UserAvatarMenu user_id={job.user_id} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header: Title + Badge + Button */}
            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 1, 
              mb: 1.5,
              flexWrap: "wrap"
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: "1rem", 
                  lineHeight: 1.3,
                  flex: 1,
                  minWidth: 0
                }}
              >
                {job.job_titles?.[0] || "Untitled Position"}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                <Tooltip title="Match score based Comparison between job requirement and the talent profile" arrow>
                  <Chip
                    label={`${score}% match`}
                    size="small"
                    sx={{
                      bgcolor: scoreColor,
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      height: 24,
                      flexShrink: 0
                    }}
                  />
                </Tooltip>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <ConnectButton jobId={job.id} matchingJob={job} showAvatar={false} />
                </Box>
              </Box>
            </Box>

            {/* Description */}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ lineHeight: 1.5, mb: 1.5, wordBreak: "break-word" }}
            >
              {fallbackText.slice(0, 200)}{fallbackText.length > 200 ? "..." : ""}{" "}
              <Typography
                component="span"
                onClick={onViewDetails}
                sx={{
                  color: "primary.main",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Read more...
              </Typography>
            </Typography>

            {/* Missing Skills */}
            {match.missmatching_skills?.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                <Typography 
                  variant="caption" 
                  sx={{ fontSize: "0.7rem", lineHeight: 2.4, flexBasis: "100%" }}
                >
                  Missing skills:
                </Typography>
                {match.missmatching_skills.slice(0, 3).map((skill, i) => (
                  <Chip 
                    key={i} 
                    label={skill} 
                    size="small" 
                    variant="outlined" 
                    sx={{ height: 20, fontSize: "0.7rem" }} 
                  />
                ))}
                {match.missmatching_skills.length > 3 && (
                  <Chip 
                    label={`+${match.missmatching_skills.length - 3}`} 
                    size="small" 
                    variant="outlined" 
                    sx={{ height: 20, fontSize: "0.7rem" }} 
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Mobile Connect Button */}
          <Box sx={{ display: { xs: "block", sm: "none" }, width: "100%", mt: 1 }}>
            <ConnectButton jobId={job.id} matchingJob={job} showAvatar={false} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobMatchCard;