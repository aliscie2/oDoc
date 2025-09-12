function calculateAICost(
  prompt: string,
  response: string,
  quick: boolean,
): number {
  // Rough token estimation: ~4 characters per token for English text
  const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

  const inputTokens = estimateTokens(prompt);
  const outputTokens = estimateTokens(response);

  if (quick) {
    // llama-3.1-8b-instant pricing (example rates)
    const inputCostPerToken = 0.00000005; // $0.05 per 1M tokens
    const outputCostPerToken = 0.00000005;
    return inputTokens * inputCostPerToken + outputTokens * outputCostPerToken;
  } else {
    // llama-3.3-70b-versatile pricing (example rates)
    const inputCostPerToken = 0.00000059; // $0.59 per 1M tokens
    const outputCostPerToken = 0.00000079; // $0.79 per 1M tokens
    return inputTokens * inputCostPerToken + outputTokens * outputCostPerToken;
  }
}

interface AiResponse {
  remainingCredits: number;
  response: string;
}

interface AiResponse {
  response: string;
}

async function ask_ai(
  prompt: string,
  systemPrompt: string,
  quick: boolean,
  apiKey: string,
  current_credits: number,
): Promise<AiResponse> {
  const model = quick ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";
  const maxTokens = quick ? 500 : 8192;

  const requestBody = {
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  };

  const maxAttempts = 3;
  let attempts = 0;
  let response: Response;

  do {
    attempts++;
    try {
      response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        },
      );
      break;
    } catch (error) {
      if (attempts >= maxAttempts) {
        throw new Error(
          `HTTP request failed after ${attempts} attempts: ${error}`,
        );
      }
      console.log(`Request failed on attempt ${attempts}, retrying...`);
    }
  } while (attempts < maxAttempts);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API request failed with status: ${response.status} - Response: ${errorBody}`,
    );
  }

  const responseJson = await response.json();
  const responseText =
    responseJson?.choices?.[0]?.message?.content || "No response from AI";

  if (responseJson.usage) {
    console.log("Token usage:", responseJson.usage);
  }

  return {
    Ok: {
      response: responseText,
      remaining_credits:
        current_credits - calculateAICost(prompt, responseText, quick),
    },
  };
}

export default ask_ai;
