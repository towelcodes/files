<script lang="ts">
    import { PUBLIC_REPO_URL } from "$env/static/public";
    import "../app.css";
    import faviconDark from "$lib/assets/favicon-dark.svg";
    import faviconLight from "$lib/assets/favicon-light.svg";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={faviconDark} media="(prefers-color-scheme: dark)" />
    <link
        rel="icon"
        href={faviconLight}
        media="(prefers-color-scheme: light)"
    />
</svelte:head>

{@render children?.()}

<footer class="text-ctp-subtext0 text-xs font-pixel text-center mt-4">
    <a href="https://towel.codes">towel.codes</a> 2026 ♥ <br />
    <a href={PUBLIC_REPO_URL}>view source code</a>
</footer>
