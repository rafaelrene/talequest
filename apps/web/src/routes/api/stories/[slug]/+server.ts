import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { decodeStorySlug, runRequestValidation } from "$lib/server/contracts";
import { runConvexQuery } from "$lib/server/convex";

export const GET: RequestHandler = async ({ params }) => {
  const decodedSlug = await runRequestValidation(decodeStorySlug({ slug: params.slug }));

  if (!decodedSlug.ok) {
    return json(
      {
        ok: false,
        code: "validation_error",
        message: decodedSlug.message,
      },
      { status: 400 },
    );
  }

  const story = await runConvexQuery("stories:bySlug", {
    slug: decodedSlug.value.slug,
  });

  if (!story) {
    throw error(404, "Story not found");
  }

  return json({
    story,
  });
};
