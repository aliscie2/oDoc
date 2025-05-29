interface GeminiMessage {
  role: 'user' | 'model';
  parts: string[];
}

interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export class GeminiAgent {
  private apiKey: string;
  private conversationHistory: GeminiMessage[];
  private totalInputTokens: number;
  private totalOutputTokens: number;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.conversationHistory = [];
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
  }

  async sendMessage(message: string, files: any[] = []): Promise<string> {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-1219:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [
            ...this.conversationHistory.map(msg => ({
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
      
      // Update usage statistics
      this.updateUsageStats(data.usageMetadata);
      
      if (message.trim()) {
        this.conversationHistory.push({
          role: 'user',
          parts: [message]
        });
      }
      
      if (assistantMessage) {
        this.conversationHistory.push({
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
      } else {
        alert("Gemini is busy");
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to get response from AI');
    }
  }

  private updateUsageStats(usageMetadata?: GeminiUsageMetadata): void {
    if (!usageMetadata) return;
    
    if (usageMetadata.promptTokenCount) {
      this.totalInputTokens += usageMetadata.promptTokenCount;
    }
    
    if (usageMetadata.candidatesTokenCount) {
      this.totalOutputTokens += usageMetadata.candidatesTokenCount;
    }
  }

  getUsage(): { total_input_tokens: number; total_output_tokens: number } {
    return {
      total_input_tokens: this.totalInputTokens,
      total_output_tokens: this.totalOutputTokens
    };
  }
  
  clearConversation(): void {
    this.conversationHistory = [];
  }
}