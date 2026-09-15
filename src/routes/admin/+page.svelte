<script lang="ts">
    import type { PageProps } from "./$types";
    import Banner from "$lib/Banner.svelte";
    import { prettyNumber } from "$lib/util";
    import { File, ExternalLink, Trash } from "@lucide/svelte";

    let { data }: PageProps = $props();

    let files = $state(data.files);
    let deleting = $state<string | undefined>();

    function formatDate(ms: number | undefined): string {
        if (!ms) return "—";
        return new Date(ms).toLocaleString();
    }

    function formatExpiry(ms: number | null | undefined): string {
        if (ms == null) return "never";
        return formatDate(ms);
    }

    async function del(key: string) {
        if (!confirm(`delete ${key}? this cannot be undone`)) return;
        deleting = key;
        try {
            const res = await fetch("/api/admin/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `${res.status} ${res.statusText}`);
            }
            files = files.filter((f) => f.key !== key);
        } catch (e: any) {
            alert(`delete failed: ${e.message}`);
        } finally {
            deleting = undefined;
        }
    }
</script>

<Banner user={data.user} isAdmin={true} />

<div class="mt-8 container lg:max-w-4xl! mx-auto px-4">
    <h1 class="text-2xl font-display text-ctp-mauve mb-4">admin panel</h1>

    <div class="text-sm text-ctp-subtext0 mb-4">
        {files.length} upload{files.length === 1 ? "" : "s"} total
    </div>

    <div class="overflow-x-auto rounded border-2 border-ctp-surface0">
        <table class="w-full text-sm">
            <thead>
                <tr class="text-left text-ctp-subtext0 bg-ctp-mantle">
                    <th class="px-3 py-2 font-bold">file</th>
                    <th class="px-3 py-2 font-bold">size</th>
                    <th class="px-3 py-2 font-bold">uploader</th>
                    <th class="px-3 py-2 font-bold">created</th>
                    <th class="px-3 py-2 font-bold">expires</th>
                    <th class="px-3 py-2 font-bold"></th>
                </tr>
            </thead>
            <tbody>
                {#each files as file}
                    <tr class="border-t border-ctp-surface0 hover:bg-ctp-crust">
                        <td class="px-3 py-2">
                            <div class="flex items-center gap-2">
                                <File class="w-4 h-4 stroke-ctp-subtext0 shrink-0" />
                                <div class="min-w-0">
                                    <div class="truncate max-w-48">
                                        {file.filename}
                                    </div>
                                    <div class="text-xs text-ctp-subtext0 font-mono">
                                        {file.key}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="px-3 py-2 text-ctp-subtext0 whitespace-nowrap">
                            {prettyNumber(file.size)}B
                        </td>
                        <td class="px-3 py-2 text-ctp-subtext0">
                            {file.uploaderId}
                        </td>
                        <td class="px-3 py-2 text-ctp-subtext0 whitespace-nowrap">
                            {formatDate(file.createdAt)}
                        </td>
                        <td class="px-3 py-2 text-ctp-subtext0 whitespace-nowrap">
                            {formatExpiry(file.expiresAt)}
                        </td>
                        <td class="px-3 py-2">
                            <div class="flex items-center gap-2">
                                <a
                                    href={`/v/${file.key}`}
                                    class="inline-flex items-center gap-1 no-underline text-ctp-mauve hover:text-ctp-lavender"
                                >
                                    <ExternalLink class="w-4 h-4" />
                                </a>
                                <button
                                    class="inline-flex items-center gap-1 text-ctp-subtext0 hover:text-ctp-red transition disabled:opacity-50"
                                    onclick={() => del(file.key)}
                                    disabled={deleting === file.key}
                                    aria-label="delete"
                                >
                                    <Trash class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    {#if files.length === 0}
        <p class="text-sm text-ctp-subtext0 italic mt-4">
            no uploads yet
        </p>
    {/if}
</div>