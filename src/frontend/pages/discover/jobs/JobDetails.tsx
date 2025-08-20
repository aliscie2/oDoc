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
  Grid,
  Button,
  TextField,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "@/utils/time";
import { useDispatch, useSelector } from "react-redux";
import { useBackendContext } from "@/contexts/BackendContext";
import MarkdownMessage from "@/pages/dash_board_v1/markDownMessageRdnder";
import { debounce } from "lodash";

interface JobDetailsProps {
  job: Job;
  match: Match | null;
  showEmails?: boolean;
}

interface MatchScoreComponentProps {
  job: Job;
  isOwner: boolean;
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

  const { profile } = useSelector((state: any) => state.filesState);
  const { backendActor } = useBackendContext();
  const canEdit = Object.keys(job.category)[0] !== "Talent";

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
      if (res.Err) {
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
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedSection(isExpanded ? panel : false);
    };
  const dispatch = useDispatch();

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
    <Card
      sx={{
        mb: { xs: 2, sm: 3 },
        mx: { xs: 0, sm: "auto" },
        borderRadius: { xs: 1, sm: 2 },
        boxShadow: 1,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <EmailIcon />
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
          >
            Emails ({job.emails?.length || 0})
          </Typography>
        </Stack>
        <Stack spacing={1}>
          {job.emails?.map((email, index) => (
            <Box
              key={index}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.6,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {email}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Typography
          variant="caption"
          sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem" }, fontWeight: 400 }}
        >
          We will not share your emsils with other users. But we will contact
          you when finding good match.
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1, sm: 2, md: 4 },
        maxWidth: 900,
        mx: { xs: 0, sm: "auto" },
        borderRadius: { xs: 0, sm: 3 },
        width: { xs: "100%", sm: "auto" },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{ textAlign: "center", mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}
      >
        {job.job_titles && (
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 2,
              fontWeight: 800,
              textShadow: "0 2px 10px rgba(0,0,0,0.1)",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
            }}
          >
            {job.job_titles[0]}
          </Typography>
        )}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Chip
            icon={job.active ? <CheckCircleIcon /> : <PauseCircleIcon />}
            label={job.active ? "Active" : "Inactive"}
            color={job.active ? "success" : "default"}
            variant="filled"
            sx={{ fontWeight: "bold", px: 2, py: 1, height: "auto" }}
          />
          {!job.user_id || profile?.id === job.user_id ? (
            <Chip
              label="Created by You"
              color="primary"
              variant="filled"
              sx={{ fontWeight: "bold", px: 2, py: 1, height: "auto" }}
            />
          ) : (
            <Button
              component={Link}
              to={`/user/?id=${job.user_id}`}
              variant="outlined"
              startIcon={<PersonIcon />}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
              }}
            >
              View Profile
            </Button>
          )}
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="center"
          sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
        >
          <Typography variant="body2" color="text.secondary">
            Created: {formatRelativeTime(job.date_created)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Updated: {formatRelativeTime(job.date_updated)}
          </Typography>
        </Stack>
      </Box>

      {/* Description Section */}
      {job.description && (
        <Card
          sx={{
            mb: { xs: 2, sm: 3 },
            mx: { xs: 0, sm: "auto" },
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <DescriptionIcon />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                }}
              >
                Description
              </Typography>
            </Stack>

            <MarkdownMessage
              message={job.description || "No deescption provided yet."}
              isUser={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Emails Section */}
      {showEmails && job.emails && job.emails.length > 0 && <EmailsList />}

      {/* Cover Letter Section */}
      {match && (match.cover_letter || canEdit) && (
        <Card
          sx={{
            mb: { xs: 2, sm: 3 },
            mx: { xs: 0, sm: "auto" },
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: 1,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <EmailIcon />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  }}
                >
                  Cover Letter
                </Typography>
              </Stack>
              {canEdit && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    editingCoverLetter
                      ? handleSaveCoverLetter()
                      : setEditingCoverLetter(true)
                  }
                  disabled={saving}
                  sx={{
                    color: "white",
                    borderColor: "white",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
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
                placeholder="Write your cover letter..."
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "2px solid white" },
                  },
                  "& .MuiInputBase-input": {
                    fontSize: { xs: "0.9rem", sm: "1.1rem" },
                    lineHeight: 1.7,
                    color: "black",
                  },
                }}
              />
            ) : (
              <MarkdownMessage
                message={match.cover_letter || "No cover letter written yet."}
                isUser={false}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Trust Note Section */}
      {job.trust_note && (
        <Card
          sx={{
            mb: { xs: 2, sm: 3 },
            mx: { xs: 0, sm: "auto" },
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: 1,
            background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <VerifiedUserIcon />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                }}
              >
                Trust Note
              </Typography>
            </Stack>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.7,
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                whiteSpace: "pre-wrap",
              }}
            >
              {job.trust_note}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      {basicInfoFields.length > 0 && (
        <Card
          sx={{
            mb: { xs: 2, sm: 3 },
            mx: { xs: 0, sm: "auto" },
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: 1,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "primary.main",
                mb: 3,
                textAlign: "center",
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
              }}
            >
              Job Details
            </Typography>

            <Grid container spacing={{ xs: 1, sm: 3 }}>
              {!job.user_id || profile?.id === job.user_id ? (
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    width: "100%",
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Required Match Score: {localScore}%
                  </Typography>
                  <Tooltip
                    title="Minimum match score is 60%. You cannot set it lower than this value."
                    placement="top"
                    open={showTooltip}
                  >
                    <div style={{ width: "100%" }}>
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
                          height: "4px",
                          background: "#e0e0e0",
                          borderRadius: "2px",
                          outline: "none",
                          WebkitAppearance: "none",
                        }}
                      />
                    </div>
                  </Tooltip>
                </Box>
              ) : (
                <Box sx={{ mb: 2, width: "100%" }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Required Match Score:{" "}
                    {Math.round((job.required_match_score || 0.6) * 100)}%
                  </Typography>
                </Box>
              )}

              {basicInfoFields.map((key) => {
                const value = job[key as keyof Job];
                if (!value) return null;
                return (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        border: 1,
                        borderColor: "divider",
                        minHeight: { xs: 60, sm: 80 },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontWeight: 500,
                          mb: 0.5,
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        }}
                      >
                        {formatFieldName(key)}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          wordBreak: "break-word",
                          fontSize: { xs: "0.9rem", sm: "1.25rem" },
                        }}
                      >
                        {String(value)}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Array Fields Accordions */}
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
              mx: { xs: 0, sm: "auto" },
              borderRadius: "12px !important",
              boxShadow: 1,
              "&:before": { display: "none" },
              "&.Mui-expanded": { margin: "0 0 16px 0" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon color="primary" />}
              sx={{
                borderRadius: "12px",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                px: { xs: 2, sm: 3 },
                "& .MuiAccordionSummary-content": { margin: "16px 0" },
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {formatFieldName(fieldName)} ({fieldValue.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
              {fieldName === "skills" ||
              fieldName === "technologies" ||
              fieldName === "tags" ? (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", gap: { xs: 1, sm: 1.5 } }}
                >
                  {fieldValue.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      variant="outlined"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.9rem" },
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 1,
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={1}>
                  {fieldValue.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        color: "white",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          lineHeight: 1.6,
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
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

      <Divider
        sx={{
          mt: 4,
          background:
            "linear-gradient(90deg, transparent, #667eea, transparent)",
          height: 2,
          border: "none",
        }}
      />
    </Paper>
  );
};
export default JobDetails;
