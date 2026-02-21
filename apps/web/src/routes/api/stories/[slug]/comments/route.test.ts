import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    runConvexMutation: vi.fn(),
    runConvexQuery: vi.fn(),
  };
});

vi.mock("$lib/server/convex", () => mocks);

import { POST } from "./+server";

describe("comments api route", () => {
  beforeEach(() => {
    mocks.runConvexMutation.mockReset();
    mocks.runConvexQuery.mockReset();
  });

  it("returns validation payload for empty slug", async () => {
    const request = new Request("http://localhost/api/stories/%20/comments", {
      method: "POST",
      body: JSON.stringify({ body: "Hello there", guestName: "Ada" }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await POST({
      locals: {
        auth: () => ({ userId: null }),
      },
      params: {
        slug: " ",
      },
      request,
    } as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: "validation_error",
      message: "`slug` is required.",
    });
    expect(mocks.runConvexMutation).not.toHaveBeenCalled();
  });

  it("returns a validation payload for anonymous invalid body", async () => {
    const request = new Request("http://localhost/api/stories/the-lantern-bridge/comments", {
      method: "POST",
      body: JSON.stringify({ body: "Hello there" }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await POST({
      locals: {
        auth: () => ({ userId: null }),
      },
      params: {
        slug: "the-lantern-bridge",
      },
      request,
    } as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: "validation_error",
      message: "Guest name is required for anonymous comments",
    });
    expect(mocks.runConvexMutation).not.toHaveBeenCalled();
  });

  it("forwards viewer-bound auth context for signed-in writes", async () => {
    mocks.runConvexMutation.mockResolvedValue("comment-1");

    const request = new Request("http://localhost/api/stories/the-lantern-bridge/comments", {
      method: "POST",
      body: JSON.stringify({
        body: "hello",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await POST({
      locals: {
        auth: () => ({
          userId: "user_123",
          getToken: vi.fn().mockResolvedValue("convex-token"),
        }),
      },
      params: {
        slug: "the-lantern-bridge",
      },
      request,
    } as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      commentId: "comment-1",
    });
    expect(mocks.runConvexMutation).toHaveBeenCalledWith(
      "comments:create",
      {
        slug: "the-lantern-bridge",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "hello" }],
            },
          ],
        },
        guestName: undefined,
      },
      { token: "convex-token", viewerUserId: "user_123" },
    );
  });
});
