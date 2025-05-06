import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { getScenarios } from "@/lib/api";

export async function ScenariosSection() {
  let scenarios = [];
  try {
    scenarios = await getScenarios();
  } catch (error) {
    console.error("Failed to fetch scenarios:", error);
    // Use default scenarios if the API is not available
    scenarios = [
      {
        id: "performance-review",
        title: "Performance Review",
        description:
          "Practice giving constructive feedback in a performance review setting.",
      },
      {
        id: "team-conflict",
        title: "Team Conflict",
        description:
          "Learn how to mediate and resolve conflicts between team members.",
      },
      {
        id: "career-development",
        title: "Career Development",
        description:
          "Guide employees through career growth and development discussions.",
      },
    ];
  }

  return (
    <section
      id="scenarios"
      className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <SectionHeader
            label="Scenarios"
            title="Practice What Matters"
            description="Choose from a variety of challenging management scenarios to improve your skills."
          />
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="flex flex-col space-y-3 rounded-lg border p-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <h3 className="text-xl font-bold">{scenario.title}</h3>
              <p className="text-gray-500">{scenario.description}</p>

              <Link
                href={`/simulator?scenario=${scenario.id
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <Button variant="ghost" className="mt-auto">
                  Practice <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
          <div className="flex flex-col space-y-3 rounded-lg border p-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <h3 className="text-xl font-bold">Custom Scenario</h3>
            <p className="text-gray-500">
              Create your own scenario tailored to your specific needs.
            </p>
            <Link href="/create-scenario">
              <Button variant="ghost" className="mt-auto">
                Create <Wand2 className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
