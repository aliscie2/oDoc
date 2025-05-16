import { Job, JobUpdate, Match, Category } from "$/declarations/backend/backend.did";

interface JobState {
    currentJob: Job | null;
    jobChanges: JobUpdate | null;
    jobs: Job[];
}

const initialState: JobState = {
    currentJob: null,
    jobChanges: null,
    jobs: [],
};

type JobAction =
    | { type: "SET_CURRENT_JOB"; job: Job }
    | { type: "UPDATE_JOB"; update: JobUpdate }
    | { type: "SET_JOBS"; jobs: Job[] }
    | { type: "ADD_JOB"; job: Job }
    | { type: "DELETE_JOB"; id: string };

export function jobReducer(state: JobState = initialState, action: JobAction): JobState {
    switch (action.type) {
        case "SET_CURRENT_JOB":
            return {
                ...state,
                currentJob: action.job,
            };
        case "UPDATE_JOB":
            if (!state.currentJob) return state;
            
            const updatedJob = { ...state.currentJob };
            
            // Apply field updates
            action.update.updates.forEach(([field, value]) => {
                (updatedJob as any)[field] = value;
            });

            // Apply optional field updates
            if (action.update.active !== undefined) {
                updatedJob.active = action.update.active;
            }
            if (action.update.required_match_score !== undefined) {
                updatedJob.required_match_score = action.update.required_match_score;
            }
            if (action.update.category !== undefined) {
                updatedJob.category = action.update.category;
            }
            if (action.update.matches !== undefined) {
                updatedJob.matches = action.update.matches;
            }

            return {
                ...state,
                currentJob: updatedJob,
                jobChanges: action.update,
            };
        case "SET_JOBS":
            return {
                ...state,
                jobs: action.jobs,
            };
        case "ADD_JOB":
            return {
                ...state,
                jobs: [...state.jobs, action.job],
            };
        case "DELETE_JOB":
            return {
                ...state,
                jobs: state.jobs.filter(job => job.id !== action.id),
                currentJob: state.currentJob?.id === action.id ? null : state.currentJob,
            };
        default:
            return state;
    }
}