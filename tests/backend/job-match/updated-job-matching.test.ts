import { Job, JobUpdate } from "$/declarations/backend/backend.did";
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

describe("Updated Job Matching - Edge Cases", () => {
  test("should find talent when job skills are updated to match", async () => {
    const testId = `test_update_${Date.now()}`;

    // Step 1: Create a talent with specific skills
    const talentUser = await createUser(`${testId}_talent`);
    globalThis.testActor.setIdentity(talentUser);

    const talentSkills = ["icp", "rust", "django"];
    const talentProfile = await createTalentProfile(talentSkills);
    const talentResult = await globalThis.testActor.update_job(
      [talentProfile],
      [],
    );

    if ("Err" in talentResult) {
      throw new Error(`Failed to create talent: ${talentResult.Err}`);
    }

    console.log("Created talent with skills:", talentSkills);

    // Step 2: Create a job with different skills (no match initially)
    const jobCreator = await createUser(`${testId}_job_creator`);
    globalThis.testActor.setIdentity(jobCreator);

    const initialJobSkills = ["python", "javascript"];
    const jobProfile = await createJobProfile(initialJobSkills);
    const jobResult = await globalThis.testActor.update_job([jobProfile], []);

    if ("Err" in jobResult) {
      throw new Error(`Failed to create job: ${jobResult.Err}`);
    }

    console.log("Created job with initial skills:", initialJobSkills);

    // Step 3: Verify no matches initially
    const initialMatches = await globalThis.testActor.get_matches(
      jobProfile.id,
      initialJobSkills,
      { Talent: null },
    );

    console.log("Initial matches count:", initialMatches.length);
    expect(initialMatches.length).toBe(0);

    // Step 4: Update the job with matching skills
    await globalThis.oneHourLater();

    const updatedJobSkills = ["icp", "rust", "scripting", "django"];
    const jobUpdate: JobUpdate = {
      id: jobProfile.id,
      updates: [{ field: "skills", values: updatedJobSkills }],
      active: [],
      required_match_score: [],
      category: [],
      matches: [],
    };

    const updateResult = await globalThis.testActor.update_job([jobUpdate], []);
    if ("Err" in updateResult) {
      throw new Error(`Failed to update job: ${updateResult.Err}`);
    }

    console.log("Updated job with new skills:", updatedJobSkills);

    // Step 5: Verify the job was updated
    const updatedJob = await globalThis.testActor.get_job(jobProfile.id);
    expect(updatedJob).toBeDefined();
    expect(updatedJob[0]?.skills).toEqual(updatedJobSkills);

    // Step 6: Search for matches with updated skills
    const matchesAfterUpdate = await globalThis.testActor.get_matches(
      jobProfile.id,
      updatedJobSkills,
      { Talent: null },
    );

    console.log("Matches after update:", {
      count: matchesAfterUpdate.length,
      matchedIds: matchesAfterUpdate.map((m) => m.id),
      matchedSkills: matchesAfterUpdate.map((m) => ({
        id: m.id,
        skills: m.skills,
      })),
    });

    // Step 7: Verify the talent is now found
    expect(matchesAfterUpdate.length).toBeGreaterThan(0);

    const foundTalent = matchesAfterUpdate.find(
      (m) => m.id === talentProfile.id,
    );
    expect(foundTalent).toBeDefined();
    expect(foundTalent?.skills).toEqual(talentSkills);

    // Step 8: Verify skill overlap calculation
    const commonSkills = updatedJobSkills.filter((skill) =>
      talentSkills.includes(skill),
    );
    console.log("Common skills:", commonSkills);
    expect(commonSkills.length).toBe(3); // icp, rust, django
  }, 30000);

  test("should find talent when creating new job with same skills", async () => {
    const testId = `test_new_${Date.now()}`;

    // Step 1: Create a talent with specific skills
    const talentUser = await createUser(`${testId}_talent`);
    globalThis.testActor.setIdentity(talentUser);

    const talentSkills = ["icp", "rust", "django"];
    const talentProfile = await createTalentProfile(talentSkills);
    const talentResult = await globalThis.testActor.update_job(
      [talentProfile],
      [],
    );

    if ("Err" in talentResult) {
      throw new Error(`Failed to create talent: ${talentResult.Err}`);
    }

    console.log("Created talent with skills:", talentSkills);

    // Step 2: Create a NEW job with matching skills
    const jobCreator = await createUser(`${testId}_job_creator`);
    globalThis.testActor.setIdentity(jobCreator);

    const jobSkills = ["icp", "rust", "scripting", "django"];
    const jobProfile = await createJobProfile(jobSkills);
    const jobResult = await globalThis.testActor.update_job([jobProfile], []);

    if ("Err" in jobResult) {
      throw new Error(`Failed to create job: ${jobResult.Err}`);
    }

    console.log("Created new job with skills:", jobSkills);

    // Step 3: Search for matches
    const matches = await globalThis.testActor.get_matches(
      jobProfile.id,
      jobSkills,
      { Talent: null },
    );

    console.log("Matches for new job:", {
      count: matches.length,
      matchedIds: matches.map((m) => m.id),
    });

    // Step 4: Verify the talent is found
    expect(matches.length).toBeGreaterThan(0);

    const foundTalent = matches.find((m) => m.id === talentProfile.id);
    expect(foundTalent).toBeDefined();
    expect(foundTalent?.skills).toEqual(talentSkills);
  }, 30000);

  test("should handle multiple skill updates correctly", async () => {
    const testId = `test_multi_update_${Date.now()}`;

    // Create talent
    const talentUser = await createUser(`${testId}_talent`);
    globalThis.testActor.setIdentity(talentUser);

    const talentSkills = ["icp", "rust", "django"];
    const talentProfile = await createTalentProfile(talentSkills);
    await globalThis.testActor.update_job([talentProfile], []);

    // Create job
    const jobCreator = await createUser(`${testId}_job_creator`);
    globalThis.testActor.setIdentity(jobCreator);

    const jobProfile = await createJobProfile(["python"]);
    await globalThis.testActor.update_job([jobProfile], []);

    // First update - partial match
    await globalThis.oneHourLater();
    let jobUpdate: JobUpdate = {
      id: jobProfile.id,
      updates: [{ field: "skills", values: ["icp", "typescript"] }],
      active: [],
      required_match_score: [],
      category: [],
      matches: [],
    };
    await globalThis.testActor.update_job([jobUpdate], []);

    let matches = await globalThis.testActor.get_matches(
      jobProfile.id,
      ["icp", "typescript"],
      { Talent: null },
    );
    console.log("After first update - matches:", matches.length);

    // Second update - better match
    await globalThis.oneHourLater();
    jobUpdate = {
      id: jobProfile.id,
      updates: [{ field: "skills", values: ["icp", "rust", "django"] }],
      active: [],
      required_match_score: [],
      category: [],
      matches: [],
    };
    await globalThis.testActor.update_job([jobUpdate], []);

    matches = await globalThis.testActor.get_matches(
      jobProfile.id,
      ["icp", "rust", "django"],
      { Talent: null },
    );

    console.log("After second update - matches:", matches.length);
    expect(matches.length).toBeGreaterThan(0);

    const foundTalent = matches.find((m) => m.id === talentProfile.id);
    expect(foundTalent).toBeDefined();
  }, 30000);
});
