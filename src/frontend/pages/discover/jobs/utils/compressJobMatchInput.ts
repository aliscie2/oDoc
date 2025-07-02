import nlp from "compromise";

function compressJobForMatching(job) {
  const doc = nlp(job.description);

  // Extract key terms and remove stop words
  const keyTerms = doc
    .nouns()
    .out("array")
    .concat(doc.verbs().out("array"))
    .concat(doc.adjectives().out("array"))
    .filter((term) => term.length > 2);

  return {
    id: job.id,
    cat: Object.keys(job.category)[0], // "Job" or "Talent"
    skills: [...new Set(job.skills)], // Remove duplicates
    exp: job.experience.filter((e) => e.trim()),
    edu: job.education.filter((e) => e.trim()),
    certs: job.certifications.filter((c) => c.trim()),
    titles: job.job_titles.filter((t) => t.trim()),
    desc_terms: [...new Set(keyTerms)].slice(0, 10), // Top 10 unique terms
    prof_lvl: job.proficiency_level,
    req_score: job.required_match_score,
  };
}

function optimizeMatchingInput(newMatchingJobs, currentJob) {
  const compressed = {
    current: compressJobForMatching(currentJob),
    candidates: newMatchingJobs.map(compressJobForMatching),
  };

  // Create skill dictionary to reduce repetition
  const allSkills = [...compressed.current.skills];
  compressed.candidates.forEach((c) => allSkills.push(...c.skills));
  const skillDict = [...new Set(allSkills)].reduce((acc, skill, idx) => {
    acc[skill] = idx;
    return acc;
  }, {});

  // Replace skills with indices
  compressed.current.skills = compressed.current.skills.map(
    (s) => skillDict[s],
  );
  compressed.candidates.forEach((c) => {
    c.skills = c.skills.map((s) => skillDict[s]);
  });

  return { ...compressed, skill_dict: skillDict };
}

export default optimizeMatchingInput;
