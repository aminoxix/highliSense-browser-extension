<script lang="ts">
  import { createMutation } from "@tanstack/svelte-query";
  import z from "zod";

  import { marked } from "marked";
  import { generateResult } from "./lib/routes";
  import type { IGenerator, Response } from "./types/main";

  let error = "";
  let isExtension = true;

  let data: IGenerator = {
    link: "",
    context: "",
    highlighter: "",
    type: "extension",
  };

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
        highlighter: data.highlighter,
      }),
    onSuccess: (data) => alert("success! " + JSON.stringify(data)),
    onError: (err) => {
      alert("failed! " + JSON.stringify(err));
      error =
        err instanceof Error ? err.message : JSON.stringify(err).toString();
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
  <div class="flex flex-col gap-2">
    <form on:submit={handleFormSubmit} class="flex flex-col gap-2">
      {#if !isExtension}
        <input
          type="url"
          bind:value={data.link}
          placeholder="Enter a URL..."
          class="border border-blue-300 px-3 py-2 rounded-lg"
        />
      {/if}
      <button
        type="submit"
        class="px-3 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 shadow-sm border border-gray-600 rounded-md font-semibold text-white"
      >
        {isExtension ? "Get DOM Content" : "Submit URL"}
      </button>
    </form>

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
