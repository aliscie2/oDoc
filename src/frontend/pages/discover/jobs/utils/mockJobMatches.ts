import { Job, Match } from "$/declarations/backend/backend.did";

interface MockJobMatchResponse {
  matches: Array<Match>;
}

export function mockJobMatchResponse(
  potentialMatches: Job[],
  currentJob: Job,
): MockJobMatchResponse {
  console.log("mockJobMatchResponse - input jobs:", potentialMatches.map(j => ({ id: j.id, title: j.job_titles?.[0] })));
  
  const matches: Match[] = potentialMatches
    .map((candidateJob) => {
      const candidateSkills = new Set(candidateJob.skills || []);
      const jobSkills = currentJob.skills || [];
      const matchingSkills = jobSkills.filter((skill) => candidateSkills.has(skill));
      
      // Skills Assessment (0-6 points)
      let skillScore = 3.0; // baseline if no skills
      if (candidateJob.skills && candidateJob.skills.length > 0) {
        skillScore = (matchingSkills.length / candidateJob.skills.length) * 6;
      }
      
      // Experience Assessment (0-2 points) - baseline 1.0
      const experienceScore = 1.0;
      
      // Education/Certs (0-1.5 points) - baseline 0.75
      const educationScore = 0.75;
      
      // Profile Completeness (0-0.5 points)
      let completenessScore = 0.25;
      if (candidateJob.skills?.length > 0 && candidateJob.job_titles?.length > 0) {
        completenessScore = 0.5;
      }
      
      const totalScore = skillScore + experienceScore + educationScore + completenessScore;
      const clampedScore = Math.max(0, Math.min(10, totalScore));

      const missingSkills = jobSkills.filter((skill) => !candidateSkills.has(skill));

      const coverLetter = `## 🎯 Why I'm Interested

I'm excited about this ${currentJob.job_titles?.[0] || "opportunity"} role!

## 💪 My Strengths
${matchingSkills.length > 0 ? 
  `- ${matchingSkills.map(skill => `✅ **${skill}**`).join('\n- ')}` : 
  '- 🌟 Eager to learn and adapt to new technologies'}

${missingSkills.length > 0 ? `## 🚀 Areas to Explore
- ${missingSkills.map(skill => `📚 **${skill}** - Ready to discuss experience or learning path`).join('\n- ')}` : ''}

## 🤝 Let's Connect
I'd love to discuss how my background aligns with your needs!

Best regards,  
Candidate`;

      return {
        user_id: candidateJob.user_id || "",
        job_id: candidateJob.id,
        missmatching_skills: missingSkills,
        score: clampedScore / 10, // Convert back to 0-1 for your system
        cover_letter: coverLetter,
        date_updated: Number(Date.now() * 1e6),
        is_connected: false,
      };
    })
    .filter((match) => (match.score * 10) >= ((currentJob.required_match_score || 0) * 10));

  console.log("mockJobMatchResponse - final matches:", matches.map(m => ({ job_id: m.job_id, score: m.score })));
  return { matches };
}