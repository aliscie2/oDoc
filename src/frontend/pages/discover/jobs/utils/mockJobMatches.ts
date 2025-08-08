import { Job, Match } from "$/declarations/backend/backend.did";

interface Candidate {
  id?: string;
  user_id?: string;
  name?: string;
  skills?: string[];
  experience_years?: number;
  education?: string[];
  certifications?: string[];
}

interface MockJobMatchResponse {
  matches: Array<Match>;
}

export function mockJobMatchResponse(
  potentialMatches: Candidate[],
  currentJob: Job,
): MockJobMatchResponse {
  const matches: Match[] = potentialMatches
    .map((candidate) => {
      // Skills match calculation
      const candidateSkills = new Set(candidate.skills || []);
      const jobSkills = currentJob.skills || [];
      const matchingSkills = jobSkills.filter((skill) =>
        candidateSkills.has(skill),
      );
      const skillsScore = (matchingSkills.length / jobSkills.length) * 40;

      // Experience relevance (assuming candidate has experience_years field)
      const experienceScore = Math.min(
        (candidate.experience_years || 0) * 5,
        20,
      );

      // Education match (assuming candidate has education field)
      const hasRelevantDegree =
        candidate.education?.some((edu) =>
          currentJob.education?.some((reqEdu) =>
            edu.toLowerCase().includes(reqEdu.toLowerCase()),
          ),
        ) || false;
      const educationScore = hasRelevantDegree ? 20 : 0;

      // Certifications match
      const candidateCerts = new Set(candidate.certifications || []);
      const jobCerts = currentJob.certifications || [];
      const matchingCerts = jobCerts.filter((cert) => candidateCerts.has(cert));
      const certsScore =
        jobCerts.length > 0 ? (matchingCerts.length / jobCerts.length) * 20 : 0;

      const totalScore = Math.min(
        skillsScore + experienceScore + educationScore + certsScore,
        10,
      );

      // Missing skills
      const missingSkills = jobSkills.filter(
        (skill) => !candidateSkills.has(skill),
      );

      // Generate basic cover letter
      const coverLetter = `Dear Hiring Manager,

I am excited to apply for the ${currentJob.job_titles?.[0] || "position"}. With ${candidate.experience_years || 0} years of experience and skills in ${matchingSkills.slice(0, 3).join(", ")}, I believe I would be a great fit for your team.

Best regards,
${candidate.name || "Candidate"}`;

      return {
        candidate_id: candidate.id || candidate.user_id || "",
        missmatching_skills: missingSkills,
        score: Math.round(totalScore * 10) / 10,
        cover_letter: coverLetter,
      };
    })
    .filter((match) => match.score >= (currentJob.required_match_score || 0));

  return { matches: matches };
}
