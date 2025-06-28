import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Job } from "$/declarations/backend/backend.did";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Collapse,
  Fade,
  Slide,
} from "@mui/material";
import {
  Visibility,
  Delete,
  Add,
  Work,
  LocationOn,
  AttachMoney,
  Schedule,
  TrendingUp,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Business,
  Email,
  CalendarToday,
  CheckCircle,
  Cancel,
  Star,
  Assignment,
  CardGiftcard,
  Person,
} from "@mui/icons-material";
import JobDetails from "./JobDetails";
import { useBackendContext } from "@/contexts/BackendContext";

interface AnimatedFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isHighlighted: boolean;
  delay?: number;
}

const AnimatedField: React.FC<AnimatedFieldProps> = ({
  label,
  value,
  icon,
  isHighlighted,
  delay = 0,
}) => {
  const theme = useTheme();

  return (
    <Fade in timeout={300 + delay}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1.5,
          borderRadius: 2,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHighlighted ? "scale(1.02)" : "scale(1)",
          bgcolor: isHighlighted
            ? theme.palette.primary.light + "20"
            : "transparent",
          border: isHighlighted
            ? `2px solid ${theme.palette.primary.main}`
            : "2px solid transparent",
          "&:hover": {
            bgcolor: theme.palette.action.hover,
          },
        }}
      >
        <Box
          sx={{
            color: isHighlighted
              ? theme.palette.primary.main
              : theme.palette.text.secondary,
            transition: "color 0.3s ease",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ display: "block", fontSize: "0.7rem" }}
          >
            {label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isHighlighted ? 600 : 400,
              color: isHighlighted
                ? theme.palette.primary.main
                : theme.palette.text.primary,
              transition: "all 0.3s ease",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

const getLocation = (job: Job) => {
  return job.location || "Remote";
};

// Check if we should show additional fields based on changes
const shouldShowAdditionalFields = () => {
  return (
    highlightedFields.has("skills") ||
    highlightedFields.has("company") ||
    highlightedFields.has("benefits") ||
    highlightedFields.has("requirements") ||
    highlightedFields.has("contactEmail") ||
    highlightedFields.has("applicationDeadline") ||
    highlightedFields.has("experienceLevel") ||
    highlightedFields.has("active")
  );
};

// Get additional fields that are highlighted
const getAdditionalHighlightedFields = () => {
  const additionalFields = [];

  if (highlightedFields.has("skills")) {
    additionalFields.push({
      field: "skills",
      label: "Skills",
      value: getSkills(currentJob!),
      icon: <Star fontSize="small" />,
    });
  }

  if (highlightedFields.has("company")) {
    additionalFields.push({
      field: "company",
      label: "Company",
      value: getCompany(currentJob!),
      icon: <Business fontSize="small" />,
    });
  }

  if (highlightedFields.has("experienceLevel")) {
    additionalFields.push({
      field: "experienceLevel",
      label: "Experience Level",
      value: getExperienceLevel(currentJob!),
      icon: <Person fontSize="small" />,
    });
  }

  if (highlightedFields.has("active")) {
    additionalFields.push({
      field: "active",
      label: "Status",
      value: getActiveStatus(currentJob!),
      icon: currentJob!.active ? (
        <CheckCircle fontSize="small" />
      ) : (
        <Cancel fontSize="small" />
      ),
    });
  }

  if (highlightedFields.has("contactEmail")) {
    additionalFields.push({
      field: "contactEmail",
      label: "Contact Email",
      value: getContactEmail(currentJob!),
      icon: <Email fontSize="small" />,
    });
  }

  if (highlightedFields.has("applicationDeadline")) {
    additionalFields.push({
      field: "applicationDeadline",
      label: "Application Deadline",
      value: getApplicationDeadline(currentJob!),
      icon: <CalendarToday fontSize="small" />,
    });
  }

  if (highlightedFields.has("benefits")) {
    additionalFields.push({
      field: "benefits",
      label: "Benefits",
      value: getBenefits(currentJob!),
      icon: <CardGiftcard fontSize="small" />,
    });
  }

  if (highlightedFields.has("requirements")) {
    additionalFields.push({
      field: "requirements",
      label: "Requirements",
      value: getRequirements(currentJob!),
      icon: <Assignment fontSize="small" />,
    });
  }

  return additionalFields;
};

const JobBriefData: React.FC<{
  currentJob: Job | null;
  highlightedFields: Set<string>;
  previousJob: Job | null;
  isMobile: boolean;
}> = ({ currentJob, highlightedFields, previousJob, isMobile }) => {
  const theme = useTheme();

  const getLocation = (job: Job) => {
    return job.location || "Remote";
  };

  const getJobCategory = (job: Job) => {
    return job.category
      ? Object.keys(job.category)[0] || "Uncategorized"
      : "Uncategorized";
  };

  const getJobType = (job: Job) => {
    return job.jobType
      ? Object.keys(job.jobType)[0] || "Not specified"
      : "Not specified";
  };

  const getSalary = (job: Job) => {
    return job.salary ? `$${job.salary.toLocaleString()}` : "Not specified";
  };

  const getExperienceLevel = (job: Job) => {
    return job.experienceLevel
      ? Object.keys(job.experienceLevel)[0] || "Not specified"
      : "Not specified";
  };

  const getSkills = (job: Job) => {
    return job.skills && job.skills.length > 0 ? job.skills : [];
  };

  const getCompany = (job: Job) => {
    return job.company || "Company not specified";
  };

  const getBenefits = (job: Job) => {
    return job.benefits || "Benefits not specified";
  };

  const getRequirements = (job: Job) => {
    return job.requirements || "Requirements not specified";
  };

  const getContactEmail = (job: Job) => {
    return job.contactEmail || "Contact not specified";
  };

  const getApplicationDeadline = (job: Job) => {
    if (job.applicationDeadline) {
      return new Date(
        Number(job.applicationDeadline) / 1000000,
      ).toLocaleDateString();
    }
    return "No deadline specified";
  };

  const getActiveStatus = (job: Job) => {
    return job.active ? "Active" : "Inactive";
  };

  // Helper to detect changes in arrays (like skills)
  const getArrayChanges = (current: string[], previous: string[]) => {
    const added = current.filter((item) => !previous.includes(item));
    const removed = previous.filter((item) => !current.includes(item));
    return {
      added,
      removed,
      unchanged: current.filter((item) => previous.includes(item)),
    };
  };

  // Helper to detect changes in text
  const getTextChanges = (current: string, previous: string) => {
    const currentWords = current.split(/\s+/);
    const previousWords = previous.split(/\s+/);

    const added = currentWords.filter((word) => !previousWords.includes(word));
    const removed = previousWords.filter(
      (word) => !currentWords.includes(word),
    );

    return { added, removed };
  };

  // Render skills with change indicators
  const renderSkillsWithChanges = () => {
    if (!currentJob || !previousJob || !highlightedFields.has("skills")) {
      return getSkills(currentJob!).join(", ");
    }

    const currentSkills = getSkills(currentJob);
    const previousSkills = getSkills(previousJob);
    const { added, removed, unchanged } = getArrayChanges(
      currentSkills,
      previousSkills,
    );

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {currentSkills.map((skill, index) => (
          <Chip
            key={`${skill}-${index}`}
            label={skill}
            size="small"
            sx={{
              bgcolor: added.includes(skill)
                ? theme.palette.success.light + "40"
                : "transparent",
              color: added.includes(skill)
                ? theme.palette.success.dark
                : theme.palette.text.primary,
              border: added.includes(skill)
                ? `1px solid ${theme.palette.success.main}`
                : `1px solid ${theme.palette.divider}`,
              animation: added.includes(skill)
                ? "skillPulse 2s ease-in-out"
                : "none",
              "@keyframes skillPulse": {
                "0%": { transform: "scale(1)", boxShadow: "none" },
                "50%": {
                  transform: "scale(1.05)",
                  boxShadow: `0 0 10px ${theme.palette.success.main}40`,
                },
                "100%": { transform: "scale(1)", boxShadow: "none" },
              },
            }}
          />
        ))}
        {removed.length > 0 && (
          <Box sx={{ ml: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <Typography
              variant="caption"
              color="error"
              sx={{ alignSelf: "center" }}
            >
              Removed:
            </Typography>
            {removed.map((skill, index) => (
              <Chip
                key={`removed-${skill}-${index}`}
                label={skill}
                size="small"
                sx={{
                  bgcolor: theme.palette.error.light + "40",
                  color: theme.palette.error.dark,
                  border: `1px solid ${theme.palette.error.main}`,
                  textDecoration: "line-through",
                  animation: "fadeOut 3s ease-in-out forwards",
                  "@keyframes fadeOut": {
                    "0%": { opacity: 1, transform: "scale(1)" },
                    "80%": { opacity: 0.3, transform: "scale(0.9)" },
                    "100%": { opacity: 0, transform: "scale(0.8)" },
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  // Render text with change indicators
  const renderTextWithChanges = (
    current: string,
    previous: string,
    fieldName: string,
  ) => {
    if (!highlightedFields.has(fieldName) || !previousJob) {
      return current;
    }

    const { added, removed } = getTextChanges(current, previous);

    if (added.length === 0 && removed.length === 0) {
      return current;
    }

    const words = current.split(/\s+/);

    return (
      <Box component="span">
        {words.map((word, index) => (
          <Box
            key={index}
            component="span"
            sx={{
              bgcolor: added.includes(word)
                ? theme.palette.success.light + "60"
                : "transparent",
              color: added.includes(word)
                ? theme.palette.success.dark
                : "inherit",
              padding: added.includes(word) ? "2px 4px" : "0",
              borderRadius: added.includes(word) ? "4px" : "0",
              margin: "0 2px",
              animation: added.includes(word)
                ? "textHighlight 2s ease-in-out"
                : "none",
              "@keyframes textHighlight": {
                "0%": { backgroundColor: "transparent" },
                "50%": { backgroundColor: theme.palette.success.light + "80" },
                "100%": { backgroundColor: theme.palette.success.light + "40" },
              },
            }}
          >
            {word}
          </Box>
        ))}
        {removed.length > 0 && (
          <Box
            component="span"
            sx={{
              ml: 1,
              p: 1,
              borderRadius: 1,
              bgcolor: theme.palette.error.light + "20",
              border: `1px solid ${theme.palette.error.light}`,
              fontSize: "0.8em",
            }}
          >
            <Typography component="span" variant="caption" color="error">
              Removed: {removed.join(", ")}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Check if we should show additional fields based on changes
  const shouldShowAdditionalFields = () => {
    return (
      highlightedFields.has("skills") ||
      highlightedFields.has("company") ||
      highlightedFields.has("benefits") ||
      highlightedFields.has("requirements") ||
      highlightedFields.has("contactEmail") ||
      highlightedFields.has("applicationDeadline") ||
      highlightedFields.has("experienceLevel") ||
      highlightedFields.has("active")
    );
  };

  // Get additional fields that are highlighted
  const getAdditionalHighlightedFields = () => {
    const additionalFields = [];

    if (highlightedFields.has("skills")) {
      additionalFields.push({
        field: "skills",
        label: "Skills",
        value: renderSkillsWithChanges(),
        icon: <Star fontSize="small" />,
        isSpecial: true,
      });
    }

    if (highlightedFields.has("company")) {
      const current = getCompany(currentJob!);
      const previous = previousJob ? getCompany(previousJob) : current;
      additionalFields.push({
        field: "company",
        label: "Company",
        value: renderTextWithChanges(current, previous, "company"),
        icon: <Business fontSize="small" />,
        isSpecial: true,
      });
    }

    if (highlightedFields.has("experienceLevel")) {
      additionalFields.push({
        field: "experienceLevel",
        label: "Experience Level",
        value: getExperienceLevel(currentJob!),
        icon: <Person fontSize="small" />,
      });
    }

    if (highlightedFields.has("active")) {
      additionalFields.push({
        field: "active",
        label: "Status",
        value: getActiveStatus(currentJob!),
        icon: currentJob!.active ? (
          <CheckCircle fontSize="small" />
        ) : (
          <Cancel fontSize="small" />
        ),
      });
    }

    if (highlightedFields.has("contactEmail")) {
      const current = getContactEmail(currentJob!);
      const previous = previousJob ? getContactEmail(previousJob) : current;
      additionalFields.push({
        field: "contactEmail",
        label: "Contact Email",
        value: renderTextWithChanges(current, previous, "contactEmail"),
        icon: <Email fontSize="small" />,
        isSpecial: true,
      });
    }

    if (highlightedFields.has("applicationDeadline")) {
      additionalFields.push({
        field: "applicationDeadline",
        label: "Application Deadline",
        value: getApplicationDeadline(currentJob!),
        icon: <CalendarToday fontSize="small" />,
      });
    }

    if (highlightedFields.has("benefits")) {
      const current = getBenefits(currentJob!);
      const previous = previousJob ? getBenefits(previousJob) : current;
      additionalFields.push({
        field: "benefits",
        label: "Benefits",
        value: renderTextWithChanges(current, previous, "benefits"),
        icon: <CardGiftcard fontSize="small" />,
        isSpecial: true,
      });
    }

    if (highlightedFields.has("requirements")) {
      const current = getRequirements(currentJob!);
      const previous = previousJob ? getRequirements(previousJob) : current;
      additionalFields.push({
        field: "requirements",
        label: "Requirements",
        value: renderTextWithChanges(current, previous, "requirements"),
        icon: <Assignment fontSize="small" />,
        isSpecial: true,
      });
    }

    return additionalFields;
  };

  if (!currentJob) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <TrendingUp
            sx={{
              color: theme.palette.primary.main,
              fontSize: "1.2rem",
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Job Overview
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 2,
          }}
        >
          <AnimatedField
            label="Category"
            value={getJobCategory(currentJob)}
            icon={<Work fontSize="small" />}
            isHighlighted={highlightedFields.has("category")}
            delay={0}
          />

          <AnimatedField
            label="Job Type"
            value={getJobType(currentJob)}
            icon={<Schedule fontSize="small" />}
            isHighlighted={highlightedFields.has("jobType")}
            delay={100}
          />

          <AnimatedField
            label="Location"
            value={getLocation(currentJob)}
            icon={<LocationOn fontSize="small" />}
            isHighlighted={highlightedFields.has("location")}
            delay={200}
          />

          <AnimatedField
            label="Salary"
            value={getSalary(currentJob)}
            icon={<AttachMoney fontSize="small" />}
            isHighlighted={highlightedFields.has("salary")}
            delay={300}
          />
        </Box>

        {/* Additional Dynamic Fields - Show when highlighted */}
        <Collapse in={shouldShowAdditionalFields()} timeout={300}>
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="caption"
              color="primary"
              sx={{
                display: "block",
                mb: 2,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Recently Updated Fields
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 2,
              }}
            >
              {getAdditionalHighlightedFields().map((fieldData) => (
                <Box
                  key={fieldData.field}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.primary.light + "10",
                    border: `2px solid ${theme.palette.primary.main}40`,
                  }}
                >
                  <Box
                    sx={{
                      color: theme.palette.primary.main,
                      mt: 0.5,
                    }}
                  >
                    {fieldData.icon}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{
                        display: "block",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      {fieldData.label}
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {fieldData.isSpecial ? (
                        fieldData.value
                      ) : (
                        <Typography variant="body2">
                          {fieldData.value}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Collapse>

        {/* Full Description */}
        {currentJob.description && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.action.hover,
              border: highlightedFields.has("description")
                ? `2px solid ${theme.palette.primary.main}`
                : "2px solid transparent",
              transition: "all 0.3s ease",
            }}
          >
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: "block", mb: 1 }}
            >
              Description
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: highlightedFields.has("description") ? 600 : 400,
                color: highlightedFields.has("description")
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
                transition: "all 0.3s ease",
              }}
            >
              {highlightedFields.has("description") && previousJob
                ? renderTextWithChanges(
                    currentJob.description,
                    previousJob.description || "",
                    "description",
                  )
                : currentJob.description}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
export default JobBriefData;
