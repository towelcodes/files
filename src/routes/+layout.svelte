<script lang="ts">
    import { PUBLIC_REPO_URL } from "$env/static/public";
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<footer class="text-ctp-subtext0 text-xs font-pixel text-center mt-4">
    teatowel powered 2025 ♥ <br />
    <a href={PUBLIC_REPO_URL}>view source code</a>
</footer>
