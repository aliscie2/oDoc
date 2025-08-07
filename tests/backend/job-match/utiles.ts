import { Category, JobUpdate } from "$/declarations/backend/backend.did";
import { createIdentity } from "@dfinity/pic";
import { registerUser } from "../utils";

export async function createDummyUser(id: string) {
  const user = createIdentity(`dummy_${id}_${Date.now()}`);
  await registerUser(`dummy_${id}_${Date.now()}`);
  return user;
}

export async function createJob(
  skills: string[],
  category: Category,
  jobTitle?: string,
): Promise<JobUpdate> {
  return {
    id: `job_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    updates: [
      { field: "skills", values: skills },
      { field: "job_titles", values: [jobTitle || "Test Job"] },
      { field: "description", values: ["Test description"] },
    ],
    active: [true],
    required_match_score: [0.5],
    category: [category],
    matches: [],
  };
}
