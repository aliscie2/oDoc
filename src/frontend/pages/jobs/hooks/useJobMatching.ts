import { Category, Job, Match } from "$/declarations/backend/backend.did";
import { backendActor } from "@/utils/backendUtils";
import { RootState } from "@/redux/reducers";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  compressJobForMatching,
  compressJobsForMatching,
  JOB_MATCHING_PROMPT,
} from "../utils/jobMatchingPrompt";
import { mockJobMatchResponse } from "../../../chatBot/mocks/mockJobMatches";
import { textToJson } from "../utils/processResponseJobs";
import ask_ai from "@/utils/askAIAgent";

interface AIMatchResponse {
  candidate_id: string;
  score: number;
  missmatching_skills: string[];
  cover_letter: string;
}

export const useJobMatching = (currentJob: Job | null) => {
  // Using direct backendActor import
  const { credits } = useSelector((state: RootState) => state.AIState);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processedJobIdsRef = useRef(new Set<string>());

  const getLookingForCategory = (job: Job) : Category => {
    const categoryKey = Object.keys(job?.category || {})[0].toLocaleLowerCase();
    console.log({categoryKey})
    return categoryKey === "job" ? { Talent: null } : { Job: null };
  };

  const processAIMatches = useCallback(
    (aiMatches: AIMatchResponse[], candidateJobs: Job[]): Match[] => {
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
    if (!currentJob || !backendActor || credits <= 0) return;

    setLoading(true);
    setError(null);

    try {
      dispatch({ type: "IS_LOOKING_NEW_MATCHES", stage: 0 });
      const candidateJobs = await backendActor.get_matches(
        currentJob.id,
        (currentJob.skills || []).map((skill) => skill.toLowerCase()),
        getLookingForCategory(currentJob),
      );
      dispatch({ type: "IS_LOOKING_NEW_MATCHES", stage: 1 });

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

        processedMatches = processAIMatches(aiMatchResponses, candidateJobs);
      } else {
        const compressedCandidates = compressJobsForMatching(candidateJobs);
        const compressedCurrentJob = compressJobForMatching(currentJob);
        const { id: _id, ...jobWithoutId } = compressedCurrentJob;

        console.log({
          x: `candidates: ${JSON.stringify(compressedCandidates)}, Current: ${JSON.stringify(jobWithoutId)}`,
          y: JOB_MATCHING_PROMPT,
          z: false, // quick parameter
        });

        const aiResponse = await ask_ai(
          `candidates: ${JSON.stringify(compressedCandidates)}, Current: ${JSON.stringify(jobWithoutId)}`,
          JOB_MATCHING_PROMPT,
          false, // quick parameter
          import.meta.env.VITE_GROQ_API_KEY,
          credits,
        );

        if (!aiResponse || "Err" in aiResponse) {
          throw new Error(
            aiResponse && "Err" in aiResponse
              ? String(aiResponse.Err)
              : "AI returned no response",
          );
        }

        const responseText = "Ok" in aiResponse ? aiResponse.Ok.response : "";
        const remainingCredits = "Ok" in aiResponse ? aiResponse.Ok.remaining_credits : 0;

        // Update credits after AI call
        dispatch({
          type: "UPDATE_AI_CREDITS",
          remainingCredits,
        });

        const parsed = textToJson(responseText)?.extractedData;
        processedMatches = processAIMatches(
          parsed?.matches || [],
          candidateJobs,
        );
      }
      dispatch({ type: "IS_LOOKING_NEW_MATCHES", stage: 2 });

      dispatch({
        type: "UPDATE_MATCHING_JOBS",
        matchingJobs: candidateJobs,
        matches: processedMatches,
      });

      if (processedMatches.length > 0) {
        const jobUpdate = {
          id: currentJob.id,
          updates: [],
          active: [] as [] | [boolean],
          required_match_score: [],
          category: [],
          matches: processedMatches.length > 0 ? [processedMatches] : [],
        };
        const saveResult = await backendActor.update_job(
          [jobUpdate],
          [credits],
        );
        if (saveResult && "Err" in saveResult) {
          console.error("Failed to auto-save matches:", saveResult.Err);
        } else {
          console.log("Debug: Successfully saved matches to backend");
        }
      }
    } catch (err) {
      console.error("Error finding matches:", err);
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [currentJob?.id, backendActor, processAIMatches, dispatch, credits]);

  useEffect(() => {
    const processedJobIds = processedJobIdsRef.current;

    if (
      currentJob?.id &&
      credits > 0 &&
      !processedJobIds.has(currentJob.id) &&
      (!currentJob.matches || currentJob.matches.length === 0) // Only run if no matches exist
    ) {
      processedJobIds.add(currentJob.id);
      findMatches();
    }
  }, [currentJob?.id, currentJob?.matches?.length, credits, findMatches]);

  return { loading, error, findMatches };
};
