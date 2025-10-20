import {
  Job,
  Match,
  Category,
  JobUpdate,
} from "$/declarations/backend/backend.did";

export interface JobState {
  currentJobId: string | null;
  jobChanges: JobUpdate[];
  jobs: Job[];
  isChanged: boolean;
  matchingJobs: Job[];
  jobSearchStage: 0 | 1 | 2;
}

const initialState: JobState = {
  currentJobId: localStorage.getItem("lastSelectedJobId") || null,
  jobChanges: [],
  jobs: [],
  isChanged: false,
  matchingJobs: [],
  jobSearchStage: 0,
};

type JobAction =
  | { type: "SET_CURRENT_JOB_ID"; job: Job }
  | { type: "UPDATE_JOB"; update: JobUpdate }
  | { type: "SET_JOBS"; jobs: Job[] }
  | { type: "ADD_JOB"; job: Job }
  | { type: "IS_LOOKING_NEW_MATCHES"; stage: 0 | 1 | 2 }
  | { type: "DELETE_JOB"; id: string }
  | { type: "DELETE_MATCH"; id: string }
  | {
      type: "UPDATE_FIELDS";
      updates: Array<
        [string, Array<string>] | { field: string; values: string[] }
      >;
      category?: string;
      required_match_score: number;
      feedback?: string;
      profile_completion?: number;
    }
  | { type: "UPDATE_REQUIRED_MATCH_SCORE"; score: number }
  | { type: "UPDATE_MATCHING_JOBS"; matchingJobs: Job[]; matches: Match[] }
  | { type: "UPDATE_MATCHES"; matches: Match[] }
  | { type: "CLEAR_JOB_CHANGES" }
  | { type: "INIT_JOBS"; matchingJobs: Job[]; jobs: Job[] }
  | { type: "TOGGLE_ACTIVE"; id: string };

// Helper functions
function generateDummyJob(): Job {
  return {
    id: `${Math.random().toString(36).substring(2, 9)}`,
    active: true,
    required_match_score: 0.6, // Default to 50% match required (0-1 scale)
    category: { Job: null } as Category,
    description: "",
    proficiency_level: "",
    education: [],
    experience: [],
    job_titles: [],
    certifications: [],
    skills: [],
    links: [],
    matches: [],
    profile_completion: 0.0,
    feedback: "",
    date_created: 0,
    date_updated: 0,
    user_id: "",
    notification_id: "",
    notification_username: "",
    trust_score: "",
    trust_note: "",
    emails: [],
    contacts: [],
  };
}

