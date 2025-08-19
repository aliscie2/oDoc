interface AiMessage {
  role: "user" | "model";
  parts: string[];
}

interface AIUsageMetadata {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

// Static data store to prevent Redux state mutations
class AIStaticStore {
  private static instance: AIStaticStore;

  public conversationHistory: AiMessage[] = [];
  public totalInputTokens: number = 0;
  public totalOutputTokens: number = 0;
  public credits: number = 0;
  public lastAlertTime: number = 0;

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
    this.lastAlertTime = 0;
  }
}

export class AIAgent {
  private static MYSTATICS = AIStaticStore.getInstance();

  // DeepSeek pricing - extremely cheap, $1 should last 30+ days
  // DeepSeek actual pricing: ~$0.14 per 1M input tokens, ~$0.28 per 1M output tokens
  private readonly INPUT_TOKEN_COST = 0.00000014; // $0.14 per 1M tokens
  private readonly OUTPUT_TOKEN_COST = 0.00000028; // $0.28 per 1M tokens

  // Context settings - keep only latest 4 messages
  private readonly MAX_CONTEXT_MESSAGES = 4;
  private readonly ALERT_COOLDOWN_MS = 3000;

  constructor(initialCredits: number = 1.0) {
    AIAgent.MYSTATICS.credits = initialCredits;
  }

  private getCurrentModel(): string {
    return "deepseek-chat";
  }

  private getCurrentPricing(): { input: number; output: number } {
    return {
      input: this.INPUT_TOKEN_COST,
      output: this.OUTPUT_TOKEN_COST,
    };
  }

  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Keep only the latest 4 messages for context awareness
  private getContextMessages(): AiMessage[] {
    return AIAgent.MYSTATICS.conversationHistory.slice(
      -this.MAX_CONTEXT_MESSAGES,
    );
  }

  // Clean up old messages, keeping only the latest 4
  private cleanupOldMessages(): void {
    if (
      AIAgent.MYSTATICS.conversationHistory.length > this.MAX_CONTEXT_MESSAGES
    ) {
      AIAgent.MYSTATICS.conversationHistory =
        AIAgent.MYSTATICS.conversationHistory.slice(-this.MAX_CONTEXT_MESSAGES);
    }
  }

  private estimateInputCost(message: string): number {
    const pricing = this.getCurrentPricing();
    const contextMessages = this.getContextMessages();
    const historyText = contextMessages.map((msg) => msg.parts[0]).join(" ");
    const totalText = historyText + " " + message;
    const estimatedTokens = this.estimateTokenCount(totalText);
    return estimatedTokens * pricing.input;
  }

  addCredits(amount: number): void {
    AIAgent.MYSTATICS.credits += amount;
  }

  private showAlert(message: string): void {
    const now = Date.now();
    if (now - AIAgent.MYSTATICS.lastAlertTime > this.ALERT_COOLDOWN_MS) {
      alert(message);
      AIAgent.MYSTATICS.lastAlertTime = now;
    }
  }

  private shouldAllowRequest(estimatedCost: number): {
    allowed: boolean;
    reason?: string;
  } {
    // Check if we have enough credits for this request
    if (AIAgent.MYSTATICS.credits < estimatedCost) {
      return {
        allowed: false,
        reason: `Insufficient credits. Please add more credits to continue. Current balance: $${AIAgent.MYSTATICS.credits.toFixed(4)}, Required: $${estimatedCost.toFixed(6)}`,
      };
    }

    return { allowed: true };
  }

