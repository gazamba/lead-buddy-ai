import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { ConversationActions } from "./conversation-actions";

describe("ConversationActions", () => {
  const mockOnSendMessage = vi.fn();
  const mockOnEndChat = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component correctly when chat is not ended", () => {
    render(
      <ConversationActions
        onSendMessage={mockOnSendMessage}
        onEndChat={mockOnEndChat}
        isChatEnded={false}
      />
    );

    expect(
      screen.getByPlaceholderText("Type your message...")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /end chat/i })
    ).toBeInTheDocument();
  });

  it("renders the correct message when chat is ended", () => {
    render(
      <ConversationActions
        onSendMessage={mockOnSendMessage}
        onEndChat={mockOnEndChat}
        isChatEnded={true}
      />
    );

    expect(screen.getByText(/conversation ended/i)).toBeInTheDocument();
  });

  it("calls onSendMessage when the send button is clicked", async () => {
    render(
      <ConversationActions
        onSendMessage={mockOnSendMessage}
        onEndChat={mockOnEndChat}
        isChatEnded={false}
      />
    );

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith("Hello");
  });

  it("does not call onSendMessage when input is empty", async () => {
    render(
      <ConversationActions
        onSendMessage={mockOnSendMessage}
        onEndChat={mockOnEndChat}
        isChatEnded={false}
      />
    );

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it("calls onEndChat when the end chat button is clicked", () => {
    render(
      <ConversationActions
        onSendMessage={mockOnSendMessage}
        onEndChat={mockOnEndChat}
        isChatEnded={false}
      />
    );

    const endChatButton = screen.getByRole("button", { name: /end chat/i });
    fireEvent.click(endChatButton);

    expect(mockOnEndChat).toHaveBeenCalled();
  });

  it("disables buttons when loading", () => {
    render(
      <ConversationActions
        onSendMessage={mockOnSendMessage}
        onEndChat={mockOnEndChat}
        isChatEnded={false}
      />
    );

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send/i });
    const endChatButton = screen.getByRole("button", { name: /end chat/i });

    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(sendButton);

    expect(sendButton).toBeDisabled();
    expect(endChatButton).toBeDisabled();
  });
});
