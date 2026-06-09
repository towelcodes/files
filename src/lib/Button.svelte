<script lang="ts">
    /* expect classes to be the tailwind bg class for the colour */
    const {
        classes,
        icon = undefined,
        callback = undefined,
        children = undefined,
    } = $props();
</script>

<button
    class="flex gap-2 transition hover:cursor-pointer hover:transform-[scale(1.05)] active:transform-[scale(0.95)] text-ctp-crust rounded px-2 py-1 border-4 border-ctp-crust font-bold {classes}"
    onclick={() => callback?.()}
>
    {#if icon}
        {@render icon()}
    {/if}
    {#if children}
        <div>
            {@render children()}
        </div>
    {/if}
</button>
