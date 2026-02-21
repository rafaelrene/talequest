import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexToken, requireUserId } from "$lib/server/auth";
import {
  decodeProgressSlug,
  decodeProgressUpdateBody,
  decodeRequestJson,
  runRequestValidation,
} from "$lib/server/contracts";
import { runConvexMutation, runConvexQuery } from "$lib/server/convex";

export const GET: RequestHandler = async ({ locals, url }) => {
  const userId = requireUserId(locals);
  const token = await getConvexToken(locals);
  let slug: string;

  const decodedSlug = await runRequestValidation(
    decodeProgressSlug({ slug: url.searchParams.get("slug") }),
  );

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

  ({ slug } = decodedSlug.value);

  const progress = await runConvexQuery(
    "progress:getForViewer",
    {
      slug,
    },
    { token, viewerUserId: userId },
  );

  return json({
    ok: true,
    progress,
  });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  const userId = requireUserId(locals);
  const token = await getConvexToken(locals);
  let payload: { slug: string; percent: number };

  const decodedPayload = await runRequestValidation(
    decodeRequestJson(request, decodeProgressUpdateBody),
  );

  if (!decodedPayload.ok) {
    return json(
      {
        ok: false,
        code: "validation_error",
        message: decodedPayload.message,
      },
      { status: 400 },
    );
  }

  payload = decodedPayload.value;

  const progressId = await runConvexMutation(
    "progress:upsertForViewer",
    {
      slug: payload.slug,
      percent: payload.percent,
    },
    { token, viewerUserId: userId },
  );

  return json({
    ok: true,
    progressId,
  });
};
