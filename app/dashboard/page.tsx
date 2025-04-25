"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, MessageSquare, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NavHeader } from "@/components/layout/nav-header";
import {
  getScenarios,
  deleteScenario,
  getConversations,
  deleteConversation,
} from "@/lib/api";
import type { Scenario, SavedConversation } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scenarios");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteScenario, setConfirmDeleteScenario] = useState<
    string | null
  >(null);
  const [confirmDeleteConversation, setConfirmDeleteConversation] = useState<
    string | null
  >(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const [scenariosData, conversationsData] = await Promise.all([
          getScenarios(),
          getConversations(),
        ]);

        setScenarios(scenariosData);
        setConversations(conversationsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleDeleteScenario = async (id: string) => {
    try {
      await deleteScenario(id);
      setScenarios(scenarios.filter((scenario) => scenario.id !== id));
      setConfirmDeleteScenario(null);
    } catch (error) {
      console.error("Error deleting scenario:", error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      setConversations(
        conversations.filter((conversation) => conversation.id !== id)
      );
      setConfirmDeleteConversation(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavHeader />
      <main className="flex-1 container py-6 px-4 md:px-6 md:py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link href="/create-scenario">
              <Plus className="mr-2 h-4 w-4" />
              Create Scenario
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="scenarios">My Scenarios</TabsTrigger>
            <TabsTrigger value="conversations">Saved Conversations</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="mb-4">Loading scenarios...</div>
                <div className="flex space-x-2 justify-center">
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            ) : scenarios.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No scenarios found</h3>
                <p className="text-gray-500 mb-6">
                  Create your first scenario to get started
                </p>
                <Button asChild>
                  <Link href="/create-scenario">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Scenario
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {scenarios.map((scenario) => (
                  <Card key={scenario.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{scenario.title}</CardTitle>
                        {scenario.is_custom && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setConfirmDeleteScenario(scenario.id)
                            }
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                          </Button>
                        )}
                      </div>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-500 line-clamp-3">
                        {scenario.context}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-xs text-gray-500">
                        {scenario.is_custom ? "Custom" : "Default"} •{" "}
                        {scenario.created_at
                          ? format(new Date(scenario.created_at), "MMM d, yyyy")
                          : "Unknown Date"}
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/simulator?id=${scenario.id}`}>
                          <Play className="mr-2 h-3 w-3" />
                          Practice
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="conversations">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="mb-4">Loading conversations...</div>
                <div className="flex space-x-2 justify-center">
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No saved conversations
                </h3>
                <p className="text-gray-500 mb-6">
                  Your saved conversations will appear here
                </p>
                <Button asChild>
                  <Link href="/simulator">
                    <Play className="mr-2 h-4 w-4" />
                    Start Practicing
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {conversations.map((conversation) => (
                  <Card key={conversation.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{conversation.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setConfirmDeleteConversation(conversation.id)
                          }
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                      </div>
                      <CardDescription>
                        {conversation.scenarios?.title || "Unknown Scenario"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Saved on{" "}
                        {format(
                          new Date(conversation.created_at),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" className="w-full" asChild>
                        <Link
                          href={`/simulator?conversation=${conversation.id}`}
                        >
                          <Play className="mr-2 h-3 w-3" />
                          Continue Conversation
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog
        open={!!confirmDeleteScenario}
        onOpenChange={() => setConfirmDeleteScenario(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scenario</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scenario? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteScenario(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmDeleteScenario &&
                handleDeleteScenario(confirmDeleteScenario)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmDeleteConversation}
        onOpenChange={() => setConfirmDeleteConversation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteConversation(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmDeleteConversation &&
                handleDeleteConversation(confirmDeleteConversation)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
