import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stories: defineTable({
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    content: v.any(),
    authorName: v.string(),
    isPublic: v.boolean(),
    readingMinutes: v.number(),
    publishedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_public_publishedAt", ["isPublic", "publishedAt"]),
  comments: defineTable({
    storyId: v.id("stories"),
    content: v.any(),
    authorUserId: v.optional(v.string()),
    guestName: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_story_createdAt", ["storyId", "createdAt"]),
  readProgress: defineTable({
    storyId: v.id("stories"),
    userId: v.string(),
    percent: v.number(),
    updatedAt: v.string(),
  }).index("by_user_story", ["userId", "storyId"]),
});
