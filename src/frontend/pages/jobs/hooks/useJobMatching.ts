import { Job, Match } from "$/declarations/backend/backend.did";
import { backendActor } from "@/utils/backendUtils";
import { RootState } from "@/redux/reducers";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  compressJobForMatching,
  compressJobsForMatching,
  JOB_MATCHING_PROMPT,
} from "../utils/jobMatchingPrompt";
import { textToJson } from "../utils/processResponseJobs";
import ask_ai from "@/utils/askAIAgent";
import { JSON_PROMPT } from "@/chatBot/services/AIService";

interface AIMatchResponse {
  candidate_id: string;
  score: number;
  missmatching_skills: string[];
  cover_letter: string;
}

const getMatchingHash = (job: Job | null): string => {
  if (!job) return "";
  return JSON.stringify({
    id: job.id,
    skills: job.skills?.slice().sort(),
    category: Object.keys(job.category || {})[0],
    required_match_score: job.required_match_score, // ✅ ADD THIS
  });
};
export const useJobMatching = (currentJob: Job | null) => {
  const { credits } = useSelector((state: RootState) => state.AIState);
  const { isChanged } = useSelector((state: RootState) => state.jobState);
  const previousIsChangedRef = useRef<boolean>(false);

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastProcessedHashRef = useRef<string>("");
  const isProcessingRef = useRef(false);

  const getLookingForCategory = (job: Job) => {
    const categoryKey = Object.keys(job?.category || {})[0];
    return categoryKey === "Job" ? { Talent: null } : { Job: null };
  };

  const processAIMatches = useCallback(
    (aiMatches: AIMatchResponse[], candidateJobs: Job[]): Match[] => {
      const jobIds = new Set(candidateJobs.map((j) => j.id));
      const uniqueMatches = new Map<string, Match>();

      aiMatches.forEach(
        ({ candidate_id, score, missmatching_skills, cover_letter }) => {
          if (!candidate_id || !jobIds.has(candidate_id)) return;

          const match: Match = {
            job_id: candidate_id,
            score: Math.max(0, Math.min(1, score)),
            missmatching_skills: missmatching_skills || [],
            date_updated: Number(Date.now() * 1e6),
            is_connected: false,
            user_id: "",
            cover_letter: cover_letter || "",
          };

          const existing = uniqueMatches.get(candidate_id);
          if (!existing || match.score > existing.score) {
            uniqueMatches.set(candidate_id, match);
          }
        },
      );

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
        (currentJob.skills || []).map((s) => s.toLowerCase()),
        getLookingForCategory(currentJob),
      );
      console.log({ candidateJobs });

      dispatch({ type: "IS_LOOKING_NEW_MATCHES", stage: 1 });

      if (!Array.isArray(candidateJobs) || candidateJobs.length === 0) {
        setLoading(false);
        return;
      }

      const compressedCandidates = compressJobsForMatching(candidateJobs);
      const { id: _id, ...jobWithoutId } = compressJobForMatching(currentJob);

      const aiJobMatchResponse = await ask_ai(
        `candidates: ${JSON.stringify(compressedCandidates)}, Current: ${JSON.stringify(jobWithoutId)}`,
        JSON_PROMPT + JOB_MATCHING_PROMPT,
        false,
        import.meta.env.VITE_GROQ_API_KEY,
        credits,
      );
      console.log({ aiJobMatchResponse });

      if (!aiJobMatchResponse || "Err" in aiJobMatchResponse) {
        throw new Error(aiJobMatchResponse?.Err || "AI no response");
      }

      dispatch({
        type: "UPDATE_AI_CREDITS",
        remainingCredits: aiJobMatchResponse.Ok.remaining_credits,
      });

      const parsed = textToJson(aiJobMatchResponse.Ok.response)?.extractedData;
      if (!parsed?.matches) throw new Error("Invalid AI response");

      const processedMatches = processAIMatches(parsed.matches, candidateJobs);

      dispatch({ type: "IS_LOOKING_NEW_MATCHES", stage: 2 });

      dispatch({
        type: "UPDATE_MATCHING_JOBS",
        matchingJobs: candidateJobs,
        matches: processedMatches,
      });

      console.log({ processedMatches });

      const res = await backendActor.update_matches(
        {
          current_job_id: currentJob.id,
          delete_matches: [],
          updates: [],
          add: processedMatches,
          reset: [],
        },
        [credits],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, [currentJob, backendActor, processAIMatches, dispatch, credits]);

  useEffect(() => {
    if (!currentJob?.id || credits <= 0 || isProcessingRef.current) return;

    const currentHash = getMatchingHash(currentJob);
    const hasChanged = currentHash !== lastProcessedHashRef.current;
    const hasNoMatches = !currentJob.matches || currentJob.matches.length === 0;

    // Trigger re-match if: job content changed OR score changed OR no matches
    if (hasNoMatches || hasChanged) {
      lastProcessedHashRef.current = currentHash;
      isProcessingRef.current = true;
      findMatches();
    }
  }, [
    currentJob?.id,
    currentJob?.skills,
    currentJob?.category,
    currentJob?.job_titles,
    currentJob?.description,
    currentJob?.matches?.length,
    currentJob?.required_match_score,
    credits,
    findMatches,
  ]);

  useEffect(() => {
    if (!currentJob?.id) return;

    // Detect transition: isChanged was true, now false
    const wasChanged = previousIsChangedRef.current;
    const nowChanged = isChanged;
    const newChangesSaved = wasChanged && !nowChanged;

    if (newChangesSaved) {
      console.log("🔄 Changes saved - revoking matches for refresh");
      lastProcessedHashRef.current = ""; // Reset hash to trigger re-fetch
      findMatches();
    }

    previousIsChangedRef.current = nowChanged;
  }, [isChanged, currentJob?.id, findMatches]);

  return { loading, error, findMatches };
};
