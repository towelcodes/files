<script lang="ts">
    let { title, children, icon, border, text, size = "" } = $props();
</script>

<div class="{border} border-2 rounded relative p-4 {size}">
    <div
        class="{text} absolute bg-bg italic -top-2.5 text-sm px-1 flex gap-1 *:my-auto"
    >
        {@render icon()}
        <div>{title}</div>
    </div>
    {@render children()}
</div>
