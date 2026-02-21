import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    runConvexQuery: vi.fn(),
  };
});

vi.mock("$lib/server/convex", () => mocks);

import { GET } from "./+server";

describe("story detail api route", () => {
  beforeEach(() => {
    mocks.runConvexQuery.mockReset();
  });

  it("returns validation payload for empty slug", async () => {
    const response = await GET({
      params: {
        slug: " ",
      },
    } as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: "validation_error",
      message: "`slug` is required.",
    });
    expect(mocks.runConvexQuery).not.toHaveBeenCalled();
  });
});
