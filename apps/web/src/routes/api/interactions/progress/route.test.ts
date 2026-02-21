import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    runConvexMutation: vi.fn(),
    runConvexQuery: vi.fn(),
  };
});

vi.mock("$lib/server/convex", () => mocks);

import { GET, POST } from "./+server";

describe("progress api route", () => {
  beforeEach(() => {
    mocks.runConvexMutation.mockReset();
    mocks.runConvexQuery.mockReset();
  });

  it("returns validation payload for empty slug", async () => {
    const response = await GET({
      locals: {
        auth: () => ({
          userId: "user_123",
          getToken: vi.fn().mockResolvedValue("convex-token"),
        }),
      },
      url: new URL("http://localhost/api/interactions/progress?slug=%20"),
    } as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: "validation_error",
      message: "`slug` is required.",
    });
    expect(mocks.runConvexQuery).not.toHaveBeenCalled();
  });

  it("returns a validation payload for invalid body", async () => {
    const request = new Request("http://localhost/api/interactions/progress", {
      method: "POST",
      body: JSON.stringify({ slug: "the-lantern-bridge", percent: "20" }),
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
      request,
    } as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: "validation_error",
      message: "`slug` and numeric `percent` are required.",
    });
    expect(mocks.runConvexMutation).not.toHaveBeenCalled();
  });

  it("returns a validation payload for out-of-range percent", async () => {
    const request = new Request("http://localhost/api/interactions/progress", {
      method: "POST",
      body: JSON.stringify({ slug: "the-lantern-bridge", percent: 101 }),
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
      request,
    } as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: "validation_error",
      message: "`percent` must be a number from 0 to 100",
    });
    expect(mocks.runConvexMutation).not.toHaveBeenCalled();
  });

  it("forwards viewer-bound auth context for reads", async () => {
    mocks.runConvexQuery.mockResolvedValue({ percent: 42 });

    const response = await GET({
      locals: {
        auth: () => ({
          userId: "user_123",
          getToken: vi.fn().mockResolvedValue("convex-token"),
        }),
      },
      url: new URL("http://localhost/api/interactions/progress?slug=the-lantern-bridge"),
    } as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      progress: { percent: 42 },
    });
    expect(mocks.runConvexQuery).toHaveBeenCalledWith(
      "progress:getForViewer",
      {
        slug: "the-lantern-bridge",
      },
      { token: "convex-token", viewerUserId: "user_123" },
    );
  });

  it("forwards viewer-bound auth context for writes", async () => {
    mocks.runConvexMutation.mockResolvedValue("progress-1");

    const request = new Request("http://localhost/api/interactions/progress", {
      method: "POST",
      body: JSON.stringify({ slug: "the-lantern-bridge", percent: 42 }),
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
      request,
    } as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      progressId: "progress-1",
    });
    expect(mocks.runConvexMutation).toHaveBeenCalledWith(
      "progress:upsertForViewer",
      {
        slug: "the-lantern-bridge",
        percent: 42,
      },
      { token: "convex-token", viewerUserId: "user_123" },
    );
  });
});
