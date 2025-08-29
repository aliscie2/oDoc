import { textToJson } from "../../pages/jobs/utils/processResponseJobs";

// AI Message Service Types
interface AIMessageConfig {
  prompt: string;
  classify: boolean;
  promptType: string;
  skipCreditUpdate?: boolean;
}

interface AIMessageResult<T = any> {
  response: string;
  parsedData: T;
  remainingCredits: number;
}
const JSON_PROMPT =
  "Analyze the user's request and provide a pure and only json. ";
export class AIService {
  constructor(
    private backendActor: any,
    private dispatch: any,
  ) {}

  async sendAIMessage<T = any>(
    config: AIMessageConfig,
    abortSignal?: AbortSignal,
  ): Promise<AIMessageResult<T>> {
    const aiResponse = await this.backendActor.ask_ai(
      config.prompt,
      JSON_PROMPT + config.promptType,
      config.classify, // classify=true means quick=true (for classification)
      import.meta.env.VITE_ANTHROPIC_API_KEY,
    );
    console.log("AI Response: ", aiResponse);

    if (!aiResponse || "Err" in aiResponse) {
      throw new Error(
        aiResponse && "Err" in aiResponse
          ? aiResponse.Err
          : "AI returned no response",
      );
    }

    const response = aiResponse.Ok.response;
    const remainingCredits = aiResponse.Ok.remaining_credits;

    if (!config.skipCreditUpdate) {
      this.dispatch({
        type: "UPDATE_AI_CREDITS",
        remainingCredits,
      });
    }

    return {
      response,
      parsedData: textToJson(response).extractedData as T,
      remainingCredits,
    };
  }

  async sendAIMessages<T = any>(
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
  ): AIMessageConfig {
    return { prompt, classify, promptType, skipCreditUpdate };
  }
}
