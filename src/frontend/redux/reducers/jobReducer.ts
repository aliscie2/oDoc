import { Job, Match, Category ,JobUpdate} from "$/declarations/backend/backend.did";


  
interface JobState {
    currentJobId: string | null;
    jobChanges: JobUpdate[];
    jobs: Job[];
    isChanged: boolean;
    matchingJobs: Job[]
}

const initialState: JobState = {
    currentJobId: null,
    jobChanges: [],
    jobs: [],
    isChanged: false,
    matchingJobs:[]
};

type JobAction =
    | { type: "SET_CURRENT_JOB"; job: Job }
    | { type: "UPDATE_JOB"; update: JobUpdate }
    | { type: "SET_JOBS"; jobs: Job[] }
    | { type: "ADD_JOB"; job: Job }
    | { type: "DELETE_JOB"; id: string }
    | { type: "DELETE_MATCH"; id: string }
    | { type: "UPDATE_FIELDS"; updates: Array<[string, Array<string>]>; category?: string; required_match_score: number }
    | { type: "UPDATE_MATCHING_JOBS"; matchingJobs: Job[]; matches: Match[] }
    | { type: "UPDATE_MATCHES"; matches: Match[], }
    | { type: "CLEAR_CHANGES" }
    | { type: "INIT_JOBS"; matchingJobs: Job[]; jobs: Job[] }
    | { type: "TOGGLE_ACTIVE"; id: string};
    

    

