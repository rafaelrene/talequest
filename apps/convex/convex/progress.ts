import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { Effect } from "effect";

import {
  decodePercent,
  decodeSlug,
  failAuthRequired,
  failNotFound,
  runBoundary,
} from "./contracts";
import { getViewerUserId, nowIso } from "./lib";

const query = queryGeneric;
const mutation = mutationGeneric;

type ConvexCtx = any;

const resolveStoryId = (ctx: ConvexCtx, slugInput: unknown) => {
  return Effect.gen(function* () {
    const slug = yield* decodeSlug(slugInput);
    const story = (yield* Effect.tryPromise({
      try: () =>
        ctx.db
          .query("stories")
          .withIndex("by_slug", (q: any) => q.eq("slug", slug))
          .first(),
      catch: () => new Error("Story query failed"),
    })) as any;

    if (!story || !story.isPublic) {
      return yield* failNotFound("Story not found");
    }

    return story._id;
  });
};

const getProgressRecord = (ctx: ConvexCtx, userId: string, storyId: any) => {
  return Effect.tryPromise({
    try: () =>
      ctx.db
        .query("readProgress")
        .withIndex("by_user_story", (q: any) => q.eq("userId", userId).eq("storyId", storyId))
        .first(),
    catch: () => new Error("Progress query failed"),
  });
};

const upsertProgressRecord = (ctx: ConvexCtx, storyId: any, userId: string, percent: number) => {
  return Effect.gen(function* () {
    const existing = (yield* getProgressRecord(ctx, userId, storyId)) as any;

    if (existing) {
      yield* Effect.tryPromise({
        try: () =>
          ctx.db.patch(existing._id, {
            percent,
            updatedAt: nowIso(),
          }),
        catch: () => new Error("Progress patch failed"),
      });

      return existing._id;
    }

    return yield* Effect.tryPromise({
      try: () =>
        ctx.db.insert("readProgress", {
          storyId,
          userId,
          percent,
          updatedAt: nowIso(),
        }),
      catch: () => new Error("Progress insert failed"),
    });
  });
};

export const getForViewer = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await runBoundary(
      Effect.gen(function* () {
        const viewerUserId = yield* Effect.tryPromise({
          try: () => getViewerUserId(ctx),
          catch: () => new Error("Viewer lookup failed"),
        });

        if (!viewerUserId) {
          return null;
        }

        const storyId = yield* resolveStoryId(ctx, args.slug);

        return (yield* getProgressRecord(ctx, viewerUserId, storyId)) as any;
      }),
    );
  },
});

export const listForViewer = query({
  args: {},
  handler: async (ctx) => {
    return await runBoundary(
      Effect.gen(function* () {
        const viewerUserId = yield* Effect.tryPromise({
          try: () => getViewerUserId(ctx),
          catch: () => new Error("Viewer lookup failed"),
        });

        if (!viewerUserId) {
          return [];
        }

        const allForUser = (yield* Effect.tryPromise({
          try: () =>
            ctx.db
              .query("readProgress")
              .withIndex("by_user_story", (q: any) => q.eq("userId", viewerUserId))
              .collect(),
          catch: () => new Error("Progress query failed"),
        })) as any[];

        const progressBySlug = (yield* Effect.tryPromise({
          try: async () => {
            const entries = await Promise.all(
              allForUser.map(async (progress) => {
                const story = await ctx.db.get(progress.storyId);

                if (!story || !story.isPublic) {
                  return null;
                }

                return {
                  slug: story.slug,
                  percent: progress.percent,
                  updatedAt: progress.updatedAt,
                };
              }),
            );

            return entries.filter((entry) => entry !== null);
          },
          catch: () => new Error("Story lookup failed"),
        })) as Array<{ slug: string; percent: number; updatedAt: string }>;

        return progressBySlug;
      }),
    );
  },
});

export const upsertForViewer = mutation({
  args: {
    slug: v.string(),
    percent: v.number(),
  },
  handler: async (ctx, args) => {
    return await runBoundary(
      Effect.gen(function* () {
        const viewerUserId = yield* Effect.tryPromise({
          try: () => getViewerUserId(ctx),
          catch: () => new Error("Viewer lookup failed"),
        });

        if (!viewerUserId) {
          return yield* failAuthRequired("Authentication required");
        }

        const storyId = yield* resolveStoryId(ctx, args.slug);
        const percent = yield* decodePercent(args.percent);

        return yield* upsertProgressRecord(ctx, storyId, viewerUserId, percent);
      }),
    );
  },
});
