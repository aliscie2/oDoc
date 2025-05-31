interface GeminiMessage {
  role: 'user' | 'model';
  parts: string[];
}

interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

// Static data store to prevent Redux state mutations
class GeminiStaticStore {
  private static instance: GeminiStaticStore;
  
  public conversationHistory: GeminiMessage[] = [];
  public totalInputTokens: number = 0;
  public totalOutputTokens: number = 0;
  public credits: number = 0;
  public isFreeTier: boolean = true;

  private constructor() {}

  public static getInstance(): GeminiStaticStore {
    if (!GeminiStaticStore.instance) {
      GeminiStaticStore.instance = new GeminiStaticStore();
    }
    return GeminiStaticStore.instance;
  }

  public reset(): void {
    this.conversationHistory = [];
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.credits = 0;
    this.isFreeTier = true;
  }
}

export class GeminiAgent {
  private apiKey: string;
  private static MYSTATICS = GeminiStaticStore.getInstance();
  
  // Pricing for different tiers
  private readonly FREE_INPUT_TOKEN_COST = 0.0000375; // Lite model: $0.075 per 1M tokens
  private readonly FREE_OUTPUT_TOKEN_COST = 0.00015;  // Lite model: $0.30 per 1M tokens
  private readonly PAID_INPUT_TOKEN_COST = 0.000015;  // Pro model: $0.15 per 1M tokens  
  private readonly PAID_OUTPUT_TOKEN_COST = 0.0006;   // Pro model: $3.50 per 1M tokens (thinking)

  constructor(initialCredits: number = 0, isFreeTier: boolean = true) {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    GeminiAgent.MYSTATICS.credits = initialCredits;
    GeminiAgent.MYSTATICS.isFreeTier = isFreeTier;
  }

  // Get the appropriate model based on tier
  private getCurrentModel(): string {
    return GeminiAgent.MYSTATICS.isFreeTier 
      ? 'gemini-2.0-flash-lite'  // Free tier - Lite model
      : 'gemini-2.0-flash-thinking-exp-1219';  // Paid tier - Pro model
  }

  // Get current pricing based on tier
  private getCurrentPricing(): { input: number; output: number } {
    return GeminiAgent.MYSTATICS.isFreeTier 
      ? { input: this.FREE_INPUT_TOKEN_COST, output: this.FREE_OUTPUT_TOKEN_COST }
      : { input: this.PAID_INPUT_TOKEN_COST, output: this.PAID_OUTPUT_TOKEN_COST };
  }

  // Rough estimation of token count (4 characters ≈ 1 token)
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Calculate estimated cost for input message
  private estimateInputCost(message: string): number {
    const pricing = this.getCurrentPricing();
    // Include conversation history + new message
    const historyText = GeminiAgent.MYSTATICS.conversationHistory
      .map(msg => msg.parts[0])
      .join(' ');
    const totalText = historyText + ' ' + message;
    const estimatedTokens = this.estimateTokenCount(totalText);
    return estimatedTokens * pricing.input;
  }

  // Add credits and set tier
  addCredits(amount: number, isFreeTier: boolean = true): void {
    GeminiAgent.MYSTATICS.credits += amount;
    GeminiAgent.MYSTATICS.isFreeTier = isFreeTier;
  }

  // Check if user should upgrade to paid tier
  private shouldUpgradeToPaid(): boolean {
    return GeminiAgent.MYSTATICS.isFreeTier && GeminiAgent.MYSTATICS.credits > 0;
  }

