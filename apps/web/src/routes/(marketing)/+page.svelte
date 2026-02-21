<script lang="ts">
  import { buttonVariants } from "@talequest/ui";
</script>

<section class="rounded-2xl border border-border bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
  <p class="mb-2 text-sm uppercase tracking-[0.18em] text-brand-600">Foundation Ready</p>
  <h1 class="font-serif text-4xl leading-tight text-foreground sm:text-5xl">Read without friction, write without limits.</h1>
  <p class="mt-4 max-w-2xl text-base text-neutral-700 sm:text-lg">
    TaleQuest web now includes Clerk authentication, a shared app shell, and protected interaction
    endpoints while public reading routes remain open.
  </p>
  <div class="mt-6 flex gap-3">
    <a class={buttonVariants()} href="/library">Browse seeded stories</a>
    <a class={buttonVariants({ variant: "ghost" })} href="https://kit.svelte.dev/docs" rel="noreferrer" target="_blank">SvelteKit docs</a>
  </div>
</section>
