import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { RichTextDoc } from "@talequest/content";

import { getConvexToken } from "$lib/server/auth";
import { runConvexQuery } from "$lib/server/convex";

type StoryDetail = {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  readingMinutes: number;
  publishedAt: string;
  content: RichTextDoc;
};

type ReadProgress = {
  percent: number;
};

type StoryComment = {
  _id: string;
  content: RichTextDoc;
  authorUserId?: string;
  guestName?: string;
  createdAt: string;
};

export const load: PageServerLoad = async ({ locals, params }) => {
  const story = await runConvexQuery<StoryDetail | null>("stories:bySlug", {
    slug: params.slug,
  });

  if (!story) {
    throw error(404, "Story not found");
  }

  const userId = locals.auth().userId;
  const token = userId ? await getConvexToken(locals) : null;
  const comments = await runConvexQuery<StoryComment[]>("comments:listForStory", {
    slug: story.slug,
  });
  const progress = userId
    ? await runConvexQuery<ReadProgress | null>(
        "progress:getForViewer",
        {
          slug: story.slug,
        },
        { token, viewerUserId: userId },
      )
    : null;

  return {
    story,
    comments,
    viewerUserId: userId,
    initialPercent: progress?.percent ?? 0,
    canTrackProgress: Boolean(userId),
  };
};
