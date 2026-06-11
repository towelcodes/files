<script lang="ts">
    import {
        PUBLIC_INSTANCE_NAME,
        PUBLIC_INSTANCE_TAGLINE,
        PUBLIC_INSTANCE_RULES,
        PUBLIC_REPO_URL,
        PUBLIC_BASE_URL,
    } from "$env/static/public";
    import { env } from "$env/dynamic/public";
    import { goto } from "$app/navigation";
    import {
        TriangleAlert,
        Upload,
        File,
        X,
        LoaderCircle,
    } from "@lucide/svelte";
    import { createUpload, prettyNumber } from "$lib/util";
    import Progress from "$lib/Progress.svelte";
    import Container from "$lib/Container.svelte";
    import Notification from "$lib/Notification.svelte";
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";

    const rules = PUBLIC_INSTANCE_RULES.split("\\n");

    let uploadButton,
        clearButton: HTMLButtonElement | undefined = $state();

    let filename = $state("");
    let files: FileList | undefined = $state();
    let progress: { loaded: number; total: number } | undefined = $state();

    let error: { title: string; description: string } | undefined = $state();

    let recentUploads: string[] = $state([]);

    onMount(() => {
        const localStorage = window.localStorage;
        localStorage.getItem("recentUploads") &&
            (recentUploads = JSON.parse(
                localStorage.getItem("recentUploads")!!,
            ));
    });

    async function upload() {
        if (!files) return;
        if (files.item(0) == null) return;
        const file = files.item(0)!!;

        // create the upload
        try {
            const { key, signed } = await createUpload(file.size, file.name);
            const req = new XMLHttpRequest();
            req.open("PUT", signed);
            req.setRequestHeader("Content-Type", file.type);
            await new Promise((resolve) => {
                req.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable) {
                        progress = {
                            loaded: e.loaded,
                            total: e.total,
                        };
                    }
                });
                req.addEventListener("readystatechange", () => {
                    if (req.readyState == 4) {
                        resolve(req.response);
                    }
                });
                req.send(file);
            });

            recentUploads.unshift(key);
            window.localStorage.setItem(
                "recentUploads",
                JSON.stringify(recentUploads),
            );

            clear();
        } catch (e: any) {
            console.error(e);
            error = {
                title: "upload failed",
                description: `${e.message} (check console)`,
            };
            return;
        }

        progress = undefined;
    }

    function clear() {
        files = new DataTransfer().files;
    }

    $effect(() => {
        const file = files?.item(0);
        const maxSize = env.PUBLIC_MAX_SIZE;

        if (file) {
            filename = file.name;

            if (maxSize != undefined && file.size > parseInt(maxSize)) {
                uploadButton!!.disabled = true;
                clearButton!!.disabled = false;
                error = {
                    title: "cannot upload this file",
                    description: `size is too big (max: ${maxSize} bytes)`,
                };
            } else {
                uploadButton!!.disabled = false;
                clearButton!!.disabled = false;
                if (error?.title === "cannot upload this file") {
                    error = undefined;
                }
            }
        } else {
            filename = "";
            uploadButton!!.disabled = true;
            clearButton!!.disabled = true;
        }
    });

    function drop(e: DragEvent) {
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            files = e.dataTransfer.files;
        }
    }

    function dragOver(e: DragEvent) {
        if (!e.dataTransfer) return;
        const fileItems = [...e.dataTransfer.items].filter(
            (item) => item.kind === "file",
        );
        if (fileItems.length > 0) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        }
    }
</script>

{#if error}
    <Notification
        title={error.title}
        description={error.description}
        callback={() => (error = undefined)}
    />
{/if}

<div class="font-mono p-8 container lg:max-w-2xl! mx-auto">
    <nav class="flex *:my-auto gap-4 m-4 mb-8">
        <h1
            class="bg-ctp-red text-ctp-crust italic font-bold rounded px-2 py-0.5 w-min text-lg"
        >
            {PUBLIC_INSTANCE_NAME ?? "bitzone"}
        </h1>

        <span class="text-ctp-subtext0 italic">
            {PUBLIC_INSTANCE_TAGLINE}
        </span>
    </nav>

    {#if rules.length > 0}
        <div class="my-4">
            {#snippet warning_icon()}
                <TriangleAlert class="h-4" />
            {/snippet}
            <Container
                icon={warning_icon}
                title="instance rules"
                border="border-ctp-red"
                text="text-ctp-red"
            >
                <ul class="text-sm">
                    {#each rules as line}
                        <li>{line}</li>
                    {/each}
                </ul>
            </Container>
            <span class="text-xs text-ctp-subtext0 italic">
                don't like these rules? <a href={PUBLIC_REPO_URL}
                    >host your own!</a
                >
            </span>
        </div>
    {/if}

    <div class="text-center *:mx-auto">
        <label
            for="upload"
            class="w-64 h-16 px-4 border-2 border-dashed border-ctp-lavender my-4 flex justify-center items-center flex-col gap-3"
        >
            <div class="flex gap-2 *:my-auto">
                {#if filename == ""}
                    <Upload class="ml-auto stroke-ctp-subtext0" />
                    <p class="italic text-ctp-subtext0 text-sm mr-auto">
                        [select a file]
                    </p>
                {:else if progress}
                    <LoaderCircle
                        class="ml-auto stroke-ctp-text animate-spin"
                    />
                    <p class="text-sm mr-auto">
                        {((progress.loaded / progress.total) * 100).toPrecision(
                            3,
                        )}% ({prettyNumber(progress.loaded)}B / {prettyNumber(
                            progress.total,
                        )}B)
                    </p>
                {:else}
                    <File class="ml-auto stroke-ctp-text" />
                    <p class="text-sm mr-auto">
                        {filename}
                    </p>
                {/if}
            </div>
            {#if progress}
                <Progress
                    progress={progress.loaded / progress.total}
                    classList="w-full"
                />
            {/if}
            <input id="upload" type="file" bind:files class="hidden" />
        </label>

        {#if env.PUBLIC_MAX_SIZE}
            <div class="text-xs text-ctp-subtext0 -mt-4 mb-4">
                max: {prettyNumber(parseInt(env.PUBLIC_MAX_SIZE))}B
            </div>
        {/if}

        <!-- upload buttons -->
        <div class="flex gap-2 mx-auto justify-center items-center">
            <button
                class="button border-ctp-red bg-ctp-red"
                onclick={upload}
                bind:this={uploadButton}
                disabled
            >
                <Upload /> upload
            </button>
            <button
                class="button border-ctp-lavender bg-ctp-lavender"
                onclick={clear}
                bind:this={clearButton}
                disabled
            >
                <X />
            </button>
        </div>
    </div>

    <!-- recent uploads -->
    {#if recentUploads.length > 0}
        <div transition:fade={{ duration: 200 }}>
            <h2 class="text-ctp-subtext0 italic text-sm mb-4 mt-8">
                recent uploads
            </h2>
            <div class="flex gap-2 flex-wrap">
                {#each recentUploads as upload}
                    <a
                        href={`/v/${upload}`}
                        class="flex items-center gap-2 rounded border-2 border-ctp-mantle px-3 py-1 text-sm"
                        transition:slide={{ duration: 200 }}
                    >
                        <File class="stroke-ctp-subtext0" />
                        {upload}
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</div>

<svelte:window ondragover={dragOver} ondrop={drop} />
