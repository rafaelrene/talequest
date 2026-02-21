import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { Effect } from "effect";
import { isRichTextDoc, plainTextToRichTextDoc, richTextToPlainText } from "@talequest/content";

import {
  decodeGuestName,
  decodeRichTextContent,
  decodeSlug,
  failNotFound,
  failValidationError,
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

export const listForStory = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await runBoundary(
      Effect.gen(function* () {
        const storyId = yield* resolveStoryId(ctx, args.slug);
        const comments = yield* Effect.tryPromise({
          try: () =>
            ctx.db
              .query("comments")
              .withIndex("by_story_createdAt", (q: any) => q.eq("storyId", storyId))
              .order("asc")
              .collect(),
          catch: () => new Error("Comment list query failed"),
        });

        return comments.map((comment) => ({
          ...comment,
          content: isRichTextDoc(comment.content)
            ? comment.content
            : plainTextToRichTextDoc(typeof comment.content === "string" ? comment.content : ""),
        }));
      }),
    );
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    content: v.any(),
    guestName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await runBoundary(
      Effect.gen(function* () {
        const storyId = yield* resolveStoryId(ctx, args.slug);
        const content = yield* decodeRichTextContent(args.content);
        const guestName = yield* decodeGuestName(args.guestName);
        const body = richTextToPlainText(content);

        if (!body) {
          return yield* failValidationError("Comment body is required");
        }

        const viewerUserId = yield* Effect.tryPromise({
          try: () => getViewerUserId(ctx),
          catch: () => new Error("Viewer lookup failed"),
        });

        if (!viewerUserId && !guestName) {
          return yield* failValidationError("Guest name is required for anonymous comments");
        }

        return yield* Effect.tryPromise({
          try: () =>
            ctx.db.insert("comments", {
              storyId,
              content,
              authorUserId: viewerUserId ?? undefined,
              guestName: viewerUserId ? undefined : guestName,
              createdAt: nowIso(),
            }),
          catch: () => new Error("Comment insert failed"),
        });
      }),
    );
  },
});
