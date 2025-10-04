import {
  GetJobs,
  Job,
  JobUpdate,
  Match,
} from "$/declarations/backend/backend.did";
import { createIdentity } from "@dfinity/pic";
import { registerUser } from "../utils";

// Helper functions
async function createUser(id: string) {
  const user = createIdentity(`user_${id}_${Date.now()}`);
  await registerUser(`user_${id}_${Date.now()}`);
  return user;
}

async function createTalentProfile(skills: string[]): Promise<JobUpdate> {
  return {
    id: `talent_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    updates: [
      { field: "skills", values: skills },
      { field: "job_titles", values: ["Developer"] },
      { field: "description", values: ["Talented developer"] },
    ],
    active: [true],
    required_match_score: [0.0],
    category: [{ Talent: null }],
    matches: [],
  };
}

async function createJobProfile(skills: string[]): Promise<JobUpdate> {
  return {
    id: `job_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    updates: [
      { field: "skills", values: skills },
      { field: "job_titles", values: ["Job Opening"] },
      { field: "description", values: ["Great job opportunity"] },
    ],
    active: [true],
    required_match_score: [0.0],
    category: [{ Job: null }],
    matches: [],
  };
}

async function updateJobWithMatches(
  jobId: string,
  matches: Job[],
  oldMatch: Match[],
) {
  const matchObjects1: Match[] = matches.map((talent) => ({
    user_id: talent.user_id,
    job_id: talent.id,
    score: 0.8,
    date_updated: talent.date_updated,
    missmatching_skills: [],
    cover_letter: "",
    is_connected: false,
  }));

  // Add to our collection of all saved matches
  const allSavedMatches = [...oldMatch, ...matchObjects1];

  const updateWithMatches: JobUpdate = {
    id: jobId,
    updates: [],
    active: [],
    required_match_score: [],
    category: [],
    matches: [allSavedMatches],
  };
  await globalThis.oneHourLater();
  const result = await globalThis.testActor.update_job([updateWithMatches], []);
  if ("Err" in result) {
    throw new Error(`Failed to update job with matches: ${result.Err}`);
  }
}

const JOB_SKILLS = ["icp", "rust"];

async function getInitJobs(
  jobProfileId: string,
  lookingFor = { Talent: null },
) {
  const jobMatches: Job[] = await globalThis.testActor.get_matches(
    jobProfileId,
    JOB_SKILLS,
    lookingFor,
  );
  const userJobs: GetJobs = await globalThis.testActor.get_my_jobs();
  await updateJobWithMatches(
    jobProfileId,
    jobMatches,
    userJobs.jobs[0].matches,
  );
  return { jobMatches, userJobs };
}

async function makeRandomTalentUpdate(talentId: string) {
  const randomSkill = `skill_${Math.random().toString(36).substring(7)}`;
  const updateTalent: JobUpdate = {
    id: talentId,
    updates: [
      { field: "skills", values: ["icp", "rust", "typescript", randomSkill] },
    ],
    active: [],
    required_match_score: [],
    category: [],
    matches: [],
  };

  const result = await globalThis.testActor.update_job([updateTalent], []);
  if ("Err" in result) {
    throw new Error(`Failed to update talent: ${result.Err}`);
  }
}

describe("Comprehensive Job Matching System", () => {
  test("should handle complete matching workflow with 30 users", async () => {
    const TALENT_COUNT = 30;
    const SHARED_SKILLS = ["icp", "rust", "typescript"];

    const testId = `test1_${Date.now()}`;

    // Step 1: Create 30 users in parallel and register them as talents
    const userPromises = Array.from({ length: TALENT_COUNT }, async (_, i) => {
      const user = await createUser(`${testId}_talent_${i}`);
      globalThis.testActor.setIdentity(user);

      const talentProfile = await createTalentProfile(SHARED_SKILLS);
      const result = await globalThis.testActor.update_job([talentProfile], []);

      if ("Err" in result) {
        throw new Error(`Failed to create talent ${i}: ${result.Err}`);
      }

      return { user, talentId: talentProfile.id };
    });

    // Wait for all users to be created
    const talentsUsers = await Promise.all(userPromises);

    // Step 2: Create job creator and job
    const jobCreator = await createUser(`${testId}_job_creator`);
    globalThis.testActor.setIdentity(jobCreator);

    const jobProfile = await createJobProfile(JOB_SKILLS);
    const jobResult = await globalThis.testActor.update_job([jobProfile], []);

    if ("Err" in jobResult) {
      throw new Error(`Failed to create job: ${jobResult.Err}`);
    }

    // Step 3: Process matches in batches
    const allSavedMatches: Match[] = [];

    for (let i = 1; i <= 3; i++) {
      // Get matches
      const { jobMatches: matches } = await getInitJobs(jobProfile.id);

      expect(matches.length).toBe(10);

      // Verify that 1-2 of these matches are not already in our saved matches
      const matchesToVerify = matches.slice(0, 2);
      for (const match of matchesToVerify) {
        const alreadyExists = allSavedMatches.some(
          (saved) => saved.job_id === match.id,
        );
        expect(alreadyExists).toBe(false);
      }

      // Verify the matches were saved correctly
      const userJobs = await globalThis.testActor.get_my_jobs();

      expect(userJobs.jobs[0].matches.length).toBe(10 * i);
      expect(userJobs.matching_jobs.length).toBe(10 * i);
    }

    // Step 4: Verify no more matches available
    const { jobMatches: noMoreMatches } = await getInitJobs(jobProfile.id);
    expect(noMoreMatches.length).toBe(0);

    // --------- test get updated talent

    globalThis.testActor.setIdentity(talentsUsers[0].user);
    await makeRandomTalentUpdate(talentsUsers[0].talentId);
    globalThis.testActor.setIdentity(jobCreator);
    const { jobMatches: noMoreMatches2 } = await getInitJobs(jobProfile.id);
    expect(noMoreMatches2.length).toBe(1);
  }, 60000); // 60 second timeout for this comprehensive test
});
