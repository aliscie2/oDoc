import { Match } from "$/declarations/backend/backend.did";

let match: Match = {
  matching_skills: ["python", "fastapi", "django"],
  user_id: "567-723-waef-231",
  score: 8.6,
  job_id: "job-1",
  date_updated: BigInt(Date.now() * 1e6),
};

export const JOB_MATCHING_PROMPT = `
Act as a job matching engine. and HR expert, investigate list of jobs/talents and match it with a job or talent
{
  matches: [
        {
        job_id: string, // id of a candidate, Note: do not take id from Current
        missmatching_skills: string[], // Items in Job but missing in Talent. That is, missmatching_skills = { skill ∈ Job | skill ∉ Talent }. Note: it should not be vice versa (in other words ignore skills found in Talent but missing in Jobs), note in job it look like categroy :{"Talent":null} | {"Job":null}
        score: number, // out of 10 // how git fit is the profile category :{"Talent":null}, relative to job with category : {"Job":null}?
        cover_letter: string, // Write your honist opnoin about why is the job with id of job_id is a good or bad match. Mention only the matching skills, history, education certicate etc.. and ignore other things.
        }
  ]
}
`;
