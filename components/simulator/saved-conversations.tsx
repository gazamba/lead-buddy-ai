"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trash2, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getConversations, deleteConversation } from "@/lib/api";
import type { SavedConversation } from "@/lib/types";
import { useAuth } from "../auth-provider";

interface SavedConversationsProps {
  onLoadConversation: (conversation: SavedConversation) => void;
}

export function SavedConversations({
  onLoadConversation,
}: SavedConversationsProps) {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<SavedConversation | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { user } = useAuth();

  const loadConversations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, user]);

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      setConversations(conversations.filter((conv) => conv.id !== id));
      setConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleLoadConversation = (conversation: SavedConversation) => {
    onLoadConversation(conversation);
    setIsOpen(false);
  };

  return (
    <>
      {user ? (
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <MessageSquare className="h-4 w-4 mr-1" /> Saved Conversations
        </Button>
      ) : (
        <></>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Saved Conversations</DialogTitle>
            <DialogDescription>
              Load a previously saved conversation to continue where you left
              off.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No saved conversations found.
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {conversation.name}
                          </CardTitle>
                          <CardDescription>
                            {conversation.scenarios?.title} •{" "}
                            {format(
                              new Date(conversation.created_at),
                              "MMM d, yyyy"
                            )}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConversation(conversation);
                            setConfirmDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {Array.isArray(conversation.messages)
                          ? conversation.messages.length
                          : 0}{" "}
                        messages
                      </div>
                      <Button
                        variant="ghost"
                        className="mt-2 w-full justify-between"
                        onClick={() => handleLoadConversation(conversation)}
                      >
                        Load Conversation
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
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
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedConversation &&
                handleDeleteConversation(selectedConversation.id)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
