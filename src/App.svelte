<!-- App.svelte -->

<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import Main from "./Main.svelte";

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <main
    class="text-white min-h-screen max-w-screen min-w-[400px] max-h-[600px] bg-gray-900 text-center flex grow flex-col p-4"
  >
    <header class="flex flex-col gap-2 items-center py-8">
      <h1 class="font-bold text-3xl text-blue-400">highliSense</h1>
      <h2 class="font-semibold text-md text-blue-200">
        highly sensible to understands your highlighted context
      </h2>
    </header>

    <section
      class="flex-1 p-4 overflow-auto border border-gray-400 rounded border-dashed"
    >
      <Main />
    </section>

    <footer class="basis-15 flex justify-center items-center">
      <span class="text-blue-300">developed with 💙 by @aminoxix</span>
    </footer>
  </main>
</QueryClientProvider>
