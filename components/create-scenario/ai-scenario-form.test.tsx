import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { AIScenarioForm } from "./ai-scenario-form";

describe("AIScenarioForm", () => {
  it("renders the form correctly", () => {
    render(<AIScenarioForm onGenerate={vi.fn()} />);

    expect(screen.getByText("Generate with AI")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Describe the management scenario you want to practice, and our AI will create it for you."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Describe your scenario")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Generate Scenario/i })
    ).toBeInTheDocument();
  });

  it("disables the button when the prompt is empty", () => {
    render(<AIScenarioForm onGenerate={vi.fn()} />);

    const button = screen.getByRole("button", { name: /Generate Scenario/i });
    expect(button).toBeDisabled();
  });

  it("enables the button when the prompt is filled", () => {
    render(<AIScenarioForm onGenerate={vi.fn()} />);

    const textarea = screen.getByLabelText("Describe your scenario");
    fireEvent.change(textarea, { target: { value: "performance" } });

    const button = screen.getByRole("button", { name: /Generate Scenario/i });
    expect(button).not.toBeDisabled();
  });

  it("calls onGenerate with the correct data for 'performance' prompt", async () => {
    const onGenerateMock = vi.fn();
    render(<AIScenarioForm onGenerate={onGenerateMock} />);

    const textarea = screen.getByLabelText("Describe your scenario");
    fireEvent.change(textarea, { target: { value: "performance" } });

    const button = screen.getByRole("button", { name: /Generate Scenario/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(onGenerateMock).toHaveBeenCalledWith({
      title: "Performance Improvement",
      description:
        "Address declining performance with a team member who was previously a top performer.",
      employeeName: "Jamie",
      context:
        "Jamie has been on your team for 3 years and was previously one of your top performers. However, in the last 2 months, their work quality has declined significantly. You need to address this change while understanding potential underlying causes.",
      tips: [
        "Start with positive recognition of past performance",
        "Use specific examples of recent issues",
        "Ask open-ended questions about potential challenges",
        "Offer support and resources",
        "Establish clear expectations going forward",
      ],
    });
  });

  it("calls onGenerate with the correct data for 'conflict' prompt", async () => {
    const onGenerateMock = vi.fn();
    render(<AIScenarioForm onGenerate={onGenerateMock} />);

    const textarea = screen.getByLabelText("Describe your scenario");
    fireEvent.change(textarea, { target: { value: "conflict" } });

    const button = screen.getByRole("button", { name: /Generate Scenario/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(onGenerateMock).toHaveBeenCalledWith({
      title: "Team Conflict Resolution",
      description:
        "Mediate a conflict between two valuable team members with different working styles.",
      employeeName: "Alex",
      context:
        "Alex and Jordan, both valuable team members, have been having increasing conflicts over project approaches. Alex prefers structured planning while Jordan favors agile iteration. Their disagreements are affecting team morale and project timelines.",
      tips: [
        "Remain neutral and avoid taking sides",
        "Focus on behaviors and impacts, not personalities",
        "Identify common goals and shared values",
        "Facilitate compromise and collaborative solutions",
        "Document agreements and follow up consistently",
      ],
    });
  });

  it("calls onGenerate with the correct data for a custom prompt", async () => {
    const onGenerateMock = vi.fn();
    render(<AIScenarioForm onGenerate={onGenerateMock} />);

    const textarea = screen.getByLabelText("Describe your scenario");
    fireEvent.change(textarea, { target: { value: "custom scenario" } });

    const button = screen.getByRole("button", { name: /Generate Scenario/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(onGenerateMock).toHaveBeenCalledWith({
      title: "Custom Scenario",
      description: "A personalized management scenario based on your prompt.",
      employeeName: "Taylor",
      context:
        "This scenario is about: custom scenario. You'll need to navigate this conversation carefully, considering both business needs and employee well-being.",
      tips: [
        "Listen actively and empathetically",
        "Consider both business needs and personal factors",
        "Be clear about expectations and outcomes",
        "Document your conversation and next steps",
        "Follow up appropriately",
      ],
    });
  });
});
