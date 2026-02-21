import { type RichTextDoc, isRichTextDoc } from "@talequest/content";
import { ConvexError } from "convex/values";
import { Cause, Effect, Exit, Option, Schema } from "effect";

export type BoundaryErrorCode = "auth_required" | "not_found" | "validation_error";

export class BoundaryError extends Error {
  readonly _tag = "BoundaryError";

  constructor(
    readonly code: BoundaryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BoundaryError";
  }
}

const failValidation = (message: string) =>
  Effect.fail(new BoundaryError("validation_error", message));

const decodeWithSchema = <T>(schema: Schema.Schema<T>, input: unknown, message: string) => {
  const parsed = Schema.decodeUnknownEither(schema)(input);

  if (parsed._tag === "Left") {
    return failValidation(message);
  }

  return Effect.succeed(parsed.right);
};

const requireNonEmptyTrimmed = (value: string, message: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return failValidation(message);
  }

  return Effect.succeed(normalized);
};

export const decodeSlug = (value: unknown) => {
  return Effect.flatMap(
    decodeWithSchema(Schema.String, value, "`slug` is required"),
    (slug: string) => requireNonEmptyTrimmed(slug, "`slug` is required"),
  );
};

export const decodeUserId = (value: unknown) => {
  return Effect.flatMap(
    decodeWithSchema(Schema.String, value, "`userId` is required"),
    (userId: string) => requireNonEmptyTrimmed(userId, "`userId` is required"),
  );
};

export const decodeGuestName = (value: unknown) => {
  if (value === undefined || value === null) {
    return Effect.succeed(undefined);
  }

  return Effect.flatMap(
    decodeWithSchema(Schema.String, value, "`guestName` must be a string"),
    (guestName: string) => {
      const normalized = guestName.trim();
      return Effect.succeed(normalized || undefined);
    },
  );
};

export const decodePercent = (value: unknown) => {
  return Effect.flatMap(
    decodeWithSchema(Schema.Number, value, "`percent` must be a number from 0 to 100"),
    (percent: number) => {
      if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
        return failValidation("`percent` must be a number from 0 to 100");
      }

      return Effect.succeed(percent);
    },
  );
};

export const decodeRichTextContent = (value: unknown) => {
  if (!isRichTextDoc(value)) {
    return failValidation("Comment content is invalid");
  }

  return Effect.succeed(value as RichTextDoc);
};

export const failAuthRequired = (message: string) => {
  return Effect.fail(new BoundaryError("auth_required", message));
};

export const failNotFound = (message: string) => {
  return Effect.fail(new BoundaryError("not_found", message));
};

export const failValidationError = (message: string) => {
  return failValidation(message);
};

export const runBoundary = async <T>(effect: Effect.Effect<T, unknown>) => {
  const exit = await Effect.runPromiseExit(effect);

  if (Exit.isSuccess(exit)) {
    return exit.value;
  }

  const failure = Cause.failureOption(exit.cause);

  if (Option.isSome(failure) && failure.value instanceof BoundaryError) {
    throw new ConvexError({
      code: failure.value.code,
      message: failure.value.message,
    });
  }

  throw Cause.squash(exit.cause);
};
