interface AiResponse {
  Ok: {
    response: string;
    remaining_credits: number;
  };
}

interface Message {
  role: string;
  content: string;
}

const contextHistory: Message[] = [];
let pendingUserMessage: string | null = null;

const calculateAICost = (
  prompt: string,
  response: string,
  quick: boolean,
): number => {
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  const inputTokens = estimateTokens(prompt);
  const outputTokens = estimateTokens(response);

  return quick
    ? (inputTokens + outputTokens) * 0.00000005
    : inputTokens * 0.00000059 + outputTokens * 0.00000079;
};

async function ask_ai(
  prompt: string,
  systemPrompt: string,
  quick: boolean,
  apiKey: string,
  current_credits: number,
): Promise<AiResponse> {
  // Store user message when quick===true
  if (quick) {
    pendingUserMessage = prompt;
  }

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...contextHistory,
    { role: "user", content: prompt },
  ];

  const requestBody = {
    model: quick ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile",
    max_tokens: quick ? 500 : 8192,
    messages,
  };

  let response: Response;
  for (let attempt = 1; attempt <= 3; attempt++) {
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
      if (attempt === 3)
        throw new Error(`HTTP request failed after 3 attempts: ${error}`);
      console.log(`Request failed on attempt ${attempt}, retrying...`);
    }
  }

  if (!response.ok) {
    throw new Error(
      `API request failed with status: ${response.status} - ${await response.text()}`,
    );
  }

  const responseJson = await response.json();
  const responseText =
    responseJson?.choices?.[0]?.message?.content || "No response from AI";

  // After long model responds, add both messages to history
  if (!quick && pendingUserMessage) {
    contextHistory.push(
      { role: "user", content: pendingUserMessage },
      { role: "assistant", content: responseText },
    );

    // Keep only last 4 exchanges (8 messages)
    while (contextHistory.length > 8) {
      contextHistory.splice(0, 2);
    }

    pendingUserMessage = null;
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
