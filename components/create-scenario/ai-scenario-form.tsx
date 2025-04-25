"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AIScenarioFormProps {
  onGenerate: (scenario: {
    title: string;
    description: string;
    employeeName: string;
    context: string;
    tips: string[];
  }) => void;
}

export function AIScenarioForm({ onGenerate }: AIScenarioFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");

  const generateScenario = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      let generatedTitle = "";
      let generatedDescription = "";
      let generatedEmployeeName = "";
      let generatedContext = "";
      let generatedTips: string[] = [];

      if (prompt.toLowerCase().includes("performance")) {
        generatedTitle = "Performance Improvement";
        generatedDescription =
          "Address declining performance with a team member who was previously a top performer.";
        generatedEmployeeName = "Jamie";
        generatedContext =
          "Jamie has been on your team for 3 years and was previously one of your top performers. However, in the last 2 months, their work quality has declined significantly. You need to address this change while understanding potential underlying causes.";
        generatedTips = [
          "Start with positive recognition of past performance",
          "Use specific examples of recent issues",
          "Ask open-ended questions about potential challenges",
          "Offer support and resources",
          "Establish clear expectations going forward",
        ];
      } else if (prompt.toLowerCase().includes("conflict")) {
        generatedTitle = "Team Conflict Resolution";
        generatedDescription =
          "Mediate a conflict between two valuable team members with different working styles.";
        generatedEmployeeName = "Alex";
        generatedContext =
          "Alex and Jordan, both valuable team members, have been having increasing conflicts over project approaches. Alex prefers structured planning while Jordan favors agile iteration. Their disagreements are affecting team morale and project timelines.";
        generatedTips = [
          "Remain neutral and avoid taking sides",
          "Focus on behaviors and impacts, not personalities",
          "Identify common goals and shared values",
          "Facilitate compromise and collaborative solutions",
          "Document agreements and follow up consistently",
        ];
      } else {
        generatedTitle = "Custom Scenario";
        generatedDescription =
          "A personalized management scenario based on your prompt.";
        generatedEmployeeName = "Taylor";
        generatedContext = `This scenario is about: ${prompt}. You'll need to navigate this conversation carefully, considering both business needs and employee well-being.`;
        generatedTips = [
          "Listen actively and empathetically",
          "Consider both business needs and personal factors",
          "Be clear about expectations and outcomes",
          "Document your conversation and next steps",
          "Follow up appropriately",
        ];
      }

      onGenerate({
        title: generatedTitle,
        description: generatedDescription,
        employeeName: generatedEmployeeName,
        context: generatedContext,
        tips: generatedTips,
      });

      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate with AI</CardTitle>
        <CardDescription>
          Describe the management scenario you want to practice, and our AI will
          create it for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your scenario</Label>
            <Textarea
              id="prompt"
              placeholder="Example: I need to give feedback to a team member who has been consistently late to meetings but is otherwise a strong performer."
              className="min-h-[120px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={generateScenario}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Scenario
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
