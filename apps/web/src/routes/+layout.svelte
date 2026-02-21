<script lang="ts">
  import { onMount } from "svelte";
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { publicEnv } from "$lib/env";
  import {
    isThemePreference,
    THEME_COOKIE_MAX_AGE_SECONDS,
    THEME_COOKIE_NAME,
    THEME_STORAGE_KEY,
    type ThemePreference,
  } from "$lib/theme";
  import {
    ClerkProvider,
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
  } from "svelte-clerk";

  let { children, data } = $props();

  let theme = $state<ThemePreference>("light");

  const applyTheme = (value: ThemePreference) => {
    document.documentElement.setAttribute("data-theme", value);
  };

  const persistTheme = (value: ThemePreference) => {
    localStorage.setItem(THEME_STORAGE_KEY, value);
    document.cookie = `${THEME_COOKIE_NAME}=${value}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  };

  const readCookieTheme = (): ThemePreference | null => {
    const cookieTheme = document.cookie
      .split(";")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${THEME_COOKIE_NAME}=`))
      ?.slice(THEME_COOKIE_NAME.length + 1);

    return isThemePreference(cookieTheme) ? cookieTheme : null;
  };

  const resolveTheme = (serverTheme: unknown): ThemePreference => {
    if (isThemePreference(serverTheme)) {
      return serverTheme;
    }

    const storageTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (isThemePreference(storageTheme)) {
      return storageTheme;
    }

    const cookieTheme = readCookieTheme();

    if (cookieTheme) {
      return cookieTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const setTheme = (value: ThemePreference) => {
    theme = value;
    applyTheme(value);
    persistTheme(value);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  onMount(() => {
    const initialTheme = resolveTheme((data as { theme?: unknown }).theme);
    setTheme(initialTheme);
  });
</script>

<svelte:head>
  <title>{publicEnv.PUBLIC_APP_NAME}</title>
  <meta name="description" content="Read and share stories on TaleQuest." />
  <link rel="icon" href={favicon} />
</svelte:head>

{#if (data as { clerkEnabled?: boolean }).clerkEnabled && publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY}
  <ClerkProvider publishableKey={publicEnv.PUBLIC_CLERK_PUBLISHABLE_KEY}>
    <div class="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-8">
      <header class="mb-8 flex items-center justify-between border-b border-border pb-4">
        <div>
          <p class="font-serif text-2xl tracking-tight">{publicEnv.PUBLIC_APP_NAME}</p>
          <p class="text-sm text-foreground/70">Stories worth revisiting.</p>
        </div>
        <nav class="flex items-center gap-3 text-sm">
          <a class="rounded-md px-3 py-2 hover:bg-muted" href="/">Discover</a>
          <a class="rounded-md px-3 py-2 hover:bg-muted" href="/library">Library</a>
          <button class="cursor-pointer rounded-md px-3 py-2 hover:bg-muted" type="button" onclick={toggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <SignedOut>
            <SignInButton mode="modal">
              {#snippet children()}
                <button class="cursor-pointer rounded-md px-3 py-2 hover:bg-muted" type="button">Sign in</button>
              {/snippet}
            </SignInButton>
            <SignUpButton mode="modal">
              {#snippet children()}
                <button class="cursor-pointer rounded-md bg-brand-600 px-3 py-2 text-white hover:bg-brand-700" type="button">Sign up</button>
              {/snippet}
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </header>
      <main class="flex-1">{@render children()}</main>
    </div>
  </ClerkProvider>
{:else}
  <div class="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-8">
    <header class="mb-8 flex items-center justify-between border-b border-border pb-4">
      <div>
        <p class="font-serif text-2xl tracking-tight">{publicEnv.PUBLIC_APP_NAME}</p>
        <p class="text-sm text-foreground/70">Stories worth revisiting.</p>
      </div>
      <nav class="flex items-center gap-3 text-sm">
        <a class="rounded-md px-3 py-2 hover:bg-muted" href="/">Discover</a>
        <a class="rounded-md px-3 py-2 hover:bg-muted" href="/library">Library</a>
        <button class="cursor-pointer rounded-md px-3 py-2 hover:bg-muted" type="button" onclick={toggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <button class="cursor-pointer rounded-md px-3 py-2 hover:bg-muted" type="button">Sign in</button>
        <button class="cursor-pointer rounded-md bg-brand-600 px-3 py-2 text-white hover:bg-brand-700" type="button">Sign up</button>
      </nav>
    </header>
    <main class="flex-1">{@render children()}</main>
  </div>
{/if}
