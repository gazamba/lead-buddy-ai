"use client";

import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { NavHeader } from "@/components/layout/nav-header";
import { ScenarioContext } from "@/components/simulator/scenario-context";
import { ConversationPanel } from "@/components/simulator/conversation-panel";
import { FeedbackPanel } from "@/components/simulator/feedback-panel";
import { ConversationActions } from "@/components/simulator/conversation-actions";
import { SavedConversations } from "@/components/simulator/saved-conversations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getScenarios, getScenarioById, getConversationById } from "@/lib/api";
import type {
  Message,
  Feedback,
  Scenario,
  SavedConversation,
} from "@/lib/types";
import { useAuth } from "@/components/auth-provider";

export default function SimulatorPage() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("id");
  const conversationId = searchParams.get("conversation");

  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeTab, setActiveTab] = useState("conversation");

  const defaultTips = [
    "Be clear and specific in your communication",
    "Balance positive feedback with areas for improvement",
    "Ask open-ended questions to understand perspectives",
    "Show empathy while maintaining professionalism",
    "End with clear next steps or expectations",
  ];

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoadingScenarios(true);
      try {
        if (conversationId) {
          const conversation = await getConversationById(conversationId);
          if (conversation) {
            setMessages(conversation.messages as Message[]);

            if (conversation.scenarios) {
              setCurrentScenario(conversation.scenarios as Scenario);

              if (
                conversation.messages &&
                (conversation.messages as Message[]).length >= 4
              ) {
                generateSimulatedFeedback(conversation.messages as Message[]);
              }
            }
          }
        } else {
          const scenariosData = await getScenarios();
          setScenarios(scenariosData);

          if (scenarioId) {
            const scenario: Scenario | null =
              scenariosData.find((s: Scenario) => s.id === scenarioId) ||
              (await getScenarioById(scenarioId));
            if (scenario) {
              setCurrentScenario(scenario);
            } else {
              setCurrentScenario(scenariosData[0] || null);
            }
          } else {
            setCurrentScenario(scenariosData[0] || null);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoadingScenarios(false);
      }
    };

    loadData();
  }, [user, scenarioId, conversationId]);

  useEffect(() => {
    if (currentScenario && messages.length === 0) {
      resetConversation();
    }
  }, [currentScenario, messages.length]);

  const resetConversation = () => {
    if (currentScenario) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Hello, I'm ${currentScenario.employee_name}. I'm here for our meeting. What did you want to discuss?`,
        },
      ]);
      setFeedback(null);
      setActiveTab("conversation");
    }
  };

  const handleSendMessage = async (input: string) => {
    if (input.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      setTimeout(() => {
        let responseOptions: string[] = [];

        if (currentScenario?.title.toLowerCase().includes("performance")) {
          responseOptions = [
            "I understand there are concerns about my deadlines. I've been struggling with some technical challenges.",
            "I didn't realize my communication was causing issues. Could you give me specific examples?",
            "I appreciate the feedback about my technical work. I'll try to improve on the other areas.",
            "What specific improvements would you like to see from me in the coming months?",
            "I've been dealing with some personal issues, but I should have communicated that better.",
          ];
        } else if (currentScenario?.title.toLowerCase().includes("feedback")) {
          responseOptions = [
            "I wasn't aware my communication style was coming across that way to clients.",
            "I'm just trying to be efficient with everyone's time. Do clients really find it abrupt?",
            "Could you give me an example of when this happened? I'd like to understand better.",
            "I appreciate you bringing this to my attention. How do you suggest I improve?",
            "I've always been direct in my communication. Is that really a problem?",
          ];
        } else if (
          currentScenario?.title.toLowerCase().includes("termination")
        ) {
          responseOptions = [
            "I'm shocked. I thought my performance has been good.",
            "Can you tell me more about this restructuring? Why my position specifically?",
            "What kind of severance package will be offered?",
            "Is there any possibility of being moved to another department instead?",
            "How much time do I have before my last day?",
          ];
        } else {
          responseOptions = [
            "I understand your perspective. Can we discuss specific examples?",
            "That's a fair point. I've been trying to improve in that area.",
            "I appreciate your feedback. What specific changes would you like to see?",
            "I hadn't thought about it that way. Could you elaborate?",
            "I see what you mean. Let me share my perspective as well.",
          ];
        }

        const responseText =
          responseOptions[Math.floor(Math.random() * responseOptions.length)];

        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: responseText,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (messages.length >= 3) {
          generateSimulatedFeedback([
            ...messages,
            userMessage,
            assistantMessage,
          ]);
        }

        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error generating response:", error);
      setIsLoading(false);
    }
  };

  const generateSimulatedFeedback = (conversationMessages: Message[]) => {
    const managerMessages = conversationMessages
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content);

    const simulatedFeedback: Feedback = {
      clarity: Math.floor(Math.random() * 30) + 70, // Random number between 70-100
      empathy: Math.floor(Math.random() * 30) + 70,
      effectiveness: Math.floor(Math.random() * 30) + 70,
      strengths: [
        "You asked good clarifying questions",
        "You maintained a professional tone throughout",
        "You provided specific examples to support your points",
      ],
      improvements: [
        "Consider acknowledging emotions more explicitly",
        "Try to establish clearer next steps and expectations",
        "Provide more specific feedback with concrete examples",
      ],
      summary:
        "Overall, you demonstrated good communication skills with room for improvement in emotional intelligence and setting clear expectations. Continue practicing active listening and empathetic responses.",
    };

    setFeedback(simulatedFeedback);
  };

  const handleLoadConversation = (conversation: SavedConversation) => {
    const scenario = scenarios.find((s) => s.id === conversation.scenario_id);
    if (scenario) {
      setCurrentScenario(scenario);
    } else if (conversation.scenarios) {
      setCurrentScenario(conversation.scenarios as Scenario);
    }

    setMessages(conversation.messages);

    if (conversation.messages.length >= 4) {
      generateSimulatedFeedback(conversation.messages);
    } else {
      setFeedback(null);
    }

    setActiveTab("conversation");
  };

  if (isLoadingScenarios) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4">Loading scenarios...</div>
            <div className="flex space-x-2 justify-center">
              <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"></div>
              <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]"></div>
              <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">No scenarios found</h2>
            <p className="text-gray-500 mb-4">
              Create a scenario to get started with practice conversations.
            </p>
            <Button onClick={() => (window.location.href = "/create-scenario")}>
              Create Scenario
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavHeader />
      <main className="flex-1 container py-6 px-4 md:px-6 md:py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{currentScenario.title}</h1>
          <div className="flex gap-2">
            <SavedConversations onLoadConversation={handleLoadConversation} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
          <ScenarioContext
            title={currentScenario.title}
            description={currentScenario.description}
            context={currentScenario.context}
            tips={currentScenario.tips || defaultTips}
          />
          <div className="lg:col-span-2">
            <ConversationActions
              messages={messages}
              scenarioId={currentScenario.id}
              scenarioTitle={currentScenario.title}
              onReset={resetConversation}
            />

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="feedback" disabled={!feedback}>
                  Feedback
                  {!feedback && <Info className="ml-2 h-4 w-4" />}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="conversation" className="mt-4">
                <ConversationPanel
                  messages={messages}
                  isLoading={isLoading}
                  employeeAvatar={currentScenario.employee_avatar}
                  employeeName={currentScenario.employee_name}
                  onSendMessage={handleSendMessage}
                />
              </TabsContent>
              <TabsContent value="feedback" className="mt-4">
                <FeedbackPanel
                  feedback={feedback}
                  scenarioParam={currentScenario.id}
                  onPracticeAgain={resetConversation}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