  async sendMessage(
    message: string,
    quick: boolean,
    systemPrompt?: string,
  ): Promise<string> {
    const startTime = Date.now();
    console.log(
      `🚀 Starting DeepSeek API request at ${new Date().toISOString()}`,
    );

    const estimatedCost = this.estimateInputCost(message);
    const requestCheck = this.shouldAllowRequest(estimatedCost);

    if (!requestCheck.allowed) {
      this.showAlert(requestCheck.reason || "Request not allowed");
      throw new Error("INSUFFICIENT_CREDITS");
    }

    try {
      const contextMessages = this.getContextMessages();
      const messages = [];

      // System prompts are NOT stored in context - only used for this request
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }

      // Add context messages (latest 4 user/model pairs)
      contextMessages.forEach((msg) => {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.parts[0],
        });
      });

      messages.push({ role: "user", content: message });

      const fetchStart = Date.now();
      console.log(
        `📡 Sending request to DeepSeek API... (${fetchStart - startTime}ms elapsed)`,
      );

      const response = await fetch(
        "https://api.deepseek.com/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages,
            max_tokens: 4000,
            temperature: 0.7,
            stream: false,
          }),
        },
      );

      const responseTime = Date.now();
      console.log(`📥 Response received in ${responseTime - fetchStart}ms`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const parseStart = Date.now();
      const data = await response.json();
      const parseTime = Date.now();
      console.log(`🔍 JSON parsed in ${parseTime - parseStart}ms`);

      const assistantMessage =
        data.choices?.[0]?.message?.content?.trim() || "";

      // Store message in context ONLY if quick=false (not for quick queries like classification)
      if (!quick) {
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

        // Clean up old messages to maintain context limit of 4
        this.cleanupOldMessages();
      }

      const usage = data.usage || {};
      const tokenData = {
        prompt_tokens: usage.prompt_tokens || 0,
        completion_tokens: usage.completion_tokens || 0,
      };

      this.updateUsageStatsAndDeductCredits(tokenData);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      console.log(`✅ DeepSeek API call completed in ${totalTime}ms total`);
      console.log(
        `📊 Tokens: ${usage.prompt_tokens} input, ${usage.completion_tokens} output`,
      );

      return assistantMessage;
    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error(`❌ DeepSeek API error after ${errorTime}ms:`, error);

      if (error instanceof Error) {
        if (error.message === "INSUFFICIENT_CREDITS") throw error;
        if (error.message.includes("401"))
          this.showAlert("Invalid DeepSeek API key");
        else if (error.message.includes("429"))
          this.showAlert("Rate limit exceeded");
        else this.showAlert("DeepSeek API request failed - please try again");
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to get response from DeepSeek",
      );
    }
  }



  private updateUsageStatsAndDeductCredits(
    usageMetadata?: AIUsageMetadata,
  ): number {
    if (!usageMetadata) return 0;

    // Update token stats for tracking
    if (usageMetadata.prompt_tokens) {
      AIAgent.MYSTATICS.totalInputTokens += usageMetadata.prompt_tokens;
    }
    if (usageMetadata.completion_tokens) {
      AIAgent.MYSTATICS.totalOutputTokens += usageMetadata.completion_tokens;
    }

    // Calculate actual cost based on DeepSeek pricing
    const pricing = this.getCurrentPricing();
    let cost = 0;
    
    if (usageMetadata.prompt_tokens) {
      cost += usageMetadata.prompt_tokens * pricing.input;
    }
    if (usageMetadata.completion_tokens) {
      cost += usageMetadata.completion_tokens * pricing.output;
    }

    AIAgent.MYSTATICS.credits = Math.max(0, AIAgent.MYSTATICS.credits - cost);
    return cost;
  }

  getUsage(): { total_input_tokens: number; total_output_tokens: number } {
    return {
      total_input_tokens: AIAgent.MYSTATICS.totalInputTokens,
      total_output_tokens: AIAgent.MYSTATICS.totalOutputTokens,
    };
  }

  remainingCredits(): number {
    return AIAgent.MYSTATICS.credits;
  }

  getTierInfo(): {
    model: string;
    credits: number;
    historyLength: number;
  } {
    return {
      model: this.getCurrentModel(),
      credits: AIAgent.MYSTATICS.credits,
      historyLength: AIAgent.MYSTATICS.conversationHistory.length,
    };
  }

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

  resetUsageStats(): void {
    AIAgent.MYSTATICS.totalInputTokens = 0;
    AIAgent.MYSTATICS.totalOutputTokens = 0;
  }



  static resetAllData(): void {
    AIAgent.MYSTATICS.reset();
  }

  getNextMessageCostEstimate(message: string): {
    estimatedCost: number;
    tokensToSend: number;
  } {
    const contextMessages = this.getContextMessages();
    const contextTokens = contextMessages.reduce(
      (sum: number, msg: AiMessage) =>
        sum + this.estimateTokenCount(msg.parts[0]),
      0,
    );
    const messageTokens = this.estimateTokenCount(message);
    const totalTokens = contextTokens + messageTokens;

    return {
      estimatedCost: totalTokens * this.getCurrentPricing().input,
      tokensToSend: totalTokens,
    };
  }

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
