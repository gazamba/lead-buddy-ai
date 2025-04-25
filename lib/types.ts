export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Feedback {
  clarity: number;
  empathy: number;
  effectiveness: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  context: string;
  employee_avatar: string;
  employee_name: string;
  tips: string[] | null;
  is_custom: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SavedConversation {
  id: string;
  name: string;
  scenario_id: string;
  messages: Message[];
  feedback?: Feedback | null;
  created_at: string;
  updated_at?: string;
  scenarios?:
    | Scenario
    | {
        title: string;
        description?: string;
        context?: string;
        employee_avatar?: string;
        employee_name?: string;
        tips?: string[] | null;
        is_custom?: boolean;
      };
}
