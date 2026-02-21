<script lang="ts">
  import type { RichTextDoc } from "@talequest/content";
  import { plainTextToRichTextDoc, richTextToParagraphs } from "@talequest/content";

  type Story = {
    slug: string;
    title: string;
    excerpt: string;
    authorName: string;
    readingMinutes: number;
    content: RichTextDoc;
  };

  type StoryComment = {
    _id: string;
    content: RichTextDoc;
    authorUserId?: string;
    guestName?: string;
    createdAt: string;
  };

  let { data } = $props();

  let percent = $state(0);
  let saveState = $state<"idle" | "saving" | "saved" | "error">("idle");
  let comments = $state<StoryComment[]>([]);
  let commentBody = $state("");
  let guestName = $state("");
  let commentState = $state<"idle" | "saving" | "saved" | "error">("idle");
  let commentError = $state("");

  $effect(() => {
    percent = Number(data.initialPercent ?? 0);
    comments = (data.comments as StoryComment[]) ?? [];
  });

  const story = $derived(data.story as Story);
  const isSignedIn = $derived(Boolean(data.viewerUserId));
  const commentsEndpoint = $derived(`/api/stories/${story.slug}/comments`);

  const paragraphs = $derived.by(() => {
    return richTextToParagraphs(story.content);
  });

  const getCommentParagraphs = (comment: StoryComment): string[] => {
    return richTextToParagraphs(comment.content);
  };

  const formatCommentDate = (createdAt: string): string => {
    return createdAt.includes("T") ? createdAt.split("T")[0] : createdAt;
  };

  const loadComments = async () => {
    const response = await fetch(commentsEndpoint);

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { comments?: StoryComment[] };
    comments = payload.comments ?? [];
  };

  const saveProgress = async () => {
    saveState = "saving";

    const response = await fetch("/api/interactions/progress", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        slug: story.slug,
        percent,
      }),
    });

    saveState = response.ok ? "saved" : "error";
  };

  const submitComment = async (event: SubmitEvent) => {
    event.preventDefault();

    commentError = "";

    const trimmedBody = commentBody.trim();
    const trimmedGuestName = guestName.trim();

    if (!trimmedBody) {
      commentError = "Comment body is required.";
      return;
    }

    if (!isSignedIn && !trimmedGuestName) {
      commentError = "Guest name is required for anonymous comments.";
      return;
    }

    commentState = "saving";

    const response = await fetch(commentsEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content: plainTextToRichTextDoc(trimmedBody),
        guestName: isSignedIn ? undefined : trimmedGuestName,
      }),
    });

    if (!response.ok) {
      commentState = "error";
      commentError = "Could not post comment. Try again.";
      return;
    }

    await loadComments();
    commentBody = "";

    if (!isSignedIn) {
      guestName = "";
    }

    commentState = "saved";
  };
</script>

<article class="space-y-6 rounded-2xl border border-border bg-white/75 p-6 shadow-sm backdrop-blur-sm sm:p-8">
  <a class="text-sm text-brand-600 hover:underline" href="/library">Back to library</a>
  <header>
    <p class="text-xs uppercase tracking-[0.16em] text-brand-600">{story.readingMinutes} min read</p>
    <h1 class="mt-2 font-serif text-4xl leading-tight text-foreground">{story.title}</h1>
    <p class="mt-3 text-neutral-700">{story.excerpt}</p>
    <p class="mt-4 text-sm text-neutral-600">By {story.authorName}</p>
  </header>

  <section class="space-y-4 text-[1.05rem] leading-8 text-neutral-800">
    {#if paragraphs.length === 0}
      <p>{story.excerpt}</p>
    {:else}
      {#each paragraphs as paragraph}
        <p>{paragraph}</p>
      {/each}
    {/if}
  </section>

  {#if Boolean(data.canTrackProgress)}
    <section class="rounded-xl border border-border bg-white/80 p-4">
      <div class="flex items-center justify-between text-sm text-neutral-700">
        <p>Reading progress</p>
        <p>{percent}%</p>
      </div>
      <input bind:value={percent} class="mt-3 w-full accent-brand-600" max="100" min="0" type="range" />
      <div class="mt-3 flex items-center gap-3">
        <button class="rounded-md bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-500" disabled={saveState === "saving"} onclick={saveProgress} type="button">
          {saveState === "saving" ? "Saving..." : "Save progress"}
        </button>
        {#if saveState === "saved"}
          <p class="text-sm text-emerald-700">Saved.</p>
        {:else if saveState === "error"}
          <p class="text-sm text-red-700">Could not save. Try again.</p>
        {/if}
      </div>
    </section>
  {/if}

  <section class="rounded-xl border border-border bg-white/80 p-4">
    <h2 class="font-serif text-2xl text-foreground">Comments</h2>
    <p class="mt-1 text-sm text-neutral-600">Join the conversation.</p>

    <form class="mt-4 space-y-3" onsubmit={submitComment}>
      {#if !isSignedIn}
        <label class="block text-sm text-neutral-700" for="guest-name">
          Guest name
          <input
            bind:value={guestName}
            class="mt-1 w-full rounded-md border border-border bg-white px-3 py-2"
            id="guest-name"
            maxlength="60"
            required
            type="text"
          />
        </label>
      {/if}

      <label class="block text-sm text-neutral-700" for="comment-body">
        Comment
        <textarea
          bind:value={commentBody}
          class="mt-1 min-h-24 w-full rounded-md border border-border bg-white px-3 py-2"
          id="comment-body"
          maxlength="1000"
          required
        ></textarea>
      </label>

      <div class="flex items-center gap-3">
        <button class="rounded-md bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-500" disabled={commentState === "saving"} type="submit">
          {commentState === "saving" ? "Posting..." : "Post comment"}
        </button>
        {#if commentState === "saved"}
          <p class="text-sm text-emerald-700">Posted.</p>
        {:else if commentError}
          <p class="text-sm text-red-700">{commentError}</p>
        {/if}
      </div>
    </form>

    <div class="mt-6 space-y-4">
      {#if comments.length === 0}
        <p class="text-sm text-neutral-600">No comments yet.</p>
      {:else}
        {#each comments as comment (comment._id)}
          <article class="rounded-lg border border-border bg-white p-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-medium text-neutral-800">{comment.guestName ?? "Signed reader"}</p>
              <p class="text-xs text-neutral-500">{formatCommentDate(comment.createdAt)}</p>
            </div>
            <div class="mt-2 space-y-2 text-sm leading-6 text-neutral-700">
              {#each getCommentParagraphs(comment) as paragraph}
                <p>{paragraph}</p>
              {/each}
            </div>
          </article>
        {/each}
      {/if}
    </div>
  </section>
</article>
