import { Job, Match } from "$/declarations/backend/backend.did";

interface MockJobMatchResponse {
  matches: Array<Match>;
}


export function mockJobMatchResponse(potentialMatches: Job[], currentJob: Job): MockJobMatchResponse {
  const matches: Match[] = potentialMatches
    .map((candidateJob) => {
      const candidateSkills = new Set((candidateJob.skills || []).map(s => s.toLowerCase()));
      const jobSkills = (currentJob.skills || []).map(s => s.toLowerCase());
      const matchingSkills = jobSkills.filter(skill => candidateSkills.has(skill));

      // More generous scoring for testing
      let skillScore = 6.0; // Higher baseline
      if (candidateJob.skills?.length > 0 && jobSkills.length > 0) {
        const matchRatio = matchingSkills.length / jobSkills.length; // Changed to job skills
        skillScore = Math.max(4.0, matchRatio * 6.0); // Minimum 4.0
      }

      const experienceScore = 2.0; // Max experience score
      const educationScore = 1.5; // Max education score
      const completenessScore = 0.5; // Max completeness

      const totalScore = skillScore + experienceScore + educationScore + completenessScore;
      const clampedScore = Math.max(0, Math.min(10, totalScore)) / 10; // This gives 0.9+ scores

      const missingSkills = jobSkills.filter(skill => !candidateSkills.has(skill));

      const coverLetter = `## 🎯 Why I'm Interested\n\nI'm excited about this ${currentJob.job_titles?.[0] || "opportunity"} role!\n\n## 💪 My Strengths\n${matchingSkills.length > 0 ? `- ${matchingSkills.map(skill => `✅ **${skill}**`).join("\n- ")}` : "- 🌟 Eager to learn and adapt"}\n\n${missingSkills.length > 0 ? `## 🚀 Areas to Explore\n- ${missingSkills.map(skill => `📚 **${skill}**`).join("\n- ")}` : ""}\n\n## 🤝 Let's Connect`;

      return {
        user_id: candidateJob.user_id || "",
        job_id: candidateJob.id,
        missmatching_skills: missingSkills,
        score: clampedScore,
        cover_letter: coverLetter,
        date_updated: Number(Date.now() * 1e6),
        is_connected: false,
      };
    })
    // .filter(match => match.score >= (currentJob.required_match_score || 0));

  console.log("Mock scores generated:", matches.map(m => ({ id: m.job_id, score: m.score, required: currentJob.required_match_score })));
  return { matches };
}
