"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { NavHeader } from "@/components/layout/nav-header";
import { ScenarioContext } from "@/components/simulator/scenario-context";
import { ConversationPanel } from "@/components/simulator/conversation-panel";
import { FeedbackPanel } from "@/components/simulator/feedback-panel";
import { ConversationActions } from "@/components/simulator/conversation-actions";
import { SavedConversations } from "@/components/simulator/saved-conversations";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getScenarios, getScenarioById, getConversationById } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import type {
  Message,
  Feedback,
  Scenario,
  SavedConversation,
} from "@/lib/types";
import { useAuth } from "@/components/auth-provider";
import { v4 as uuidv4 } from "uuid";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const conversationId = searchParams.get("conversation");

  const { user } = useAuth();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);
  const [isChatEnded, setIsChatEnded] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeTab, setActiveTab] = useState("conversation");
  const [sessionId, setSessionId] = useState<string | null>(conversationId);

  const defaultTips = [
    "Be clear and specific in your communication",
    "Balance positive feedback with areas for improvement",
    "Ask open-ended questions to understand perspectives",
    "Show empathy while maintaining professionalism",
    "End with clear next steps or expectations",
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingScenarios(true);
      try {
        if (conversationId) {
          const conversation = await getConversationById(conversationId);
          if (conversation) {
            setMessages(conversation.messages as Message[]);
            setSessionId(conversationId);
            if (conversation.scenarios) {
              setCurrentScenario(conversation.scenarios as Scenario);
            }
          }
        } else {
          const scenariosData = await getScenarios();
          setScenarios(scenariosData);
          let selectedScenario: Scenario | null = null;

          if (scenarioId) {
            selectedScenario =
              scenariosData.find((s: Scenario) => s.id === scenarioId) ||
              (await getScenarioById(scenarioId));
          }
          setCurrentScenario(selectedScenario || scenariosData[0] || null);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load scenarios or conversation.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingScenarios(false);
      }
    };

    loadData();
  }, [scenarioId, conversationId, toast]);

  useEffect(() => {
    if (currentScenario && !conversationId) {
      resetConversation();
    }
  }, [currentScenario, conversationId]);

  const resetConversation = async () => {
    if (!currentScenario) {
      console.error("No current scenario available");
      toast({
        title: "Error",
        description: "No scenario selected. Please select a scenario.",
        variant: "destructive",
      });
      return;
    }

    const newSessionId = uuidv4();
    console.log("Starting new conversation with sessionId:", newSessionId);

    setSessionId(newSessionId);
    setMessages([]);
    setFeedback(null);
    setActiveTab("conversation");
    setIsChatEnded(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: newSessionId,
          employeeName: currentScenario.employee_name,
          context: currentScenario.context,
          scenarioId: currentScenario.id,
        }),
      });
      const data = await response.json();

      if (data.response) {
        console.log("Initial AI response:", data.response);
        setMessages([
          {
            id: Date.now().toString(),
            role: "ai",
            content: data.response,
          },
        ]);
      } else {
        console.error("API error:", data.error);
        toast({
          title: "Error",
          description: "Failed to start conversation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (input: string) => {
    if (input.trim() === "" || !currentScenario || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "human",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log("Sending message:", { input, sessionId });
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          sessionId,
          employeeName: currentScenario.employee_name,
          context: currentScenario.context,
          scenarioId: currentScenario.id,
        }),
      });
      const data = await response.json();
      console.log("API response:", data);

      if (data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        console.error("Error:", data.error);
        toast({
          title: "Error",
          description: "Failed to send message.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFeedback = async () => {
    if (!currentScenario || !sessionId) {
      console.error("Missing scenario or session ID");
      toast({
        title: "Error",
        description:
          "Cannot generate feedback without a valid scenario or session.",
        variant: "destructive",
      });
      return;
    }

    // Check for minimum human messages
    const humanMessages = messages.filter((msg) => msg.role === "human");
    if (humanMessages.length < 2) {
      console.log("Not enough human messages to generate feedback");
      toast({
        title: "Insufficient Conversation",
        description:
          "Please provide at least two responses to Casey before ending the conversation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Generating feedback with messages:", messages);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "End conversation",
          sessionId,
          employeeName: currentScenario.employee_name,
          context: currentScenario.context,
          scenarioId: currentScenario.id,
        }),
      });
      const data = await response.json();
      console.log("Feedback API response:", data);

      if (data.feedback) {
        setFeedback(data.feedback);
        setIsChatEnded(true);
        setActiveTab("feedback");
        if (data.feedback.sbi_usage.score === 0) {
          toast({
            title: "Insufficient Feedback",
            description:
              "Please provide detailed feedback to Casey using the SBI model (Situation, Behavior, Impact), include an action plan, and balance praise with constructive feedback.",
            variant: "destructive",
          });
        }
      } else {
        console.error("Error:", data.error);
        toast({
          title: "Error",
          description: "Failed to generate feedback.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to generate feedback.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadConversation = async (conversation: SavedConversation) => {
    const scenario = scenarios.find((s) => s.id === conversation.scenario_id);
    if (scenario) {
      setCurrentScenario(scenario);
    } else if (conversation.scenarios) {
      setCurrentScenario(conversation.scenarios as Scenario);
    }

    setMessages(conversation.messages);
    setSessionId(conversation.id);
    setIsChatEnded(false);
    setActiveTab("conversation");
    setFeedback(null);
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
    <div className="flex h-screen flex-col">
      <NavHeader />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1">
          <div className="flex w-full flex-col xl:flex-row">
            <div className="flex w-full flex-col xl:w-1/4">
              <ScenarioContext
                scenarios={scenarios}
                currentScenario={currentScenario}
                setCurrentScenario={setCurrentScenario}
                isLoading={isLoadingScenarios}
              />
              <SavedConversations onLoadConversation={handleLoadConversation} />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden xl:w-3/4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex h-full flex-col"
              >
                <div className="flex items-center justify-between border-b px-4 py-2">
                  <TabsList>
                    <TabsTrigger value="conversation">Conversation</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetConversation}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                <TabsContent
                  value="conversation"
                  className="flex-1 overflow-hidden data-[state=inactive]:hidden"
                >
                  <ConversationPanel
                    messages={messages}
                    isLoading={isLoading}
                    tips={currentScenario?.tips || defaultTips}
                  />
                  <ConversationActions
                    onSendMessage={handleSendMessage}
                    onEndChat={generateFeedback}
                    isChatEnded={isChatEnded}
                  />
                </TabsContent>
                <TabsContent
                  value="feedback"
                  className="flex-1 overflow-auto data-[state=inactive]:hidden"
                >
                  <FeedbackPanel
                    feedback={feedback}
                    onGenerateFeedback={generateFeedback}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SimulatorContent />
    </Suspense>
  );
}
