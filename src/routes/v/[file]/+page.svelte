<script lang="ts">
    import type { PageProps } from "./$types";
    let { data }: PageProps = $props();
    console.log(data);
</script>

<div class="flex text-center justify-center items-center">
    <div class="border-2 border-ctp-red p-4">
        <h1>{data.file} file</h1>
    </div>
    <div>
        {#if data.contentType.startsWith("image")}
            <img src={`/u/${data.file}`} alt="uploaded file" />
        {:else if data.contentType.startsWith("video")}
            <video width="320" height="240" controls>
                <source src={`/u/${data.file}`} type={data.contentType} />
                your browser does not support previewing this video type.
            </video>
        {:else}
            <p>[no preview avaliable]</p>
        {/if}
    </div>
</div>
