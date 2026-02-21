<script lang="ts">
  type StoryListItem = {
    slug: string;
    title: string;
    excerpt: string;
    authorName: string;
    readingMinutes: number;
    progressPercent: number | null;
  };

  let { data }: { data: { stories: StoryListItem[] } } = $props();
</script>

<section class="space-y-4 rounded-2xl border border-border bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
  <h1 class="font-serif text-3xl text-foreground">Library</h1>
  <p class="text-neutral-700">Seeded stories are public and ready to read.</p>
</section>

<section class="mt-6 grid gap-4 sm:grid-cols-2">
  {#if data.stories.length === 0}
    <article class="rounded-xl border border-border bg-white/80 p-5 text-neutral-700">No stories seeded yet.</article>
  {:else}
    {#each data.stories as story}
      <a class="rounded-xl border border-border bg-white/80 p-5 transition hover:-translate-y-0.5 hover:border-brand-500" href={`/library/${story.slug}`}>
        <p class="text-xs uppercase tracking-[0.16em] text-brand-600">{story.readingMinutes} min read</p>
        <h2 class="mt-2 font-serif text-2xl text-foreground">{story.title}</h2>
        <p class="mt-2 text-sm text-neutral-700">{story.excerpt}</p>
        {#if story.progressPercent !== null}
          <div class="mt-4 rounded-md border border-border bg-brand-50/60 p-3">
            <div class="flex items-center justify-between text-xs uppercase tracking-[0.08em] text-brand-700">
              <p>Your progress</p>
              <p>{story.progressPercent}%</p>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-brand-100">
              <div class="h-full rounded-full bg-brand-600" style={`width: ${story.progressPercent}%`}></div>
            </div>
          </div>
        {/if}
        <p class="mt-4 text-sm text-neutral-600">By {story.authorName}</p>
      </a>
    {/each}
  {/if}
</section>
