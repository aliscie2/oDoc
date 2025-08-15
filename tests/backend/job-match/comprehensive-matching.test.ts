import { JobUpdate, Match } from "$/declarations/backend/backend.did.js";
import { createDummyUser, createJob } from "./utiles";

describe("Comprehensive Job Matching System", () => {
  describe("Core Matching Workflow", () => {
    test("should complete full matching cycle: create → match → save → empty → update → match again", async () => {
      const timestamp = Date.now();
      const jobCreator = await createDummyUser(`jobCreator_${timestamp}`);
      const talentUser = await createDummyUser(`talentUser_${timestamp}`);

      // Step 1: Create job and talent with matching skills
      globalThis.testActor.setIdentity(jobCreator);
      const jobUpdate = await createJob(["react", "typescript"], { Job: null }, "Frontend Developer");
      await globalThis.testActor.update_job([jobUpdate], []);

      globalThis.testActor.setIdentity(talentUser);
      const talentUpdate = await createJob(["react", "javascript"], { Talent: null }, "React Developer");
      await globalThis.testActor.update_job([talentUpdate], []);

      // Step 2: Get initial matches - should find the talent
      globalThis.testActor.setIdentity(jobCreator);
      const initialMatches = await globalThis.testActor.get_matches(
        jobUpdate.id,
        ["react", "typescript"],
        { Talent: null }
      );

      expect(initialMatches.length).toBeGreaterThanOrEqual(1);
      const foundTalent = initialMatches.find(job => job.id === talentUpdate.id);
      expect(foundTalent).toBeDefined();

      // Step 3: Save matches (simulating frontend AI processing)
      const processedMatches: Match[] = [{
        job_id: talentUpdate.id,
        score: 0.75, // Frontend calculated score
        user_id: talentUser.getPrincipal().toString(),
        missmatching_skills: ["typescript"],
        date_updated: Date.now() * 1000000,
        is_connected: false,
        cover_letter: "Interested in this role",
      }];

      await globalThis.testActor.update_job([{
        id: jobUpdate.id,
        updates: [],
        active: [],
        required_match_score: [],
        category: [],
        matches: [processedMatches],
      }], []);

      // Step 4: Get matches again - should be empty (already processed)
      const emptyMatches = await globalThis.testActor.get_matches(
        jobUpdate.id,
        ["react", "typescript"],
        { Talent: null }
      );
      expect(emptyMatches.length).toBe(0);

      // Step 5: Talent updates their profile
      globalThis.testActor.setIdentity(talentUser);
      await new Promise(resolve => setTimeout(resolve, 100)); // Ensure different timestamp

      const talentUpdateNew: JobUpdate = {
        id: talentUpdate.id,
        updates: [
          { field: "skills", values: ["react", "javascript", "node"] },
          { field: "description", values: ["Updated: Full-stack developer"] }
        ],
        active: [],
        required_match_score: [],
        category: [],
        matches: [],
      };

      await globalThis.testActor.update_job([talentUpdateNew], []);

      // Step 6: Get matches again - should see updated talent
      globalThis.testActor.setIdentity(jobCreator);
      const updatedMatches = await globalThis.testActor.get_matches(
        jobUpdate.id,
        ["react", "typescript"],
        { Talent: null }
      );

      expect(updatedMatches.length).toBe(1);
      expect(updatedMatches[0].id).toBe(talentUpdate.id);
      expect(updatedMatches[0].skills).toContain("node");
      expect(updatedMatches[0].description).toBe("Updated: Full-stack developer");

      // Step 7: Save updated matches
      const newProcessedMatches: Match[] = [{
        job_id: talentUpdate.id,
        score: 0.85, // New frontend calculated score
        user_id: talentUser.getPrincipal().toString(),
        missmatching_skills: ["typescript"],
        date_updated: Date.now() * 1000000,
        is_connected: false,
        cover_letter: "Even more interested now!",
      }];

      await globalThis.testActor.update_job([{
        id: jobUpdate.id,
        updates: [],
        active: [],
        required_match_score: [],
        category: [],
        matches: [newProcessedMatches],
      }], []);

      // Step 8: Get matches final time - should be empty again
      const finalMatches = await globalThis.testActor.get_matches(
        jobUpdate.id,
        ["react", "typescript"],
        { Talent: null }
      );
      expect(finalMatches.length).toBe(0);
    });

    test("should handle bidirectional matching (job ↔ talent)", async () => {
      const timestamp = Date.now();
      const jobCreator = await createDummyUser(`jobCreator_${timestamp}`);
      const talentUser = await createDummyUser(`talentUser_${timestamp}`);

      // Create job and talent
      globalThis.testActor.setIdentity(jobCreator);
      const jobUpdate = await createJob(["react"], { Job: null });
      await globalThis.testActor.update_job([jobUpdate], []);

      globalThis.testActor.setIdentity(talentUser);
      const talentUpdate = await createJob(["react"], { Talent: null });
      await globalThis.testActor.update_job([talentUpdate], []);

      // Job creator finds talent
      globalThis.testActor.setIdentity(jobCreator);
      const jobMatches = await globalThis.testActor.get_matches(
        jobUpdate.id,
        ["react"],
        { Talent: null }
      );
      expect(jobMatches.length).toBeGreaterThanOrEqual(1);

      // Talent user finds job
      globalThis.testActor.setIdentity(talentUser);
      const talentMatches = await globalThis.testActor.get_matches(
        talentUpdate.id,
        ["react"],
        { Job: null }
      );
      expect(talentMatches.length).toBeGreaterThanOrEqual(1);

      // Both should find each other
      expect(jobMatches.some(j => j.id === talentUpdate.id)).toBe(true);
      expect(talentMatches.some(j => j.id === jobUpdate.id)).toBe(true);
    });
  });

  describe("Score Validation", () => {
    test("should reject required_match_score outside 0.0-1.0 range", async () => {
      const user = await createDummyUser(`scoreTest_${Date.now()}`);
      globalThis.testActor.setIdentity(user);

      const jobUpdate = await createJob(["react"], { Job: null });

      // Test invalid scores
      const invalidScores = [-0.1, 1.1, 2.0, -1.0];
      
      for (const score of invalidScores) {
        const result = await globalThis.testActor.update_job([{
          id: jobUpdate.id,
          updates: [],
          active: [],
          required_match_score: [score],
          category: [],
          matches: [],
        }], []);

        expect("Err" in result).toBe(true);
        if ("Err" in result) {
          expect(result.Err).toBe("Required match score must be between 0.0 and 1.0");
        }
      }
    });

    test("should accept valid required_match_score values", async () => {
      const user = await createDummyUser(`scoreValidTest_${Date.now()}`);
      globalThis.testActor.setIdentity(user);

      const jobUpdate = await createJob(["react"], { Job: null });

      const validScores = [0.0, 0.25, 0.5, 0.75, 1.0];
      
      for (const score of validScores) {
        const result = await globalThis.testActor.update_job([{
          id: jobUpdate.id,
          updates: [],
          active: [],
          required_match_score: [score],
          category: [],
          matches: [],
        }], []);

        expect("Ok" in result).toBe(true);

        const job = await globalThis.testActor.get_job(jobUpdate.id);
        expect(job![0]?.required_match_score).toBe(score);
      }
    });

    test("should reject match scores outside 0.0-1.0 range", async () => {
      const timestamp = Date.now();
      const jobCreator = await createDummyUser(`jobCreator_${timestamp}`);
      const talentUser = await createDummyUser(`talentUser_${timestamp}`);

      globalThis.testActor.setIdentity(jobCreator);
      const jobUpdate = await createJob(["react"], { Job: null });
      await globalThis.testActor.update_job([jobUpdate], []);

      globalThis.testActor.setIdentity(talentUser);
      const talentUpdate = await createJob(["react"], { Talent: null });
      await globalThis.testActor.update_job([talentUpdate], []);

      globalThis.testActor.setIdentity(jobCreator);

      const invalidScores = [-0.1, 1.1, 2.0, -1.0];
      
      for (const score of invalidScores) {
        const invalidMatches = [{
          job_id: talentUpdate.id,
          score: score,
          user_id: talentUser.getPrincipal().toString(),
          missmatching_skills: [],
          date_updated: Date.now() * 1000000,
          is_connected: false,
          cover_letter: "",
        }];

        const result = await globalThis.testActor.update_job([{
          id: jobUpdate.id,
          updates: [],
          active: [],
          required_match_score: [],
          category: [],
          matches: [invalidMatches],
        }], []);

        expect("Err" in result).toBe(true);
        if ("Err" in result) {
          expect(result.Err).toBe("Match score must be between 0.0 and 1.0");
        }
      }
    });
  });

  describe("get_my_jobs Score Filtering", () => {
    test("should filter matches based on required_match_score", async () => {
      const timestamp = Date.now();
      const jobCreator = await createDummyUser(`jobCreator_${timestamp}`);
      const talentUser1 = await createDummyUser(`talent1_${timestamp}`);
      const talentUser2 = await createDummyUser(`talent2_${timestamp}`);

      // Create job with required score of 0.7
      globalThis.testActor.setIdentity(jobCreator);
      const jobUpdate = await createJob(["react"], { Job: null });
      await globalThis.testActor.update_job([{
        id: jobUpdate.id,
        updates: [],
        active: [],
        required_match_score: [0.7],
        category: [],
        matches: [],
      }], []);

      // Create talents
      globalThis.testActor.setIdentity(talentUser1);
      const talent1Update = await createJob(["react"], { Talent: null });
      await globalThis.testActor.update_job([talent1Update], []);

      globalThis.testActor.setIdentity(talentUser2);
      const talent2Update = await createJob(["react"], { Talent: null });
      await globalThis.testActor.update_job([talent2Update], []);

      // Save matches with different scores
      globalThis.testActor.setIdentity(jobCreator);
      const matches: Match[] = [
        {
          job_id: talent1Update.id,
          score: 0.8, // Above threshold
          user_id: talentUser1.getPrincipal().toString(),
          missmatching_skills: [],
          date_updated: Date.now() * 1000000,
          is_connected: false,
          cover_letter: "",
        },
        {
          job_id: talent2Update.id,
          score: 0.6, // Below threshold
          user_id: talentUser2.getPrincipal().toString(),
          missmatching_skills: [],
          date_updated: Date.now() * 1000000,
          is_connected: false,
          cover_letter: "",
        }
      ];

      await globalThis.testActor.update_job([{
        id: jobUpdate.id,
        updates: [],
        active: [],
        required_match_score: [],
        category: [],
        matches: [matches],
      }], []);

      // get_my_jobs should only return the high-scoring match
      const myJobs = await globalThis.testActor.get_my_jobs();
      expect(myJobs.jobs.length).toBe(1);
      expect(myJobs.matching_jobs.length).toBe(1);
      expect(myJobs.matching_jobs[0].id).toBe(talent1Update.id);
    });

    test("should use default required_match_score of 0.0", async () => {
      const user = await createDummyUser(`defaultTest_${Date.now()}`);
      globalThis.testActor.setIdentity(user);

      const jobUpdate = await createJob(["react"], { Job: null });
      await globalThis.testActor.update_job([jobUpdate], []);

      const job = await globalThis.testActor.get_job(jobUpdate.id);
      expect(job![0]?.required_match_score).toBe(0.0);
    });
  });

  describe("Infinite Loop Prevention", () => {
    test("should not update date_updated when saving matches", async () => {
      const timestamp = Date.now();
      const jobCreator = await createDummyUser(`jobCreator_${timestamp}`);
      const talentUser = await createDummyUser(`talentUser_${timestamp}`);

      globalThis.testActor.setIdentity(jobCreator);
      const jobUpdate = await createJob(["react"], { Job: null });
      await globalThis.testActor.update_job([jobUpdate], []);

      // Get initial date_updated
      const initialJob = await globalThis.testActor.get_job(jobUpdate.id);
      const initialDateUpdated = initialJob![0]?.date_updated;

      globalThis.testActor.setIdentity(talentUser);
      const talentUpdate = await createJob(["react"], { Talent: null });
      await globalThis.testActor.update_job([talentUpdate], []);

      // Save matches
      globalThis.testActor.setIdentity(jobCreator);
      const matches: Match[] = [{
        job_id: talentUpdate.id,
        score: 0.8,
        user_id: talentUser.getPrincipal().toString(),
        missmatching_skills: [],
        date_updated: Date.now() * 1000000,
        is_connected: false,
        cover_letter: "",
      }];

      await globalThis.testActor.update_job([{
        id: jobUpdate.id,
        updates: [], // No field updates
        active: [],
        required_match_score: [],
        category: [],
        matches: [matches],
      }], []);

      // Verify date_updated didn't change
      const finalJob = await globalThis.testActor.get_job(jobUpdate.id);
      const finalDateUpdated = finalJob![0]?.date_updated;
      
      expect(finalDateUpdated).toBe(initialDateUpdated);
    });

    test("should update date_updated only for field changes", async () => {
      const user = await createDummyUser(`fieldUpdateTest_${Date.now()}`);
      globalThis.testActor.setIdentity(user);

      const jobUpdate = await createJob(["react"], { Job: null });
      await globalThis.testActor.update_job([jobUpdate], []);

      const initialJob = await globalThis.testActor.get_job(jobUpdate.id);
      const initialDateUpdated = initialJob![0]?.date_updated;

      await new Promise(resolve => setTimeout(resolve, 100));

      // Update fields (should change date_updated)
      await globalThis.testActor.update_job([{
        id: jobUpdate.id,
        updates: [{ field: "description", values: ["Updated description"] }],
        active: [],
        required_match_score: [],
        category: [],
        matches: [],
      }], []);

      const updatedJob = await globalThis.testActor.get_job(jobUpdate.id);
      const updatedDateUpdated = updatedJob![0]?.date_updated;

      expect(updatedDateUpdated).toBeGreaterThan(initialDateUpdated!);
    });
  });

  describe("Edge Cases", () => {
    test("should handle inactive profiles correctly", async () => {
      const timestamp = Date.now();
      const jobCreator = await createDummyUser(`jobCreator_${timestamp}`);
      const talentUser = await createDummyUser(`talentUser_${timestamp}`);

      globalThis.testActor.setIdentity(talentUser);
      const talentUpdate = await createJob(["react"], { Talent: null });
      await globalThis.testActor.update_job([talentUpdate], []);

      // Deactivate talent
      await globalThis.testActor.update_job([{
        id: talentUpdate.id,
        updates: [],
        active: [false],
        required_match_score: [],
        category: [],
        matches: [],
      }], []);

      globalThis.testActor.setIdentity(jobCreator);
      const jobUpdate = await createJob(["react"], { Job: null });
      await globalThis.testActor.update_job([jobUpdate], []);

      const matches = await globalThis.testActor.get_matches(
        jobUpdate.id,
        ["react"],
        { Talent: null }
      );

      // Should not include inactive talent
      expect(matches.find(j => j.id === talentUpdate.id)).toBeUndefined();
    });

    test("should exclude own profiles from matches", async () => {
      const user = await createDummyUser(`selfTest_${Date.now()}`);
      globalThis.testActor.setIdentity(user);

      const talentUpdate = await createJob(["react"], { Talent: null });
      await globalThis.testActor.update_job([talentUpdate], []);

      const jobUpdate = await createJob(["react"], { Job: null });
      await globalThis.testActor.update_job([jobUpdate], []);

      const matches = await globalThis.testActor.get_matches(
        jobUpdate.id,
        ["react"],
        { Talent: null }
      );

      // Should not include own talent profile
      expect(matches.find(j => j.id === talentUpdate.id)).toBeUndefined();
    });

    test("should require minimum 30% skill overlap", async () => {
      const timestamp = Date.now();
      const jobCreator = await createDummyUser(`jobCreator_${timestamp}`);
      const talentUser = await createDummyUser(`talentUser_${timestamp}`);

      globalThis.testActor.setIdentity(talentUser);
      const talentUpdate = await createJob(
        ["python", "django", "flask", "postgresql"], // Only 1/4 = 25% overlap
        { Talent: null }
      );
      await globalThis.testActor.update_job([talentUpdate], []);

      globalThis.testActor.setIdentity(jobCreator);
      const jobUpdate = await createJob(["react"], { Job: null });
      await globalThis.testActor.update_job([jobUpdate], []);

      const matches = await globalThis.testActor.get_matches(
        jobUpdate.id,
        ["react"],
        { Talent: null }
      );

      // Should not include talent with insufficient overlap
      expect(matches.find(j => j.id === talentUpdate.id)).toBeUndefined();
    });
  });
});