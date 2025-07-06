interface AiMessage {
  role: "user" | "model";
  parts: string[];
}

interface AIUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

// Static data store to prevent Redux state mutations
class AIStaticStore {
  private static instance: AIStaticStore;

  public conversationHistory: AiMessage[] = [];
  public totalInputTokens: number = 0;
  public totalOutputTokens: number = 0;
  public credits: number = 0;
  public isFreeTier: boolean = true;
  public lastAlertTime: number = 0; // Prevent alert spam

  private constructor() {}

  public static getInstance(): AIStaticStore {
    if (!AIStaticStore.instance) {
      AIStaticStore.instance = new AIStaticStore();
    }
    return AIStaticStore.instance;
  }

  public reset(): void {
    this.conversationHistory = [];
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.credits = 0;
    this.isFreeTier = true;
    this.lastAlertTime = 0;
  }
}

export class AIAgent {
  private apiKey: string;
  private static MYSTATICS = AIStaticStore.getInstance();

  // Pricing for different tiers
  private readonly FREE_INPUT_TOKEN_COST = 0.0000375; // Lite model: $0.075 per 1M tokens
  private readonly FREE_OUTPUT_TOKEN_COST = 0.00015; // Lite model: $0.30 per 1M tokens
  private readonly PAID_INPUT_TOKEN_COST = 0.000015; // Pro model: $0.15 per 1M tokens
  private readonly PAID_OUTPUT_TOKEN_COST = 0.0006; // Pro model: $3.50 per 1M tokens (thinking)

  // Cost optimization settings
  private readonly MAX_HISTORY_MESSAGES = 50; // Limit conversation history
  private readonly MAX_HISTORY_TOKENS = 7000; // Token-based limit
  private readonly ENABLE_COMPRESSION = true; // Compress old messages
  private readonly ALERT_COOLDOWN_MS = 3000; // 3 seconds between alerts

  constructor(initialCredits: number = 0, isFreeTier: boolean = true) {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

    // Set credits and tier based on constructor parameters
    AIAgent.MYSTATICS.credits = initialCredits;
    AIAgent.MYSTATICS.isFreeTier = isFreeTier;

    // If credits are provided but isFreeTier is true, auto-switch to paid
    if (initialCredits > 0 && isFreeTier) {
      console.log("Credits provided - automatically switching to paid tier");
      AIAgent.MYSTATICS.isFreeTier = false;
    }
  }

  // Get the appropriate model based on tier
  private getCurrentModel(): string {
    return AIAgent.MYSTATICS.isFreeTier
      ? "gemini-1.5-flash" // Free tier - Lite model
      : "gemini-2.5-flash-preview-05-20"; // Paid tier - Pro model (same model for now)
  }

  // Get current pricing based on tier
  private getCurrentPricing(): { input: number; output: number } {
    return AIAgent.MYSTATICS.isFreeTier
      ? {
          input: this.FREE_INPUT_TOKEN_COST,
          output: this.FREE_OUTPUT_TOKEN_COST,
        }
      : {
          input: this.PAID_INPUT_TOKEN_COST,
          output: this.PAID_OUTPUT_TOKEN_COST,
        };
  }

  // Rough estimation of token count (4 characters ≈ 1 token)
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Compress conversation history to reduce token usage
  private compressHistory(): AiMessage[] {
    const history = [...AIAgent.MYSTATICS.conversationHistory];

    if (history.length <= this.MAX_HISTORY_MESSAGES) {
      return history;
    }

    // Keep the first message (system context) and recent messages
    const recentMessages = history.slice(-this.MAX_HISTORY_MESSAGES);

    // If still too many tokens, summarize older messages
    let totalTokens = recentMessages.reduce(
      (sum, msg) => sum + this.estimateTokenCount(msg.parts[0]),
      0,
    );

    if (totalTokens <= this.MAX_HISTORY_TOKENS) {
      return recentMessages;
    }

    // More aggressive compression - keep only the most recent messages
    const veryRecentMessages = history.slice(-6); // Keep last 6 messages

    // Add a summary of older context if there were more messages
    if (history.length > 6) {
      const summaryMessage: AiMessage = {
        role: "user",
        parts: [
          `[Previous conversation context: ${Math.floor((history.length - 6) / 2)} exchanges about various topics]`,
        ],
      };
      return [summaryMessage, ...veryRecentMessages];
    }

    return veryRecentMessages;
  }

