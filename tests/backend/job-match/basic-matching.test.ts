import { createDummyUser, createJob } from "./utiles";

describe("Basic Job Matching", () => {
  test("should create job successfully", async () => {
    const user = await createDummyUser(`jobCreator_${Date.now()}`);
    globalThis.testActor.setIdentity(user);

    const jobUpdate = await createJob(["react", "typescript"], { Job: null });

    const createRes = await globalThis.testActor.update_job([jobUpdate], []);
    expect("Ok" in createRes).toBe(true);

    const myJobs = await globalThis.testActor.get_my_jobs();
    expect(myJobs.jobs.length).toBe(1);
    expect(myJobs.jobs[0].skills).toEqual(["react", "typescript"]);
    expect(myJobs.jobs[0].active).toBe(true);
  });

  test("should create talent successfully", async () => {
    const user = await createDummyUser(`talentCreator_${Date.now()}`);
    globalThis.testActor.setIdentity(user);

    const talentUpdate = await createJob(["python", "django"], {
      Talent: null,
    });

    const createRes = await globalThis.testActor.update_job([talentUpdate], []);
    expect("Ok" in createRes).toBe(true);

    const myJobs = await globalThis.testActor.get_my_jobs();
    expect(myJobs.jobs.length).toBe(1);
    expect(myJobs.jobs[0].skills).toEqual(["python", "django"]);
    expect(myJobs.jobs[0].category).toEqual({ Talent: null });
  });

  test("should find matches between job and talent with shared skills", async () => {
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

    // Create job with matching skills
    globalThis.testActor.setIdentity(jobCreator);
    const jobUpdate = await createJob(["react", "typescript"], { Job: null });
    const jobRes = await globalThis.testActor.update_job([jobUpdate], []);
    expect("Ok" in jobRes).toBe(true);

    // Check matches
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

  test("should exclude inactive jobs from matches", async () => {
    const timestamp = Date.now();
    const jobCreator = await createDummyUser(`jobCreator3_${timestamp}`);
    const talentUser = await createDummyUser(`talentUser3_${timestamp}`);

    // Create active talent
    globalThis.testActor.setIdentity(talentUser);
    const talentUpdate = await createJob(["react"], { Talent: null });
    await globalThis.testActor.update_job([talentUpdate], []);

    // Deactivate the talent
    const deactivateUpdate = {
      id: talentUpdate.id,
      updates: [],
      active: [false],
      required_match_score: [],
      category: [],
      matches: [],
    };
    await globalThis.testActor.update_job([deactivateUpdate], []);

    // Create job
    globalThis.testActor.setIdentity(jobCreator);
    const jobUpdate = await createJob(["react"], { Job: null });
    await globalThis.testActor.update_job([jobUpdate], []);

    const matches = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react"],
      { Talent: null },
    );

    // Should not include the inactive talent
    const inactiveMatch = matches.find((job) => job.id === talentUpdate.id);
    expect(inactiveMatch).toBeUndefined();
  });

  test("should exclude own jobs from matches", async () => {
    const user = await createDummyUser(`selfUser_${Date.now()}`);
    globalThis.testActor.setIdentity(user);

    // Create talent
    const talentUpdate = await createJob(["react"], { Talent: null });
    await globalThis.testActor.update_job([talentUpdate], []);

    // Create job with same user
    const jobUpdate = await createJob(["react"], { Job: null });
    await globalThis.testActor.update_job([jobUpdate], []);

    const matches = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react"],
      { Talent: null },
    );

    // Should not include own talent profile
    const selfMatch = matches.find((job) => job.id === talentUpdate.id);
    expect(selfMatch).toBeUndefined();
  });

  test("should handle minimum skill overlap requirement", async () => {
    const timestamp = Date.now();
    const jobCreator = await createDummyUser(`jobCreator4_${timestamp}`);
    const talentUser = await createDummyUser(`talentUser4_${timestamp}`);

    // Create talent with many skills, only one matching
    globalThis.testActor.setIdentity(talentUser);
    const talentUpdate = await createJob(
      [
        "react", // Only this matches
        "python",
        "django",
        "flask",
        "postgresql",
        "redis",
        "docker",
      ],
      { Talent: null },
    );
    await globalThis.testActor.update_job([talentUpdate], []);

    // Create job with many skills, only one matching
    globalThis.testActor.setIdentity(jobCreator);
    const jobUpdate = await createJob(
      [
        "react", // Only this matches
        "typescript",
        "node",
        "express",
        "mongodb",
        "aws",
        "kubernetes",
      ],
      { Job: null },
    );
    await globalThis.testActor.update_job([jobUpdate], []);

    const matches = await globalThis.testActor.get_matches(
      jobUpdate.id,
      [
        "react",
        "typescript",
        "node",
        "express",
        "mongodb",
        "aws",
        "kubernetes",
      ],
      { Talent: null },
    );

    // With only 1/7 skills matching (14%), should not meet 30% threshold
    const lowOverlapMatch = matches.find((job) => job.id === talentUpdate.id);
    expect(lowOverlapMatch).toBeUndefined();
  });

  test("should include jobs with sufficient skill overlap", async () => {
    const timestamp = Date.now();
    const jobCreator = await createDummyUser(`jobCreator5_${timestamp}`);
    const talentUser = await createDummyUser(`talentUser5_${timestamp}`);

    // Create talent with good skill overlap
    globalThis.testActor.setIdentity(talentUser);
    const talentUpdate = await createJob(
      [
        "react",
        "javascript",
        "typescript", // 3 matching skills
      ],
      { Talent: null },
    );
    await globalThis.testActor.update_job([talentUpdate], []);

    // Create job
    globalThis.testActor.setIdentity(jobCreator);
    const jobUpdate = await createJob(
      [
        "react",
        "javascript",
        "typescript",
        "node", // 3/4 = 75% overlap
      ],
      { Job: null },
    );
    await globalThis.testActor.update_job([jobUpdate], []);

    const matches = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react", "javascript", "typescript", "node"],
      { Talent: null },
    );

    // Should include talent with good overlap (75% > 30%)
    const goodOverlapMatch = matches.find((job) => job.id === talentUpdate.id);
    expect(goodOverlapMatch).toBeDefined();
  });
});
