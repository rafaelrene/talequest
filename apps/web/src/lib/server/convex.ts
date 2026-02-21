import { ConvexHttpClient } from "convex/browser";
import { error } from "@sveltejs/kit";
import { plainTextToRichTextDoc, type RichTextDoc } from "@talequest/content";

import { publicEnv } from "$lib/env";

let fallbackCommentCounter = 0;
let fallbackProgressCounter = 0;

type FallbackStory = {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  readingMinutes: number;
  publishedAt: string;
  content: RichTextDoc;
};

type FallbackComment = {
  _id: string;
  content: RichTextDoc;
  authorUserId?: string;
  guestName?: string;
  createdAt: string;
};

const fallbackStories: FallbackStory[] = [
  {
    slug: "the-lantern-bridge",
    title: "The Lantern Bridge",
    excerpt: "Mira crosses a bridge that only appears when stories are spoken aloud.",
    authorName: "TaleQuest Team",
    readingMinutes: 6,
    publishedAt: "2026-02-20T09:00:00.000Z",
    content: plainTextToRichTextDoc(
      "Mira waited for twilight before stepping onto the old stone path. At first there was only fog, then one lantern at a time the bridge unfolded in front of her.",
    ),
  },
  {
    slug: "cartographer-of-rain",
    title: "Cartographer of Rain",
    excerpt: "A mapmaker learns each rainfall redraws the borders of her city.",
    authorName: "TaleQuest Team",
    readingMinutes: 5,
    publishedAt: "2026-02-18T09:00:00.000Z",
    content: plainTextToRichTextDoc(
      "Every morning Nadi charted puddles before they evaporated. The citizens called them accidents. She called them instructions.",
    ),
  },
];

const fallbackCommentsBySlug = new Map<string, FallbackComment[]>();
const fallbackProgressByKey = new Map<string, { _id: string; percent: number }>();

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const statusForBoundaryCode = (code: string): number => {
  switch (code) {
    case "validation_error":
      return 400;
    case "auth_required":
      return 401;
    case "not_found":
      return 404;
    default:
      return 500;
  }
};

const throwMappedConvexError = (caught: unknown): never => {
  if (!isObjectRecord(caught) || !("data" in caught)) {
    throw caught;
  }

  const payload = caught.data;

  if (!isObjectRecord(payload)) {
    throw caught;
  }

  const code = typeof payload.code === "string" ? payload.code : "internal_error";
  const message = typeof payload.message === "string" ? payload.message : "Unexpected server error";

  throw error(statusForBoundaryCode(code), message);
};

const withClientAuth = async (token: string | null | undefined): Promise<ConvexHttpClient> => {
  const nextClient = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);

  if (token) {
    await nextClient.setAuth(token);
  } else {
    nextClient.clearAuth();
  }

  return nextClient;
};

const getFallbackStory = (slug: string): FallbackStory | null => {
  return fallbackStories.find((story) => story.slug === slug) ?? null;
};

const runFallbackQuery = <T>(name: string, args: Record<string, unknown>): T => {
  switch (name) {
    case "stories:listPublic":
      return [...fallbackStories] as T;
    case "stories:bySlug": {
      const slug = String(args.slug ?? "");
      return getFallbackStory(slug) as T;
    }
    case "comments:listForStory": {
      const slug = String(args.slug ?? "");
      return [...(fallbackCommentsBySlug.get(slug) ?? [])] as T;
    }
    case "progress:getForUser": {
      const slug = String(args.slug ?? "");
      const userId = String(args.userId ?? "");
      const key = `${slug}:${userId}`;
      return (
        fallbackProgressByKey.get(key)
          ? { percent: fallbackProgressByKey.get(key)?.percent ?? 0 }
          : null
      ) as T;
    }
    case "progress:getForViewer": {
      const slug = String(args.slug ?? "");
      const userId = String(args.userId ?? "");
      const key = `${slug}:${userId}`;

      return (
        fallbackProgressByKey.get(key)
          ? { percent: fallbackProgressByKey.get(key)?.percent ?? 0 }
          : null
      ) as T;
    }
    case "progress:listForViewer": {
      const userId = String(args.userId ?? "");

      return [...fallbackProgressByKey.entries()]
        .filter(([key]) => key.endsWith(`:${userId}`))
        .map(([key, value]) => {
          const separatorIndex = key.lastIndexOf(":");
          const slug = separatorIndex >= 0 ? key.slice(0, separatorIndex) : key;

          return {
            slug,
            percent: value.percent,
            updatedAt: new Date().toISOString(),
          };
        }) as T;
    }
    default:
      throw error(503, `Unsupported local fallback query: ${name}`);
  }
};

