<script lang="ts">
    import { Eye, Download, TriangleAlert, Plus } from "@lucide/svelte";
    import type { PageProps } from "./$types";
    let { data, form }: PageProps = $props();
    console.log(data);
    console.log(form);
</script>

<div class="flex text-center justify-center items-center mt-4">
    <div class="w-max md:w-4/5 lg:w-2/3 p-4 border-2 border-ctp-mauve">
        <div
            class="flex gap-2 text-ctp-crust font-bold font-mono absolute top-1"
        >
            <div class="flex *my:auto gap-2 py-1 px-2 bg-ctp-mauve w-min">
                <Eye />
                <div>Preview</div>
            </div>
            <a
                class="bg-ctp-maroon px-2 hover:cursor-pointer"
                href="/u/{data.file}"
                download={data.file}
            >
                <Download />
            </a>
            <a class="bg-ctp-maroon px-2 hover:cursor-pointer" href="/">
                <Plus />
            </a>
        </div>
        <div class="p-2 text-left font-bold font-mono flex *:my-auto gap-2">
            <div class="flex">
                <a href="/v/{data.file}" class="no-underline">{data.file}</a>
            </div>
            <span class="bg-ctp-surface1 text-sm px-2">{data.contentType}</span>
            <span class="bg-ctp-blue text-sm text-ctp-crust px-2"
                >{data.lastModified}</span
            >
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
</div>
