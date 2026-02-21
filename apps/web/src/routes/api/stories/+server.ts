import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { runConvexQuery } from "$lib/server/convex";

export const GET: RequestHandler = async () => {
  const stories = await runConvexQuery("stories:listPublic", {});

  return json({
    stories,
  });
};
