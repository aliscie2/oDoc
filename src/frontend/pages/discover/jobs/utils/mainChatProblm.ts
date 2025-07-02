import nlp from "compromise";

export const MAIN_CHAT_PROMPT = `Match talent to job. Return JSON:
{matches:[{job_id:string,missmatching_skills:number[],score:number,cover_letter:string}]}
skill_dict maps indices to skills. missmatching_skills = skills in current.skills but not in candidate.skills (as indices).`;

export function classifyMessage(message) {
  if (!message || message.trim().length < 5) {
    return {
      type: null,
      feedback:
        "Please clarify: calendar update, talent/job search, or questions about your calendar/jobs?",
    };
  }

  const doc = nlp(message);
  const lowerMsg = message.toLowerCase();

  const calendarTerms = [
    "schedule",
    "reschedule",
    "calendar",
    "appointment",
    "booking",
    "event",
    "meeting",
    "availability",
    "confirm",
    "cancel",
    "postpone",
    "move",
  ];
  const jobTerms = [
    "cv",
    "resume",
    "portfolio",
    "salary",
    "hire",
    "hiring",
    "recruit",
    "job",
    "developer",
    "engineer",
    "remote",
    "onsite",
    "freelance",
    "skills",
    "experience",
    "icp",
    "javascript",
    "react",
    "node",
    "python",
    "java",
    "php",
    "angular",
    "vue",
    "html",
    "css",
    "sql",
    "mongodb",
    "aws",
    "docker",
    "kubernetes",
  ];

  let calendarScore = 0,
    jobsScore = 0;

  // Strong job indicators
  if (
    /(i am|i'm|am)\s+(good|great|expert|skilled|experienced)\s+(at|in|with)/i.test(
      lowerMsg,
    )
  )
    jobsScore += 4;
  if (
    /(looking for|seeking|need|want)\s+(work|job|position|role)/i.test(lowerMsg)
  )
    jobsScore += 4;
  if (
    /(years?\s+of\s+experience|senior|junior|lead|full.?stack|front.?end|back.?end)/i.test(
      lowerMsg,
    )
  )
    jobsScore += 3;

  // Term matching
  [...calendarTerms, ...jobTerms].forEach((term) => {
    const score = jobTerms.includes(term) ? 3 : 3;
    if (lowerMsg.includes(term)) {
      jobTerms.includes(term) ? (jobsScore += score) : (calendarScore += score);
    }
  });

  // Time patterns for calendar
  if (
    doc.match("#Time").found ||
    doc.has("#Date") ||
    /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next\s+week)/i.test(
      lowerMsg,
    )
  )
    calendarScore += 2;

  // Context patterns
  if (/(available|free|busy)\s+(when|next|today|tomorrow)/i.test(lowerMsg))
    calendarScore += 2;
  if (/(list|show|tell me)\s+(events|meetings|schedule)/i.test(lowerMsg))
    calendarScore += 2;
  if (/(list|show|tell me)\s+(jobs|applications|interviews)/i.test(lowerMsg))
    jobsScore += 2;
  if (/(budget|price|cost)\s+(hourly|monthly|project)/i.test(lowerMsg))
    jobsScore += 2;

  const scoreDiff = Math.abs(calendarScore - jobsScore);
  const maxScore = Math.max(calendarScore, jobsScore);

  if (maxScore > 0 && scoreDiff < 1.5 && calendarScore > 0 && jobsScore > 0) {
    return {
      type: null,
      feedback:
        "Could relate to both calendar and jobs. Please clarify your intent.",
    };
  }

  if (calendarScore > jobsScore && calendarScore > 0)
    return { type: "CALENDAR", feedback: "" };
  if (jobsScore > calendarScore && jobsScore > 0)
    return { type: "JOBS", feedback: "" };

  return {
    type: null,
    feedback:
      "Unable to determine topic. Please be more specific about calendar or job matters.",
  };
}
