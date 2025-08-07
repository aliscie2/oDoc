import { createDummyUser, createJob } from "./utiles";

test("test date updated", async () => {
  const user = await createDummyUser(`dummy`);
  globalThis.testActor.setIdentity(user);

  const jobProfile = await createJob(["react"], { Talent: null });
  await globalThis.testActor.update_job([jobProfile], []);

  let myjobs = await globalThis.testActor.get_my_jobs();
  console.log({ initial: myjobs.jobs[0].date_updated });

  await globalThis.oneHourLater();

  await globalThis.testActor.update_job(
    [
      {
        id: myjobs.jobs[0].id,
        updates: [{ field: "skills", values: ["react", "vue", "typescript"] }],
        active: [],
        required_match_score: [],
        category: [],
        matches: [],
      },
    ],
    [],
  );

  let myjobs2 = await globalThis.testActor.get_my_jobs();
  console.log({ updated: myjobs2.jobs[0].date_updated });

  expect(myjobs2.jobs[0].date_updated).toBeGreaterThan(
    myjobs.jobs[0].date_updated,
  );
});

test("should update job timestamp when updating skills", async () => {
  const timestamp = Date.now();
  const user = await createDummyUser(`timestampTest_${timestamp}`);
  globalThis.testActor.setIdentity(user);

  const jobProfile = await createJob(["react"], { Talent: null });
  await globalThis.testActor.update_job([jobProfile], []);

  const myJobsBefore = await globalThis.testActor.get_my_jobs();
  const jobBefore = myJobsBefore.jobs.find((job) => job.id === jobProfile.id);
  expect(jobBefore).toBeDefined();

  console.log("Before update:");
  console.log("  - Skills:", jobBefore!.skills);
  console.log("  - Timestamp:", jobBefore!.date_updated);

  const initialTimestamp = jobBefore!.date_updated;

  await globalThis.oneHourLater();

  const updateResult = await globalThis.testActor.update_job(
    [
      {
        id: jobProfile.id,
        updates: [{ field: "skills", values: ["react", "vue", "typescript"] }],
        active: [],
        required_match_score: [],
        category: [],
        matches: [],
      },
    ],
    [],
  );

  console.log("Update result:", updateResult);
  expect("Ok" in updateResult).toBe(true);

  const myJobsAfter = await globalThis.testActor.get_my_jobs();
  const jobAfter = myJobsAfter.jobs.find((job) => job.id === jobProfile.id);
  expect(jobAfter).toBeDefined();

  console.log("After update:");
  console.log("  - Skills:", jobAfter!.skills);
  console.log("  - Timestamp:", jobAfter!.date_updated);
  console.log(
    "  - Timestamp changed:",
    jobAfter!.date_updated !== initialTimestamp,
  );

  expect(jobAfter!.skills).toContain("vue");
  expect(jobAfter!.skills).toContain("typescript");
  expect(jobAfter!.skills).toEqual(["react", "vue", "typescript"]);
  expect(jobAfter!.date_updated).toBeGreaterThan(initialTimestamp);
});

test("should update job timestamp when updating other fields", async () => {
  const timestamp = Date.now();
  const user = await createDummyUser(`timestampTest2_${timestamp}`);
  globalThis.testActor.setIdentity(user);

  const jobProfile = await createJob(["react"], { Job: null });
  await globalThis.testActor.update_job([jobProfile], []);

  const myJobsBefore = await globalThis.testActor.get_my_jobs();
  const initialTimestamp = myJobsBefore.jobs[0].date_updated;

  await globalThis.oneHourLater();

  await globalThis.testActor.update_job(
    [
      {
        id: jobProfile.id,
        updates: [],
        active: [false],
        required_match_score: [],
        category: [],
        matches: [],
      },
    ],
    [],
  );

  const myJobsAfter = await globalThis.testActor.get_my_jobs();
  const jobAfter = myJobsAfter.jobs.find((job) => job.id === jobProfile.id);

  console.log("Active field update:");
  console.log("  - Before timestamp:", initialTimestamp);
  console.log("  - After timestamp:", jobAfter!.date_updated);
  console.log("  - Active changed to:", jobAfter!.active);

  expect(jobAfter!.active).toBe(false);
  expect(jobAfter!.date_updated).toBeGreaterThan(initialTimestamp);
});

test("should not update timestamp when no changes made", async () => {
  const timestamp = Date.now();
  const user = await createDummyUser(`noChangeTest_${timestamp}`);
  globalThis.testActor.setIdentity(user);

  const jobProfile = await createJob(["react"], { Talent: null });
  await globalThis.testActor.update_job([jobProfile], []);

  const myJobsBefore = await globalThis.testActor.get_my_jobs();
  const initialTimestamp = myJobsBefore.jobs[0].date_updated;

  await globalThis.oneHourLater();

  await globalThis.testActor.update_job(
    [
      {
        id: jobProfile.id,
        updates: [],
        active: [],
        required_match_score: [],
        category: [],
        matches: [],
      },
    ],
    [],
  );

  const myJobsAfter = await globalThis.testActor.get_my_jobs();
  const jobAfter = myJobsAfter.jobs.find((job) => job.id === jobProfile.id);

  console.log("No changes update:");
  console.log("  - Before timestamp:", initialTimestamp);
  console.log("  - After timestamp:", jobAfter!.date_updated);
  console.log(
    "  - Timestamps equal:",
    jobAfter!.date_updated === initialTimestamp,
  );

  expect(jobAfter!.date_updated).toBe(initialTimestamp);
});
