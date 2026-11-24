<script lang="ts">
    interface Option {
        label: string;
        value: string;
        enabled?: boolean;
        tooltip?: string;
    }

    /* options: the choices shown in the horizontal list
       value: bindable, holds the currently selected option's value
       enabled: per-option, whether it can be selected (defaults to true)
       tooltip: per-option, text shown on hover */
    let { options, value = $bindable("") } = $props();

    function optionClass(option: Option): string {
        const base =
            "flex items-center gap-2 rounded border-2 px-3 py-1 text-sm font-bold transition";
        if (option.enabled === false) {
            return `${base} opacity-50 cursor-not-allowed`;
        }
        return option.value === value
            ? `${base} border-ctp-lavender bg-ctp-lavender text-ctp-crust`
            : `${base} border-ctp-surface0 bg-ctp-surface0 text-ctp-subtext0 hover:border-ctp-overlay0`;
    }
</script>

<div class="flex gap-2 flex-wrap">
    {#each options as option}
        <div class="relative group">
            <button
                class={optionClass(option)}
                disabled={option.enabled === false}
                onclick={() => (value = option.value)}
            >
                {option.label}
            </button>

            {#if option.tooltip}
                <span
                    class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10
                        whitespace-nowrap rounded border border-ctp-surface0 bg-ctp-mantle px-2 py-1
                        text-xs text-ctp-subtext0 opacity-0 shadow-lg transition-opacity duration-150
                        group-hover:opacity-100"
                >
                    {option.tooltip}
                </span>
            {/if}
        </div>
    {/each}
</div>