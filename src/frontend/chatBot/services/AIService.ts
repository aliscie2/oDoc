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

    // bad response example,
    // DO NOT DEETE THIS LINES
    // const aiResponse = {
    //   Ok: {
    //     remaining_credits: 0.8,
    //     response:
    //       '```json {   "type": "JOB",   "required_match_score": 0.6,   "feedback": "📝 Dummy data has been added to the talent profile.      * 📧 Email: dummy@example.com     * 💼 Job title: Software Developer     * 📚 Skills: Python, Java, JavaScript     * 📚 Education: Bachelor\'s degree in Computer Science     * 📈 Experience: 5 years of experience in software development     * 💸 Hourly rate: $50     * 🌍 Timezone: UTC-5, flexible with other timezones",   "updates": [     {       "field": "job_titles",       "values": ["Software Developer"]     },     {       "field": "skills",       "values": ["Python", "Java", "JavaScript"]     },     {       "field": "education",       "values": ["Bachelor\'s degree in Computer Science"]     },     {       "field": "experience",       "values": ["5 years of experience in software development"]     },     {       "field": "emails",       "values": ["dummy@example.com"]     },     {       "field": "description",       "values": ["Software Developer with 5 years of experience in software development. Proficient in Python, Java, and JavaScript."]     },     {       "field": "proficiency_level",       "values": ["Advanced"]     },     {       "field": "certifications",       "values": ["Certified Scrum Master"]     },     {       "field": "links",       "values": ["https://www.linkedin.com/in/dummy/"]     }   ],   "category": "Talent",   "profile_completion": 0.8 } ```',
    //   },
    // };
    console.log("AI Response:", { aiResponse });

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
