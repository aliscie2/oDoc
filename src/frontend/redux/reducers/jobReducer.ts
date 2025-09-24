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
  currentJobId: null,
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
        values = (update as any).values;
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
        (updatedJob as any)[field] = cleanedValues;
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

    case "UPDATE_FIELDS":
      const category: unknown = {};
      category[action.category] = null;
      let jobUpdate: JobUpdate = {
        id: state.currentJobId,
        active: [],
        matches: [],
        updates: [],
        category: [category],
        required_match_score: [action.required_match_score],
      };

      // Convert updates and add feedback if present
      const formattedUpdates = action.updates.map((update) =>
        Array.isArray(update)
          ? { field: update[0], values: update[1] }
          : update,
      );

      // Add feedback to updates if provided
      if (action.feedback !== undefined) {
        formattedUpdates.push({ field: "feedback", values: [action.feedback] });
      }

      // Add profile_completion to updates if provided
      if (action.profile_completion !== undefined) {
        formattedUpdates.push({
          field: "profile_completion",
          values: [action.profile_completion.toString()],
        });
      }

      if (!state.currentJobId) {
        const newJob = applyFieldUpdates(
          generateDummyJob(),
          action.updates,
          action.category,
          action.feedback,
          action.profile_completion,
        );
        jobUpdate.id = newJob.id;
        jobUpdate.active = [true];
        jobUpdate.updates = formattedUpdates;
        return {
          ...state,
          currentJobId: newJob.id,
          jobs: [...state.jobs, newJob],
          jobChanges: [...state.jobChanges, jobUpdate],
          isChanged: true,
        };
      }

      const job2 = state.jobs.find((j) => j.id === state.currentJobId);
      if (!job2) return state;

      const updatedJob2 = applyFieldUpdates(
        job2,
        action.updates,
        action.category,
        action.feedback,
        action.profile_completion,
      );

      const oldJobUpdate = state.jobChanges.find(
        (j) => j.id == state.currentJobId,
      );
      jobUpdate.id = state.currentJobId;

      if (oldJobUpdate) {
        jobUpdate = { ...oldJobUpdate };
        jobUpdate.updates = [...jobUpdate.updates, ...formattedUpdates];
        return {
          ...state,
          jobs: state.jobs.map((j) =>
            j.id === state.currentJobId ? updatedJob2 : j,
          ),
          jobChanges: state.jobChanges.map((j) =>
            j.id === state.currentJobId ? jobUpdate : j,
          ),
          isChanged: true,
        };
      }

      jobUpdate.active = [true];
      updatedJob2.active = true;
      jobUpdate.updates = formattedUpdates;
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === state.currentJobId ? updatedJob2 : j,
        ),
        jobChanges: [
          ...state.jobChanges.filter((j) => j.id !== state.currentJobId),
          jobUpdate,
        ],
        isChanged: true,
      };

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

      const newState = {
        ...state,
        jobs: hasMatchChanges
          ? state.jobs.map((j) =>
              j.id === state.currentJobId ? { ...j, matches: newMatches2 } : j,
            )
          : state.jobs,
        matchingJobs: newMatchingJobs,
        jobChanges: hasMatchChanges
          ? state.jobChanges.some((j) => j.id === state.currentJobId)
            ? state.jobChanges.map((j) =>
                j.id === state.currentJobId
                  ? { ...j, matches: [newMatches2] }
                  : j,
              )
            : [
                ...state.jobChanges,
                {
                  id: state.currentJobId!,
                  active: [],
                  matches: [newMatches2],
                  updates: [],
                  category: [],
                  required_match_score: [],
                },
              ]
          : state.jobChanges,
        isChanged: hasMatchChanges ? true : state.isChanged,
      };



      return newState;
    }

    case "UPDATE_MATCHES": {
      const existingJobChange = state.jobChanges.find(
        (j) => j.id === state.currentJobId,
      );

      const currentJob = state.jobs.find((j) => j.id === state.currentJobId);
      if (!currentJob) return state;

      // Fix: Preserve all existing matches and only update specific ones
      // Previously this was replacing ALL matches with just the updated ones,
      // causing other matches to disappear when connecting to a job
      const updatedMatches = currentJob.matches?.map((existingMatch) => {
        const updateMatch = action.matches.find(
          (m) => m.job_id === existingMatch.job_id,
        );
        return updateMatch ? { ...existingMatch, ...updateMatch } : existingMatch;
      }) || [];

      // Add any completely new matches that don't exist yet
      const newMatches = action.matches.filter(
        (newMatch) =>
          !updatedMatches.some((existing) => existing.job_id === newMatch.job_id),
      );
      const finalMatches = [...updatedMatches, ...newMatches];

      let newChange: JobUpdate;

      if (existingJobChange) {
        newChange = {
          ...existingJobChange,
          matches: [finalMatches],
        };
      } else {
        newChange = {
          id: state.currentJobId!,
          active: [],
          matches: [finalMatches],
          updates: [],
          category: [],
          required_match_score: [],
        };
      }



      return {
        ...state,
        isChanged: true,
        jobs: state.jobs.map((job) =>
          job.id === state.currentJobId
            ? { ...job, matches: finalMatches }
            : job,
        ),
        jobChanges: existingJobChange
          ? state.jobChanges.map((change) =>
              change.id === state.currentJobId ? newChange : change,
            )
          : [...state.jobChanges, newChange],
      };
    }

    case "CLEAR_JOB_CHANGES":
      return { ...state, jobChanges: [], isChanged: false };

    case "INIT_JOBS":
      return {
        ...state,
        jobs: action.jobs,
        matchingJobs: action.matchingJobs,
        currentJobId: action.jobs[0]?.id || null,
      };

    case "SET_JOBS":
      return {
        ...state,
        jobs: action.jobs,
        currentJobId:
          state.currentJobId &&
          action.jobs.some((j) => j.id === state.currentJobId)
            ? state.currentJobId
            : null,
      };

    case "ADD_JOB":
      return { ...state, jobs: [...state.jobs, action.job] };

    case "DELETE_JOB":
      return {
        ...state,
        jobs: state.jobs.filter((job) => job.id !== action.id),
        // currentJobId: state.currentJobId === action.id ? null : state.currentJobId,
        // jobChanges: state.jobChanges.filter(j => j.id !== action.id),
      };

    case "DELETE_MATCH":
      const newMatches =
        state.jobs
          .find((j) => j.id === state.currentJobId)
          ?.matches.filter((match) => match.job_id !== action.id) || [];

      // Calculate updated jobChanges once
      const updatedJobChanges = state.jobChanges.some(
        (j) => j.id === state.currentJobId,
      )
        ? state.jobChanges.map((j) =>
            j.id === state.currentJobId ? { ...j, matches: [newMatches] } : j,
          )
        : [
            ...state.jobChanges,
            {
              id: state.currentJobId,
              active: [],
              matches: [newMatches],
              updates: [],
              category: [],
              required_match_score: [],
            },
          ];

      return {
        ...state,
        jobChanges: updatedJobChanges,
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

    case "UPDATE_REQUIRED_MATCH_SCORE":
      if (!state.currentJobId) return state;

      const updatedJob = state.jobs.find((j) => j.id === state.currentJobId);
      if (!updatedJob) return state;

      const updatedJobWithScore = {
        ...updatedJob,
        required_match_score: action.score,
      };

      const existingChange = state.jobChanges.find(
        (j) => j.id === state.currentJobId,
      );
      let updatedJobChange: JobUpdate;

      if (existingChange) {
        updatedJobChange = {
          ...existingChange,
          required_match_score: [action.score],
        };
      } else {
        updatedJobChange = {
          id: state.currentJobId,
          active: [],
          matches: [],
          updates: [],
          category: [],
          required_match_score: [action.score],
        };
      }

      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === state.currentJobId ? updatedJobWithScore : j,
        ),
        jobChanges: existingChange
          ? state.jobChanges.map((j) =>
              j.id === state.currentJobId ? updatedJobChange : j,
            )
          : [...state.jobChanges, updatedJobChange],
        isChanged: true,
      };

    default:
      return state;
  }
}
