import { Job } from "$/declarations/backend/backend.did";
import exp from "constants";

function calculateMatch(talent: Job, job: Job) {
  const jobSkills = new Set(job.skills);
  const talentSkills = new Set(talent.skills);

  const missmatchingSkills = job.skills.filter(
    (skill) => !talentSkills.has(skill),
  );
  const matchingSkills = job.skills.filter((skill) => talentSkills.has(skill));

  // Simple scoring algorithm
  const skillScore =
    jobSkills.size > 0 ? (matchingSkills.length / jobSkills.size) * 4 : 0;
  const educationScore = job.education.some((edu) =>
    talent.education.includes(edu),
  )
    ? 2
    : 0;
  const experienceScore = job.experience.some((exp) =>
    talent.experience.includes(exp),
  )
    ? 2
    : 0;
  const certScore = job.certifications.some((cert) =>
    talent.certifications.includes(cert),
  )
    ? 2
    : 0;

  const totalScore = Math.min(
    10,
    skillScore + educationScore + experienceScore + certScore,
  );

  return {
    job_id: job.id,
    missmatchingSkills,
    score: Math.round(totalScore * 10) / 10,
    matchingSkills,
    matchingEducation: job.education.filter((edu) =>
      talent.education.includes(edu),
    ),
    matchingExperience: job.experience.filter((exp) =>
      talent.experience.includes(exp),
    ),
    matchingCertifications: job.certifications.filter((cert) =>
      talent.certifications.includes(cert),
    ),
  };
}

async function generateMatches(talent: Job, candidates: Job[], aiAgent) {
  const matches = [];

  for (const candidate of candidates) {
    if (candidate.id === talent.id) continue;

    const match = calculateMatch(talent, candidate);

    // Only use AI for cover letter generation with minimal context

    const aiResponse = await aiAgent.sendMessage(`
      Write a brief cover letter explaining why this is a ${match.score >= 7 ? "good" : match.score >= 4 ? "decent" : "poor"} match:
      - Matching skills: ${match.matchingSkills.join(", ") || "None"}
      - Missing skills: ${match.missmatchingSkills.join(", ")}
      - Education match: ${match.matchingEducation.length > 0 ? "Yes" : "No"}
      - Experience match: ${match.matchingExperience.length > 0 ? "Yes" : "No"}
      - Score: ${match.score}/10
      Keep it under 100 words.
    `);

    matches.push({
      job_id: match.job_id,
      missmatching_skills: match.missmatchingSkills,
      score: match.score,
      cover_letter:
        aiResponse.text ||
        `Score: ${match.score}/10. ${match.matchingSkills.length} matching skills.`,
    });
  }

  return matches.sort((a, b) => b.score - a.score);
}

export default generateMatches;
