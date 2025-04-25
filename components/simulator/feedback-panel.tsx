"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface Feedback {
  clarity: number
  empathy: number
  effectiveness: number
  strengths: string[]
  improvements: string[]
  summary: string
}

interface FeedbackPanelProps {
  feedback: Feedback | null
  scenarioParam: string
  onPracticeAgain: () => void
}

export function FeedbackPanel({ feedback, scenarioParam, onPracticeAgain }: FeedbackPanelProps) {
  if (!feedback) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <CardContent>
          <p className="text-center text-gray-500">
            Continue the conversation to receive feedback on your communication.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] overflow-auto">
      <CardHeader>
        <CardTitle>Conversation Feedback</CardTitle>
        <CardDescription>Analysis of your communication style and effectiveness</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Clarity</span>
              <span className="text-sm text-gray-500">{feedback.clarity}%</span>
            </div>
            <Progress value={feedback.clarity} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Empathy</span>
              <span className="text-sm text-gray-500">{feedback.empathy}%</span>
            </div>
            <Progress value={feedback.empathy} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Effectiveness</span>
              <span className="text-sm text-gray-500">{feedback.effectiveness}%</span>
            </div>
            <Progress value={feedback.effectiveness} className="h-2" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Strengths</h3>
            <div className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100 border-green-200 dark:border-green-800"
                  >
                    Strength
                  </Badge>
                  <p>{strength}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Areas for Improvement</h3>
            <div className="space-y-2">
              {feedback.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-100 border-amber-200 dark:border-amber-800"
                  >
                    Improve
                  </Badge>
                  <p>{improvement}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Summary</h3>
            <p className="text-gray-700">{feedback.summary}</p>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={onPracticeAgain}>Practice Again</Button>
        </div>
      </CardContent>
    </Card>
  )
}
