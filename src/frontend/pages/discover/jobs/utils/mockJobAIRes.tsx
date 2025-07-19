import { Job } from "$/declarations/backend/backend.did";

export function mockJobAIResponse(
  currentJob: Job,
  jobs: Array<Job>,
  command: string,
) {
  // Parse command type and values
  const commandType = command.substring(0, 2);
  const commandValue = command.substring(3);

  // Initialize response structure
  let response = {
    required_match_score: currentJob?.required_match_score || 7.0,
    feedback: "",
    updates: [],
    category: Object.keys(currentJob?.category || {})[0] || "Job",
    done: false,
    isBreakingChanges: false,
  };

  // Handle different command types
  switch (commandType) {
    case "as": // Add skills
      const newSkills = commandValue.split(",").map((skill) => skill.trim());
      const existingSkills = currentJob?.skills || [];
      const combinedSkills = [...existingSkills, ...newSkills];

      response.updates.push({
        field: "skills",
        values: combinedSkills,
      });

      response.feedback = `Added skills: ${newSkills.join(", ")}. Great! Your skill set is expanding.`;
      response.isBreakingChanges = true;

      // Check if we need additional information
      if (!currentJob?.emails || currentJob.emails.length === 0) {
        response.feedback += " Please provide your email address for contact.";
      }
      if (!currentJob?.description || currentJob.description.trim() === "") {
        response.feedback += " Please add a description of your background.";
      }
      break;

    case "us": // Update skills (replace entirely)
      const updateSkills = commandValue.split(",").map((skill) => skill.trim());

      response.updates.push({
        field: "skills",
        values: updateSkills,
      });

      response.feedback = `Updated skills to: ${updateSkills.join(", ")}.`;
      response.isBreakingChanges = true;
      break;

    case "ds": // Remove skills
      const skillsToRemove = commandValue
        .split(",")
        .map((skill) => skill.trim());
      const remainingSkills = (currentJob?.skills || []).filter(
        (skill) =>
          !skillsToRemove.some((removeSkill) =>
            skill.toLowerCase().includes(removeSkill.toLowerCase()),
          ),
      );

      response.updates.push({
        field: "skills",
        values: remainingSkills,
      });

      response.feedback = `Removed skills: ${skillsToRemove.join(", ")}`;
      response.isBreakingChanges = true;
      break;

    case "ud": // Update description
      response.updates.push({
        field: "description",
        values: [commandValue],
      });

      response.feedback = "Description updated successfully.";

      // Infer job titles from description
      const inferredTitles = inferJobTitles(
        commandValue,
        currentJob?.skills || [],
      );
      if (inferredTitles.length > 0) {
        response.updates.push({
          field: "job_titles",
          values: inferredTitles,
        });
      }
      break;

    case "ae": // Add email
      const emails = commandValue.split(",").map((email) => email.trim());
      const existingEmails = currentJob?.emails || [];
      const combinedEmails = [...existingEmails, ...emails];

      response.updates.push({
        field: "emails",
        values: combinedEmails,
      });

      response.feedback = "Email address added successfully.";
      break;

    case "ue": // Update emails (replace entirely)
      const updateEmails = commandValue.split(",").map((email) => email.trim());

      response.updates.push({
        field: "emails",
        values: updateEmails,
      });

      response.feedback = "Email addresses updated successfully.";
      break;

    case "ac": // Add contact
      const contacts = commandValue.split(",").map((contact) => contact.trim());
      const existingContacts = currentJob?.contacts || [];
      const combinedContacts = [...existingContacts, ...contacts];

      response.updates.push({
        field: "contacts",
        values: combinedContacts,
      });

      response.feedback = "Contact information added successfully.";
      break;

    case "uc": // Update contacts (replace entirely)
      const updateContacts = commandValue
        .split(",")
        .map((contact) => contact.trim());

      response.updates.push({
        field: "contacts",
        values: updateContacts,
      });

      response.feedback = "Contacts updated successfully.";
      break;

    case "ax": // Add experience
      const newExperience = commandValue.split(",").map((exp) => exp.trim());
      const existingExperience = currentJob?.experience || [];
      const combinedExperience = [...existingExperience, ...newExperience];

      response.updates.push({
        field: "experience",
        values: combinedExperience,
      });

      response.feedback = "Experience added successfully.";
      break;

    case "ux": // Update experience (replace entirely)
      const experiences = commandValue.split(",").map((exp) => exp.trim());
      response.updates.push({
        field: "experience",
        values: experiences,
      });

      response.feedback = "Experience updated successfully.";
      break;

    case "aj": // Add job titles
      const newJobTitles = commandValue.split(",").map((title) => title.trim());
      const existingJobTitles = currentJob?.job_titles || [];
      const combinedJobTitles = [...existingJobTitles, ...newJobTitles];

      response.updates.push({
        field: "job_titles",
        values: combinedJobTitles,
      });

      response.feedback = "Job titles added successfully.";
      break;

    case "uj": // Update job titles (replace entirely)
      const updateJobTitles = commandValue
        .split(",")
        .map((title) => title.trim());

      response.updates.push({
        field: "job_titles",
        values: updateJobTitles,
      });

      response.feedback = "Job titles updated successfully.";
      break;

    case "acer": // Add certifications
      const newCertifications = commandValue
        .split(",")
        .map((cert) => cert.trim());
      const existingCertifications = currentJob?.certifications || [];
      const combinedCertifications = [
        ...existingCertifications,
        ...newCertifications,
      ];

      response.updates.push({
        field: "certifications",
        values: combinedCertifications,
      });

      response.feedback = "Certifications added successfully.";
      break;

    case "uc": // Update certifications (replace entirely)
      const certs = commandValue.split(",").map((cert) => cert.trim());
      response.updates.push({
        field: "certifications",
        values: certs,
      });

      response.feedback = "Certifications updated successfully.";
      break;

    case "pl": // Update proficiency level
      response.updates.push({
        field: "proficiency_level",
        values: [commandValue],
      });

      response.feedback = `Proficiency level set to ${commandValue}.`;
      break;

    case "ct": // Change category
      const newCategory =
        commandValue.toLowerCase() === "job" ? "Job" : "Talent";

      // Check if user already has a talent profile
      if (newCategory === "Talent") {
        const hasTalent = jobs
          .filter((j) => j.id !== currentJob?.id)
          .some((j) => Object.keys(j.category)[0] === "Talent");

        if (hasTalent) {
          response.feedback =
            "You already have a talent profile. You can create only one talent profile.";
          return response;
        }
      }

      response.category = newCategory;
      response.feedback = `Category changed to ${newCategory}.`;
      response.isBreakingChanges = true;
      break;

    default:
      // Handle general queries or unrecognized commands
      response.feedback = analyzeGeneralQuery(command, currentJob);
      break;
  }

  // Add trust score and trust note
  const trustAssessment = assessTrust(currentJob, response.updates);
  response.updates.push({
    field: "trust_score",
    values: [trustAssessment.score],
  });
  response.updates.push({
    field: "trust_note",
    values: [trustAssessment.note],
  });

  // Check if profile is complete
  response.done = isProfileComplete(currentJob, response.updates);

  return response;
}

