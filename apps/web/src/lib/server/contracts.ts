import {
  type RichTextDoc,
  isRichTextDoc,
  plainTextToRichTextDoc,
  richTextToPlainText,
} from "@talequest/content";
import { Cause, Effect, Exit, Option, Schema } from "effect";

export class RequestValidationError extends Error {
  readonly _tag = "RequestValidationError";

  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

export const runRequestValidation = async <T>(
  effect: Effect.Effect<T, RequestValidationError>,
): Promise<{ ok: true; value: T } | { ok: false; message: string }> => {
  const exit = await Effect.runPromiseExit(effect);

  if (Exit.isSuccess(exit)) {
    return {
      ok: true,
      value: exit.value,
    };
  }

  const failure = Cause.failureOption(exit.cause);

  if (Option.isSome(failure)) {
    return {
      ok: false,
      message: failure.value.message,
    };
  }

  throw Cause.squash(exit.cause);
};

const progressSlugSchema = Schema.Struct({
  slug: Schema.String,
});

const progressUpdateSchema = Schema.Struct({
  slug: Schema.String,
  percent: Schema.Number,
});

const commentCreateSchema = Schema.Struct({
  body: Schema.optional(Schema.String),
  content: Schema.optional(Schema.Unknown),
  guestName: Schema.optional(Schema.String),
});

const decodeWithSchema = <T>(schema: Schema.Schema<T>, input: unknown, message: string) => {
  const parsed = Schema.decodeUnknownEither(schema)(input);

  if (parsed._tag === "Left") {
    return Effect.fail(new RequestValidationError(message));
  }

  return Effect.succeed(parsed.right);
};

const requireNonEmptyTrimmed = (value: string, message: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return Effect.fail(new RequestValidationError(message));
  }

  return Effect.succeed(normalized);
};

export const decodeProgressSlug = (input: unknown) => {
  return Effect.flatMap(
    decodeWithSchema(progressSlugSchema, input, "`slug` is required."),
    ({ slug }) => {
      return Effect.map(requireNonEmptyTrimmed(slug, "`slug` is required."), (value) => ({
        slug: value,
      }));
    },
  );
};

export const decodeStorySlug = (input: unknown) => {
  return decodeProgressSlug(input);
};

export const decodeProgressUpdateBody = (input: unknown) => {
  return Effect.flatMap(
    decodeWithSchema(progressUpdateSchema, input, "`slug` and numeric `percent` are required."),
    ({ slug, percent }) => {
      return Effect.flatMap(
        requireNonEmptyTrimmed(slug, "`slug` and numeric `percent` are required."),
        (normalizedSlug) => {
          if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
            return Effect.fail(
              new RequestValidationError("`percent` must be a number from 0 to 100"),
            );
          }

          return Effect.succeed({
            slug: normalizedSlug,
            percent,
          });
        },
      );
    },
  );
};

export const decodeCommentCreateBody = (input: unknown, hasSignedInUser: boolean) => {
  return Effect.flatMap(
    decodeWithSchema(commentCreateSchema, input, "Invalid JSON payload"),
    ({ body, content, guestName }) => {
      const normalizedBody = body?.trim();
      const normalizedGuestName = guestName?.trim();
      const commentContent =
        content ?? (normalizedBody ? plainTextToRichTextDoc(normalizedBody) : null);

      if (!commentContent || !isRichTextDoc(commentContent)) {
        return Effect.fail(new RequestValidationError("Comment content is invalid"));
      }

      if (!richTextToPlainText(commentContent)) {
        return Effect.fail(new RequestValidationError("Comment body is required"));
      }

      if (!hasSignedInUser && !normalizedGuestName) {
        return Effect.fail(
          new RequestValidationError("Guest name is required for anonymous comments"),
        );
      }

      return Effect.succeed({
        content: commentContent as RichTextDoc,
        guestName: normalizedGuestName,
      });
    },
  );
};

export const decodeRequestJson = <T>(
  request: Request,
  decode: (input: unknown) => Effect.Effect<T, RequestValidationError>,
) => {
  return Effect.flatMap(
    Effect.tryPromise({
      try: () => request.json(),
      catch: () => new RequestValidationError("Invalid JSON payload"),
    }),
    decode,
  );
};
