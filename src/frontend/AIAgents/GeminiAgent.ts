interface GeminiMessage {
  role: 'user' | 'model';
  parts: string[];
}

export class GeminiAgent {
  private apiKey: string;
  private conversationHistory: GeminiMessage[];

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.conversationHistory = [];
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
        alert(`API request failed with status ${response.status}`)
      }

      const data = await response.json();
      const assistantMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
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
      throw new Error(error instanceof Error ? error.message : 'Failed to get response from AI');
    }
  }
  
  clearConversation(): void {
    this.conversationHistory = [];
  }
}