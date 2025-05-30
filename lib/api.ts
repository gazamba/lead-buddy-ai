import { Feedback, Scenario } from "./types";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function getScenarios(): Promise<Scenario[]> {
  const response = await fetch(`${getBaseUrl()}/api/scenarios`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch scenarios");
  }

  return response.json();
}

export async function getScenarioById(id: string) {
  const response = await fetch(`${getBaseUrl()}/api/scenarios/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch scenario");
  }
  return response.json();
}

export async function createScenarioTips(formData: FormData) {
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    context: formData.get("context") as string,
  };

  const prompt = `You are an expert leadership coach.
      I will give you a title, a description, and additional context about a leadership situation.
      Your task is to analyze the situation and return 5 practical and actionable tips to help a leader handle it effectively.
      The output must be a simple array of 5 short strings (tips).
      Important:
      Focus on emotional intelligence, clear communication, professionalism, and empathy.
      The tips must be very actionable and relevant to the situation.
      No explanations, only the 5 tips.
      Input Example:
      Title: Handling underperformance in a senior engineer
      Description: The engineer is missing deadlines and seems disengaged.
      Context: This engineer has been with the company for 5 years and used to be a high performer. We want to understand if something external is affecting them before making any decisions.
      Output example:
      [
      "Schedule a private meeting focused on support, not blame.",
      "Ask open-ended questions to explore possible external factors.",
      "Express appreciation for past contributions to reduce defensiveness."
      ]
      Now you know what expect, provide the 5 tips for the context scenario below:
      Title: ${data.title}, Description: ${data.description}, Context: ${data.context}
    `;

  const response = await fetch("/api/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create promppt");
  }

  return response.json();
}

export async function createPrompt(prompt: string) {
  const response = await fetch(`${getBaseUrl()}/api/prompts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prompt),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create promppt");
  }

  return response.json();
}

export async function createScenario(scenario: any) {
  const response = await fetch(`${getBaseUrl()}/api/scenarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scenario),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create scenario");
  }
  return response.json();
}

export async function updateScenario(id: string, updates: any) {
  const response = await fetch(`${getBaseUrl()}/api/scenarios/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update scenario");
  }
  return response.json();
}

export async function deleteScenario(id: string) {
  const response = await fetch(`${getBaseUrl()}/api/scenarios/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete scenario");
  }
  return response.json();
}

export async function getConversations() {
  const response = await fetch(`${getBaseUrl()}/api/conversations`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch conversations");
  }
  return response.json();
}

export async function getConversationById(id: string) {
  const response = await fetch(`${getBaseUrl()}/api/conversations/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch conversation");
  }
  return response.json();
}

export async function createConversation(conversation: any) {
  const response = await fetch(`${getBaseUrl()}/api/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conversation),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create conversation");
  }
  return response.json();
}

export async function deleteConversation(id: string) {
  const response = await fetch(`${getBaseUrl()}/api/conversations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete conversation");
  }
  return response.json();
}

export async function getProfile() {
  const response = await fetch(`${getBaseUrl()}/api/profile`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch profile");
  }
  return response.json();
}

export async function updateProfile(updates: any) {
  const response = await fetch(`${getBaseUrl()}/api/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }
  return response.json();
}

export async function getFeedback(
  context: string,
  conversations: string
): Promise<Feedback> {
  const prompt = `
You are an expert leadership coach. Based on the provided context and conversations, provide ONE feedback object for the entire conversation in the exact JSON format shown below. The response MUST:
- Contain ONLY the JSON object.
- Be valid JSON with no trailing commas, unclosed brackets, or syntax errors.
- Exclude any additional text, markdown (e.g., \`\`\`json), or explanations.
- Ensure all arrays (e.g., strengths, improvements) are complete and properly closed.

Example format:
{
  "clarity": 85,
  "empathy": 90,
  "effectiveness": 80,
  "strengths": [
    "You asked good clarifying questions",
    "You maintained a professional tone throughout",
    "You provided specific examples to support your points"
  ],
  "improvements": [
    "Consider acknowledging emotions more explicitly",
    "Try to establish clearer next steps and expectations",
    "Provide more specific feedback with concrete examples"
  ],
  "summary": "Overall, you demonstrated good communication skills with room for improvement in emotional intelligence and setting clear expectations. Continue practicing active listening and empathetic responses."
}

Context: ${context}
Conversations for reference: ${conversations}
`;

  const response = await fetch(`${getBaseUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: prompt }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get feedback");
  } 
  
  const data = await response.json();
  
  let feedback:Feedback;
  try {
    feedback = typeof data === "string" ? JSON.parse(data) : data;
  } catch (parseError) {
    console.error("Failed to parse feedback:", parseError);
    throw new Error("Invalid feedback format received from API");
  }

  return feedback;
}
