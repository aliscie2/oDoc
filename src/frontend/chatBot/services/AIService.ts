import ask_ai from "@/utils/askAIAgent";
import { textToJson } from "../../pages/jobs/utils/processResponseJobs";
import ResponseGuard from "../utils/responseGuard";

// AI Message Service Types
interface AIMessageConfig {
  prompt: string;
  classify: boolean;
  promptType: string;
  skipCreditUpdate?: boolean;
  credits: number;
}

interface AIMessageResult<T = any> {
  response: string;
  parsedData: T;
  remainingCredits: number;
}
export const JSON_PROMPT =
  "Analyze the user's request and provide a pure and only json. ";
export class AIService {
  constructor(
    private backendActor: any,
    private dispatch: any,
  ) {}

  async sendAIMessage<T = unknown>(
    config: AIMessageConfig,
    abortSignal?: AbortSignal,
  ): Promise<AIMessageResult<T>> {
    const aiResponse = await ask_ai(
      config.prompt,
      JSON_PROMPT + config.promptType,
      config.classify, // classify=true means quick=true (for classification)
      import.meta.env.VITE_GROQ_API_KEY,
      config.credits,
    );

    if (!aiResponse || "Err" in aiResponse) {
      throw new Error(
        aiResponse && "Err" in aiResponse
          ? aiResponse.Err
          : "AI returned no response",
      );
    }

    const response = aiResponse.Ok.response;
    const remainingCredits = aiResponse.Ok.remaining_credits;

    let processedResponse = response;
    if (!config.classify) {
      const guardResult = ResponseGuard.guard(response);
      processedResponse = guardResult.isValid
        ? guardResult.repairedResponse
        : guardResult.originalResponse;

      if (!guardResult.isValid && response.toLowerCase().includes("calendar")) {
        processedResponse = ResponseGuard.generateFallbackResponse(
          config.prompt,
        );
      }
    }

    const parsedResult = textToJson(processedResponse);

    if (!config.skipCreditUpdate) {
      this.dispatch({
        type: "UPDATE_AI_CREDITS",
        remainingCredits,
      });
    }

    return {
      response: processedResponse,
      parsedData: parsedResult.extractedData as T,
      remainingCredits,
    };
  }

  async sendAIMessages<T = unknown>(
    configs: AIMessageConfig[],
    abortSignal?: AbortSignal,
  ): Promise<AIMessageResult<T>[]> {
    const results: AIMessageResult<T>[] = [];

    for (const config of configs) {
      const result = await this.sendAIMessage(
        {
          ...config,
          skipCreditUpdate: true,
        },
        abortSignal,
      );
      results.push(result);
    }

    // Single credit update at the end with the last response's credits
    if (results.length > 0) {
      this.dispatch({
        type: "UPDATE_AI_CREDITS",
        remainingCredits: results[results.length - 1].remainingCredits,
      });
    }

    return results;
  }

  createAIConfig(
    prompt: string,
    promptType: string,
    classify: boolean = false,
    skipCreditUpdate: boolean = false,
    credits: number,
  ): AIMessageConfig {
    return { prompt, classify, promptType, skipCreditUpdate, credits };
  }
}
