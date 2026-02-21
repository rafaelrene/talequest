import { describe, expect, it } from "vitest";
import {
  isRichTextDoc,
  plainTextToRichTextDoc,
  richTextToParagraphs,
  richTextToPlainText,
} from "./index";

describe("content helpers", () => {
  it("converts plain text to rich text paragraphs", () => {
    const doc = plainTextToRichTextDoc("First line\n\nSecond line");

    expect(isRichTextDoc(doc)).toBe(true);
    expect(richTextToParagraphs(doc)).toEqual(["First line", "Second line"]);
  });

  it("creates an empty paragraph for empty input", () => {
    const doc = plainTextToRichTextDoc("   \n");

    expect(doc.content).toEqual([{ type: "paragraph", content: [] }]);
    expect(richTextToPlainText(doc)).toBe("");
  });

  it("rejects malformed rich text docs", () => {
    expect(isRichTextDoc({ type: "doc", content: [{}] })).toBe(false);
  });
});
