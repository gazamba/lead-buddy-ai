import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Scenario } from "@/lib/types";

interface ScenarioContextProps {
  scenarios: Scenario[];
  currentScenario: Scenario | null;
  setCurrentScenario: (scenario: Scenario | null) => void;
  isLoading: boolean;
}

export function ScenarioContext({
  scenarios,
  currentScenario,
  setCurrentScenario,
  isLoading,
}: ScenarioContextProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentScenario) {
    return <div>No scenario selected</div>;
  }

  const tips = currentScenario.tips || [
    "Be clear and specific in your communication",
    "Balance positive feedback with areas for improvement",
    "Ask open-ended questions to understand perspectives",
    "Show empathy while maintaining professionalism",
    "End with clear next steps or expectations",
  ];

  return (
    <div className="space-y-4 lg:col-span-1">
      <div className="space-y-2">
        {/* <h1 className="text-2xl font-bold tracking-tight">{title}</h1> */}
        <p className="text-gray-500">{currentScenario.description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Scenario Context</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{currentScenario.context}</p>
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
  );
}