function applyFieldUpdates(
  job: Job,
  updates: Array<[string, string[]] | { field: string; values: string[] }>,
  category?: string,
  feedback?: string,
  profile_completion?: number,
): Job {
  const updatedJob = { ...job };

  if (category) {
    const formattedCategory =
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    if (formattedCategory === "Job" || formattedCategory === "Talent") {
      updatedJob.category = { [formattedCategory]: null } as Category;
    }
  }

  if (feedback !== undefined) {
    updatedJob.feedback = feedback;
  }

  if (profile_completion !== undefined) {
    updatedJob.profile_completion = Math.max(
      0,
      Math.min(1, profile_completion),
    );
  }

  // Ensure updates is an array and handle different formats
  if (!updates) {
    return updatedJob; // Return early if no updates
  }

  if (Array.isArray(updates)) {
    updates.forEach((update) => {
      let field: string;
      let values: string[];

      // Handle both tuple format [field, values] and object format {field, values}
      if (Array.isArray(update) && update.length >= 2) {
        [field, values] = update;
      } else if (
        typeof update === "object" &&
        update !== null &&
        "field" in update &&
        "values" in update
      ) {
        field = (update as any).field;
        values = (update as unknown).values;
      } else {
        console.warn("Invalid update format:", update);
        return; // Skip invalid updates
      }

      if (!field || typeof field !== "string" || !Array.isArray(values)) {
        console.warn("Invalid update data:", { field, values });
        return; // Skip invalid updates
      }

      const cleanedValues =
        field === "links"
          ? values.map((v) => v.replace(/`/g, "").trim())
          : values;

      const listFields = [
        "skills",
        "education",
        "experience",
        "certifications",
        "job_titles",
        "links",
        "emails",
        "contacts",
      ];
      if (listFields.includes(field)) {
        (updatedJob as unknown)[field] = cleanedValues;
      } else if (
        [
          "description",
          "proficiency_level",
          "trust_score",
          "trust_note",
          "feedback",
        ].includes(field)
      ) {
        (updatedJob as unknown)[field] =
          cleanedValues.length > 0 ? cleanedValues[0] : "";
      }
    });
  } else {
    console.warn("Updates is not an array:", updates);
  }

  return updatedJob;
}

export function jobReducer(
  state: JobState = initialState,
  action: JobAction,
): JobState {
  function isValidCurrentJob(state: JobState): boolean {
    return !!(
      state.currentJobId && state.jobs.some((j) => j.id === state.currentJobId)
    );
  }

  switch (action.type) {
    case "SET_CURRENT_JOB_ID":
      return { ...state, currentJobId: action.job?.id };
    case "TOGGLE_ACTIVE":
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.id ? { ...j, active: !j.active } : j,
        ),
        jobChanges: state.jobChanges.some((j) => j.id === action.id)
          ? state.jobChanges.map((j) =>
              j.id === action.id
                ? {
                    ...j,
                    active: [
                      !state.jobs.find((j) => j.id === action.id)?.active,
                    ],
                  }
                : j,
            )
          : [
              ...state.jobChanges,
              {
                id: action.id,
                active: [!state.jobs.find((j) => j.id === action.id)?.active],
                matches: [],
                updates: [],
                category: [],
                required_match_score: [],
              },
            ],
        isChanged: true,
      };
    case "UPDATE_FIELDS": {
      const category: unknown = {};
      category[action.category] = null;

      const formattedUpdates = action.updates.map((update) => {
        const [field, values] = Array.isArray(update)
          ? update
          : [update.field, update.values];

        return {
          field,
          values: Array.isArray(values)
            ? values.map((v) => String(v))
            : [String(values)],
        };
      });

      if (action.feedback !== undefined) {
        formattedUpdates.push({
          field: "feedback",
          values: [String(action.feedback)],
        });
      }

      if (action.profile_completion !== undefined) {
        formattedUpdates.push({
          field: "profile_completion",
          values: [String(action.profile_completion)],
        });
      }

      if (!isValidCurrentJob(state)) {
        const newJob = applyFieldUpdates(
          generateDummyJob(),
          action.updates,
          action.category,
          action.feedback,
          action.profile_completion,
        );
        newJob.active = true;

        const jobUpdate: JobUpdate = {
          id: newJob.id,
          active: [true],
          updates: formattedUpdates,
          category: [category],
          required_match_score: action.required_match_score
            ? [action.required_match_score]
            : [],
          matches: [],
        };

        return {
          ...state,
          currentJobId: newJob.id,
          jobs: [...state.jobs, newJob],
          jobChanges: [...state.jobChanges, jobUpdate],
          isChanged: true,
        };
      }

      const currentJob = state.jobs.find((j) => j.id === state.currentJobId);
      if (!currentJob) return state;

      const updatedJob = applyFieldUpdates(
        currentJob,
        action.updates,
        action.category,
        action.feedback,
        action.profile_completion,
      );

      const existingChange = state.jobChanges.find(
        (j) => j.id === state.currentJobId,
      );

      const contentFields = [
        "skills",
        "description",
        "job_titles",
        "education",
        "certifications",
        "experience",
        "category",
      ];

      // Safely check if updates exist and are iterable
      const hasContentChange =
        Array.isArray(action.updates) &&
        action.updates.some((update) => {
          const [field] = Array.isArray(update) ? update : [update.field];
          return contentFields.includes(field);
        });

      if (hasContentChange) {
        updatedJob.date_updated = Date.now() * 1e6;
      }

      const jobUpdate: JobUpdate = existingChange
        ? {
            ...existingChange,
            updates: [...existingChange.updates, ...formattedUpdates],
            category: [category],
            required_match_score: action.required_match_score
              ? [action.required_match_score]
              : existingChange.required_match_score,
          }
        : {
            id: state.currentJobId,
            active: [true],
            updates: formattedUpdates,
            category: [category],
            required_match_score: action.required_match_score
              ? [action.required_match_score]
              : [],
            matches: [],
          };

      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === state.currentJobId ? updatedJob : j,
        ),
        jobChanges: existingChange
          ? state.jobChanges.map((j) =>
              j.id === state.currentJobId ? jobUpdate : j,
            )
          : [...state.jobChanges, jobUpdate],
        isChanged: true,
      };
    }

    case "IS_LOOKING_NEW_MATCHES":
      return { ...state, jobSearchStage: action.stage };

    case "UPDATE_MATCHING_JOBS": {
      // Check if we actually need to update anything
      const currentJob = state.jobs.find((j) => j.id === state.currentJobId);
      if (!currentJob) return state;

      // Check if matches are actually different
      const existingMatches = currentJob.matches || [];
      const hasMatchChanges =
        action.matches.length !== existingMatches.length ||
        action.matches.some(
          (newMatch) =>
            !existingMatches.some(
              (existing) =>
                existing.job_id === newMatch.job_id &&
                Math.abs(existing.score - newMatch.score) < 0.001, // Use small epsilon for float comparison
            ),
        );

      // Check if matching jobs are actually different
      const hasMatchingJobChanges =
        action.matchingJobs.length !== state.matchingJobs.length ||
        action.matchingJobs.some(
          (newJob) =>
            !state.matchingJobs.some((existing) => existing.id === newJob.id),
        );

      // If nothing changed, return the same state reference
      if (!hasMatchChanges && !hasMatchingJobChanges) {
        return state;
      }

      const newMatches2 = hasMatchChanges
        ? existingMatches
            .filter(
              (match) => !action.matches.some((m) => m.job_id === match.job_id),
            )
            .concat(action.matches)
        : existingMatches;

      const newMatchingJobs = hasMatchingJobChanges
        ? state.matchingJobs
            .filter((j) => !action.matchingJobs.some((m) => m.id === j.id))
            .concat(action.matchingJobs)
        : state.matchingJobs;

      return {
        ...state,
        jobs: hasMatchChanges
          ? state.jobs.map((j) =>
              j.id === state.currentJobId ? { ...j, matches: newMatches2 } : j,
            )
          : state.jobs,
        matchingJobs: newMatchingJobs,
        jobChanges: state.jobChanges, // ← Don't modify jobChanges for matches
        isChanged: state.isChanged,
      };
    }
    case "UPDATE_MATCHES": {
      const currentJob = state.jobs.find((j) => j.id === state.currentJobId);
      if (!isValidCurrentJob(state)) return state;

      const updatedMatches =
        currentJob.matches?.map((existingMatch) => {
          const updateMatch = action.matches.find(
            (m) => m.job_id === existingMatch.job_id,
          );
          return updateMatch
            ? { ...existingMatch, ...updateMatch }
            : existingMatch;
        }) || [];

      const newMatches = action.matches.filter(
        (newMatch) =>
          !updatedMatches.some(
            (existing) => existing.job_id === newMatch.job_id,
          ),
      );
      const finalMatches = [...updatedMatches, ...newMatches];

      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === state.currentJobId
            ? { ...job, matches: finalMatches }
            : job,
        ),
        // ❌ Remove jobChanges logic - no longer needed
      };
    }

    case "DELETE_MATCH":
      if (!isValidCurrentJob(state)) return state;

      return {
        ...state,
        jobChanges: state.jobChanges.some((j) => j.id === state.currentJobId)
          ? state.jobChanges.map((j) =>
              j.id === state.currentJobId
                ? {
                    ...j,
                    matchChanges: {
                      ...j.matchChanges,
                      delete_matches: [
                        ...(j.matchChanges?.delete_matches || []),
                        action.id,
                      ],
                    },
                  }
                : j,
            )
          : [
              ...state.jobChanges,
              {
                id: state.currentJobId,
                active: [],
                updates: [],
                category: [],
                required_match_score: [],
                matchChanges: {
                  delete_matches: [action.id],
                  updates: [],
                  add: [],
                  reset: [],
                },
              },
            ],
        jobs: state.jobs.map((job) =>
          job.id === state.currentJobId
            ? {
                ...job,
                matches: job.matches.filter(
                  (match) => match.job_id !== action.id,
                ),
              }
            : job,
        ),
        isChanged: true,
      };

    case "CLEAR_JOB_CHANGES":
      return { ...state, jobChanges: [], isChanged: false };

    case "INIT_JOBS":
      return {
        ...state,
        jobs: action.jobs,
        matchingJobs: action.matchingJobs,
        // currentJobId: action.jobs[0]?.id || null,
      };

    case "SET_JOBS":
      return {
        ...state,
        jobs: action.jobs,
        // currentJobId:
        //   state.currentJobId &&
        //   action.jobs.some((j) => j.id === state.currentJobId)
        //     ? state.currentJobId
        //     : null,
      };

    case "ADD_JOB":
      return { ...state, jobs: [...state.jobs, action.job] };

    case "DELETE_JOB": {
      // If this is the last job, deactivate and clear it instead of deleting
      if (state.jobs.length === 1 && state.jobs[0].id === action.id) {
        const clearedJob = {
          ...state.jobs[0],
          active: false,
          description: "",
          proficiency_level: "",
          education: [],
          experience: [],
          job_titles: [],
          certifications: [],
          skills: [],
          links: [],
          matches: [],
          feedback: "",
          emails: [],
          contacts: [],
          trust_score: "",
          trust_note: "",
        };

        const jobUpdate: JobUpdate = {
          id: action.id,
          active: [false],
          updates: [
            { field: "description", values: [""] },
            { field: "proficiency_level", values: [""] },
            { field: "education", values: [] },
            { field: "experience", values: [] },
            { field: "job_titles", values: [] },
            { field: "certifications", values: [] },
            { field: "skills", values: [] },
            { field: "links", values: [] },
            { field: "feedback", values: [""] },
            { field: "emails", values: [] },
            { field: "contacts", values: [] },
            { field: "trust_score", values: [""] },
            { field: "trust_note", values: [""] },
          ],
          category: [],
          required_match_score: [],
          matches: [],
        };

        return {
          ...state,
          jobs: [clearedJob],
          currentJobId: clearedJob.id,
          jobChanges: [jobUpdate],
          isChanged: true,
        };
      }

      // Normal delete for multiple jobs
      const filteredJobs = state.jobs.filter((job) => job.id !== action.id);
      const isDeleted = state.currentJobId === action.id;
      const newCurrentId =
        isDeleted && filteredJobs.length > 0
          ? filteredJobs[0].id
          : isDeleted
            ? null
            : state.currentJobId;

      return {
        ...state,
        jobs: filteredJobs,
        currentJobId: newCurrentId,
        jobChanges: state.jobChanges.filter((j) => j.id !== action.id),
      };
    }
    case "UPDATE_REQUIRED_MATCH_SCORE":
      if (!isValidCurrentJob(state)) return state;

      const updatedJob = state.jobs.find((j) => j.id === state.currentJobId);
      if (!updatedJob) return state;

      const updatedJobWithScore = {
        ...updatedJob,
        required_match_score: action.score,
      };

      const existingChange = state.jobChanges.find(
        (j) => j.id === state.currentJobId,
      );

      const newJobChanges = existingChange
        ? state.jobChanges.map((j) =>
            j.id === state.currentJobId
              ? { ...j, required_match_score: [action.score] }
              : j,
          )
        : [
            ...state.jobChanges,
            {
              id: state.currentJobId,
              active: [],
              matches: [],
              updates: [],
              category: [],
              required_match_score: [action.score],
            },
          ];

      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === state.currentJobId ? updatedJobWithScore : j,
        ),
        jobChanges: newJobChanges,
        isChanged: true,
      };

    default:
      return state;
  }
}
