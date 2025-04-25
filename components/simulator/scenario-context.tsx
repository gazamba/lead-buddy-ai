import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScenarioContextProps {
  title: string
  description: string
  context: string
  tips: string[]
}

export function ScenarioContext({ title, description, context, tips }: ScenarioContextProps) {
  return (
    <div className="space-y-4 lg:col-span-1">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Scenario Context</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{context}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tips for Success</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc list-inside text-sm">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
