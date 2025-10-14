// import { Match } from "$/declarations/backend/backend.did";

import { Job } from "$/declarations/backend/backend.did";

export const JOB_MATCHING_PROMPT = `Match the current job to candidates. Return exactly ONE match per unique candidate_id. Never include the current job's own ID.

Return valid JSON in this exact format:
{matches:[{candidate_id:string, missmatching_skills:string[], score:number, cover_letter:string}]}

Scoring approach (0-1 scale, where 1.0 = perfect match) - SCORE BASED ON AVAILABLE DATA ONLY:

**Skills Assessment (0-6 points):**
- If candidate has skills: (matching_skills / candidate_total_skills) * 6
- If no skills provided: assume 3.0 baseline (neutral)

**Experience Assessment (0-2 points):**  
- If experience provided: min(experience_years / required_years, 1) * 2
- If no experience data: assume 1.0 baseline (benefit of doubt)

**Education/Certs (0-1.5 points):**
- If education provided: relevant ? 1.5 : 0  
- If no education data: assume 0.75 baseline

**Profile Completeness Bonus (0-0.5 points):**
- Complete profile: +0.5
- Incomplete but has core info: +0.25
- Very minimal: +0 (no penalty)

**Only penalize for explicit mismatches:**
- Critical skill explicitly missing: -1.0
- Salary/rate explicitly too high: -1.0  
- Timezone explicitly problematic: -0.5

**Key principle:** Lack of information ≠ bad match. Score generously when data is limited but what exists looks promising.

Rules:
- One match per candidate_id only
- candidate_id must be from candidates array  
- score: calculated number 0.0-1.0
- missmatching_skills: actual skill names that are in job.skills (required) but missing in talent.skills (asymmetric difference)
- cover_letter: focus on potential and available strengths, mention data gaps as areas to explore in markdown built points with emojis

Always return valid JSON with no duplicates.`;

export const compressJobForMatching = (job: Job) => ({
  id: job.id,
  description: job.description,
  job_titles: job.job_titles,
  category: job.category,
  skills: job.skills,
  required_match_score: job.required_match_score,
  education: job.education,
  experience: job.experience,
  certifications: job.certifications,
  proficiency_level: job.proficiency_level,
  trust_note: job.trust_note, // Useful for AI analysis of deal-breakers
});

export const compressJobsForMatching = (jobs: Job[]) =>
  jobs.map(compressJobForMatching);
