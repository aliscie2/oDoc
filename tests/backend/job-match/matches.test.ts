import { JobUpdate, Match } from "$/declarations/backend/backend.did.js";
import { registerUser } from "../utils";
import { createDummyUser, createJob } from "./utiles";

test("should create job and get my jobs", async () => {
  const { user } = await registerUser(`jobCreator_${Date.now()}`);
  globalThis.testActor.setIdentity(user);

  const jobUpdate = await createJob(["react", "typescript"], { Job: null });

  const createRes = await globalThis.testActor.update_job([jobUpdate], []);
  expect("Ok" in createRes).toBe(true);

  const myJobs = await globalThis.testActor.get_my_jobs();
  expect(myJobs.jobs.length).toBe(1);
  expect(myJobs.jobs[0].skills).toEqual(["react", "typescript"]);
  expect(myJobs.jobs[0].active).toBe(true);
});

test("should find matches between job and talent", async () => {
  const timestamp = Date.now();
  const jobCreator = await createDummyUser(`jobCreator_${timestamp}`);
  const talentUser = await createDummyUser(`talentUser_${timestamp}`);

  // Create talent first
  globalThis.testActor.setIdentity(talentUser);
  const talentUpdate = await createJob(
    ["react", "javascript"],
    { Talent: null },
    "React Developer",
  );
  const talentRes = await globalThis.testActor.update_job([talentUpdate], []);
  expect("Ok" in talentRes).toBe(true);

  // Wait a bit to ensure proper ordering
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Create job with matching skills
  globalThis.testActor.setIdentity(jobCreator);
  const jobUpdate = await createJob(["react", "typescript"], { Job: null });
  const jobRes = await globalThis.testActor.update_job([jobUpdate], []);
  expect("Ok" in jobRes).toBe(true);

  // Check matches using get_matches instead of get_my_jobs
  const matches = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["react", "typescript"],
    { Talent: null },
  );
  expect(matches.length).toBeGreaterThanOrEqual(1);
  expect(matches.some((job) => job.skills.includes("react"))).toBe(true);
});

test("should not match jobs with no shared skills", async () => {
  const timestamp = Date.now();
  const jobCreator = await createDummyUser(`jobCreator2_${timestamp}`);
  const talentUser = await createDummyUser(`talentUser2_${timestamp}`);

  // Create talent with different skills
  globalThis.testActor.setIdentity(talentUser);
  const talentUpdate = await createJob(
    ["python", "django"],
    { Talent: null },
    "Python Developer",
  );
  await globalThis.testActor.update_job([talentUpdate], []);

  // Create job with completely different skills
  globalThis.testActor.setIdentity(jobCreator);
  const jobUpdate = await createJob(["react", "typescript"], { Job: null });
  await globalThis.testActor.update_job([jobUpdate], []);

  const matches = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["react", "typescript"],
    { Talent: null },
  );

  // Filter only matches that have no shared skills
  const nonMatchingJobs = matches.filter(
    (job) =>
      !job.skills.some((skill) => ["react", "typescript"].includes(skill)),
  );
  expect(nonMatchingJobs.length).toBe(0);
});

