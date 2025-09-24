import * as React from "react";
import { Job, JobUpdate, Match } from "$/declarations/backend/backend.did";
import {
  Box,
  Typography,
  Divider,
  Paper,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Button,
  TextField,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SecurityIcon from "@mui/icons-material/Security";
import { formatRelativeTime } from "@/utils/time";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "@/utils/backendUtils";
import MarkdownMessage from "@/chatBot/markDownMessageRdnder";
import { debounce } from "lodash";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";

interface JobDetailsProps {
  job: Job;
  match: Match | null;
  showEmails?: boolean;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, match, showEmails }) => {
  const [expandedSection, setExpandedSection] = React.useState<string | false>("basic");
  const [editingCoverLetter, setEditingCoverLetter] = React.useState(false);
  const [coverLetterText, setCoverLetterText] = React.useState<string>(match?.cover_letter || "");
  const [saving, setSaving] = React.useState(false);
  const [localScore, setLocalScore] = React.useState<number>(Math.round((job.required_match_score || 0.6) * 100));
  const [showTooltip, setShowTooltip] = React.useState<boolean>(false);

  // Sync local state when job prop changes
  React.useEffect(() => {
    setLocalScore(Math.round((job.required_match_score || 0.6) * 100));
  }, [job.required_match_score]);

  const { profile } = useSelector(
    (state: { filesState: { profile: { id: string } | null } }) => state.filesState,
  );
  
  const canEdit = Object.keys(job.category)[0] !== "Talent";
  const dispatch = useDispatch();

  const handleSaveCoverLetter = async () => {
    if (!match) return;
    setSaving(true);
    try {
      const updatedMatch: Match = { ...match, cover_letter: coverLetterText };
      const jobUpdate: Array<JobUpdate> = [
        {
          id: job.id,
          updates: [],
          active: [],
          required_match_score: [],
          category: [],
          matches: [[updatedMatch]],
        },
      ];
      const res = await backendActor.update_job(jobUpdate, []);
      if ("Err" in res) {
        alert(JSON.stringify(res.Err));
      } else {
        setEditingCoverLetter(false);
      }
    } catch (error) {
      console.error("Failed to update cover letter:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatFieldName = (key: string) =>
    key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

  const basicInfoFields = Object.keys(job).filter(
    (key) =>
      !Array.isArray(job[key as keyof Job]) &&
      key !== "required_match_score" &&
      key !== "category" &&
      key !== "date_created" &&
      key !== "date_updated" &&
      key !== "user_id" &&
      key !== "active" &&
      key !== "description" &&
      key !== "cover_letter" &&
      key !== "trust_note" &&
      key !== "feedback" &&
      job[key as keyof Job] !== undefined,
  );

  const arrayFields = Object.keys(job).filter((key) => {
    const value = job[key as keyof Job];
    return (
      Array.isArray(value) &&
      key !== "matches" &&
      key !== "emails" &&
      value.length > 0
    );
  });

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedSection(isExpanded ? panel : false);
    };

  // Debounced dispatch function using lodash
  const debouncedDispatch = React.useCallback(
    debounce((scoreAsDecimal: number) => {
      dispatch({
        type: "UPDATE_REQUIRED_MATCH_SCORE",
        score: scoreAsDecimal,
      });
    }, 150),
    [dispatch],
  );

  const handleScoreChange = (newScore: number) => {
    // Show tooltip if user tries to go below 60%
    if (newScore < 60) {
      setShowTooltip(true);
      // Hide tooltip after 2 seconds
      setTimeout(() => setShowTooltip(false), 2000);
    } else {
      setShowTooltip(false);
    }

    // Ensure minimum of 60
    const clampedScore = Math.max(60, newScore);
    setLocalScore(clampedScore); // Update UI immediately for smooth experience

    // Convert from percentage (0-100) to decimal (0-1) and ensure minimum of 0.6
    const scoreAsDecimal = Math.max(0.6, clampedScore / 100);
    debouncedDispatch(scoreAsDecimal); // Debounced dispatch
  };

  const EmailsList = () => (
    <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon color="info" />
          Contact Information
        </Typography>
        <Stack spacing={2}>
          {job.emails?.map((email, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "action.selected",
                  borderColor: "primary.main",
                },
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.6,
                  fontFamily: "monospace",
                }}
              >
                {email}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, display: "block", lineHeight: 1.4 }}>
            🔒 Privacy Protected: We will not share your emails with other users. We will only contact you when finding good matches.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1000,
        mx: "auto",
        borderRadius: 3,
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        {job.job_titles && (
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            {job.job_titles[0]}
          </Typography>
        )}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Chip
            icon={job.active ? <CheckCircleIcon /> : <PauseCircleIcon />}
            label={job.active ? `Active ${Object.keys(job.category)[0]}` : `Inactive ${Object.keys(job.category)[0]}`}
            color={job.active ? "success" : "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          {!job.user_id || profile?.id === job.user_id ? (
            <Chip
              label="Your Posting"
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Posted by:
              </Typography>
              <UserAvatarMenu
                user_id={job.user_id}
                sx={{ width: 32, height: 32 }}
              />
            </Stack>
          )}
        </Stack>
        <Stack direction="row" spacing={3} sx={{ color: "text.secondary" }}>
          <Typography variant="body2">
            Created {formatRelativeTime(job.date_created)}
          </Typography>
          <Typography variant="body2">
            Updated {formatRelativeTime(job.date_updated)}
          </Typography>
        </Stack>
      </Box>

      {/* Job Description */}
      {job.description && (
        <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
              <DescriptionIcon color="primary" />
              Job Description
            </Typography>
            <Box sx={{ pl: 2, borderLeft: "3px solid", borderColor: "primary.main", bgcolor: "action.hover", borderRadius: 1, p: 2 }}>
              <MarkdownMessage message={job.description} isUser={false} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Emails Section */}
      {showEmails && job.emails && job.emails.length > 0 && <EmailsList />}

      {/* Cover Letter */}
      {match && (match.cover_letter || canEdit) && (
        <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon color="secondary" />
                Cover Letter
              </Typography>
              {canEdit && (
                <Button
                  variant={editingCoverLetter ? "contained" : "outlined"}
                  size="small"
                  onClick={() => editingCoverLetter ? handleSaveCoverLetter() : setEditingCoverLetter(true)}
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingCoverLetter ? "Save" : "Edit"}
                </Button>
              )}
            </Stack>
            {editingCoverLetter ? (
              <TextField
                fullWidth
                multiline
                rows={8}
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
                placeholder="Write your personalized cover letter..."
                variant="outlined"
              />
            ) : (
              <Box sx={{ pl: 2, borderLeft: "3px solid", borderColor: "secondary.main", bgcolor: "action.hover", borderRadius: 1, p: 2 }}>
                <MarkdownMessage message={match.cover_letter || "No cover letter written yet."} isUser={false} />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trust & Verification */}
      {job.trust_note && (
        <Card sx={{ mb: 3, borderRadius: 2, border: "2px solid", borderColor: "success.main", bgcolor: "action.hover" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "success.dark", display: "flex", alignItems: "center", gap: 1 }}>
              <SecurityIcon />
              Verified & Trusted
            </Typography>
            <Box sx={{ bgcolor: "background.paper", borderRadius: 1, p: 2, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {job.trust_note}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Position Details & Requirements */}
      {basicInfoFields.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUpIcon color="info" />
              Position Details & Requirements
            </Typography>

            {/* Match Score Section */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "action.hover", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Match Score Requirement
                </Typography>
              </Stack>

              {!job.user_id || profile?.id === job.user_id ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Required Match Score: {localScore}%
                  </Typography>
                  <Tooltip
                    title="Minimum match score is 60%. You cannot set it lower than this value."
                    placement="top"
                    open={showTooltip}
                  >
                    <Box sx={{ width: "100%" }}>
                      <input
                        type="range"
                        min="60"
                        max="100"
                        value={localScore}
                        onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "linear-gradient(to right, #1976d2, #42a5f5)",
                          borderRadius: "3px",
                          outline: "none",
                          WebkitAppearance: "none",
                        }}
                      />
                    </Box>
                  </Tooltip>
                </>
              ) : (
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Required Match Score: {Math.round((job.required_match_score || 0.6) * 100)}%
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {basicInfoFields.map((key) => {
                const value = job[key as keyof Job];
                if (!value) return null;
                return (
                  <Box
                    key={key}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease",
                      "&:hover": { bgcolor: "action.selected", borderColor: "primary.main" },
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      {formatFieldName(key)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5, wordBreak: "break-word" }}>
                      {String(value)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Skills & Experience Sections */}
      {arrayFields.map((fieldName) => {
        const fieldValue = job[fieldName as keyof Job] as string[];
        if (!fieldValue || fieldValue.length === 0) return null;

        return (
          <Accordion
            key={fieldName}
            expanded={expandedSection === fieldName}
            onChange={handleAccordionChange(fieldName)}
            sx={{
              mb: 2,
              borderRadius: "8px !important",
              border: "1px solid",
              borderColor: "divider",
              "&:before": { display: "none" },
              "&.Mui-expanded": { margin: "0 0 16px 0" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                borderRadius: "8px",
                bgcolor: "action.hover",
                borderBottom: "1px solid",
                borderColor: "divider",
                px: 3,
                py: 1.5,
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  bgcolor: "action.selected",
                },
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatFieldName(fieldName)}
                </Typography>
                <Chip label={fieldValue.length} size="small" color="primary" sx={{ fontWeight: 600 }} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: "background.paper" }}>
              {fieldName === "skills" || fieldName === "technologies" || fieldName === "tags" ? (
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1.5 }}>
                  {fieldValue.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 500, borderRadius: 2, "&:hover": { bgcolor: "action.selected" } }}
                    />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {fieldValue.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s ease",
                        "&:hover": { bgcolor: "action.selected", borderColor: "primary.main" },
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Divider sx={{ mt: 4, borderColor: "divider" }} />
    </Paper>
  );
};

export default JobDetails;