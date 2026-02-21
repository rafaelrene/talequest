export const THEME_COOKIE_NAME = "tq_theme";
export const THEME_STORAGE_KEY = "tq_theme";

export type ThemePreference = "light" | "dark";

export const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark";
