import { render, screen } from "@testing-library/react";
import { FeaturesSection } from "./features-section";

describe("FeaturesSection", () => {
  it("renders the section header with correct content", () => {
    render(<FeaturesSection />);

    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Why LeadBuddy Works")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Our platform uses advanced AI to create realistic conversation scenarios that help managers improve their communication skills."
      )
    ).toBeInTheDocument();
  });

  it("renders all features with correct titles and descriptions", () => {
    render(<FeaturesSection />);

    const features = [
      {
        title: "Realistic Simulations",
        description:
          "Practice with AI-powered employees that respond naturally to your communication style.",
      },
      {
        title: "Instant Feedback",
        description:
          "Receive detailed analysis on your tone, clarity, empathy, and effectiveness.",
      },
      {
        title: "Custom Scenarios",
        description:
          "Create your own scenarios to practice specific conversations relevant to your needs.",
      },
    ];

    features.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });
  });
});
