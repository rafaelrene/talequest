import { generateText, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

export type RichTextDoc = JSONContent & {
  type: "doc";
  content: JSONContent[];
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isJsonContentNode = (value: unknown): value is JSONContent => {
  if (!isObjectRecord(value)) {
    return false;
  }

  if (typeof value.type !== "string") {
    return false;
  }

  if ("text" in value && value.text !== undefined && typeof value.text !== "string") {
    return false;
  }

  if ("attrs" in value && value.attrs !== undefined && !isObjectRecord(value.attrs)) {
    return false;
  }

  if ("content" in value && value.content !== undefined) {
    if (!Array.isArray(value.content)) {
      return false;
    }

    if (!value.content.every((child) => isJsonContentNode(child))) {
      return false;
    }
  }

  if ("marks" in value && value.marks !== undefined) {
    if (!Array.isArray(value.marks)) {
      return false;
    }

    if (
      !value.marks.every((mark) => {
        return isObjectRecord(mark) && typeof mark.type === "string";
      })
    ) {
      return false;
    }
  }

  return true;
};

export const isRichTextDoc = (value: unknown): value is RichTextDoc => {
  if (!isObjectRecord(value) || value.type !== "doc") {
    return false;
  }

  if (!Array.isArray(value.content)) {
    return false;
  }

  return value.content.every((node) => isJsonContentNode(node));
};

export const assertRichTextDoc = (value: unknown): RichTextDoc => {
  if (!isRichTextDoc(value)) {
    throw new Error("Invalid ProseMirror JSON document");
  }

  return value;
};

export const plainTextToRichTextDoc = (value: string): RichTextDoc => {
  const lines = value
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    type: "doc",
    content: lines.length
      ? lines.map((line) => ({
          type: "paragraph",
          content: [
            {
              type: "text",
              text: line,
            },
          ],
        }))
      : [
          {
            type: "paragraph",
            content: [],
          },
        ],
  };
};

const collectNodeText = (node: JSONContent | undefined): string => {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return typeof node.text === "string" ? node.text : "";
  }

  return (node.content ?? []).map((child) => collectNodeText(child)).join("");
};

export const richTextToPlainText = (doc: RichTextDoc): string => {
  return collectNodeText(doc).trim();
};

export const richTextToParagraphs = (doc: RichTextDoc): string[] => {
  const text = generateText(doc, [StarterKit], {
    blockSeparator: "\n\n",
  }).trim();

  if (!text) {
    return [];
  }

  return text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};
