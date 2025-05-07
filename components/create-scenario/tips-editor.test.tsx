import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { TipsEditor } from "./tips-editor";

describe("TipsEditor", () => {
  it("renders the component with initial tips", () => {
    const tips = ["Tip 1", "Tip 2"];
    const onTipsChange = vi.fn();

    render(<TipsEditor tips={tips} onTipsChange={onTipsChange} />);

    expect(screen.getByText("Success Tips")).toBeInTheDocument();
    expect(screen.getByText("Tip 1")).toBeInTheDocument();
    expect(screen.getByText("Tip 2")).toBeInTheDocument();
  });

  it("adds a new tip when the Add Tip button is clicked", () => {
    const tips: string[] = [];
    const onTipsChange = vi.fn();

    render(<TipsEditor tips={tips} onTipsChange={onTipsChange} />);

    const input = screen.getByPlaceholderText("Add a new tip...");
    const addButton = screen.getByText("Add Tip");

    fireEvent.change(input, { target: { value: "New Tip" } });
    fireEvent.click(addButton);

    expect(onTipsChange).toHaveBeenCalledWith(["New Tip"]);
  });

  it("does not add an empty tip", () => {
    const tips: string[] = [];
    const onTipsChange = vi.fn();

    render(<TipsEditor tips={tips} onTipsChange={onTipsChange} />);

    const addButton = screen.getByText("Add Tip");

    fireEvent.click(addButton);

    expect(onTipsChange).not.toHaveBeenCalled();
  });

  it("removes a tip when the remove button is clicked", () => {
    const tips = ["Tip 1", "Tip 2"];
    const onTipsChange = vi.fn();

    render(<TipsEditor tips={tips} onTipsChange={onTipsChange} />);

    const removeButtons = screen.getAllByText("×");
    fireEvent.click(removeButtons[0]);

    expect(onTipsChange).toHaveBeenCalledWith(["Tip 2"]);
  });

  it("adds a new tip when Enter key is pressed", () => {
    const tips: string[] = [];
    const onTipsChange = vi.fn();

    render(<TipsEditor tips={tips} onTipsChange={onTipsChange} />);

    const input = screen.getByPlaceholderText("Add a new tip...");

    fireEvent.change(input, { target: { value: "New Tip" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(onTipsChange).toHaveBeenCalledWith(["New Tip"]);
  });
});
