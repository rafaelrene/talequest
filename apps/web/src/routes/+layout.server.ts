import type { LayoutServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { buildClerkProps } from "svelte-clerk/server";
import { isThemePreference, THEME_COOKIE_NAME } from "$lib/theme";

export const load: LayoutServerLoad = ({ locals, cookies }) => {
  const clerkEnabled = typeof env.CLERK_SECRET_KEY === "string" && env.CLERK_SECRET_KEY.length > 0;
  const auth = locals.auth();
  const rawTheme = cookies.get(THEME_COOKIE_NAME);
  const theme = isThemePreference(rawTheme) ? rawTheme : null;

  return {
    ...(clerkEnabled ? buildClerkProps(auth) : {}),
    auth: {
      userId: auth.userId,
    },
    theme,
    clerkEnabled,
  };
};
