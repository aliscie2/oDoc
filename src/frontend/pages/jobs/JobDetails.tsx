import * as React from "react";
import { Job, JobUpdate, Match } from "$/declarations/backend/backend.did";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Tooltip,
  LinearProgress,
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
  const [expandedSection, setExpandedSection] = React.useState<string | false>(
    "basic",
  );
  const [editingCoverLetter, setEditingCoverLetter] = React.useState(false);
  const [coverLetterText, setCoverLetterText] = React.useState<string>(
    match?.cover_letter || "",
  );
  const [saving, setSaving] = React.useState(false);
  const [localScore, setLocalScore] = React.useState<number>(
    Math.round((job.required_match_score || 0.6) * 100),
  );
  const [showTooltip, setShowTooltip] = React.useState<boolean>(false);

  // Sync local state when job prop changes
  React.useEffect(() => {
    setLocalScore(Math.round((job.required_match_score || 0.6) * 100));
  }, [job.required_match_score]);

  const { profile } = useSelector(
    (state: { filesState: { profile: { id: string } | null } }) =>
      state.filesState,
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
    debounce(async (scoreAsDecimal: number) => {
      dispatch({
        type: "UPDATE_REQUIRED_MATCH_SCORE",
        score: scoreAsDecimal,
      });

      // Save to backend
      try {
        const jobUpdate: JobUpdate = {
          id: job.id,
          active: [],
          matches: [],
          updates: [],
          category: [],
          required_match_score: [scoreAsDecimal],
        };
        await backendActor.update_job([jobUpdate], []);
      } catch (error) {
        console.error("Failed to save match score:", error);
      }
    }, 500),
    [dispatch, job.id],
  );

  const handleScoreChange = (newScore: number) => {
    if (newScore < 60) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } else {
      setShowTooltip(false);
    }

    const clampedScore = Math.max(60, newScore);
    setLocalScore(clampedScore);

    const scoreAsDecimal = Math.max(0.6, clampedScore / 100);
    debouncedDispatch(scoreAsDecimal);

    // Trigger filter update
    dispatch({ type: "FILTER_MATCHES_BY_SCORE" });
  };

  const EmailsList = () => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 1.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <EmailIcon fontSize="small" color="info" />
        Contact
      </Typography>
      <Stack spacing={1.5}>
        {job.emails?.map((email, index) => (
          <Box
            key={index}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 1,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {email}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Box
        sx={{
          mt: 1.5,
          p: 1.5,
          bgcolor: "action.hover",
          borderRadius: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          We will only contact you when finding good matches.
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          🔒 Privacy Protected: We will not share your emails with other users.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: 720, md: 900 },
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          {job.job_titles && (
            <Typography
              variant="h5"
              component="h1"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1.3,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              {job.job_titles[0]}
            </Typography>
          )}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 2 }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 2 }}
          >
            <Chip
              icon={job.active ? <CheckCircleIcon /> : <PauseCircleIcon />}
              label={
                job.active
                  ? `Active ${Object.keys(job.category)[0]}`
                  : `Inactive ${Object.keys(job.category)[0]}`
              }
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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 0.5, sm: 2 }}
            sx={{ color: "text.secondary" }}
          >
            <Typography variant="caption">
              Created {formatRelativeTime(job.date_created)}
            </Typography>
            <Typography variant="caption">
              Updated {formatRelativeTime(job.date_updated)}
            </Typography>
          </Stack>
        </Box>

        {/* Job Description */}

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Profile Completion:
          </Typography>

          <Box flexGrow={1}>
            <LinearProgress
              variant="buffer"
              value={(job?.profile_completion ?? 0) * 100}
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            {Math.round((job?.profile_completion ?? 0) * 100)}%
          </Typography>
        </Box>

        {job.description && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1.5,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <DescriptionIcon fontSize="small" color="primary" />
              Description
            </Typography>
            <Box
              sx={{
                pl: { xs: 1.5, sm: 2 },
                borderLeft: "3px solid",
                borderColor: "primary.main",
                bgcolor: "action.hover",
                borderRadius: 1,
                p: { xs: 1.5, sm: 2 },
              }}
            >
              <MarkdownMessage message={job.description} isUser={false} />
            </Box>
          </Box>
        )}

        {/* Emails Section */}
        {showEmails && job.emails && job.emails.length > 0 && <EmailsList />}

        {/* Cover Letter */}
        {match && (match.cover_letter || canEdit) && (
          <Box sx={{ mb: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <EmailIcon fontSize="small" color="secondary" />
                Cover Letter
              </Typography>
              {canEdit && (
                <Button
                  variant={editingCoverLetter ? "contained" : "outlined"}
                  size="small"
                  onClick={() =>
                    editingCoverLetter
                      ? handleSaveCoverLetter()
                      : setEditingCoverLetter(true)
                  }
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
              <Box
                sx={{
                  pl: { xs: 1.5, sm: 2 },
                  borderLeft: "3px solid",
                  borderColor: "secondary.main",
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <MarkdownMessage
                  message={match.cover_letter || "No cover letter written yet."}
                  isUser={false}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Trust & Verification */}
        {job.trust_note && (
          <Box
            sx={{
              mb: 3,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 1,
              border: "2px solid",
              borderColor: "success.main",
              bgcolor: "success.50",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1.5,
                fontWeight: 600,
                color: "success.dark",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SecurityIcon fontSize="small" />
              Verified
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}
            >
              {job.trust_note}
            </Typography>
          </Box>
        )}

        {/* Position Details & Requirements */}
        {basicInfoFields.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TrendingUpIcon fontSize="small" color="info" />
              Details
            </Typography>

            {/* Match Score Section */}
            <Box
              sx={{
                mb: 2,
                p: { xs: 1.5, sm: 2 },
                bgcolor: "action.hover",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Match Score Requirement
              </Typography>

              {!job.user_id || profile?.id === job.user_id ? (
                <>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Required: {localScore}%
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
                        onChange={(e) =>
                          handleScoreChange(parseInt(e.target.value))
                        }
                        style={{
                          width: "100%",
                          height: "6px",
                          background:
                            "linear-gradient(to right, #1976d2, #42a5f5)",
                          borderRadius: "3px",
                          outline: "none",
                          WebkitAppearance: "none",
                        }}
                      />
                    </Box>
                  </Tooltip>
                </>
              ) : (
                <Typography variant="body2">
                  Required:{" "}
                  {Math.round((job.required_match_score || 0.6) * 100)}%
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                },
                gap: 1.5,
              }}
            >
              {basicInfoFields.map((key) => {
                const value = job[key as keyof Job];
                if (!value) return null;
                return (
                  <Box
                    key={key}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, textTransform: "uppercase" }}
                    >
                      {formatFieldName(key)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, mt: 0.5, wordBreak: "break-word" }}
                    >
                      {String(value)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
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
                mb: 1.5,
                borderRadius: "8px !important",
                border: "1px solid",
                borderColor: "divider",
                "&:before": { display: "none" },
                "&.Mui-expanded": { margin: "0 0 12px 0" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  borderRadius: "8px",
                  bgcolor: "action.hover",
                  px: { xs: 2, sm: 2.5 },
                  py: 1,
                  minHeight: 48,
                  "&.Mui-expanded": {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    minHeight: 48,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatFieldName(fieldName)}
                  </Typography>
                  <Chip
                    label={fieldValue.length}
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: "0.75rem" }}
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 2, sm: 2.5 } }}>
                {fieldName === "skills" ||
                fieldName === "technologies" ||
                fieldName === "tags" ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {fieldValue.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    ))}
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {fieldValue.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "action.hover",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
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
      </Paper>
    </Box>
  );
};

export default JobDetails;
