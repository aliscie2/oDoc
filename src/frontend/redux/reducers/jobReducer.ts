import { Job, Match, Category } from "$/declarations/backend/backend.did";

interface JobUpdate {
    'id': string,
    'active': [] | [boolean],
    'matches': [] | [Array<Match>],
    'updates': Array<[string, Array<string>]>,
    'category': [] | [Category],
    'required_match_score': [] | [number],
}

interface JobState {
    currentJobId: string | null;
    jobChanges: JobUpdate[];
    jobs: Job[];
}

const initialState: JobState = {
    currentJobId: null,
    jobChanges: [],
    jobs: [],
};

type JobAction =
    | { type: "SET_CURRENT_JOB"; job: Job }
    | { type: "UPDATE_JOB"; update: JobUpdate }
    | { type: "SET_JOBS"; jobs: Job[] }
    | { type: "ADD_JOB"; job: Job }
    | { type: "DELETE_JOB"; id: string }
    | { type: "UPDATE_MATCHES"; matches: Match[] }
    | { type: "UPDATE_FIELDS"; updates: Array<{ field: string; values: string[] }>; category?: string };

function generateDummyJob(): Job {
    let category = {};
    category["Job"] = null;

    return {
        id: `${Math.random().toString(36).substring(2, 9)}`,
        active: true,
        required_match_score: 0,
        category: category as Category,
        description: '',
        proficiency_level: '',
        education: [],
        experience: [],
        job_titles: [],
        certifications: [],
        skills: [],
        links: [],
        matches: []
    };
}

function applyFieldUpdates(job: Job, updates: Array<{ field: string; values: string[] }>, category?: string): Job {
    const updatedJob = { ...job };
    
    if (category) {
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        if (formattedCategory === 'Job' || formattedCategory === 'Talent') {
            const categoryObj = {};
            categoryObj[formattedCategory] = null;
            updatedJob.category = categoryObj as Category;
        }
    }
    
    updates.forEach(({ field, values }) => {
        const cleanedValues = field === 'links' 
            ? values.map(v => v.replace(/`/g, '').trim())
            : values;
        
        if (['education', 'experience', 'job_titles', 'certifications', 'skills', 'links'].includes(field)) {
            (updatedJob as any)[field] = cleanedValues;
        } 
        else if (['description', 'proficiency_level'].includes(field)) {
            (updatedJob as any)[field] = cleanedValues.length > 0 ? cleanedValues[0] : '';
        }
    });
    
    return updatedJob;
}

function createJobUpdate(jobId: string, job: Job, updates: Array<{ field: string; values: string[] }>, category?: string): JobUpdate {
    const categoryValue = category 
        ? [{[category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()]: null} as Category]
        : [job.category];
        
    return {
        id: jobId,
        active: [job.active],
        matches: [],
        updates: updates.map(({ field, values }) => [field, values]),
        category: categoryValue,
        required_match_score: [job.required_match_score]
    };
}

export function jobReducer(state: JobState = initialState, action: JobAction): JobState {
    switch (action.type) {
        case "SET_CURRENT_JOB":
            return {
                ...state,
                currentJobId: action.job?.id,
                // jobs: [...state.jobs.filter(j => j.id !== action.job.id), action.job]
            };
        case "UPDATE_JOB":
            if (!state.currentJobId) return state;
            
            const jobToUpdate1 = state.jobs.find(j => j.id === state.currentJobId);
            if (!jobToUpdate1) return state;
            
            const updatedJob1 = { ...jobToUpdate1 };
            
            action.update.updates.forEach(([field, values]) => {
                (updatedJob1 as any)[field] = values.length > 0 ? values[0] : '';
            });
    
            if (action.update.active !== undefined) {
                updatedJob1.active = action.update.active;
            }
            if (action.update.required_match_score !== undefined) {
                updatedJob1.required_match_score = action.update.required_match_score;
            }
            if (action.update.category !== undefined) {
                updatedJob1.category = action.update.category;
            }
    
            return {
                ...state,
                jobs: [...state.jobs.filter(j => j.id !== state.currentJobId), updatedJob1],
                jobChanges: [
                    ...state.jobChanges.filter(j => j.id !== action.update.id),
                    action.update
                ],
            };
        case "UPDATE_FIELDS":
            if (!state.currentJobId) {
                const newJob = applyFieldUpdates(generateDummyJob(), action.updates, action.category);
                return {
                    ...state,
                    currentJobId: newJob.id,
                    jobs: [...state.jobs, newJob],
                    jobChanges: [createJobUpdate(newJob.id, newJob, action.updates, action.category)]
                };
            }
            
            const jobToUpdate = state.jobs.find(j => j.id === state.currentJobId);
            if (!jobToUpdate) return state;
            
            const updatedJob = applyFieldUpdates(jobToUpdate, action.updates, action.category);
            
            return {
                ...state,
                jobs: [...state.jobs.filter(j => j.id !== state.currentJobId), updatedJob],
                jobChanges: [
                    ...state.jobChanges.filter(j => j.id !== state.currentJobId),
                    createJobUpdate(state.currentJobId, updatedJob, action.updates, action.category)
                ],
            };
        case "UPDATE_MATCHES":
            if (!state.currentJobId) return state;
            
            const jobToUpdate3 = state.jobs.find(j => j.id === state.currentJobId);
            if (!jobToUpdate3) return state;
            
            const updatedJob3 = {
                ...jobToUpdate3,
                matches: action.matches
            };

            return {
                ...state,
                jobs: [...state.jobs.filter(j => j.id !== state.currentJobId), updatedJob3],
                jobChanges: [
                    ...state.jobChanges.filter(j => j.id !== state.currentJobId),
                    {
                        id: state.currentJobId,
                        active: [updatedJob3.active],
                        matches: [action.matches],
                        updates: [],
                        category: [updatedJob3.category],
                        required_match_score: [updatedJob3.required_match_score]
                    }
                ]
            };
        case "SET_JOBS":
            return {
                ...state,
                jobs: action.jobs,
                currentJobId: state.currentJobId && action.jobs.some(j => j.id === state.currentJobId) 
                    ? state.currentJobId 
                    : null
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
                currentJobId: state.currentJobId === action.id ? null : state.currentJobId,
                jobChanges: state.jobChanges.filter(j => j.id !== action.id),
            };
        default:
            return state;
    }
}