<script lang="ts">
    import {
        PUBLIC_INSTANCE_NAME,
        PUBLIC_INSTANCE_TAGLINE,
        PUBLIC_INSTANCE_RULES,
        PUBLIC_REPO_URL,
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

    const rules = PUBLIC_INSTANCE_RULES.split("\\n");

    let uploadButton,
        clearButton: HTMLButtonElement | undefined = $state();

    let filename = $state("");
    let files: FileList | undefined = $state();
    let progress: { loaded: number; total: number } | undefined = $state();

    let error: { title: string; description: string } | undefined = $state();

    async function upload() {
        if (!files) return;
        if (files.item(0) == null) return;
        const file = files.item(0)!!;

        // create the upload
        try {
            const { key, signed } = await createUpload(file.size);
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
                        console.log(
                            "upload: ",
                            e.loaded,
                            e.total,
                            e.loaded / e.total,
                        );
                    }
                });
                req.upload.addEventListener("loadend", () => {
                    console.log("loadend");
                });
                req.addEventListener("readystatechange", () => {
                    console.log("readyState", req.readyState);
                    if (req.readyState == 4) {
                        resolve(req.response);
                    }
                });
                req.send(file);
            });
            console.log("completed: ", req.readyState, req.status);
            goto(`/v/${key}`);
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
        // FIXME tidy this up
        if (files) {
            console.log(files);
            if (files.length > 0) {
                filename = files[0].name;

                if (env.PUBLIC_MAX_SIZE != undefined) {
                    if (files[0].size > parseInt(env.PUBLIC_MAX_SIZE)) {
                        uploadButton!!.disabled = true;
                        clearButton!!.disabled = false;
                        error = {
                            title: "cannot upload this file",
                            description: `size is too big (max: ${env.PUBLIC_MAX_SIZE} bytes)`,
                        };
                    } else {
                        uploadButton!!.disabled = false;
                        clearButton!!.disabled = false;
                    }
                } else {
                    uploadButton!!.disabled = false;
                    clearButton!!.disabled = false;
                }
            } else {
                filename = "";
                uploadButton!!.disabled = true;
                clearButton!!.disabled = true;
            }
        } else {
            filename = "";
            uploadButton!!.disabled = true;
            clearButton!!.disabled = true;
        }
    });

    function drop(e: DragEvent) {
        if ([...e.dataTransfer!!.items].some((item) => item.kind === "file")) {
            e.preventDefault();
        }
    }

    function dragOver(e: DragEvent) {
        const fileItems = [...e.dataTransfer!!.items].filter(
            (item) => item.kind === "file",
        );
        if (fileItems.length > 0) {
            e.preventDefault();
            e.dataTransfer!!.dropEffect = "copy";
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
            ondrop={drop}
            ondragover={dragOver}
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
</div>
