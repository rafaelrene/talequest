import { mutationGeneric } from "convex/server";

const mutation = mutationGeneric;

const fixtures = [
  {
    slug: "the-lantern-keeper",
    title: "The Lantern Keeper",
    excerpt: "A storm watcher decides whether to keep one final light burning.",
    authorName: "TaleQuest Editorial",
    isPublic: true,
    readingMinutes: 7,
    publishedAt: "2026-02-01T00:00:00.000Z",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The harbor had gone dark except for a single lantern at the edge of the cliff.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "mapmakers-daughter",
    title: "The Mapmaker's Daughter",
    excerpt: "An apprentice draws a route no one believes exists.",
    authorName: "TaleQuest Editorial",
    isPublic: true,
    readingMinutes: 9,
    publishedAt: "2026-02-10T00:00:00.000Z",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Mara's final exam was simple: map the city from memory before sunrise.",
            },
          ],
        },
      ],
    },
  },
] as const;

export const seedStories = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stories").collect();

    if (existing.length > 0) {
      return {
        created: 0,
        total: existing.length,
      };
    }

    for (const story of fixtures) {
      await ctx.db.insert("stories", story);
    }

    return {
      created: fixtures.length,
      total: fixtures.length,
    };
  },
});
