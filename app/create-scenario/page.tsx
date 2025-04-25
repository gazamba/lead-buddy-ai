"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NavHeader } from "@/components/layout/nav-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createScenario } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export default function CreateScenarioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeAvatar, setEmployeeAvatar] = useState("");
  const [tips, setTips] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const tipsArray = tips
        .split("\n")
        .map((tip) => tip.trim())
        .filter((tip) => tip.length > 0);

      const scenario = await createScenario({
        title,
        description,
        context,
        employee_name: employeeName,
        employee_avatar: employeeAvatar || employeeName.charAt(0).toUpperCase(),
        tips: tipsArray,
      });

      router.push(`/simulator?id=${scenario.id}`);
    } catch (error) {
      console.error("Error creating scenario:", error);
      setError("Failed to create scenario. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavHeader />
      <main className="flex-1 container py-6 px-4 md:px-6 md:py-10">
        <h1 className="text-3xl font-bold mb-6">Create a New Scenario</h1>

        <Card className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Scenario Details</CardTitle>
              <CardDescription>
                Create a custom scenario for practicing critical conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Scenario Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Performance Improvement Discussion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Address declining performance with a team member"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Conversation Context</Label>
                <Textarea
                  id="context"
                  placeholder="Describe the situation, background, and what you need to discuss..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-name">Employee Name</Label>
                  <Input
                    id="employee-name"
                    placeholder="e.g., Alex"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-avatar">
                    Employee Avatar (Optional)
                  </Label>
                  <Input
                    id="employee-avatar"
                    placeholder="e.g., A (single letter)"
                    value={employeeAvatar}
                    onChange={(e) => setEmployeeAvatar(e.target.value)}
                    maxLength={1}
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to use first letter of name
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tips">Conversation Tips (Optional)</Label>
                <Textarea
                  id="tips"
                  placeholder="Enter tips for this conversation, one per line..."
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Enter each tip on a new line. If left empty, default tips will
                  be used.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Scenario"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
