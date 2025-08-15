import { JobUpdate, Match } from "$/declarations/backend/backend.did";
import { createIdentity } from "@dfinity/pic";
import { registerUser } from "../utils";
import exp from "constants";

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

async function updateJobWithMatches(jobId: string, matches: Match[]) {
  const updateWithMatches: JobUpdate = {
    id: jobId,
    updates: [],
    active: [],
    required_match_score: [],
    category: [],
    matches: [matches],
  };
  await globalThis.oneHourLater();
  const result = await globalThis.testActor.update_job([updateWithMatches], []);
  if ("Err" in result) {
    throw new Error(`Failed to update job with matches: ${result.Err}`);
  }
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
    const JOB_SKILLS = ["icp", "rust"];
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
    const users = await Promise.all(userPromises);

    // Step 2: Create job creator and job
    const jobCreator = await createUser(`${testId}_job_creator`);
    globalThis.testActor.setIdentity(jobCreator);

    const jobProfile = await createJobProfile(JOB_SKILLS);
    const jobResult = await globalThis.testActor.update_job([jobProfile], []);

    if ("Err" in jobResult) {
      throw new Error(`Failed to create job: ${jobResult.Err}`);
    }

    // Step 3: Process matches in batches
    let allSavedMatches: Match[] = [];

    for (let i = 1; i <= 3; i++) {
      // Get matches
      const matches = await globalThis.testActor.get_matches(
        jobProfile.id,
        JOB_SKILLS,
        { Talent: null },
      );

      expect(matches.length).toBe(10);

      // Verify that 1-2 of these matches are not already in our saved matches
      const matchesToVerify = matches.slice(0, 2);
      for (const match of matchesToVerify) {
        const alreadyExists = allSavedMatches.some(
          (saved) => saved.job_id === match.id,
        );
        expect(alreadyExists).toBe(false);
      }

      // Create match objects from the batch
      const matchObjects: Match[] = matches.map((talent) => ({
        user_id: talent.user_id,
        job_id: talent.id,
        score: 0.8,
        date_updated: talent.date_updated,
        missmatching_skills: [],
        cover_letter: "",
        is_connected: false,
      }));

      // Add to our collection of all saved matches
      allSavedMatches = [...allSavedMatches, ...matchObjects];

      // Update job with all matches (old + new)
      await updateJobWithMatches(jobProfile.id, allSavedMatches);

      // Verify the matches were saved correctly
      const userJobs = await globalThis.testActor.get_my_jobs();
      expect(userJobs.jobs[0].matches.length).toBe(10 * i);
      expect(userJobs.matching_jobs.length).toBe(10 * i);
    }

    // Step 4: Verify no more matches available
    const noMoreMatches = await globalThis.testActor.get_matches(
      jobProfile.id,
      JOB_SKILLS,
      { Talent: null },
    );

    expect(noMoreMatches.length).toBe(0);

    // Verify the workflow completed successfully
    expect(allSavedMatches.length).toBe(30);
  }, 60000); // 60 second timeout for this comprehensive test

  test("get matches, should get the newlly updated mathces", async () => {
    // Create talent and job
    const talent = await createUser("talent");
    globalThis.testActor.setIdentity(talent);
    const talentProfile = await createTalentProfile([
      "icp",
      "rust",
      "typescript",
    ]);
    await globalThis.testActor.update_job([talentProfile], []);

    const jobCreator = await createUser("job_creator");
    globalThis.testActor.setIdentity(jobCreator);
    const jobProfile = await createJobProfile(["icp", "rust"]);
    await globalThis.testActor.update_job([jobProfile], []);

    // Get matches (any number)
    const matches = await globalThis.testActor.get_matches(
      jobProfile.id,
      ["icp", "rust"],
      { Talent: null },
    );

    await updateJobWithMatches(jobProfile.id, {
      user_id: matches[0].user_id,
      job_id: matches[0].id,
      score: 0.8,
      date_updated: matches[0].date_updated,
      missmatching_skills: [],
      cover_letter: "",
      is_connected: false,
    });
    const newMatch = await globalThis.testActor.get_matches(
      jobProfile.id,
      ["icp", "rust"],
      { Talent: null },
    );
    expect(newMatch.length).toBe(0)

    // Login as talent and update profile
    globalThis.testActor.setIdentity(talent);
    await makeRandomTalentUpdate(talentProfile.id);
    await globalThis.oneHourLater();

    // Login as job user and get matches - should find the updated talent
    globalThis.testActor.setIdentity(jobCreator);
    const updatedMatches = await globalThis.testActor.get_matches(
      jobProfile.id,
      ["icp", "rust"],
      { Talent: null },
    );

    expect(updatedMatches.some((match) => match.id === talentProfile.id)).toBe(
      true,
    );
  });
});