function inferJobTitles(description, skills) {
  const titles = [];
  const desc = description.toLowerCase();

  // Common job title patterns
  const titlePatterns = {
    developer: ["Software Developer", "Full Stack Developer", "Web Developer"],
    engineer: ["Software Engineer", "Backend Engineer", "Frontend Engineer"],
    designer: ["UI/UX Designer", "Web Designer", "Graphic Designer"],
    manager: ["Project Manager", "Product Manager", "Technical Manager"],
    analyst: ["Data Analyst", "Business Analyst", "Systems Analyst"],
    consultant: [
      "Technical Consultant",
      "IT Consultant",
      "Business Consultant",
    ],
  };

  // Check for specific technologies
  if (
    skills.some((skill) =>
      ["rust", "python", "javascript"].includes(skill.toLowerCase()),
    )
  ) {
    titles.push("Backend Developer");
  }
  if (
    skills.some((skill) =>
      ["react", "vue", "angular"].includes(skill.toLowerCase()),
    )
  ) {
    titles.push("Frontend Developer");
  }
  if (
    skills.some((skill) =>
      ["icp", "blockchain", "web3"].includes(skill.toLowerCase()),
    )
  ) {
    titles.push("Blockchain Developer");
  }

  // Check description for job title keywords
  Object.keys(titlePatterns).forEach((keyword) => {
    if (desc.includes(keyword)) {
      titles.push(...titlePatterns[keyword]);
    }
  });

  return [...new Set(titles)].slice(0, 3); // Return unique titles, max 3
}

