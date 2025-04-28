export async function getScenarios() {
  const response = await fetch("/api/scenarios");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch scenarios");
  }
  return response.json();
}

export async function getScenarioById(id: string) {
  const response = await fetch(`/api/scenarios/${id}`);
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
      "Express appreciation for past contributions to reduce defensiveness.",
      "Clarify expectations and offer help to reestablish goals.",
      "Set a follow-up check-in to monitor progress and offer continued support."
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
  const response = await fetch("/api/prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prompt), // test to see this
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create promppt");
  }

  return response.json();
}

export async function createScenario(scenario: any) {
  const response = await fetch("/api/scenarios", {
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
  const response = await fetch(`/api/scenarios/${id}`, {
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
  const response = await fetch(`/api/scenarios/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete scenario");
  }
  return response.json();
}

export async function getConversations() {
  const response = await fetch("/api/conversations");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch conversations");
  }
  return response.json();
}

export async function getConversationById(id: string) {
  const response = await fetch(`/api/conversations/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch conversation");
  }
  return response.json();
}

export async function createConversation(conversation: any) {
  const response = await fetch("/api/conversations", {
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

export async function updateConversation(id: string, updates: any) {
  const response = await fetch(`/api/conversations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update conversation");
  }
  return response.json();
}

export async function deleteConversation(id: string) {
  const response = await fetch(`/api/conversations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete conversation");
  }
  return response.json();
}

export async function getProfile() {
  const response = await fetch("/api/profile");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch profile");
  }
  return response.json();
}

export async function updateProfile(updates: any) {
  const response = await fetch("/api/profile", {
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
