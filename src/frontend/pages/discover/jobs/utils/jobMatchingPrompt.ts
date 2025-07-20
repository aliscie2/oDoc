import { Match } from "$/declarations/backend/backend.did";

const match: Match = {
  matching_skills: ["python", "fastapi", "django"],
  user_id: "567-723-waef-231",
  score: 8.6,
  job_id: "job-1",
  date_updated: BigInt(Date.now() * 1e6),
};

export const JOB_MATCHING_PROMPT = `Match current job to candidates. Return JSON:
{matches:[{candidate_id:string,missmatching_skills:string[],score:number,cover_letter:string}]}

SCORING FORMULA (0-10):
- Skills match: (matching_skills / total_current_skills) * 40%
- Experience relevance: relevant_years * 20% (max 4 points)
- Education match: has_relevant_degree ? 20% : 0%
- Certifications match: (matching_certs / total_current_certs) * 20%
 
Calculate exact score using this formula. Be consistent.
candidate_id = ID of matching candidate from candidates array.
missmatching_skills = actual skill names that are in current job but missing in candidate.
Use skill_dict to convert indices back to skill names.`;