function assessTrust(currentJob, updates) {
  let score = 7.0;
  let notes = [];

  // Check for email presence
  const hasEmail =
    currentJob?.emails?.length > 0 ||
    updates.some((u) => u.field === "emails" && u.values.length > 0);

  if (!hasEmail) {
    score -= 1.0;
    notes.push("No email provided");
  }

  // Check for description
  const hasDescription =
    currentJob?.description || updates.some((u) => u.field === "description");

  if (!hasDescription) {
    score -= 0.5;
    notes.push("No description provided");
  }

  // Check for skills
  const hasSkills =
    currentJob?.skills?.length > 0 ||
    updates.some((u) => u.field === "skills" && u.values.length > 0);

  if (!hasSkills) {
    score -= 1.0;
    notes.push("No skills listed");
  }

  // Bonus for having contacts
  const hasContacts =
    currentJob?.contacts?.length > 0 ||
    updates.some((u) => u.field === "contacts" && u.values.length > 0);

  if (hasContacts) {
    score += 0.5;
    notes.push("Has contact information");
  }

  const trustNote = notes.length > 0 ? notes.join(", ") : "Profile looks good";

  return {
    score: Math.max(1.0, Math.min(10.0, score)).toString(),
    note: trustNote,
  };
}

function isProfileComplete(currentJob, updates) {
  // Check essential fields
  const hasEmail =
    currentJob?.emails?.length > 0 ||
    updates.some((u) => u.field === "emails" && u.values.length > 0);

  const hasSkills =
    currentJob?.skills?.length > 0 ||
    updates.some((u) => u.field === "skills" && u.values.length > 0);

  const hasDescription =
    currentJob?.description || updates.some((u) => u.field === "description");

  return hasEmail && hasSkills && hasDescription;
}

function analyzeGeneralQuery(query, currentJob) {
  const q = query.toLowerCase();

  if (q.includes("help") || q.includes("how") || q.includes("what")) {
    return "I can help you manage your job profile. Use commands like 'as>skill1,skill2' to add skills, 'ds>skill1' to remove skills, 'ud>description' to update description, 'ae>email@example.com' to add email, etc.";
  }

  if (q.includes("done") || q.includes("finished") || q.includes("complete")) {
    return "Great! Your profile is being processed. Make sure you have provided all necessary information including skills, email, and description.";
  }

  // Provide guidance based on missing information
  const missing = [];
  if (!currentJob?.emails || currentJob.emails.length === 0) {
    missing.push("email address");
  }
  if (!currentJob?.skills || currentJob.skills.length === 0) {
    missing.push("skills");
  }
  if (!currentJob?.description) {
    missing.push("description");
  }

  if (missing.length > 0) {
    return `Please provide your ${missing.join(", ")} to complete your profile.`;
  }

  return "Your profile looks good. Is there anything specific you'd like to update?";
}
