"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ConversationActionsProps {
  onSendMessage: (input: string) => Promise<void>;
  onEndChat: () => Promise<void>;
  isChatEnded: boolean;
}

export function ConversationActions({
  onSendMessage,
  onEndChat,
  isChatEnded,
}: ConversationActionsProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading) return;
    setIsLoading(true);
    try {
      await onSendMessage(input);
      setInput("");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChatEnded) {
    return (
      <div className="border-t p-4 text-center text-gray-500">
        Conversation ended. View feedback or start a new conversation.
      </div>
    );
  }

  return (
    <div className="border-t p-4">
      <form
        className="flex items-center gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSendMessage();
        }}
      >
        <Textarea
          disabled={isLoading}
          id="message"
          placeholder="Type your message..."
          className="flex-1 min-h-10 resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              await handleSendMessage();
            }
          }}
        />
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || input.trim() === ""}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
          <Button
            variant="outline"
            onClick={onEndChat}
            disabled={isLoading}
            type="button"
          >
            End Chat
          </Button>
        </div>
      </form>
    </div>
  );
}