const runFallbackMutation = <T>(name: string, args: Record<string, unknown>): T => {
  switch (name) {
    case "comments:create": {
      const slug = String(args.slug ?? "");
      const story = getFallbackStory(slug);

      if (!story) {
        throw error(404, "Story not found");
      }

      const nextComment: FallbackComment = {
        _id: `fallback-comment-${++fallbackCommentCounter}`,
        content: args.content as RichTextDoc,
        authorUserId:
          typeof args.userId === "string" && args.userId.length > 0 ? args.userId : undefined,
        guestName:
          typeof args.guestName === "string" && args.guestName.length > 0
            ? args.guestName
            : undefined,
        createdAt: new Date().toISOString(),
      };

      const comments = fallbackCommentsBySlug.get(slug) ?? [];
      comments.unshift(nextComment);
      fallbackCommentsBySlug.set(slug, comments);

      return nextComment._id as T;
    }
    case "progress:upsertForUser": {
      const slug = String(args.slug ?? "");
      const userId = String(args.userId ?? "");
      const percent = Number(args.percent ?? 0);

      if (!slug || !getFallbackStory(slug)) {
        throw error(404, "Story not found");
      }

      if (!userId) {
        throw error(401, "Authentication required");
      }

      if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
        throw error(400, "Progress percent must be between 0 and 100");
      }

      const key = `${slug}:${userId}`;
      const existing = fallbackProgressByKey.get(key);

      if (existing) {
        existing.percent = percent;
        fallbackProgressByKey.set(key, existing);
        return existing._id as T;
      }

      const id = `fallback-progress-${++fallbackProgressCounter}`;
      fallbackProgressByKey.set(key, {
        _id: id,
        percent,
      });

      return id as T;
    }
    case "progress:upsertForViewer": {
      const slug = String(args.slug ?? "");
      const userId = String(args.userId ?? "");
      const percent = Number(args.percent ?? 0);

      if (!slug || !getFallbackStory(slug)) {
        throw error(404, "Story not found");
      }

      if (!userId) {
        throw error(401, "Authentication required");
      }

      if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
        throw error(400, "Progress percent must be between 0 and 100");
      }

      const key = `${slug}:${userId}`;
      const existing = fallbackProgressByKey.get(key);

      if (existing) {
        existing.percent = percent;
        fallbackProgressByKey.set(key, existing);
        return existing._id as T;
      }

      const id = `fallback-progress-${++fallbackProgressCounter}`;
      fallbackProgressByKey.set(key, {
        _id: id,
        percent,
      });

      return id as T;
    }
    default:
      throw error(503, `Unsupported local fallback mutation: ${name}`);
  }
};

export const runConvexQuery = async <T>(
  name: string,
  args: Record<string, unknown>,
  options?: { token?: string | null; viewerUserId?: string | null },
): Promise<T> => {
  if (!publicEnv.PUBLIC_CONVEX_URL) {
    const fallbackArgs = options?.viewerUserId ? { ...args, userId: options.viewerUserId } : args;
    return runFallbackQuery<T>(name, fallbackArgs);
  }

  try {
    const nextClient = await withClientAuth(options?.token);
    return (await nextClient.query(name as never, args as never)) as T;
  } catch (caught) {
    throwMappedConvexError(caught);
    throw error(500, "Unexpected server error");
  }
};

export const runConvexMutation = async <T>(
  name: string,
  args: Record<string, unknown>,
  options?: { token?: string | null; viewerUserId?: string | null },
): Promise<T> => {
  if (!publicEnv.PUBLIC_CONVEX_URL) {
    const fallbackArgs = options?.viewerUserId ? { ...args, userId: options.viewerUserId } : args;
    return runFallbackMutation<T>(name, fallbackArgs);
  }

  try {
    const nextClient = await withClientAuth(options?.token);
    return (await nextClient.mutation(name as never, args as never)) as T;
  } catch (caught) {
    throwMappedConvexError(caught);
    throw error(500, "Unexpected server error");
  }
};
