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
