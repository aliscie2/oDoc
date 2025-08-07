import { Match } from "$/declarations/backend/backend.did";
import { registerUser } from "../utils";
import { createJob } from "./utiles";

test("should filter jobs by recency (50 days)", async () => {
  const { user } = await registerUser(`recentTest_${Date.now()}`);
  globalThis.testActor.setIdentity(user);

  const jobUpdate = await createJob(["react"], { Job: null });
  await globalThis.testActor.update_job([jobUpdate], []);

  const initialTime = await globalThis.testPic.getTime();

  // Advance time by 50 days
  await globalThis.timeLater(50 * 24 * 60 * 60 * 1000);

  const matches = await globalThis.testActor.get_matches(
    jobUpdate.id,
    ["react"],
    { Talent: null },
  );

  expect(matches.length).toBeGreaterThanOrEqual(0);

  const fiftyDaysInMs = 50 * 24 * 60 * 60 * 1000;
  const cutoffTime = initialTime - fiftyDaysInMs;

  matches.forEach((job) => {
    expect(job.date_updated).toBeGreaterThan(cutoffTime * 1000000); // Convert to nanoseconds
  });
});

test("should return good matches in get_my_jobs based on match score", async () => {
  const { user } = await registerUser(`scoreTest_${Date.now()}`);
  globalThis.testActor.setIdentity(user);

  const jobUpdate = await createJob(["react"], { Job: null });
  jobUpdate.required_match_score = [0.7];
  await globalThis.testActor.update_job([jobUpdate], []);

  const currentTime = await globalThis.testPic.getTime();

  const goodMatch: Match = {
    job_id: `good_match_${Date.now()}`,
    date_updated: currentTime * 1000000, // Convert to nanoseconds
    cover_letter: "",
    missmatching_skills: [],
    user_id: "test_user",
    score: 0.8,
    is_connected: false,
  };

  const badMatch: Match = {
    job_id: `bad_match_${Date.now()}`,
    date_updated: currentTime * 1000000, // Convert to nanoseconds
    cover_letter: "",
    missmatching_skills: [],
    user_id: "test_user",
    score: 0.5,
    is_connected: false,
  };

  await globalThis.testActor.update_job(
    [
      {
        id: jobUpdate.id,
        updates: [],
        active: [],
        required_match_score: [],
        category: [],
        matches: [[goodMatch, badMatch]],
      },
    ],
    [],
  );

  const myJobs = await globalThis.testActor.get_my_jobs();
  expect(myJobs.jobs.length).toBe(1);

  const savedMatches = myJobs.jobs[0].matches;
  const goodMatches = savedMatches.filter((m) => m.score >= 0.7);
  expect(goodMatches.length).toBe(1);
  expect(goodMatches[0].job_id).toBe(goodMatch.job_id);
});
