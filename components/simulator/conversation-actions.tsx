"use client";

import { useState } from "react";
import { Save, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createConversation } from "@/lib/api";
import type { Message } from "@/lib/types";
import { useAuth } from "../auth-provider";

interface ConversationActionsProps {
  messages: Message[];
  scenarioId: string;
  scenarioTitle: string;
  onReset: () => void;
}

export function ConversationActions({
  messages,
  scenarioId,
  scenarioTitle,
  onReset,
}: ConversationActionsProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [conversationName, setConversationName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSaveConversation = async () => {
    if (!conversationName.trim() || !user) return;

    setIsLoading(true);

    try {
      await createConversation({
        scenario_id: scenarioId,
        name: conversationName,
        messages: messages,
      });

      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
        setSaveDialogOpen(false);
        setConversationName("");
      }, 2000);
    } catch (error) {
      console.error("Error saving conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSaveDialogOpen(true)}
        disabled={messages.length <= 1}
      >
        <Save className="h-4 w-4 mr-1" /> Save Conversation
      </Button>
      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="h-4 w-4 mr-1" /> Reset
      </Button>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {saveSuccess ? (
                <div className="flex items-center text-green-600">
                  <Check className="mr-2 h-5 w-5" /> Conversation Saved
                </div>
              ) : (
                "Save Conversation"
              )}
            </DialogTitle>
            <DialogDescription>
              {saveSuccess
                ? "Your conversation has been saved successfully."
                : "Save this conversation to review later or continue where you left off."}
            </DialogDescription>
          </DialogHeader>

          {!saveSuccess && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="conversation-name">Conversation Name</Label>
                  <Input
                    id="conversation-name"
                    placeholder="e.g., Performance Review Practice #1"
                    value={conversationName}
                    onChange={(e) => setConversationName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSaveDialogOpen(false)}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button
                  onClick={handleSaveConversation}
                  disabled={!conversationName.trim() || isLoading}
                >
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
