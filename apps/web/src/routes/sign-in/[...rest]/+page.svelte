<script lang="ts">
  import { SignIn } from "svelte-clerk";
</script>

<section class="rounded-2xl border border-border bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
  <h1 class="mb-4 font-serif text-3xl text-foreground">Sign in</h1>
  <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
</section>
