import "svelte-clerk/env";

declare global {
  namespace App {
    interface PageData {
      auth?: {
        userId: string | null;
      };
    }
  }
}

export {};