  // Calculate estimated cost for input message with optimized history
  private estimateInputCost(message: string): number {
    const pricing = this.getCurrentPricing();
    const compressedHistory = this.compressHistory();

    const historyText = compressedHistory.map((msg) => msg.parts[0]).join(" ");
    const totalText = historyText + " " + message;
    const estimatedTokens = this.estimateTokenCount(totalText);
    return estimatedTokens * pricing.input;
  }

  // Add credits and optionally change tier
  addCredits(amount: number, switchToPaid: boolean = false): void {
    AIAgent.MYSTATICS.credits += amount;
    if (switchToPaid) {
      AIAgent.MYSTATICS.isFreeTier = false;
    }
  }

  // Show alert with cooldown to prevent spam
  private showAlert(message: string): void {
    const now = Date.now();
    if (now - AIAgent.MYSTATICS.lastAlertTime > this.ALERT_COOLDOWN_MS) {
      alert(message);
      AIAgent.MYSTATICS.lastAlertTime = now;
    }
  }

  // Check if request should be allowed based on cost and credits
  private shouldAllowRequest(estimatedCost: number): {
    allowed: boolean;
    reason?: string;
  } {
    if (AIAgent.MYSTATICS.isFreeTier) {
      // For free tier, implement daily/hourly limits instead of strict credit checking
      const conversationLength = AIAgent.MYSTATICS.conversationHistory.length;
      if (conversationLength > 50) {
        // Limit free tier to 50 messages per session
        return {
          allowed: false,
          reason:
            "Free tier conversation limit reached. Please start a new conversation or upgrade to paid tier.",
        };
      }
      return { allowed: true };
    }

    // For paid tier, check credits with a small buffer
    const bufferCost = estimatedCost * 1.2; // 20% buffer for estimation errors
    if (AIAgent.MYSTATICS.credits == 0) {
      return {
        allowed: false,
        reason: `Insufficient credits for this request. Available: $${AIAgent.MYSTATICS.credits.toFixed(4)}, Required: ~$${bufferCost.toFixed(4)}. Please add more credits to continue.`,
      };
    }

    return { allowed: true };
  }

