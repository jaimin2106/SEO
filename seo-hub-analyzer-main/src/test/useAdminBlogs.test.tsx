import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
  logAdminAction: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mocks.from,
    rpc: mocks.rpc,
    storage: { from: vi.fn() },
  },
}));

vi.mock("@/lib/adminAudit", () => ({
  logAdminAction: mocks.logAdminAction,
}));

import { useAdminBlogMutations } from "@/hooks/admin/useAdminBlogs";

describe("useAdminBlogMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const insert = vi.fn().mockReturnValue({
      select: () => ({
        single: async () => ({
          data: { id: "saved-blog-id", updated_at: "2026-11-05T12:00:00Z" },
          error: null,
        }),
      }),
    });
    mocks.from.mockReturnValue({ insert });
    mocks.rpc.mockResolvedValue({
      error: { message: "function is not in the schema cache" },
    });
  });

  it("returns the created article ID when tag updates fail after the article was saved", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useAdminBlogMutations(), { wrapper });

    let saved: Awaited<ReturnType<typeof result.current.saveBlog.mutateAsync>> | undefined;
    await act(async () => {
      saved = await result.current.saveBlog.mutateAsync({
        title: "Test article",
        slug: "test-article",
        content: [],
        status: "draft",
        tag_ids: [],
      });
    });

    expect(saved?.id).toBe("saved-blog-id");
    expect(saved?.error).toContain("Article saved, but tags could not be updated");
    expect(mocks.from).toHaveBeenCalledWith("blogs");
    expect(mocks.rpc).toHaveBeenCalledWith("admin_replace_blog_tags", {
      p_blog_id: "saved-blog-id",
      p_tag_ids: [],
    });
  });
});
