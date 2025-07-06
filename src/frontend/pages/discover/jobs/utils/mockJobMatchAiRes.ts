import { Job } from "$/declarations/backend/backend.did";

export const mockAIJobMatchResponse = (
  newMatchingJobs: Array<Job>,
  currentJob: Job,
) => {
  const coverLetterTemplates = [
    "I am excited to apply for this position as it aligns perfectly with my career goals.",
    "My experience in this field makes me a strong candidate for your team.",
    "I believe my skills would be valuable to your organization.",
    "This opportunity matches my professional aspirations and expertise.",
    "I am confident I can contribute meaningfully to your company's success.",
    "My background demonstrates the qualifications needed for this role.",
    "I am eager to bring my experience to your dynamic team.",
    "This position represents an excellent fit for my skill set.",
  ];

  const matches = newMatchingJobs.map((candidate) => {
    const candidateSkills = candidate.skills || [];
    const jobSkills = currentJob.skills || [];
    const matchingSkills = candidateSkills.filter((skill) =>
      jobSkills.includes(skill),
    );
    const missmatchingSkills = jobSkills.filter(
      (skill) => !candidateSkills.includes(skill),
    );

    const skillsScore =
      jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 4 : 0;
    const experienceScore = Math.min(
      (candidate.experience?.length || 0) * 0.5,
      4,
    );
    const educationScore = candidate.education?.length > 0 ? 2 : 0;
    const certScore =
      currentJob.certifications?.length > 0
        ? Math.min(
            ((candidate.certifications?.length || 0) /
              currentJob.certifications.length) *
              2,
            2,
          )
        : 0;

    const score = Math.min(
      Math.round(
        (skillsScore + experienceScore + educationScore + certScore) * 10,
      ) / 10,
      10,
    );

    return {
      candidate_id: candidate.user_id,
      missmatching_skills: missmatchingSkills,
      score: Math.max(0.1, score + (Math.random() - 0.5) * 0.5),
      cover_letter:
        coverLetterTemplates[
          Math.floor(Math.random() * coverLetterTemplates.length)
        ],
    };
  });

  return { matches: matches.sort((a, b) => b.score - a.score) };
};