  async sendMessage(message: string, files: any[] = []): Promise<string> {
    // Auto-upgrade to paid tier if they have credits
    if (this.shouldUpgradeToPaid()) {
      GeminiAgent.MYSTATICS.isFreeTier = false;
    }

    // For free tier, allow limited usage without credits
    if (GeminiAgent.MYSTATICS.isFreeTier && GeminiAgent.MYSTATICS.credits <= 0) {
      // You can implement daily limits, reduced functionality, etc.
      // For now, we'll allow basic usage but suggest upgrading
      console.log("Free tier user with no credits - consider implementing daily limits");
    }

    // For paid tier, check credits
    if (!GeminiAgent.MYSTATICS.isFreeTier) {
      const estimatedCost = this.estimateInputCost(message);
      
      if (GeminiAgent.MYSTATICS.credits < estimatedCost) {
        alert("Please buy more credits");
        throw new Error('Insufficient credits for this request. Please add more credits to continue.');
      }
    }

    try {
      const currentModel = this.getCurrentModel();
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [
            ...GeminiAgent.MYSTATICS.conversationHistory.map(msg => ({
              role: msg.role,
              parts: [{ text: msg.parts[0] }]
            })),
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Update usage statistics and deduct credits (only for paid tier)
      if (!GeminiAgent.MYSTATICS.isFreeTier) {
        this.updateUsageStatsAndDeductCredits(data.usageMetadata);
      } else {
        // For free tier, still track usage but don't deduct credits
        this.updateUsageStats(data.usageMetadata);
      }
      
      if (message.trim()) {
        GeminiAgent.MYSTATICS.conversationHistory.push({
          role: 'user',
          parts: [message]
        });
      }
      
      if (assistantMessage) {
        GeminiAgent.MYSTATICS.conversationHistory.push({
          role: 'model',
          parts: [assistantMessage]
        });
      }
      
      return assistantMessage;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Show different alert based on error type
      if (error instanceof Error && error.message.includes('403')) {
        alert("API key invalid or quota exceeded");
      } else if (error instanceof Error && error.message.includes('429')) {
        alert("Rate limit exceeded - Gemini is busy");
      } else if (error instanceof Error && error.message.includes('Insufficient credits')) {
        alert(error.message);
      } else {
        alert("Gemini is busy");
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to get response from AI');
    }
  }

  // Update usage stats only (for free tier)
  private updateUsageStats(usageMetadata?: GeminiUsageMetadata): void {
    if (!usageMetadata) return;
    
    if (usageMetadata.promptTokenCount) {
      GeminiAgent.MYSTATICS.totalInputTokens += usageMetadata.promptTokenCount;
    }
    
    if (usageMetadata.candidatesTokenCount) {
      GeminiAgent.MYSTATICS.totalOutputTokens += usageMetadata.candidatesTokenCount;
    }
  }

  // Update usage stats and deduct credits (for paid tier)
  private updateUsageStatsAndDeductCredits(usageMetadata?: GeminiUsageMetadata): number {
    if (!usageMetadata) return 0;
    
    const pricing = this.getCurrentPricing();
    let cost = 0;
    
    if (usageMetadata.promptTokenCount) {
      GeminiAgent.MYSTATICS.totalInputTokens += usageMetadata.promptTokenCount;
      cost += usageMetadata.promptTokenCount * pricing.input;
    }
    
    if (usageMetadata.candidatesTokenCount) {
      GeminiAgent.MYSTATICS.totalOutputTokens += usageMetadata.candidatesTokenCount;
      cost += usageMetadata.candidatesTokenCount * pricing.output;
    }

    // Deduct the cost from credits
    GeminiAgent.MYSTATICS.credits = Math.max(0, GeminiAgent.MYSTATICS.credits - cost);
    
    return cost;
  }

  getUsage(): { total_input_tokens: number; total_output_tokens: number } {
    return {
      total_input_tokens: GeminiAgent.MYSTATICS.totalInputTokens,
      total_output_tokens: GeminiAgent.MYSTATICS.totalOutputTokens
    };
  }

  // Get remaining credits
  remainingCredits(): number {
    return GeminiAgent.MYSTATICS.credits;
  }

  // Get current tier info
  getTierInfo(): { tier: string; model: string; credits: number } {
    return {
      tier: GeminiAgent.MYSTATICS.isFreeTier ? 'Free' : 'Paid',
      model: this.getCurrentModel(),
      credits: GeminiAgent.MYSTATICS.credits
    };
  }

  // Get total cost incurred so far
  getTotalCost(): number {
    const pricing = this.getCurrentPricing();
    return (GeminiAgent.MYSTATICS.totalInputTokens * pricing.input) + 
           (GeminiAgent.MYSTATICS.totalOutputTokens * pricing.output);
  }
  
  clearConversation(): void {
    GeminiAgent.MYSTATICS.conversationHistory = [];
  }

  // Reset usage stats (useful for new billing periods)
  resetUsageStats(): void {
    GeminiAgent.MYSTATICS.totalInputTokens = 0;
    GeminiAgent.MYSTATICS.totalOutputTokens = 0;
  }

  // Manually switch tiers (if needed)
  switchTier(isFreeTier: boolean): void {
    GeminiAgent.MYSTATICS.isFreeTier = isFreeTier;
  }

  // Static method to reset all data (useful for testing or logout)
  static resetAllData(): void {
    GeminiAgent.MYSTATICS.reset();
  }
}