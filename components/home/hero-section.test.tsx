import { render, screen } from "@testing-library/react";
import { HeroSection } from "./hero-section";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe("HeroSection", () => {
  it("renders the heading", () => {
    render(<HeroSection />);
    const heading = screen.getByRole("heading", {
      name: /Master Critical Conversations with AI-Powered Practice/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<HeroSection />);
    const description = screen.getByText(
      /Improve your management skills through realistic simulations of feedback sessions, performance reviews, and difficult conversations./i
    );
    expect(description).toBeInTheDocument();
  });

  it("renders the 'Try a Simulation' button", () => {
    render(<HeroSection />);
    const trySimulationButton = screen.getByRole("button", {
      name: /Try a Simulation/i,
    });
    expect(trySimulationButton).toBeInTheDocument();
  });

  it("renders the 'Create Your Scenario' button", () => {
    render(<HeroSection />);
    const createScenarioButton = screen.getByRole("button", {
      name: /Create Your Scenario/i,
    });
    expect(createScenarioButton).toBeInTheDocument();
  });
});
