<!-- Main.svelte -->

<script lang="ts">
  import z from "zod";

  import type { IGenerator, Response } from "./types/main";

  import { createMutation } from "@tanstack/svelte-query";
  import { generateResult } from "./lib/routes";

  let error = $state("");
  let isExtension = $state(true);

  let data: IGenerator = $state({
    link: "",
    context: "",
    highlighter: "",
    type: "extension",
  });

  const formSchema = z.object({
    link: z.string().url(),
  });

  const mutation = createMutation<Response>({
    mutationKey: ["generator"],
    mutationFn: () =>
      generateResult({
        type: data.type,
        link: data.link,
        context: data.link ? undefined : data.context,
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
    chrome.runtime.sendMessage(
      { type: "TRIGGER_EXTRACTION" },
      (response: { payload: IGenerator }) => {
        error = "";
        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError.message);
          error = `fatt hi gaya! ${chrome.runtime.lastError.message}`;
          return;
        }

        if (response && response.payload) {
          data = response.payload;
          $mutation.mutate();
        } else {
          error =
            "fatt gaya! no content received, please refresh your browser & try again.";
        }
      }
    );
  }

  const handleFormSubmit = () => {
    const result = formSchema.safeParse({ link: data.link });

    if (!result.success) {
      error = result.error.toString();
      return;
    } else {
      data.type = "link";
      $mutation.mutate();
    }
  };
</script>

<div class="flex flex-col items-center justify-center gap-8">
  <div class="flex flex-col gap-2">
    <button
      onclick={requestDomExtraction}
      class="px-3 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 shadow-sm border border-gray-600 rounded-md font-semibold text-white"
    >
      Get DOM Content
    </button>

    <p class={error && `text-red-500`}>
      {error ? error : $mutation.data ? $mutation.data.text : ""}
    </p>

    <div>
      <form onsubmit={handleFormSubmit}>
        <input
          type="url"
          bind:value={data.link}
          placeholder="Enter a URL..."
          class="border border-blue-300 px-3 py-2 rounded-lg"
        />
        <button
          onclick={requestDomExtraction}
          class="px-3 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 shadow-sm border border-gray-600 rounded-md font-semibold text-white"
        >
          Related to Reference?
        </button>
      </form>
    </div>

    <div class="flex items-center gap-4">
      Switch over current screen?
      <div class="relative inline-flex items-center mr-5">
        <input
          id="toggle"
          type="checkbox"
          class="h-5 w-5"
          bind:checked={isExtension}
        />
      </div>
    </div>
  </div>
</div>
