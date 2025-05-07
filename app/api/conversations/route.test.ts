import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "./route";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("GET /api/conversations", () => {
  it("should return conversations data", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: 1, title: "Test Conversation" }],
        error: null,
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {} as NextRequest;
    const response = await GET(request);

    expect(mockSupabase.from).toHaveBeenCalledWith("conversations");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: 1, title: "Test Conversation" }]);
  });

  it("should handle errors when fetching conversations", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {} as NextRequest;
    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Database error" });
  });
});

describe("POST /api/conversations", () => {
  it("should create a new conversation", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-id" } },
        }),
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 1, name: "New Conversation" },
        error: null,
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {
      json: vi.fn().mockResolvedValue({
        scenario_id: 1,
        name: "New Conversation",
        messages: [],
      }),
    } as unknown as Request;

    const response = await POST(request);

    expect(mockSupabase.from).toHaveBeenCalledWith("conversations");
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: 1, name: "New Conversation" });
  });

  it("should return 400 if required fields are missing", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-id" } },
        }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {
      json: vi.fn().mockResolvedValue({ name: "Incomplete Data" }),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Missing required field: scenario_id",
    });
  });

  it("should handle errors when creating a conversation", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-id" } },
        }),
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {
      json: vi.fn().mockResolvedValue({
        scenario_id: 1,
        name: "New Conversation",
        messages: [],
      }),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Database error" });
  });
});
