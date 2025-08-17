import { Job, Match } from "$/declarations/backend/backend.did";
import { useBackendContext } from "@/contexts/BackendContext";
import { RootState } from "@/redux/reducers";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  compressJobForMatching,
  compressJobsForMatching,
  JOB_MATCHING_PROMPT,
} from "../utils/jobMatchingPrompt";
import { mockJobMatchResponse } from "../utils/mockJobMatches";
import { textToJson } from "../utils/processResponseJobs";

interface AIMatchResponse {
  candidate_id: string;
  score: number;
  missmatching_skills: string[];
  cover_letter: string;
}

export const useJobMatching = (currentJob: Job | null) => {
  const { backendActor } = useBackendContext();
  const { aiAgent } = useSelector((state: RootState) => state.AIState);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedJobIds] = useState(new Set<string>());

  const getLookingForCategory = (job: Job) => {
    const categoryKey = Object.keys(job?.category || {})[0];
    return categoryKey === "Job" ? { Talent: null } : { Job: null };
  };

  const processAIMatches = useCallback(
    (
      aiMatches: AIMatchResponse[],
      candidateJobs: Job[],
      currentJobId: string,
    ): Match[] => {
      const jobIds = new Set(candidateJobs.map((j) => j.id));
      const uniqueMatches = new Map<string, Match>();

      aiMatches.forEach((aiMatch) => {
        if (aiMatch.candidate_id && jobIds.has(aiMatch.candidate_id)) {
          const match: Match = {
            job_id: aiMatch.candidate_id,
            score: Math.max(0, Math.min(1, aiMatch.score)),
            missmatching_skills: aiMatch.missmatching_skills || [],
            date_updated: Number(Date.now() * 1e6),
            is_connected: false,
            user_id: "",
            cover_letter: aiMatch.cover_letter || "",
          };

          const existing = uniqueMatches.get(aiMatch.candidate_id);
          if (!existing || match.score > existing.score) {
            uniqueMatches.set(aiMatch.candidate_id, match);
          }
        }
      });

      // Return ALL matches, don't filter by score here
      // Backend will handle the filtering when displaying to user
      return Array.from(uniqueMatches.values());
    },
    [],
  );

  const findMatches = useCallback(async () => {
    if (!currentJob || !backendActor || !aiAgent) return;

    setLoading(true);
    setError(null);

    try {
      const candidateJobs = await backendActor.get_matches(
        currentJob.id,
        (currentJob.skills || []).map((skill) => skill.toLowerCase()),
        getLookingForCategory(currentJob),
      );
      console.log({ candidateJobs, currentJob });

      if (!Array.isArray(candidateJobs) || candidateJobs.length === 0) {
        setLoading(false);
        return;
      }

      let processedMatches: Match[];

      if (import.meta.env.VITE_DFX_NETWORK === "local") {
        const mockResponse = mockJobMatchResponse(candidateJobs, currentJob);
        // Convert Match objects to AIMatchResponse format
        const aiMatchResponses = mockResponse.matches.map(
          (match): AIMatchResponse => ({
            candidate_id: match.job_id,
            score: match.score,
            missmatching_skills: match.missmatching_skills,
            cover_letter: match.cover_letter,
          }),
        );

        processedMatches = processAIMatches(
          aiMatchResponses,
          candidateJobs,
          currentJob.id,
        );
      } else {
        const compressedCandidates = compressJobsForMatching(candidateJobs);
        const compressedCurrentJob = compressJobForMatching(currentJob);
        const { id: _id, ...jobWithoutId } = compressedCurrentJob;

        const aiResponse = await aiAgent.sendMessage(
          `candidates: ${JSON.stringify(compressedCandidates)}, Current: ${JSON.stringify(jobWithoutId)}`,
          false,
          JOB_MATCHING_PROMPT,
        );

        if (!aiResponse) throw new Error("AI returned no response");

        const parsed = textToJson(aiResponse)?.extractedData;
        processedMatches = processAIMatches(
          parsed?.matches || [],
          candidateJobs,
          currentJob.id,
        );
      }
      console.log({ candidateJobs, processedMatches });

      dispatch({
        type: "UPDATE_MATCHING_JOBS",
        matchingJobs: candidateJobs,
        matches: processedMatches,
      });

      if (processedMatches.length > 0) {
        const jobUpdate = {
          id: currentJob.id,
          updates: [],
          active: [],
          required_match_score: [],
          category: [],
          matches: [processedMatches],
        };

        const saveResult = await backendActor.update_job([jobUpdate], []);
        if (saveResult?.Err) {
          console.error("Failed to auto-save matches:", saveResult.Err);
        }
      }
    } catch (err) {
      console.error("Error finding matches:", err);
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [currentJob, backendActor, aiAgent, processAIMatches, dispatch]);

  useEffect(() => {
    if (
      currentJob?.id &&
      aiAgent?.remainingCredits() > 0 &&
      !processedJobIds.has(currentJob.id)
    ) {
      processedJobIds.add(currentJob.id);
      findMatches();
    }
  }, [currentJob?.id, aiAgent, findMatches, processedJobIds]);

  return { loading, error, findMatches };
};
