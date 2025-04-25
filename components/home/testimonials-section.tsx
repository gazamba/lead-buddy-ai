import Link from "next/link"
import { Star, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "LeadBuddy has completely transformed how I approach difficult conversations. The realistic simulations helped me practice delivering tough feedback in a way that's both honest and empathetic.",
      author: "Jennifer Davis",
      role: "Engineering Manager, TechCorp",
      initials: "JD",
    },
    {
      quote:
        "As a new manager, I was terrified of performance reviews. After practicing with LeadBuddy, I feel confident and prepared. The instant feedback helped me identify my strengths and areas for improvement.",
      author: "Marcus Rodriguez",
      role: "Team Lead, Finance Plus",
      initials: "MR",
    },
    {
      quote:
        "I had to let go of a team member and was dreading the conversation. The termination scenario in LeadBuddy helped me prepare to handle it with professionalism and compassion. It made a difficult situation much more manageable.",
      author: "Sarah Kim",
      role: "HR Director, Global Retail",
      initials: "SK",
    },
  ]

  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <SectionHeader
            label="Testimonials"
            title="What Managers Say"
            description="Hear from managers who have transformed their communication skills with our platform."
          />
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="flex-1">
                <p className="text-lg font-medium leading-relaxed mb-4">{testimonial.quote}</p>
              </blockquote>
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-semibold text-slate-700 dark:text-slate-200">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link href="/create-scenario">
            <Button size="lg">
              Create Your First Scenario <Wand2 className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