test("should return only top 10 matches and exclude saved matches on subsequent calls", async () => {
  const timestamp = Date.now();
  const jobCreator = await createDummyUser(`jobCreator3_${timestamp}`);

  // Create 15 talents (smaller number for faster test)
  const uniqueSkills = [];
  for (let i = 0; i < 15; i++) {
    const talentUser = await createDummyUser(`talent_${timestamp}_${i}`);
    globalThis.testActor.setIdentity(talentUser);

    const skills = ["javascript", "react", `skill_${timestamp}_${i}`];
    uniqueSkills.push(`skill_${timestamp}_${i}`);
    const talentUpdate = await createJob(
      skills,
      { Talent: null },
      `Developer ${i}`,
    );
    await globalThis.testActor.update_job([talentUpdate], []);
  }

  // Create job as job creator
  globalThis.testActor.setIdentity(jobCreator);
  const jobUpdate = await createJob(["javascript", "react"], { Job: null });
  await globalThis.testActor.update_job([jobUpdate], []);

  // Get initial matches
  const matches1 = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["javascript", "react"],
    { Talent: null },
  );
  expect(matches1.length).toBeGreaterThan(0);
  expect(matches1.length).toBeLessThanOrEqual(10);

  // Save first 3 matches
  const matchesToSave = matches1.slice(0, 3);
  const savedMatches: Match[] = matchesToSave.map((job) => ({
    job_id: job.id,
    match_score: 0.8,
    date_updated: Date.now() * 1000000,
    cover_letter: "",
    status: { Pending: null },
    missmatching_skills: [],
    user_id: job.user_id,
    score: 0.8,
    is_connected: false,
  }));

  const updateWithMatches: JobUpdate = {
    id: jobUpdate.id,
    updates: [],
    active: [],
    required_match_score: [],
    category: [],
    matches: [savedMatches],
  };

  await globalThis.testActor.update_job([updateWithMatches], []);

  // Get matches again - should exclude saved matches
  const matches2 = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["javascript", "react"],
    { Talent: null },
  );

  // Should get different matches (not the saved ones)
  const savedJobIds = savedMatches.map((m) => m.job_id);
  const newMatchIds = matches2.map((j) => j.id);

  const hasOverlap = savedJobIds.some((id) => newMatchIds.includes(id));
  expect(hasOverlap).toBe(false);
}, 15000); // Increased timeout

test("should handle multiple users with different skill combinations", async () => {
  const timestamp = Date.now();
  const jobCreator = await createDummyUser(`multiSkillJob_${timestamp}`);

  // Create users with different skill combinations
  const skillCombinations = [
    ["react", "typescript", "node"],
    ["react", "javascript"],
    ["python", "django"],
    ["react", "vue"],
    ["typescript", "node"],
  ];

  for (let i = 0; i < skillCombinations.length; i++) {
    const talentUser = await createDummyUser(`multiSkill_${timestamp}_${i}`);
    globalThis.testActor.setIdentity(talentUser);

    const talentUpdate = await createJob(skillCombinations[i], {
      Talent: null,
    });
    await globalThis.testActor.update_job([talentUpdate], []);
  }

  globalThis.testActor.setIdentity(jobCreator);
  const jobUpdate = await createJob(["react", "typescript"], { Job: null });
  await globalThis.testActor.update_job([jobUpdate], []);

  const matches = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["react", "typescript"],
    { Talent: null },
  );

  // Should match talents with react or typescript
  const hasRelevantMatches = matches.some((job) =>
    job.skills.some((skill) => ["react", "typescript"].includes(skill)),
  );
  expect(hasRelevantMatches).toBe(true);

  // Should not match python/django only talents
  const pythonOnlyMatches = matches.filter(
    (job) =>
      job.skills.includes("python") &&
      !job.skills.some((skill) => ["react", "typescript"].includes(skill)),
  );
  expect(pythonOnlyMatches.length).toBe(0);
});