// Helper functions
function generateDummyJob(): Job {
    return {
        id: `${Math.random().toString(36).substring(2, 9)}`,
        active: true,
        required_match_score: 0,
        category: { Job: null } as Category,
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

function applyFieldUpdates(job: Job, updates: Array<{field: string; values: string[]}>, category?: string): Job {
    const updatedJob = { ...job };
    
    if (category) {
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        if (formattedCategory === 'Job' || formattedCategory === 'Talent') {
            updatedJob.category = { [formattedCategory]: null } as Category;
        }
    }
    
    updates.forEach(({field, values}) => {
        const cleanedValues = field === 'links' 
            ? values.map(v => v.replace(/`/g, '').trim())
            : values;

        const listFields = ['skills', 'education', 'experience', 'certifications', 'job_titles', 'links', 'emails'];
        if (listFields.includes(field)) {
            (updatedJob as any)[field] = cleanedValues;
        } else if (['description', 'proficiency_level', 'trust_score', 'trust_note'].includes(field)) {
            (updatedJob as any)[field] = cleanedValues.length > 0 ? cleanedValues[0] : '';
        }
    });
    
    return updatedJob;
}


function mergeMatches(existing: Match[], newMatches: Match[]): Match[] {
    return [
        ...existing.filter(em => !newMatches.some(nm => nm.job_id === em.job_id)),
        ...newMatches.map(match => ({
            ...match,
            date_updated: 0,
            is_connected: match.is_connected || false
        }))
    ];
}

export function jobReducer(state: JobState = initialState, action: JobAction): JobState {
    

    switch (action.type) {
        case "SET_CURRENT_JOB":
            return { ...state, currentJobId: action.job?.id };
            case "TOGGLE_ACTIVE":
                return {...state,
                    jobs: state.jobs.map(j => j.id === action.id? {...j, active: !j.active} : j),
                    jobChanges: state.jobChanges.some(j => j.id === action.id)
                       ? state.jobChanges.map(j =>
                            j.id === action.id
                               ? {...j, active: [!state.jobs.find(j => j.id === action.id)?.active] } : j
                        )
                      : [...state.jobChanges, {
                            id: action.id,
                            active: [!state.jobs.find(j => j.id === action.id)?.active],
                            matches: [],
                            updates: [],
                            category: [],
                            required_match_score: []
                          }],
                    isChanged: true,

                }
            case "UPDATE_FIELDS":
                let category: any = [];
                let jobUpdate: JobUpdate ={
                    id: state.currentJobId,
                    active: [],
                    matches: [],
                    updates: [],
                    category,
                    required_match_score: [action.required_match_score]
                }

                if (!state.currentJobId) {
                    
                    let c: string = action.category =="Job"? "Job" : "Talent";
                    category[c] = null;
                    if (!action.category){
                        category = []   
                    }
                    const newJob = applyFieldUpdates(generateDummyJob(), action.updates, action.category);
                    jobUpdate.id = newJob.id
                    jobUpdate.active = [true]
                    jobUpdate.updates = action.updates
                    return {
                        ...state,
                        currentJobId: newJob.id,
                        jobs: [...state.jobs, newJob],
                        jobChanges: [...state.jobChanges, jobUpdate],
                        isChanged: true
                    };
                }
                
                const job2 = state.jobs.find(j => j.id === state.currentJobId);
                if (!job2) return state;
                
                const updatedJob2 = applyFieldUpdates(job2, action.updates, action.category);
                // let isAlreadyHaseUpdate = state.jobChanges.some(j=>j.id==state.currentJobId);
                const oldJobUpdate = state.jobChanges.find(j=>j.id==state.currentJobId);
                jobUpdate.id = state.currentJobId
                
                if (oldJobUpdate){
                    jobUpdate = {...oldJobUpdate};
                    jobUpdate.updates = [...jobUpdate.updates, ...action.updates]
                    return {
                       ...state,
                        jobs: state.jobs.map(j => j.id === state.currentJobId? updatedJob2 : j),
                        jobChanges: state.jobChanges.map(j => j.id === state.currentJobId? jobUpdate : j),
                        isChanged: true
                    };
                }
                jobUpdate.active = [true]
                jobUpdate.updates = action.updates
                return {
                    ...state,
                    jobs: state.jobs.map(j => j.id === state.currentJobId ? updatedJob2 : j),
                    jobChanges: [...state.jobChanges.filter(j => j.id !== state.currentJobId), jobUpdate],
                    isChanged: true
                };


                case "UPDATE_MATCHING_JOBS":
                    //  is newMatches action.matches + state.currentJobId)?.matches if job_id is repeated we replace with match from action.matches
                    let newMatches2 = state.jobs.find(j => j.id === state.currentJobId)?.matches.filter(match => !action.matches.some(m=>m.job_id==match.job_id) ) || [];

                    newMatches2.push(...action.matches);


                    let newmMtchingJobs = state.matchingJobs.filter(j => !action.matchingJobs.some(m=>m.id==j.id));
                    newmMtchingJobs.push(...action.matchingJobs);
                    
                    
                    return {
                        ...state,
                        jobs: state.jobs.map(j => j.id === state.currentJobId ? {...j,matches:newMatches2} : j),
                        matchingJobs: newmMtchingJobs,
                        jobChanges: state.jobChanges.some(j => j.id === state.currentJobId)
                        ? state.jobChanges.map(j => 
                            j.id === state.currentJobId 
                                ? { ...j, matches: [newMatches2] }
                                : j
                          )
                        : [...state.jobChanges, {
                            id: state.currentJobId,
                            active: [],
                            matches: [newMatches2],
                            updates: [],
                            category: [],
                            required_match_score: []
                          }],
                        isChanged: true,
                    };

            case "UPDATE_MATCHES":
                const existingJobChange = state.jobChanges.find(j => j.id === state.currentJobId);
                
                let newChange: JobUpdate;
                
                if (existingJobChange) {
                    // Change exists - update the existing one
                    newChange = {
                        ...existingJobChange,
                        matches: [[...action.matches, ...(existingJobChange.matches[0] || [])]]
                    };
                } else {
                    // Change doesn't exist - create a new one
                    newChange = {
                        id: state.currentJobId,
                        active: [],
                        matches: [action.matches],
                        updates: [],
                        category: [],
                        required_match_score: []
                    };
                }
            
                return {
                    ...state,
                    isChanged: true,
                    jobs: state.jobs.map(job => 
                        job.id === state.currentJobId 
                            ? { ...job, matches: action.matches }
                            : job
                    ),
                    jobChanges: existingJobChange
                        ? state.jobChanges.map(change => 
                            change.id === state.currentJobId ? newChange : change
                          )
                        : [...state.jobChanges, newChange]
                };

        case "CLEAR_CHANGES":
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
                currentJobId: state.currentJobId && action.jobs.some(j => j.id === state.currentJobId) 
                    ? state.currentJobId 
                    : null
            };

        case "ADD_JOB":
            return { ...state, jobs: [...state.jobs, action.job] };

        case "DELETE_JOB":
            return {
                ...state,
                jobs: state.jobs.filter(job => job.id !== action.id),
                // currentJobId: state.currentJobId === action.id ? null : state.currentJobId,
                // jobChanges: state.jobChanges.filter(j => j.id !== action.id),
            };

            case "DELETE_MATCH":
                let newMatches = state.jobs.find(j => j.id === state.currentJobId)?.matches.filter(match => match.job_id !== action.id) || [];
            
                // Calculate updated jobChanges once
                let updatedJobChanges = state.jobChanges.some(j => j.id === state.currentJobId)
                    ? state.jobChanges.map(j => 
                        j.id === state.currentJobId 
                            ? { ...j, matches: [newMatches] }
                            : j
                      )
                    : [...state.jobChanges, {
                        id: state.currentJobId,
                        active: [],
                        matches: [newMatches],
                        updates: [],
                        category: [],
                        required_match_score: []
                      }];
            
                return {
                    ...state,
                    jobChanges: updatedJobChanges,
                    jobs: state.jobs.map(job => 
                        job.id === state.currentJobId 
                            ? { ...job, matches: job.matches.filter(match => match.job_id !== action.id) }
                            : job
                    ),
                    isChanged: true,
                };

            
        default:
            return state;
    }
}