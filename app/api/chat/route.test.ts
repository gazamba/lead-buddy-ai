import { describe, it, expect, vi } from "vitest";
import { GET } from "/Users/gabriel-azambuja/personal-projects/lead-buddy-ai/app/(auth)/auth/confirm/route";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("GET", () => {
  it("should redirect to the specified 'next' URL if token_hash and type are valid", async () => {
    const mockRequest = {
      url: "http://localhost?token_hash=valid_token&type=magiclink&next=/dashboard",
    } as any;

    const mockSupabase = {
      auth: {
        verifyOtp: vi.fn().mockResolvedValue({ error: null }),
      },
    };

    (createClient as any).mockResolvedValue(mockSupabase);

    await GET(mockRequest);

    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
      type: "magiclink",
      token_hash: "valid_token",
    });
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("should redirect to '/error' if token_hash or type is missing", async () => {
    const mockRequest = {
      url: "http://localhost?next=/dashboard",
    } as any;

    await GET(mockRequest);

    expect(redirect).toHaveBeenCalledWith("/error");
  });

  it("should redirect to '/error' if verifyOtp returns an error", async () => {
    const mockRequest = {
      url: "http://localhost?token_hash=invalid_token&type=magiclink&next=/dashboard",
    } as any;

    const mockSupabase = {
      auth: {
        verifyOtp: vi.fn().mockResolvedValue({ error: "Invalid token" }),
      },
    };

    (createClient as any).mockResolvedValue(mockSupabase);

    await GET(mockRequest);

    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
      type: "magiclink",
      token_hash: "invalid_token",
    });
    expect(redirect).toHaveBeenCalledWith("/error");
  });

  it("should default to '/' if 'next' is not provided", async () => {
    const mockRequest = {
      url: "http://localhost?token_hash=valid_token&type=magiclink",
    } as any;

    const mockSupabase = {
      auth: {
        verifyOtp: vi.fn().mockResolvedValue({ error: null }),
      },
    };

    (createClient as any).mockResolvedValue(mockSupabase);

    await GET(mockRequest);

    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
      type: "magiclink",
      token_hash: "valid_token",
    });
    expect(redirect).toHaveBeenCalledWith("/");
  });
});