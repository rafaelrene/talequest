import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import {
  decodeCommentCreateBody,
  decodeRequestJson,
  decodeStorySlug,
  runRequestValidation,
} from "$lib/server/contracts";
import { getConvexToken } from "$lib/server/auth";
import { runConvexMutation, runConvexQuery } from "$lib/server/convex";

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

  const comments = await runConvexQuery("comments:listForStory", {
    slug: decodedSlug.value.slug,
  });

  return json({
    comments,
  });
};

export const POST: RequestHandler = async ({ locals, params, request }) => {
  const userId = locals.auth().userId;
  const token = userId ? await getConvexToken(locals) : null;
  let slug: string;
  let payload: { content: unknown; guestName?: string };

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

  ({ slug } = decodedSlug.value);

  const decodedPayload = await runRequestValidation(
    decodeRequestJson(request, (input) => decodeCommentCreateBody(input, Boolean(userId))),
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

  const commentId = await runConvexMutation(
    "comments:create",
    {
      slug,
      content: payload.content,
      guestName: payload.guestName,
    },
    { token, viewerUserId: userId },
  );

  return json({
    ok: true,
    commentId,
  });
};
