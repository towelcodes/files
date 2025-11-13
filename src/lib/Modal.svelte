<script lang="ts">
    import { TriangleAlert } from "@lucide/svelte";
    const {
        title,
        description,
        click,
    }: {
        title: string;
        description: string;
        click: () => any;
    } = $props();
</script>

<div class="flex justify-center items-center">
    <div>
        <div class="flex">
            <TriangleAlert />
            <h2>{title}</h2>
        </div>
        <p>{description}</p>
        <div>
            <div class="mx-auto">
                <button
                    class="button border-ctp-red bg-ctp-red"
                    onclick={click}
                >
                    ok
                </button>
            </div>
        </div>
    </div>
</div>
