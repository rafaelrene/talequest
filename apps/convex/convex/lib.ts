import { DateTime } from "luxon";

type ConvexCtx = {
  auth: {
    getUserIdentity: () => Promise<{ subject: string } | null>;
  };
};

export const nowIso = (): string => DateTime.utc().toISO() ?? new Date().toISOString();

export const normalizeText = (value: string): string => value.trim().replaceAll(/\s+/g, " ");

export const getViewerUserId = async (ctx: ConvexCtx): Promise<string | null> => {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
};
