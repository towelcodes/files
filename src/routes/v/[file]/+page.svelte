<script lang="ts">
    import { env } from "$env/dynamic/public";
    import {
        Eye,
        Download,
        Flag,
        Link,
        Trash,
        Pencil,
        TriangleAlert,
        Plus,
    } from "@lucide/svelte";
    import type { PageProps } from "./$types";
    import Button from "$lib/Button.svelte";
    import { prettyNumber } from "$lib/util";
    let { data }: PageProps = $props();

    const properties = [
        ["filename", data.file],
        ["size", `${prettyNumber(data.size)}B`],
        ["date", data.lastModified],
        ["type", data.contentType],
    ];

    function report() {}

    function edit() {}

    function del() {}

    function copyUrl() {
        const copyText: HTMLDivElement =
            document.querySelector("#downloadUrl")!!;
        const selection = window.getSelection()!!;
        const range = document.createRange();
        range.selectNodeContents(copyText);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy");
    }
</script>

<svelte:head>
    <meta property="og:title" content={data.file} />
    <meta property="og:type" content="video.other" />
    <meta property="og:url" content={`${env.PUBLIC_BASE_URL}/u/${data.file}`} />
    {#if data.contentType.startsWith("image")}
        <meta
            property="og:image"
            content={`${env.PUBLIC_BASE_URL}/u/${data.file}`}
        />
    {:else}
        <meta
            property="og:image"
            content={`${env.PUBLIC_BASE_URL}/default.png`}
        />
    {/if}
    {#if data.contentType.startsWith("video")}
        <meta
            property="og:video"
            content={`${env.PUBLIC_BASE_URL}/u/${data.file}`}
        />
    {/if}
</svelte:head>

<!-- add download button so we can reuse it later -->
{#snippet download_icon()}
    <Download />
{/snippet}
{#snippet download_button()}
    <a href="/u/{data.file}" download={data.file} class="no-underline w-min">
        <Button classes="bg-ctp-green w-min" icon={download_icon}
            >Download</Button
        >
    </a>
{/snippet}

<div
    class="w-full h-full flex items-center justify-around flex-col md:flex-row gap-6 px-8"
>
    <div class="flex flex-1 flex-col gap-2">
        <!-- title and buttons -->
        <div class="flex gap-2">
            <div class="rounded bg-ctp-crust w-min px-4 py-2 grow my-auto">
                <h1 class="text-4xl font-display text-ctp-subtext0 italic">
                    {data.file}
                </h1>
                <div class="text-sm text-ctp-subtext0 text-nowrap">
                    by {data.uploader}
                </div>
            </div>
            <div class="flex flex-col gap-1 justify-around">
                <!-- buttons -->
                <div class="flex gap-1 mx-auto">
                    {@render download_button()}

                    {#snippet report_icon()}
                        <Flag />
                    {/snippet}
                    <Button classes="bg-ctp-surface1" icon={report_icon} />

                    {#snippet edit_icon()}
                        <Pencil />
                    {/snippet}
                    <Button classes="bg-ctp-surface1" icon={edit_icon} />

                    {#snippet delete_icon()}
                        <Trash />
                    {/snippet}
                    <Button classes="bg-ctp-surface1" icon={delete_icon} />
                </div>

                <!-- url -->
                <div
                    class="relative bg-ctp-crust text-ctp-subtext0 font-mono text-sm w-full rounded-sm py-2 px-2 text-nowrap overflow-x-auto"
                    id="downloadUrl"
                >
                    {#snippet link_icon()}
                        <Link class="h-5 w-4" />
                    {/snippet}
                    <Button
                        classes="absolute text-ctp-text! bg-ctp-surface0 right-0 top-0"
                        icon={link_icon}
                        callback={copyUrl}
                    />
                    {env.PUBLIC_BASE_URL}/u/{data.file}
                </div>
            </div>
        </div>

        <!-- preview -->
        <div class="bg-ctp-crust rounded px-4 py-4">
            <div class="max-w-2xl mx-auto">
                {#if data.contentType.startsWith("image")}
                    <img
                        src={`/u/${data.file}`}
                        alt=""
                        class="max-h-[32em] mx-auto"
                    />
                {:else if data.contentType.startsWith("video")}
                    <video width="320" height="240" class="mx-auto" controls>
                        <source
                            src={`/u/${data.file}`}
                            type={data.contentType}
                        />
                        your browser does not support previewing this video type.
                    </video>
                {:else}
                    <div class="w-full text-center">
                        <div class="flex flex-col">
                            <div
                                class="grow flex items-center justify-center py-4"
                            >
                                <div
                                    class="rounded-full bg-ctp-mantle w-20 h-20 text-4xl font-bold flex items-center justify-center"
                                >
                                    <h1 class="text-ctp-maroon">?</h1>
                                </div>
                            </div>
                        </div>

                        <h3 class="text-ctp-subtext0 mb-2">
                            this file type can't be previewed yet.
                        </h3>
                        <div class="[&_button]:mx-auto my-4">
                            {@render download_button()}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    <div class="flex flex-col gap-6 w-min">
        <div
            class="relative rounded border-4 border-ctp-surface0 px-4 py-2 pt-6 w-sm"
        >
            <h2 class="font-display text-4xl absolute -top-6 bg-bg px-1">
                properties
            </h2>
            <div class="flex flex-col gap-1">
                {#each properties as [property, value]}
                    <div class="flex *:py-1">
                        <div
                            class="relative z-10 rounded-sm w-[12em] bg-ctp-mantle font-bold text-center -mr-2"
                        >
                            {property}
                        </div>
                        <div
                            class="rounded-sm w-full bg-ctp-crust font-mono text-sm -ml-2 pl-7 leading-6"
                        >
                            {value}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        <div
            class="relative rounded border-4 border-ctp-surface0 px-4 py-2 pt-5 w-sm"
        >
            <h2 class="font-display text-4xl absolute -top-6 bg-bg px-1">
                about
            </h2>
            <i class="text-ctp-subtext0"
                >The uploader did not provide any additional information.</i
            >
        </div>
    </div>
</div>
