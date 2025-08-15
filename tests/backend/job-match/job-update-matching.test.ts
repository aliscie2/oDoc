import { JobUpdate, Match } from "$/declarations/backend/backend.did.js";
import { createDummyUser, createJob } from "./utiles";

describe("Update Matching Logic", () => {
  test("should return updated job when job creator updates one of multiple jobs", async () => {
    const timestamp = Date.now();
    const jobCreator = await createDummyUser(`jobCreator_${timestamp}`);
    const talentUser = await createDummyUser(`talentUser_${timestamp}`);

    // Step 1: Login as job creator and add 2 jobs
    globalThis.testActor.setIdentity(jobCreator);

    const job1Update = await createJob(
      ["react", "javascript"],
      { Job: null },
      "Frontend Developer",
    );
    await globalThis.testActor.update_job([job1Update], []);

    const job2Update = await createJob(
      ["react", "typescript"],
      { Job: null },
      "React Developer",
    );
    await globalThis.testActor.update_job([job2Update], []);

    // Step 2: Login as another user (talent) and add talent profile
    globalThis.testActor.setIdentity(talentUser);
    const talentUpdate = await createJob(
      ["react", "node"],
      { Talent: null },
      "Full Stack Developer",
    );
    await globalThis.testActor.update_job([talentUpdate], []);

    // Step 3: Get matches of 2 jobs (talent should see both jobs)
    const job1Matches = await globalThis.testActor.get_matches(
      job1Update.id,
      ["react", "javascript"],
      { Job: null },
    );
    console.log({job1Matches,talentUpdate})

    const job2Matches = await globalThis.testActor.get_matches(
      job2Update.id,
      ["react", "typescript"],
      { Job: null },
    );

    // Both jobs should match the talent (they all have "react" skill)
    expect(job1Matches.length).toBeGreaterThanOrEqual(1);
    expect(job2Matches.length).toBeGreaterThanOrEqual(1);

    // Verify the talent appears in both job matches
    const talentInJob1 = job1Matches.find((job) => job.id === talentUpdate.id);
    const talentInJob2 = job2Matches.find((job) => job.id === talentUpdate.id);
    expect(talentInJob1).toBeDefined();
    expect(talentInJob2).toBeDefined();

    // Step 4: Save matches via update_job for both jobs
    const savedMatchesJob1: Match[] = [
      {
        job_id: talentUpdate.id,
        score: 0.8,
        user_id: talentUser.getPrincipal().toString(),
        missmatching_skills: ["javascript"],
        date_updated: Date.now() * 1000000,
        is_connected: false,
        cover_letter: "Interested in frontend role",
      },
    ];

    const savedMatchesJob2: Match[] = [
      {
        job_id: talentUpdate.id,
        score: 0.7,
        user_id: talentUser.getPrincipal().toString(),
        missmatching_skills: ["typescript"],
        date_updated: Date.now() * 1000000,
        is_connected: false,
        cover_letter: "Interested in React role",
      },
    ];

    // Save matches for both jobs
    await globalThis.testActor.update_job(
      [
        {
          id: job1Update.id,
          updates: [],
          active: [],
          required_match_score: [],
          category: [],
          matches: [savedMatchesJob1],
        },
      ],
      [],
    );

    await globalThis.testActor.update_job(
      [
        {
          id: job2Update.id,
          updates: [],
          active: [],
          required_match_score: [],
          category: [],
          matches: [savedMatchesJob2],
        },
      ],
      [],
    );

    // Step 5: Get_matches should return empty list for both jobs
    const job1MatchesAfterSave = await globalThis.testActor.get_matches(
      job1Update.id,
      ["react", "javascript"],
      { Job: null },
    );

    const job2MatchesAfterSave = await globalThis.testActor.get_matches(
      job2Update.id,
      ["react", "typescript"],
      { Job: null },
    );

    expect(job1MatchesAfterSave.length).toBe(0);
    expect(job2MatchesAfterSave.length).toBe(0);

    // Step 6: Login as first user (job creator) and update one of the jobs
    globalThis.testActor.setIdentity(jobCreator);

    // Wait a bit to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 100));

    const job1UpdateNew: JobUpdate = {
      id: job1Update.id,
      updates: [
        { field: "skills", values: ["react", "javascript", "vue"] },
        {
          field: "description",
          values: ["Updated frontend position with Vue.js"],
        },
      ],
      active: [],
      required_match_score: [],
      category: [],
      matches: [],
    };

    await globalThis.testActor.update_job([job1UpdateNew], []);

    // Step 7: Login back as talent user
    globalThis.testActor.setIdentity(talentUser);

    // Step 8: Get_matches should return a list of one item (the updated job)
    const job1MatchesAfterUpdate = await globalThis.testActor.get_matches(
      job1Update.id,
      ["react", "javascript", "vue"],
      { Job: null },
    );

    const job2MatchesAfterUpdate = await globalThis.testActor.get_matches(
      job2Update.id,
      ["react", "typescript"],
      { Job: null },
    );

    // Job1 should return the updated job (talent should see it again)
    expect(job1MatchesAfterUpdate.length).toBe(1);
    expect(job1MatchesAfterUpdate[0].id).toBe(talentUpdate.id);

    // Job2 should still return empty (wasn't updated)
    expect(job2MatchesAfterUpdate.length).toBe(0);

    // Verify the job has the updated information
    const updatedJob = await globalThis.testActor.get_job(job1Update.id);
    expect(updatedJob).toBeDefined();
    expect(updatedJob![0]?.skills).toContain("vue");
    expect(updatedJob![0]?.description).toBe(
      "Updated frontend position with Vue.js",
    );
  });

  test("should return updated talent when talent updates profile", async () => {
    const timestamp = Date.now();
    const jobCreator = await createDummyUser(`jobCreator2_${timestamp}`);
    const talentUser1 = await createDummyUser(`talent1_${timestamp}`);
    const talentUser2 = await createDummyUser(`talent2_${timestamp}`);

    // Create two talents
    globalThis.testActor.setIdentity(talentUser1);
    const talent1Update = await createJob(["react", "javascript"], {
      Talent: null,
    });
    await globalThis.testActor.update_job([talent1Update], []);

    globalThis.testActor.setIdentity(talentUser2);
    const talent2Update = await createJob(["react", "typescript"], {
      Talent: null,
    });
    await globalThis.testActor.update_job([talent2Update], []);

    // Create job
    globalThis.testActor.setIdentity(jobCreator);
    const jobUpdate = await createJob(["react"], { Job: null });
    await globalThis.testActor.update_job([jobUpdate], []);

    // Get initial matches - should return both talents
    const initialMatches = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react"],
      { Talent: null },
    );

    expect(initialMatches.length).toBeGreaterThanOrEqual(2);

    const matchingTalentIds = initialMatches.map((job) => job.id);
    expect(matchingTalentIds).toContain(talent1Update.id);
    expect(matchingTalentIds).toContain(talent2Update.id);

    // Save the matches
    const savedMatches: Match[] = initialMatches.map((job) => ({
      job_id: job.id,
      score: 0.8,
      user_id: job.user_id,
      missmatching_skills: [],
      date_updated: Date.now() * 1000000,
      is_connected: false,
      cover_letter: "",
    }));

    await globalThis.testActor.update_job(
      [
        {
          id: jobUpdate.id,
          updates: [],
          active: [],
          required_match_score: [],
          category: [],
          matches: [savedMatches],
        },
      ],
      [],
    );

    // Get matches again - should return empty list
    const matchesAfterSaving = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react"],
      { Talent: null },
    );

    expect(matchesAfterSaving.length).toBe(0);

    // Update one of the talents
    globalThis.testActor.setIdentity(talentUser1);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const talent1UpdateNew: JobUpdate = {
      id: talent1Update.id,
      updates: [{ field: "skills", values: ["react", "javascript", "node"] }],
      active: [],
      required_match_score: [],
      category: [],
      matches: [],
    };

    await globalThis.testActor.update_job([talent1UpdateNew], []);

    // Get matches again - should return the updated talent
    globalThis.testActor.setIdentity(jobCreator);
    const matchesAfterUpdate = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react"],
      { Talent: null },
    );

    expect(matchesAfterUpdate.length).toBe(1);
    expect(matchesAfterUpdate[0].id).toBe(talent1Update.id);
    expect(matchesAfterUpdate[0].skills).toContain("node");
  });

  test("should track date_updated correctly for both jobs and talents", async () => {
    const timestamp = Date.now();
    const jobCreator = await createDummyUser(`jobCreator3_${timestamp}`);
    const talentUser = await createDummyUser(`talent_${timestamp}`);

    // Create talent and job
    globalThis.testActor.setIdentity(talentUser);
    const talentUpdate = await createJob(["react"], { Talent: null });
    await globalThis.testActor.update_job([talentUpdate], []);

    // Get initial talent date_updated
    const initialTalent = await globalThis.testActor.get_job(talentUpdate.id);
    const initialTalentDateUpdated = initialTalent![0]?.date_updated;

    globalThis.testActor.setIdentity(jobCreator);
    const jobUpdate = await createJob(["react"], { Job: null });
    await globalThis.testActor.update_job([jobUpdate], []);

    // Get initial job date_updated
    const initialJob = await globalThis.testActor.get_job(jobUpdate.id);
    const initialJobDateUpdated = initialJob![0]?.date_updated;

    // Get and save initial matches
    const initialMatches = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react"],
      { Talent: null },
    );

    expect(initialMatches.length).toBeGreaterThanOrEqual(1);

    const savedMatches: Match[] = [
      {
        job_id: talentUpdate.id,
        score: 0.7,
        user_id: talentUser.getPrincipal().toString(),
        missmatching_skills: [],
        date_updated: Date.now() * 1000000,
        is_connected: false,
        cover_letter: "",
      },
    ];

    await globalThis.testActor.update_job(
      [
        {
          id: jobUpdate.id,
          updates: [],
          active: [],
          required_match_score: [],
          category: [],
          matches: [savedMatches],
        },
      ],
      [],
    );

    // Verify no matches returned after saving
    const noMatches = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react"],
      { Talent: null },
    );
    expect(noMatches.length).toBe(0);

    // Test talent update
    await new Promise((resolve) => setTimeout(resolve, 100));
    globalThis.testActor.setIdentity(talentUser);

    await globalThis.testActor.update_job(
      [
        {
          id: talentUpdate.id,
          updates: [
            { field: "description", values: ["Updated talent description"] },
          ],
          active: [],
          required_match_score: [],
          category: [],
          matches: [],
        },
      ],
      [],
    );

    // Verify talent date_updated changed
    const updatedTalent = await globalThis.testActor.get_job(talentUpdate.id);
    const newTalentDateUpdated = updatedTalent![0]?.date_updated;
    expect(newTalentDateUpdated).toBeGreaterThan(initialTalentDateUpdated!);

    // Should return the talent as a match again
    globalThis.testActor.setIdentity(jobCreator);
    const matchesAfterTalentUpdate = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react"],
      { Talent: null },
    );

    expect(matchesAfterTalentUpdate.length).toBe(1);
    expect(matchesAfterTalentUpdate[0].description).toBe(
      "Updated talent description",
    );

    // Save matches again and test job update
    await globalThis.testActor.update_job(
      [
        {
          id: jobUpdate.id,
          updates: [],
          active: [],
          required_match_score: [],
          category: [],
          matches: [savedMatches],
        },
      ],
      [],
    );

    // Update job
    await new Promise((resolve) => setTimeout(resolve, 100));
    await globalThis.testActor.update_job(
      [
        {
          id: jobUpdate.id,
          updates: [
            { field: "description", values: ["Updated job description"] },
          ],
          active: [],
          required_match_score: [],
          category: [],
          matches: [],
        },
      ],
      [],
    );

    // Verify job date_updated changed
    const updatedJob = await globalThis.testActor.get_job(jobUpdate.id);
    const newJobDateUpdated = updatedJob![0]?.date_updated;
    expect(newJobDateUpdated).toBeGreaterThan(initialJobDateUpdated!);

    // Talent should see the updated job
    globalThis.testActor.setIdentity(talentUser);
    const finalMatches = await globalThis.testActor.get_matches(
      jobUpdate.id,
      ["react"],
      { Job: null },
    );
    expect(finalMatches.length).toBe(1);
    expect(finalMatches[0].id).toBe(talentUpdate.id);
  });
});
