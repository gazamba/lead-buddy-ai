import { render, screen } from "@testing-library/react";
import { ScenariosSection } from "./scenarios-section";
import { getScenarios } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getScenarios: vi.fn(),
}));

describe("ScenariosSection", () => {
  it("renders default scenarios when API fails", async () => {
    (getScenarios as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(await ScenariosSection());

    expect(screen.getByText("Performance Review")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Practice giving constructive feedback in a performance review setting."
      )
    ).toBeInTheDocument();

    expect(screen.getByText("Team Conflict")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Learn how to mediate and resolve conflicts between team members."
      )
    ).toBeInTheDocument();

    expect(screen.getByText("Career Development")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Guide employees through career growth and development discussions."
      )
    ).toBeInTheDocument();
  });

  it("renders scenarios fetched from the API", async () => {
    const mockScenarios = [
      {
        id: "mock-scenario-1",
        title: "Mock Scenario 1",
        description: "Description for mock scenario 1.",
      },
      {
        id: "mock-scenario-2",
        title: "Mock Scenario 2",
        description: "Description for mock scenario 2.",
      },
    ];
    (getScenarios as jest.Mock).mockResolvedValue(mockScenarios);

    render(await ScenariosSection());

    expect(screen.getByText("Mock Scenario 1")).toBeInTheDocument();
    expect(
      screen.getByText("Description for mock scenario 1.")
    ).toBeInTheDocument();

    expect(screen.getByText("Mock Scenario 2")).toBeInTheDocument();
    expect(
      screen.getByText("Description for mock scenario 2.")
    ).toBeInTheDocument();
  });

  it("renders the custom scenario card", async () => {
    (getScenarios as jest.Mock).mockResolvedValue([]);

    render(await ScenariosSection());

    expect(screen.getByText("Custom Scenario")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create your own scenario tailored to your specific needs."
      )
    ).toBeInTheDocument();
  });
});
