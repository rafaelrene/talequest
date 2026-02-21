import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    getConvexToken: vi.fn(),
    runConvexQuery: vi.fn(),
  };
});

vi.mock("$lib/server/auth", () => ({ getConvexToken: mocks.getConvexToken }));
vi.mock("$lib/server/convex", () => ({ runConvexQuery: mocks.runConvexQuery }));

import { load } from "./+page.server";

describe("library page server load", () => {
  beforeEach(() => {
    mocks.getConvexToken.mockReset();
    mocks.runConvexQuery.mockReset();
  });

  it("returns stories without viewer progress when signed out", async () => {
    mocks.runConvexQuery.mockResolvedValueOnce([
      {
        slug: "the-lantern-bridge",
        title: "The Lantern Bridge",
        excerpt: "A keeper crosses at dusk.",
        authorName: "A. River",
        readingMinutes: 9,
        publishedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    const result = await load({
      locals: {
        auth: () => ({ userId: null }),
      },
    } as never);

    expect(result).toEqual({
      stories: [
        {
          slug: "the-lantern-bridge",
          title: "The Lantern Bridge",
          excerpt: "A keeper crosses at dusk.",
          authorName: "A. River",
          readingMinutes: 9,
          publishedAt: "2026-01-01T00:00:00.000Z",
          progressPercent: null,
        },
      ],
    });
    expect(mocks.getConvexToken).not.toHaveBeenCalled();
    expect(mocks.runConvexQuery).toHaveBeenCalledTimes(1);
    expect(mocks.runConvexQuery).toHaveBeenNthCalledWith(1, "stories:listPublic", {});
  });

  it("loads and maps viewer progress when signed in", async () => {
    mocks.getConvexToken.mockResolvedValue("convex-token");
    mocks.runConvexQuery
      .mockResolvedValueOnce([
        {
          slug: "the-lantern-bridge",
          title: "The Lantern Bridge",
          excerpt: "A keeper crosses at dusk.",
          authorName: "A. River",
          readingMinutes: 9,
          publishedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          slug: "stormglass",
          title: "Stormglass",
          excerpt: "A map made of weather.",
          authorName: "B. Hale",
          readingMinutes: 12,
          publishedAt: "2026-01-02T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([
        {
          slug: "stormglass",
          percent: 67,
          updatedAt: "2026-01-03T00:00:00.000Z",
        },
      ]);

    const result = await load({
      locals: {
        auth: () => ({ userId: "user_123" }),
      },
    } as never);

    expect(mocks.getConvexToken).toHaveBeenCalledTimes(1);
    expect(mocks.runConvexQuery).toHaveBeenCalledTimes(2);
    expect(mocks.runConvexQuery).toHaveBeenNthCalledWith(1, "stories:listPublic", {});
    expect(mocks.runConvexQuery).toHaveBeenNthCalledWith(
      2,
      "progress:listForViewer",
      {},
      { token: "convex-token", viewerUserId: "user_123" },
    );
    expect(result).toEqual({
      stories: [
        {
          slug: "the-lantern-bridge",
          title: "The Lantern Bridge",
          excerpt: "A keeper crosses at dusk.",
          authorName: "A. River",
          readingMinutes: 9,
          publishedAt: "2026-01-01T00:00:00.000Z",
          progressPercent: null,
        },
        {
          slug: "stormglass",
          title: "Stormglass",
          excerpt: "A map made of weather.",
          authorName: "B. Hale",
          readingMinutes: 12,
          publishedAt: "2026-01-02T00:00:00.000Z",
          progressPercent: 67,
        },
      ],
    });
  });
});
