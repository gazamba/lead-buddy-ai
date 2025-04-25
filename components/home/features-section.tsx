import { MessageSquare, BarChart, Wand2 } from "lucide-react"
import { SectionHeader } from "@/components/ui/section-header"

export function FeaturesSection() {
  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-slate-700 dark:text-slate-200" />,
      title: "Realistic Simulations",
      description: "Practice with AI-powered employees that respond naturally to your communication style.",
    },
    {
      icon: <BarChart className="h-8 w-8 text-slate-700 dark:text-slate-200" />,
      title: "Instant Feedback",
      description: "Receive detailed analysis on your tone, clarity, empathy, and effectiveness.",
    },
    {
      icon: <Wand2 className="h-8 w-8 text-slate-700 dark:text-slate-200" />,
      title: "Custom Scenarios",
      description: "Create your own scenarios to practice specific conversations relevant to your needs.",
    },
  ]

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <SectionHeader
            label="Features"
            title="Why LeadBuddy Works"
            description="Our platform uses advanced AI to create realistic conversation scenarios that help managers improve their communication skills."
          />
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
