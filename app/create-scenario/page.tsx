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
import { createScenario, createScenarioTips } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export default function CreateScenarioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("context", context);
      formData.append("employeeName", employeeName);

      const tips = await createScenarioTips(formData);

      const scenario = await createScenario({
        title,
        description,
        context,
        employee_name: employeeName,
        employee_avatar: employeeName.charAt(0).toUpperCase(),
        tips: tips,
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

              <div className="grid grid-cols gap-4">
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
