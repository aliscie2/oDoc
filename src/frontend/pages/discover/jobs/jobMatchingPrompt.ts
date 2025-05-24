import { Match } from "$/declarations/backend/backend.did";

let match: Match ={
    
    'matching_skills' : ['python','fastapi','django'],
  'user_id' : "567-723-waef-231",
  'score' : 8.6,
  'job_id' : "job-1",
  'date_updated' : BigInt(Date.now() * 1e6),
};

export const JOB_MATCHING_PROMPT = `
Act as a job matching engine. and HR expert, investigate list of jobs/talents and match it with a job or talent
{
  matches: [
        {
        job_id: string, // the id of which one from the list, note you have two ojbect a list and json, take scan the list and comapre it to the json and put an id from the list here.
        missmatching_skills: [""], // skills, requirement, education, found in job with category : {"Job":null} but not found in user profile with category :{"Talent":null},
        score: number, // out of 10 // how git fit is the profile category :{"Talent":null}, relative to job with category : {"Job":null}?
        }
  ]
}
`;