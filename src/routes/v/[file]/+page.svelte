<script lang="ts">
    import type { PageProps } from "./$types";
    let { data }: PageProps = $props();
</script>

<div class="flex text-center justify-center items-center">
    <div class="border-2 border-ctp-red p-4">
        <h1>{data.file} file</h1>
    </div>
</div>
