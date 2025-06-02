<script lang="ts">
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import z from "zod";

  import { marked } from "marked";
  import { fetchStatus, generateResult } from "./lib/routes";
  import type { IGenerator, Response } from "./types/main";

  let error = "";
  const isChrome = typeof chrome !== "undefined" && chrome.runtime?.id;

  let isExtension = !!isChrome;

  let data: IGenerator = {
    link: "",
    context: "",
    highlighter: "",
    type: "extension",
  };

  const queryClient = useQueryClient();

  const statusQuery = createQuery<string>({
    queryKey: ["status"],
    queryFn: fetchStatus,
    retry: 2,
  });

  const formSchema = z.object({
    link: z.string().url(),
  });

  const mutation = createMutation<Response>({
    mutationKey: ["generator"],
    mutationFn: () =>
      generateResult({
        type: isExtension ? "extension" : "link",
        link: isExtension ? undefined : data.link,
        context: isExtension ? data.context : undefined,
        highlighter:
          data.highlighter || "please provide me summary of link shared",
      }),
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ["status"] }),
        (error =
          err instanceof Error ? err.message : JSON.stringify(err).toString());
    },
  });

  function requestDomExtraction() {
    if (!isExtension) return;

    chrome.runtime.sendMessage(
      { type: "TRIGGER_EXTRACTION" },
      (response: { payload: IGenerator }) => {
        error = "";
        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError.message);
          error = `Extraction error: ${chrome.runtime.lastError.message}`;
          return;
        }

        if (response?.payload) {
          data = response.payload;
          $mutation.mutate();
        } else {
          error =
            "No content received. Please refresh the browser and try again.";
        }
      }
    );
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault();
    error = "";

    if (isExtension) {
      requestDomExtraction();
    } else {
      const result = formSchema.safeParse({ link: data.link });
      if (!result.success) {
        error = result.error.toString();
        return;
      }

      $mutation.mutate();
    }
  }
</script>

<div class="flex flex-col items-center justify-center gap-8">
  <div
    class="flex items-center border border-blue-400 shadow-sm px-3 py-0.5 gap-2 w-max rounded-full"
  >
    {#if $statusQuery.isLoading}
      <div class="size-3 rounded-full bg-yellow-400"></div>
    {:else}
      <div
        class={`size-3 rounded-full ${$statusQuery.isError ? "bg-red-500" : "bg-green-400"}`}
      ></div>
    {/if}
    <span>status</span>
  </div>
  <div class="flex flex-col gap-2 items-center">
    <form on:submit={handleFormSubmit} class="flex flex-col gap-2">
      {#if !isExtension}
        <input
          type="url"
          bind:value={data.link}
          placeholder="Enter a URL..."
          class="border border-blue-300 px-3 py-2 rounded-lg w-2xs"
        />
      {/if}
      <button
        type="submit"
        disabled={$mutation.isPending}
        class={`px-3 py-2 shadow-sm border border-gray-600 w-2xs rounded-md font-semibold ${$mutation.isPending ? "bg-gray-500 cursor-not-allowed text-gray-200" : "text-white bg-blue-500 hover:bg-blue-600 cursor-pointer"}`}
      >
        {isExtension ? "Get DOM Content" : "Submit URL"}
      </button>
    </form>

    {#if !!isChrome}
      <div class="flex items-center gap-4">
        Use current screen (extension)?
        <div class="relative inline-flex items-center">
          <input
            id="toggle"
            type="checkbox"
            class="h-5 w-5 toggle"
            bind:checked={isExtension}
            on:change={() => console.log("toggle", isExtension)}
          />
        </div>
      </div>
    {/if}

    <div>
      {#if error}
        <p class="text-red-500">{error}</p>
      {:else if $mutation.data}
        <div class="prose max-w-none">
          <p class="text-blue-100">
            {@html marked.parse($mutation.data.text)}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
