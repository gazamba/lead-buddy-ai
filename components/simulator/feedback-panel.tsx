"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Feedback } from "@/lib/types";

interface FeedbackPanelProps {
  feedback: Feedback | null;
  onGenerateFeedback: () => Promise<void>;
}

export function FeedbackPanel({
  feedback,
  onGenerateFeedback,
}: FeedbackPanelProps) {
  if (!feedback) {
    return (
      <Card className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <CardContent className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-4">
            Keep the conversation flowing to unlock your feedback! 🚀
          </p>
          <Button onClick={onGenerateFeedback}>Generate Feedback</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 overflow-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
        <CardTitle className="text-2xl font-bold">
          Your Feedback Report
        </CardTitle>
        <CardDescription className="text-blue-100">
          Insights to level up your mentoring skills! 🎯
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                SBI Model Usage
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {feedback.sbi_usage.score}%
              </span>
            </div>
            <Progress
              value={feedback.sbi_usage.score}
              className="h-2 bg-gray-200 dark:bg-gray-700"
            />
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              {feedback.sbi_usage.description}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Action Plan Clarity
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {feedback.action_plan.score}%
              </span>
            </div>
            <Progress
              value={feedback.action_plan.score}
              className="h-2 bg-gray-200 dark:bg-gray-700"
            />
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              {feedback.action_plan.description}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Feedback Balance
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {feedback.balance.score}%
              </span>
            </div>
            <Progress
              value={feedback.balance.score}
              className="h-2 bg-gray-200 dark:bg-gray-700"
            />
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              {feedback.balance.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg text-gray-800 dark:text-gray-100 mb-2">
              Key Takeaways
            </h3>
            <div className="space-y-2">
              {feedback.overall.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 border-blue-200 dark:border-blue-800"
                  >
                    Insight
                  </Badge>
                  <p className="text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
