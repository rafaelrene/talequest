import type { PageServerLoad } from "./$types";

import { getConvexToken } from "$lib/server/auth";
import { runConvexQuery } from "$lib/server/convex";

type StoryListItem = {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  readingMinutes: number;
  publishedAt: string;
  progressPercent: number | null;
};

type StoryProgress = {
  slug: string;
  percent: number;
  updatedAt: string;
};

export const load: PageServerLoad = async ({ locals }) => {
  const stories = await runConvexQuery<Omit<StoryListItem, "progressPercent">[]>(
    "stories:listPublic",
    {},
  );
  const userId = locals.auth().userId;
  const token = userId ? await getConvexToken(locals) : null;
  const progressRecords = userId
    ? await runConvexQuery<StoryProgress[]>(
        "progress:listForViewer",
        {},
        { token, viewerUserId: userId },
      )
    : [];
  const progressBySlug = new Map(progressRecords.map((record) => [record.slug, record.percent]));
  const storiesWithProgress: StoryListItem[] = stories.map((story) => ({
    ...story,
    progressPercent: progressBySlug.get(story.slug) ?? null,
  }));

  return {
    stories: storiesWithProgress,
  };
};
