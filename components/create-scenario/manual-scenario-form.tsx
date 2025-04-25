"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ManualScenarioFormProps {
  title: string
  description: string
  employeeName: string
  context: string
  tips: string[]
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onEmployeeNameChange: (name: string) => void
  onContextChange: (context: string) => void
  onSave: () => void
}

export function ManualScenarioForm({
  title,
  description,
  employeeName,
  context,
  tips,
  onTitleChange,
  onDescriptionChange,
  onEmployeeNameChange,
  onContextChange,
  onSave,
}: ManualScenarioFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scenario Details</CardTitle>
          <CardDescription>Define the basic information about your management scenario.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Scenario Title*</Label>
              <Input
                id="title"
                placeholder="e.g., Performance Improvement Discussion"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Short Description*</Label>
              <Input
                id="description"
                placeholder="e.g., Address declining performance with a previously strong team member"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-name">Employee Name*</Label>
              <Input
                id="employee-name"
                placeholder="e.g., Jamie"
                value={employeeName}
                onChange={(e) => onEmployeeNameChange(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                This will be used to create the employee avatar in the simulation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Context</CardTitle>
          <CardDescription>Provide detailed background information for the conversation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="context">Context Details*</Label>
            <Textarea
              id="context"
              placeholder="Describe the situation, history, and relevant details for this conversation..."
              className="min-h-[150px]"
              value={context}
              onChange={(e) => onContextChange(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={onSave}>
          Create & Start Simulation
        </Button>
      </div>
    </div>
  )
}
