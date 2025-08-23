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

  // Google Gemini pricing - very affordable and frontend-friendly
  // Gemini Flash pricing: Free tier available, then $0.075 per 1M input tokens, $0.30 per 1M output tokens
  private readonly INPUT_TOKEN_COST = 0.000000075; // $0.075 per 1M tokens
  private readonly OUTPUT_TOKEN_COST = 0.0000003; // $0.30 per 1M tokens

  // Context settings - keep only latest 4 messages
  private readonly MAX_CONTEXT_MESSAGES = 4;
  private readonly ALERT_COOLDOWN_MS = 3000;

  constructor(initialCredits: number = 1.0) {
    AIAgent.MYSTATICS.credits = initialCredits;
  }

  private getCurrentModel(): string {
    return "gemini-1.5-flash";
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
    abortSignal?: AbortSignal,
    onStream?: (chunk: string) => void,
  ): Promise<string> {
    const startTime = Date.now();
    console.log(
      `🚀 Starting Google Gemini API request at ${new Date().toISOString()}`,
    );

    const estimatedCost = this.estimateInputCost(message);
    const requestCheck = this.shouldAllowRequest(estimatedCost);

    if (!requestCheck.allowed) {
      this.showAlert(requestCheck.reason || "Request not allowed");
      throw new Error("INSUFFICIENT_CREDITS");
    }

    try {
      const contextMessages = this.getContextMessages();
      
      // Build conversation history for Gemini
      let conversationText = "";
      
      // Add system prompt if provided
      if (systemPrompt) {
        conversationText += `System: ${systemPrompt}\n\n`;
      }

      // Add context messages
      contextMessages.forEach((msg) => {
        const role = msg.role === "user" ? "User" : "Assistant";
        conversationText += `${role}: ${msg.parts[0]}\n\n`;
      });

      // Add current message
      conversationText += `User: ${message}\n\nAssistant:`;

      const fetchStart = Date.now();
      console.log(
        `📡 Sending request to Google Gemini API... (${fetchStart - startTime}ms elapsed)`,
      );

      const apiUrl = onStream 
        ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`
        : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

      const requestBody = {
        contents: [{
          parts: [{ text: conversationText }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        }
      };

      console.log("🔍 Request body:", JSON.stringify(requestBody, null, 2));
      console.log("🔑 API Key present:", !!import.meta.env.VITE_GEMINI_API_KEY);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortSignal,
      });

      const responseTime = Date.now();
      console.log(`📥 Response received in ${responseTime - fetchStart}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(
          `API request failed with status ${response.status}: ${errorText}`,
        );
      }

      let assistantMessage = "";
      let usage: any = {};

      if (onStream && response.body) {
        // Handle streaming response for Gemini
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6);
                if (dataStr === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(dataStr);
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    assistantMessage += text;
                    onStream(text);
                  }
                  // Capture usage data if available
                  if (parsed.usageMetadata) {
                    usage = parsed.usageMetadata;
                  }
                } catch (e) {
                  // Skip invalid JSON chunks
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        // Handle non-streaming response for Gemini
        const parseStart = Date.now();
        const data = await response.json();
        const parseTime = Date.now();
        console.log(`🔍 JSON parsed in ${parseTime - parseStart}ms`);

        assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        usage = data.usageMetadata || {};
      }

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

      const tokenData = {
        prompt_tokens: usage.promptTokenCount || 0,
        completion_tokens: usage.candidatesTokenCount || 0,
      };

      this.updateUsageStatsAndDeductCredits(tokenData);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      console.log(
        `✅ Google Gemini API call completed in ${totalTime}ms total`,
      );
      console.log(
        `📊 Tokens: ${usage.promptTokenCount} input, ${usage.candidatesTokenCount} output`,
      );

      return assistantMessage;
    } catch (error) {
      const errorTime = Date.now() - startTime;

      // Handle abort signal
      if (error instanceof Error && error.name === "AbortError") {
        console.log(`🛑 Google Gemini API request cancelled after ${errorTime}ms`);
        throw new Error("Request cancelled");
      }

      console.error(`❌ Google Gemini API error after ${errorTime}ms:`, error);

      if (error instanceof Error) {
        if (error.message === "INSUFFICIENT_CREDITS") throw error;
        if (error.message.includes("401") || error.message.includes("403"))
          this.showAlert("Invalid Google Gemini API key");
        else if (error.message.includes("429"))
          this.showAlert("Rate limit exceeded");
        else this.showAlert("Google Gemini API request failed - please try again");
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to get response from Google Gemini",
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

    // Calculate actual cost based on Google Gemini pricing
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