  async sendMessage(
    message: string,
    quick: boolean = false,
    systemPrompt?: string,
  ): Promise<string> {
    const estimatedCost = this.estimateInputCost(message);
    const requestCheck = this.shouldAllowRequest(estimatedCost);

    if (!requestCheck.allowed) {
      this.showAlert(requestCheck.reason || "Request not allowed");
      throw new Error("INSUFFICIENT_CREDITS");
    }

    try {
      const compressedHistory = this.compressHistory();

      // Build contents array for Gemini API
      const contents = [];

      // Add system prompt if provided
      if (systemPrompt) {
        contents.push({ role: "user", parts: [{ text: systemPrompt }] });
        contents.push({ role: "model", parts: [{ text: "Understood." }] });
      }

      // Add conversation history
      compressedHistory.forEach((msg) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.parts[0] }],
        });
      });

      // Add current message
      contents.push({ role: "user", parts: [{ text: message }] });
      const model =
        message.length > 3000
          ? "gemini-2.0-flash-lite"
          : "gemini-2.5-flash-preview-05-20";
      //  const model = "gemini-2.5-flash-preview-05-20"
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: AIAgent.MYSTATICS.isFreeTier ? 2000 : 4000,
              temperature: 0.7,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log({ data });
      const assistantMessage =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      // Update conversation history
      if (message.trim()) {
        AIAgent.MYSTATICS.conversationHistory.push({
          role: "user",
          parts: [message],
        });
      }

      if (assistantMessage) {
        AIAgent.MYSTATICS.conversationHistory.push({
          role: "model",
          parts: [assistantMessage],
        });
      }

      // Update usage stats and deduct credits
      if (AIAgent.MYSTATICS.isFreeTier) {
        this.updateUsageStats(data.usageMetadata);
      } else {
        this.updateUsageStatsAndDeductCredits(data.usageMetadata);
      }

      return assistantMessage;
    } catch (error) {
      console.error("Error calling Gemini API:", error);

      if (error instanceof Error) {
        if (error.message === "INSUFFICIENT_CREDITS") throw error;
        if (error.message.includes("403"))
          this.showAlert("API token invalid or unauthorized");
        else if (error.message.includes("429"))
          this.showAlert("Rate limit exceeded");
        else this.showAlert("API request failed - please try again");
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to get response from AI",
      );
    }
  }

  // async sendMessage(
  //   message: string,
  //   quick: boolean = false,
  //   systemPrompt?: string,
  // ): Promise<string> {
  //   const estimatedCost = this.estimateInputCost(message);
  //   const requestCheck = this.shouldAllowRequest(estimatedCost);

  //   if (!requestCheck.allowed) {
  //     this.showAlert(requestCheck.reason || "Request not allowed");
  //     throw new Error("INSUFFICIENT_CREDITS");
  //   }

  //   try {
  //     const apiToken = import.meta.env.VITE_HUGING_FACE_TOKEN;
  //     const compressedHistory = this.compressHistory();

  //     // Build conversation context
  //     let conversationContext = "";
  //     if (systemPrompt) {
  //       conversationContext += `<|system|>\n${systemPrompt}<|end|>\n`;
  //     }

  //     // Add history in alternating user/assistant format
  //     compressedHistory.forEach((msg) => {
  //       const role = msg.role === "user" ? "user" : "assistant";
  //       conversationContext += `<|${role}|>\n${msg.parts[0]}<|end|>\n`;
  //     });

  //     // Add current message
  //     conversationContext += `<|user|>\n${message}<|end|>\n<|assistant|>`;

  //     const response = await fetch(
  //       "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct",
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${apiToken}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           inputs: conversationContext,
  //           parameters: {
  //             max_new_tokens: 2000,
  //             temperature: 0.7,
  //             return_full_text: false,
  //           },
  //         }),
  //       },
  //     );

  //     if (!response.ok) {
  //       console.log({ response });
  //       throw new Error(`API request failed with status ${response.status}`);
  //     }

  //     const data = await response.json();

  //     const assistantMessage = Array.isArray(data)
  //       ? data[0]?.generated_text?.trim() || ""
  //       : "";
  //     const DETECTION_RATE =
  //       message.length < 500
  //         ? 0.001
  //         : Math.min(message.length / 100000 + 0.01, 0.07);
  //     // Update stats (Hugging Face doesn't provide token counts, so estimate)
  //     if (!AIAgent.MYSTATICS.isFreeTier) {
  //       AIAgent.MYSTATICS.credits = Math.max(
  //         0,
  //         AIAgent.MYSTATICS.credits - DETECTION_RATE,
  //       );
  //     }

  //     // Add to conversation history
  //     if (message.trim()) {
  //       AIAgent.MYSTATICS.conversationHistory.push({
  //         role: "user",
  //         parts: [message],
  //       });
  //     }

  //     if (assistantMessage) {
  //       AIAgent.MYSTATICS.conversationHistory.push({
  //         role: "model",
  //         parts: [assistantMessage],
  //       });
  //     }

  //     return assistantMessage;
  //   } catch (error) {
  //     console.error("Error calling Hugging Face API:", error);

  //     if (error instanceof Error) {
  //       if (error.message === "INSUFFICIENT_CREDITS") {
  //         throw error;
  //       } else if (error.message.includes("403")) {
  //         this.showAlert("API token invalid or unauthorized");
  //       } else if (error.message.includes("429")) {
  //         this.showAlert("Rate limit exceeded");
  //       } else {
  //         this.showAlert("API request failed - please try again");
  //       }
  //     }

  //     throw new Error(
  //       error instanceof Error
  //         ? error.message
  //         : "Failed to get response from AI",
  //     );
  //   }
  // }

  // Update usage stats only (for free tier)
  private updateUsageStats(usageMetadata?: AIUsageMetadata): void {
    if (!usageMetadata) return;

    if (usageMetadata.promptTokenCount) {
      AIAgent.MYSTATICS.totalInputTokens += usageMetadata.promptTokenCount;
    }

    if (usageMetadata.candidatesTokenCount) {
      AIAgent.MYSTATICS.totalOutputTokens += usageMetadata.candidatesTokenCount;
    }
  }

  // Update usage stats and deduct credits (for paid tier)
  private updateUsageStatsAndDeductCredits(
    usageMetadata?: AIUsageMetadata,
  ): number {
    if (!usageMetadata) return 0;
    // TODO update this later
    // const pricing = this.getCurrentPricing();
    let cost = 0.05;

    // if (usageMetadata.promptTokenCount) {
    //   GeminiAgent.MYSTATICS.totalInputTokens += usageMetadata.promptTokenCount;
    //   cost += usageMetadata.promptTokenCount * pricing.input;
    // }

    // if (usageMetadata.candidatesTokenCount) {
    //   GeminiAgent.MYSTATICS.totalOutputTokens += usageMetadata.candidatesTokenCount;
    //   cost += usageMetadata.candidatesTokenCount * pricing.output;
    // }

    // Deduct the cost from credits
    AIAgent.MYSTATICS.credits = Math.max(0, AIAgent.MYSTATICS.credits - 0.05);

    return cost;
  }

  getUsage(): { total_input_tokens: number; total_output_tokens: number } {
    return {
      total_input_tokens: AIAgent.MYSTATICS.totalInputTokens,
      total_output_tokens: AIAgent.MYSTATICS.totalOutputTokens,
    };
  }

  // Get remaining credits
  remainingCredits(): number {
    return AIAgent.MYSTATICS.credits;
  }

  // Get current tier info with cost savings info
  getTierInfo(): {
    tier: string;
    model: string;
    credits: number;
    historyLength: number;
    estimatedSavings: string;
  } {
    const fullHistoryTokens = AIAgent.MYSTATICS.conversationHistory.reduce(
      (sum, msg) => sum + this.estimateTokenCount(msg.parts[0]),
      0,
    );
    const compressedTokens = this.compressHistory().reduce(
      (sum, msg) => sum + this.estimateTokenCount(msg.parts[0]),
      0,
    );
    const tokenSavings = fullHistoryTokens - compressedTokens;
    const costSavings = tokenSavings * this.getCurrentPricing().input;

    return {
      tier: AIAgent.MYSTATICS.isFreeTier ? "Free" : "Paid",
      model: this.getCurrentModel(),
      credits: AIAgent.MYSTATICS.credits,
      historyLength: AIAgent.MYSTATICS.conversationHistory.length,
      estimatedSavings: `${tokenSavings} tokens (~$${costSavings.toFixed(4)} per request)`,
    };
  }

  // Get total cost incurred so far
  getTotalCost(): number {
    const pricing = this.getCurrentPricing();
    return (
      AIAgent.MYSTATICS.totalInputTokens * pricing.input +
      AIAgent.MYSTATICS.totalOutputTokens * pricing.output
    );
  }

  clearConversation(): void {
    AIAgent.MYSTATICS.conversationHistory = [];
  }

  // Reset usage stats (useful for new billing periods)
  resetUsageStats(): void {
    AIAgent.MYSTATICS.totalInputTokens = 0;
    AIAgent.MYSTATICS.totalOutputTokens = 0;
  }

  // Manually switch tiers (if needed)
  switchTier(isFreeTier: boolean): void {
    AIAgent.MYSTATICS.isFreeTier = isFreeTier;
  }

  // Static method to reset all data (useful for testing or logout)
  static resetAllData(): void {
    AIAgent.MYSTATICS.reset();
  }

  // New method: Get cost estimate for next message
  getNextMessageCostEstimate(message: string): {
    estimatedCost: number;
    tokensToSend: number;
    historySavings: number;
  } {
    const fullHistoryTokens = AIAgent.MYSTATICS.conversationHistory.reduce(
      (sum, msg) => sum + this.estimateTokenCount(msg.parts[0]),
      0,
    );
    const compressedHistory = this.compressHistory();
    const compressedTokens = compressedHistory.reduce(
      (sum, msg) => sum + this.estimateTokenCount(msg.parts[0]),
      0,
    );
    const messageTokens = this.estimateTokenCount(message);
    const totalTokens = compressedTokens + messageTokens;

    return {
      estimatedCost: totalTokens * this.getCurrentPricing().input,
      tokensToSend: totalTokens,
      historySavings: fullHistoryTokens - compressedTokens,
    };
  }

  // Helper method to check if credits are sufficient before making a request
  canMakeRequest(message: string): {
    canProceed: boolean;
    reason?: string;
    estimatedCost: number;
  } {
    const estimatedCost = this.estimateInputCost(message);
    const requestCheck = this.shouldAllowRequest(estimatedCost);

    return {
      canProceed: requestCheck.allowed,
      reason: requestCheck.reason,
      estimatedCost,
    };
  }
}
