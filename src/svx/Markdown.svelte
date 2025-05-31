<script lang="ts">
  import { marked } from "marked";
  export let content = "";
</script>

<div>{@html marked(content)}</div>
