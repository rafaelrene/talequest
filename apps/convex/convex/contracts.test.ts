import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import {
  decodeGuestName,
  decodePercent,
  decodeRichTextContent,
  decodeSlug,
  failAuthRequired,
  runBoundary,
} from "./contracts";

describe("convex boundary contracts", () => {
  it("trims slug values", async () => {
    await expect(runBoundary(decodeSlug("  starter-story  "))).resolves.toBe("starter-story");
  });

  it("rejects out-of-range percent", async () => {
    await expect(runBoundary(decodePercent(120))).rejects.toMatchObject({
      data: {
        code: "validation_error",
        message: "`percent` must be a number from 0 to 100",
      },
    });
  });

  it("normalizes guest name to undefined when blank", async () => {
    await expect(runBoundary(decodeGuestName("   "))).resolves.toBeUndefined();
  });

  it("accepts valid rich text content", async () => {
    await expect(
      runBoundary(
        decodeRichTextContent({
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
        }),
      ),
    ).resolves.toMatchObject({ type: "doc" });
  });

  it("maps auth boundary failures into ConvexError payloads", async () => {
    await expect(runBoundary(failAuthRequired("Authentication required"))).rejects.toMatchObject({
      data: {
        code: "auth_required",
        message: "Authentication required",
      },
    });
  });

  it("does not wrap non-boundary errors", async () => {
    const boom = new Error("boom");

    await expect(runBoundary(Effect.fail(boom))).rejects.toThrowError("boom");
  });
});
