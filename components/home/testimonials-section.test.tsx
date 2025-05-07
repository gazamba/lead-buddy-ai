import { render, screen } from "@testing-library/react";
import { TestimonialsSection } from "./testimonials-section";

describe("TestimonialsSection", () => {
  it("renders the section header with correct text", () => {
    render(<TestimonialsSection />);
    expect(screen.getByText("Testimonials")).toBeInTheDocument();
    expect(screen.getByText("What Managers Say")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Hear from managers who have transformed their communication skills with our platform."
      )
    ).toBeInTheDocument();
  });

  it("renders all testimonials", () => {
    render(<TestimonialsSection />);
    const testimonials = [
      "LeadBuddy has completely transformed how I approach difficult conversations. The realistic simulations helped me practice delivering tough feedback in a way that's both honest and empathetic.",
      "As a new manager, I was terrified of performance reviews. After practicing with LeadBuddy, I feel confident and prepared. The instant feedback helped me identify my strengths and areas for improvement.",
      "I had to let go of a team member and was dreading the conversation. The termination scenario in LeadBuddy helped me prepare to handle it with professionalism and compassion. It made a difficult situation much more manageable.",
    ];

    testimonials.forEach((quote) => {
      expect(screen.getByText(quote)).toBeInTheDocument();
    });
  });

  it("renders author names and roles", () => {
    render(<TestimonialsSection />);
    const authors = [
      { name: "Jennifer Davis", role: "Engineering Manager, TechCorp" },
      { name: "Marcus Rodriguez", role: "Team Lead, Finance Plus" },
      { name: "Sarah Kim", role: "HR Director, Global Retail" },
    ];

    authors.forEach(({ name, role }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByText(role)).toBeInTheDocument();
    });
  });

  it("renders the create scenario button", () => {
    render(<TestimonialsSection />);
    const button = screen.getByRole("button", {
      name: /Create Your First Scenario/i,
    });
    expect(button).toBeInTheDocument();
  });
});
