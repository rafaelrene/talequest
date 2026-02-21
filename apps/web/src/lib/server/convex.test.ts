import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const instances: Array<{
    setAuth: ReturnType<typeof vi.fn>;
    clearAuth: ReturnType<typeof vi.fn>;
    query: ReturnType<typeof vi.fn>;
    mutation: ReturnType<typeof vi.fn>;
  }> = [];

  return { instances };
});

vi.mock("$lib/env", () => ({
  publicEnv: {
    PUBLIC_CONVEX_URL: "https://example.convex.cloud",
  },
}));

vi.mock("@sveltejs/kit", () => ({
  error: (status: number, message: string) => {
    return Object.assign(new Error(message), { status });
  },
}));

vi.mock("convex/browser", () => ({
  ConvexHttpClient: class {
    private authToken: string | null = null;
    setAuth = vi.fn(async (token: string) => {
      this.authToken = token;
    });
    clearAuth = vi.fn(() => {
      this.authToken = null;
    });
    query = vi.fn(async () => {
      return { token: this.authToken };
    });
    mutation = vi.fn(async () => {
      return { token: this.authToken };
    });

    constructor() {
      mocks.instances.push(this);
    }
  },
}));

import { runConvexMutation, runConvexQuery } from "./convex";

describe("convex web client auth isolation", () => {
  beforeEach(() => {
    mocks.instances.length = 0;
  });

  it("creates a fresh client per query token", async () => {
    const first = await runConvexQuery<{ token: string | null }>(
      "progress:getForViewer",
      {
        slug: "story-one",
      },
      { token: "token-a" },
    );
    const second = await runConvexQuery<{ token: string | null }>(
      "progress:getForViewer",
      {
        slug: "story-two",
      },
      { token: "token-b" },
    );

    expect(mocks.instances).toHaveLength(2);
    expect(mocks.instances[0]?.setAuth).toHaveBeenCalledWith("token-a");
    expect(mocks.instances[1]?.setAuth).toHaveBeenCalledWith("token-b");
    expect(first).toEqual({ token: "token-a" });
    expect(second).toEqual({ token: "token-b" });
  });

  it("clears auth for unauthenticated mutation requests", async () => {
    const response = await runConvexMutation<{ token: string | null }>("progress:upsertForViewer", {
      slug: "story-one",
      percent: 20,
    });

    expect(mocks.instances).toHaveLength(1);
    expect(mocks.instances[0]?.setAuth).not.toHaveBeenCalled();
    expect(mocks.instances[0]?.clearAuth).toHaveBeenCalledTimes(1);
    expect(response).toEqual({ token: null });
  });
});
