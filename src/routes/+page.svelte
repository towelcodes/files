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
    import Modal from "$lib/Modal.svelte";
    import { createUpload } from "$lib/util";

    const rules = PUBLIC_INSTANCE_RULES.split("\\n");

    let uploadButton,
        clearButton: HTMLButtonElement | undefined = $state();

    let filename = $state("");
    let files: FileList | undefined = $state();
    let progress: number | undefined = $state();

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
            const res = await new Promise((resolve) => {
                req.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable) {
                        progress = e.loaded / e.total;
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
        } catch (e) {
            console.error(e);
            error = {
                title: "something went wrong",
                description: "check the console",
            };
            return;
        }

        progress = undefined;
    }

    function clear() {
        files = new DataTransfer().files;
    }

    $effect(() => {
        if (files) {
            console.log(files);
            if (files.length > 0) {
                filename = files[0].name;

                if (env.PUBLIC_MAX_SIZE != undefined) {
                    if (files[0].size > parseInt(env.PUBLIC_MAX_SIZE)) {
                        uploadButton!!.disabled = true;
                        clearButton!!.disabled = false;
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
        // fixme unknown assert
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
    <Modal
        title={error.title}
        description={error.description}
        click={() => (error = undefined)}
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
            <div class="border-2 rounded border-ctp-red relative p-4">
                <div
                    class="absolute bg-bg italic text-ctp-red -top-2.5 text-sm px-1 flex gap-1 *:my-auto"
                >
                    <TriangleAlert class="h-4" />
                    <div>instance rules</div>
                </div>

                <ul class="text-sm">
                    {#each rules as line}
                        <li>{line}</li>
                    {/each}
                </ul>
            </div>
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
            class="w-64 h-16 border-2 border-dotted border-ctp-lavender my-4 flex justify-center items-center"
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
                        {(progress * 100).toPrecision(3)}%
                    </p>
                {:else}
                    <File class="ml-auto stroke-ctp-text" />
                    <p class="text-sm mr-auto">
                        {filename}
                    </p>
                {/if}
            </div>
            <input id="upload" type="file" bind:files class="hidden" />
        </label>
        {#if env.PUBLIC_MAX_SIZE}
            <div class="text-xs text-ctp-subtext0 -mt-4 mb-4">
                max: {env.PUBLIC_MAX_SIZE} bytes
            </div>
        {/if}

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
