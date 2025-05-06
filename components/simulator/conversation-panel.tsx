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
import type { Message } from "@/lib/types";

interface ConversationPanelProps {
  messages: Message[];
  isLoading: boolean;
  tips: string[];
}

export function ConversationPanel({
  messages,
  isLoading,
  tips,
}: ConversationPanelProps) {
  return (
    <Card className="flex-1 overflow-auto">
      <CardContent className="p-6">
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
                      "AI"
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
                    AI
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
    </Card>
  );
}
