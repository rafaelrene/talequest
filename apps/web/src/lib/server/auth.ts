import { error } from "@sveltejs/kit";

export const requireUserId = (locals: App.Locals): string => {
  const { userId } = locals.auth();

  if (!userId) {
    throw error(401, "Authentication required");
  }

  return userId;
};

type AuthWithToken = {
  getToken?: (options?: { template?: string }) => Promise<string | null>;
};

export const getConvexToken = async (locals: App.Locals): Promise<string | null> => {
  const auth = locals.auth() as AuthWithToken;

  if (typeof auth.getToken !== "function") {
    return null;
  }

  return await auth.getToken({ template: "convex" });
};
