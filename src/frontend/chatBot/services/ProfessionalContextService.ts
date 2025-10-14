export interface RecruitmentContext {
  userType: "JOB" | "TALENT" | null;
  jobCount: number;
  candidateCount: number;
  activeJobId?: string;
  recentMetrics?: {
    applicationRate: number;
    responseRate: number;
    conversionRate: number;
  };
}

export class ProfessionalContextService {
  constructor(private context: RecruitmentContext) {}

  enhanceMessage(userMessage: string): string {
    const contextualPrefix = this.getContextualPrefix(userMessage);
    const professionalContext = this.getProfessionalContext();

    return `${contextualPrefix}

User Context: ${professionalContext}

User Query: ${userMessage}

Please provide a professional, data-driven response focused on recruitment/hiring insights. Include specific metrics, actionable recommendations, and business intelligence where relevant.`;
  }

  private getContextualPrefix(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("analyze")) {
      return "ANALYSIS REQUEST - Provide detailed analytical insights with specific metrics and recommendations.";
    }

    if (lowerMessage.includes("suggest") || lowerMessage.includes("improve")) {
      return "OPTIMIZATION REQUEST - Focus on actionable improvements and best practices.";
    }

    if (lowerMessage.includes("trend") || lowerMessage.includes("market")) {
      return "MARKET INTELLIGENCE - Provide industry trends and competitive insights.";
    }

    if (lowerMessage.includes("candidate") || lowerMessage.includes("talent")) {
      return "TALENT ANALYSIS - Focus on candidate-related insights and recommendations.";
    }

    return "HIRING INTELLIGENCE - Provide professional recruitment insights.";
  }

  private getProfessionalContext(): string {
    const { userType, jobCount, candidateCount, recentMetrics } = this.context;

    let context = `User Type: ${userType || "General"}, `;
    context += `Active Jobs: ${jobCount}, `;
    context += `Total Candidates: ${candidateCount}`;

    if (recentMetrics) {
      context += `, Recent Performance: ${recentMetrics.applicationRate}% application rate, `;
      context += `${recentMetrics.responseRate}% response rate, `;
      context += `${recentMetrics.conversionRate}% conversion rate`;
    }

    return context;
  }

  static getSystemPrompt(): string {
    return `You are a Hiring Intelligence Assistant for oDoc, a professional freelance recruitment platform. 

Your role is to:
- Provide data-driven recruitment insights and analytics
- Offer actionable hiring optimization recommendations  
- Analyze market trends
- Suggest improvements to job postings and hiring processes
- Use professional, business-appropriate language
- Focus on ROI, efficiency, and measurable outcomes
- Reference specific metrics and percentages when available

Always respond as a sophisticated business intelligence tool, not a casual chatbot. Include relevant data points, industry benchmarks, and specific recommendations.`;
  }
}
