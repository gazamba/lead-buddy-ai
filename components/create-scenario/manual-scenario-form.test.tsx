import { render, screen, fireEvent } from "@testing-library/react";
import { ManualScenarioForm } from "./manual-scenario-form";

describe("ManualScenarioForm", () => {
  const mockProps = {
    title: "",
    description: "",
    employeeName: "",
    context: "",
    tips: [],
    onTitleChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onEmployeeNameChange: vi.fn(),
    onContextChange: vi.fn(),
    onSave: vi.fn(),
  };

  it("renders all input fields and button", () => {
    render(<ManualScenarioForm {...mockProps} />);

    expect(screen.getByLabelText("Scenario Title*")).toBeInTheDocument();
    expect(screen.getByLabelText("Short Description*")).toBeInTheDocument();
    expect(screen.getByLabelText("Employee Name*")).toBeInTheDocument();
    expect(screen.getByLabelText("Context Details*")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create & Start Simulation/i })
    ).toBeInTheDocument();
  });

  it("calls onTitleChange when title input changes", () => {
    render(<ManualScenarioForm {...mockProps} />);

    const titleInput = screen.getByLabelText("Scenario Title*");
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    expect(mockProps.onTitleChange).toHaveBeenCalledWith("New Title");
  });

  it("calls onDescriptionChange when description input changes", () => {
    render(<ManualScenarioForm {...mockProps} />);

    const descriptionInput = screen.getByLabelText("Short Description*");
    fireEvent.change(descriptionInput, {
      target: { value: "New Description" },
    });

    expect(mockProps.onDescriptionChange).toHaveBeenCalledWith(
      "New Description"
    );
  });

  it("calls onEmployeeNameChange when employee name input changes", () => {
    render(<ManualScenarioForm {...mockProps} />);

    const employeeNameInput = screen.getByLabelText("Employee Name*");
    fireEvent.change(employeeNameInput, { target: { value: "Jamie" } });

    expect(mockProps.onEmployeeNameChange).toHaveBeenCalledWith("Jamie");
  });

  it("calls onContextChange when context textarea changes", () => {
    render(<ManualScenarioForm {...mockProps} />);

    const contextTextarea = screen.getByLabelText("Context Details*");
    fireEvent.change(contextTextarea, { target: { value: "New Context" } });

    expect(mockProps.onContextChange).toHaveBeenCalledWith("New Context");
  });

  it("calls onSave when the button is clicked", () => {
    render(<ManualScenarioForm {...mockProps} />);

    const saveButton = screen.getByRole("button", {
      name: /Create & Start Simulation/i,
    });
    fireEvent.click(saveButton);

    expect(mockProps.onSave).toHaveBeenCalled();
  });
});
