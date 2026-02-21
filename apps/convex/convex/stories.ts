import { queryGeneric } from "convex/server";
import { v } from "convex/values";
import { Effect } from "effect";
import { isRichTextDoc, plainTextToRichTextDoc } from "@talequest/content";

import { decodeSlug, runBoundary } from "./contracts";

const query = queryGeneric;

const normalizeStoryContent = <T extends { content: unknown; excerpt: string }>(story: T) => {
  return {
    ...story,
    content: isRichTextDoc(story.content) ? story.content : plainTextToRichTextDoc(story.excerpt),
  };
};

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    return await runBoundary(
      Effect.gen(function* () {
        const stories = (yield* Effect.tryPromise({
          try: () =>
            ctx.db
              .query("stories")
              .withIndex("by_public_publishedAt", (q: any) => q.eq("isPublic", true))
              .order("desc")
              .collect(),
          catch: () => new Error("Story list query failed"),
        })) as any[];

        return stories.map((story) => normalizeStoryContent(story));
      }),
    );
  },
});

export const bySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await runBoundary(
      Effect.gen(function* () {
        const slug = yield* decodeSlug(args.slug);
        const story = (yield* Effect.tryPromise({
          try: () =>
            ctx.db
              .query("stories")
              .withIndex("by_slug", (q: any) => q.eq("slug", slug))
              .first(),
          catch: () => new Error("Story lookup query failed"),
        })) as any;

        if (!story || !story.isPublic) {
          return null;
        }

        return normalizeStoryContent(story);
      }),
    );
  },
});
