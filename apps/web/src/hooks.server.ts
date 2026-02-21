import type { Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { withClerkHandler } from "svelte-clerk/server";

const fallbackHandle: Handle = async ({ event, resolve }) => {
  event.locals.auth = () =>
    ({
      userId: null,
    }) as ReturnType<App.Locals["auth"]>;

  return resolve(event);
};

const hasClerkSecretKey =
  typeof env.CLERK_SECRET_KEY === "string" && env.CLERK_SECRET_KEY.length > 0;

export const handle: Handle = hasClerkSecretKey ? withClerkHandler() : fallbackHandle;
