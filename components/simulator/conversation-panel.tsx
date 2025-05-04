"use client";

import { useState } from "react";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: "human" | "ai";
  content: string;
}

interface ConversationPanelProps {
  messages: Message[];
  isLoading: boolean;
  employeeAvatar: string;
  employeeName: string;
  onSendMessage: (message: string) => void;
  isChatEnded: boolean;
}

export function ConversationPanel({
  messages,
  isLoading,
  employeeAvatar,
  employeeName,
  onSendMessage,
  isChatEnded,
}: ConversationPanelProps) {
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    onSendMessage(input);
    setInput("");
  };

  const handleEndConversation = () => {
    onSendMessage("End conversation");
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              {employeeAvatar}
            </div>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{employeeName}</CardTitle>
            <CardDescription>Employee</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "human" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === "human" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar>
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                    {message.role === "human" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      employeeAvatar
                    )}
                  </div>
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === "human"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar>
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                    {employeeAvatar}
                  </div>
                </Avatar>
                <div className="rounded-lg p-3 bg-muted">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-3">
        {!isChatEnded ? (
          <div className="flex w-full items-center space-x-2">
            <form
              className="flex w-full items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <Textarea
                disabled={isLoading}
                id="message"
                placeholder="Type your message..."
                className="flex-1 min-h-10 resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input.trim() === ""}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <Button
              variant="outline"
              onClick={handleEndConversation}
              disabled={isLoading}
              aria-label="End conversation and view feedback"
            >
              End Conversation
            </Button>
          </div>
        ) : (
          <div className="text-center w-full text-gray-500">
            Conversation ended. View feedback or start a new conversation.
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
