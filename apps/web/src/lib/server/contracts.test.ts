import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
  decodeCommentCreateBody,
  decodeProgressSlug,
  decodeProgressUpdateBody,
  decodeRequestJson,
  decodeStorySlug,
  runRequestValidation,
} from "./contracts";

describe("request contracts", () => {
  it("decodes and trims progress slug", async () => {
    await expect(
      Effect.runPromise(decodeProgressSlug({ slug: "  starter-story  " })),
    ).resolves.toEqual({ slug: "starter-story" });
  });

  it("rejects invalid progress payload", async () => {
    await expect(
      Effect.runPromise(decodeProgressUpdateBody({ slug: "story", percent: "20" })),
    ).rejects.toThrowError("`slug` and numeric `percent` are required.");
  });

  it("rejects out-of-range progress percent", async () => {
    await expect(
      Effect.runPromise(decodeProgressUpdateBody({ slug: "story", percent: 101 })),
    ).rejects.toThrowError("`percent` must be a number from 0 to 100");
  });

  it("rejects empty story slug", async () => {
    await expect(Effect.runPromise(decodeStorySlug({ slug: "   " }))).rejects.toThrowError(
      "`slug` is required.",
    );
  });

  it("requires guest name for anonymous comments", async () => {
    await expect(
      Effect.runPromise(decodeCommentCreateBody({ body: "hello" }, false)),
    ).rejects.toThrowError("Guest name is required for anonymous comments");
  });

  it("accepts rich text comment payload", async () => {
    await expect(
      Effect.runPromise(
        decodeCommentCreateBody(
          {
            content: {
              type: "doc",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Nice chapter" }] }],
            },
            guestName: "  Ada  ",
          },
          false,
        ),
      ),
    ).resolves.toMatchObject({ guestName: "Ada" });
  });

  it("maps malformed request json to validation error", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: "{",
      headers: {
        "content-type": "application/json",
      },
    });

    await expect(
      Effect.runPromise(decodeRequestJson(request, decodeProgressUpdateBody)),
    ).rejects.toThrowError("Invalid JSON payload");
  });

  it("unwraps validation failures without throwing fiber errors", async () => {
    const result = await runRequestValidation(decodeCommentCreateBody({ body: "hello" }, false));

    expect(result).toEqual({
      ok: false,
      message: "Guest name is required for anonymous comments",
    });
  });
});
