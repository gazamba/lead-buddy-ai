import { describe, it, expect, vi } from "vitest";
import { GET, DELETE } from "./route";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("GET", () => {
  it("should return 403 if user is not authenticated", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {} as NextRequest;
    const params = { conversationsId: "123" };

    const response = await GET(request, { params: Promise.resolve(params) });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("should return 404 if conversation is not found", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {} as NextRequest;
    const params = { conversationsId: "123" };

    const response = await GET(request, { params: Promise.resolve(params) });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Conversation not found" });
  });

  it("should return 403 if user is not the owner of the conversation", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: "user2" },
              error: null,
            }),
          }),
        }),
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {} as NextRequest;
    const params = { conversationsId: "123" };

    const response = await GET(request, { params: Promise.resolve(params) });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("should return the conversation data if user is authorized", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "123", user_id: "user1" },
              error: null,
            }),
          }),
        }),
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {} as NextRequest;
    const params = { conversationsId: "123" };

    const response = await GET(request, { params: Promise.resolve(params) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "123", user_id: "user1" });
  });
});

describe("DELETE", () => {

  it("should return 404 if conversation is not found", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {} as Request;
    const params = { conversationsId: "123" };

    const response = await DELETE(request, { params: Promise.resolve(params) });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Conversation not found" });
  });

  it("should return 403 if user is not the owner of the conversation", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: "user2" },
              error: null,
            }),
          }),
        }),
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {} as Request;
    const params = { conversationsId: "123" };

    const response = await DELETE(request, { params: Promise.resolve(params) });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("should delete the conversation if user is authorized", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user1" } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: "user1" },
              error: null,
            }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const request = {} as Request;
    const params = { conversationsId: "123" };

    const response = await DELETE(request, { params: Promise.resolve(params) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });
});