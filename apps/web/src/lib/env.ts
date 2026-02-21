import { env } from "$env/dynamic/public";

type PublicEnv = {
  PUBLIC_APP_NAME: string;
  PUBLIC_CONVEX_URL: string;
  PUBLIC_CLERK_PUBLISHABLE_KEY: string;
};

export const publicEnv: PublicEnv = {
  PUBLIC_APP_NAME: env.PUBLIC_APP_NAME ?? "TaleQuest",
  PUBLIC_CONVEX_URL: env.PUBLIC_CONVEX_URL ?? "",
  PUBLIC_CLERK_PUBLISHABLE_KEY: env.PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
};
