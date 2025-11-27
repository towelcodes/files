<script lang="ts">
    let {
        progress,
        total,
        classList,
    }: { progress: number; total?: number; classList?: string } = $props();
    let root: HTMLDivElement | undefined = $state();
    let currentWidth = $derived(root?.offsetWidth ?? 20);
</script>

<div class="h-2 rounded bg-ctp-surface2 p-0 {classList}" bind:this={root}>
    <div
        class="transition-all h-2 rounded bg-ctp-mauve"
        style="width: calc(calc({progress}px/{total ?? 1}px)*{currentWidth}px)"
    ></div>
</div>