test("should update job and reflect changes in matches", async () => {
  const timestamp = Date.now();
  const jobCreator = await createDummyUser(`jobUpdater_${timestamp}`);
  const talentUser = await createDummyUser(`talentForUpdate_${timestamp}`);

  // Create talent
  globalThis.testActor.setIdentity(talentUser);
  const uniqueSkill = `newskill_${timestamp}`;
  const talentUpdate = await createJob(["react", uniqueSkill], {
    Talent: null,
  });
  await globalThis.testActor.update_job([talentUpdate], []);

  // Create job
  globalThis.testActor.setIdentity(jobCreator);
  let jobUpdate = await createJob(["react"], { Job: null });
  await globalThis.testActor.update_job([jobUpdate], []);

  // Initial match - should find the talent
  let matches = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["react"],
    { Talent: null },
  );

  const relevantMatches = matches.filter((job) => job.skills.includes("react"));
  expect(relevantMatches.length).toBeGreaterThanOrEqual(1);

  // Update job with new skills
  const updatedJob: JobUpdate = {
    id: jobUpdate.id,
    updates: [{ field: "skills", values: ["react", uniqueSkill] }],
    active: [],
    required_match_score: [],
    category: [],
    matches: [],
  };

  await globalThis.testActor.update_job([updatedJob], []);

  // Should still match with updated skills
  matches = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["react", uniqueSkill],
    { Talent: null },
  );

  const updatedRelevantMatches = matches.filter((job) =>
    job.skills.includes(uniqueSkill),
  );
  expect(updatedRelevantMatches.length).toBeGreaterThanOrEqual(1);
});

test("should get more matches after saving initial batch", async () => {
  const timestamp = Date.now();
  const jobCreator = await createDummyUser(`jobCreator_batch_${timestamp}`);

  // Create 25 talents to ensure we have more than 20 total matches
  for (let i = 0; i < 25; i++) {
    const talentUser = await createDummyUser(`talent_batch_${timestamp}_${i}`);
    globalThis.testActor.setIdentity(talentUser);

    const skills = ["javascript", "react", `skill_${timestamp}_${i}`];
    const talentUpdate = await createJob(
      skills,
      { Talent: null },
      `Developer ${i}`,
    );
    await globalThis.testActor.update_job([talentUpdate], []);
  }

  // Create job
  globalThis.testActor.setIdentity(jobCreator);
  const jobUpdate = await createJob(["javascript", "react"], { Job: null });
  await globalThis.testActor.update_job([jobUpdate], []);

  // Get first batch (should be max 10)
  const matches1 = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["javascript", "react"],
    { Talent: null },
  );
  console.log("First batch matches:", matches1.length);
  expect(matches1.length).toBeGreaterThan(0);
  expect(matches1.length).toBeLessThanOrEqual(10);

  // Save only SOME matches from first batch (not all)
  const matchesToSave = matches1.slice(0, Math.min(5, matches1.length));
  const savedMatches: Match[] = matchesToSave.map((job) => ({
    job_id: job.id,
    match_score: 0.8,
    date_updated: Date.now() * 1000000,
    cover_letter: "",
    status: { Pending: null },
    missmatching_skills: [],
    user_id: job.user_id,
    score: 0.8,
    is_connected: false,
  }));

  const updateWithMatches: JobUpdate = {
    id: jobUpdate.id,
    updates: [],
    active: [],
    required_match_score: [],
    category: [],
    matches: [savedMatches],
  };

  await globalThis.testActor.update_job([updateWithMatches], []);

  // Get second batch - should get remaining matches
  const matches2 = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["javascript", "react"],
    { Talent: null },
  );
  console.log("Second batch matches:", matches2.length);
  console.log("Saved matches count:", savedMatches.length);

  // Should get different matches (remaining ones)
  if (matches1.length > matchesToSave.length) {
    expect(matches2.length).toBeGreaterThan(0);
  }

  // Verify no overlap with saved matches
  const savedJobIds = savedMatches.map((m) => m.job_id);
  const secondBatchIds = matches2.map((j) => j.id);
  const hasOverlap = savedJobIds.some((id) => secondBatchIds.includes(id));
  expect(hasOverlap).toBe(false);

  // The unsaved matches from first batch should appear in second batch
  const unsavedFromFirst = matches1.slice(matchesToSave.length);
  const unsavedIds = unsavedFromFirst.map((j) => j.id);
  const foundUnsaved = unsavedIds.filter((id) => secondBatchIds.includes(id));

  if (unsavedFromFirst.length > 0) {
    expect(foundUnsaved.length).toBeGreaterThan(0);
  }
});
