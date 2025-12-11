<script lang="ts">
    import { TriangleAlert, X } from "@lucide/svelte";
    const {
        title,
        description,
        callback,
    }: {
        title: string;
        description: string;
        callback: () => any;
    } = $props();

    let root: HTMLDivElement | undefined = $state();

    const dismissAnimation = [
        {
            transform: "scale(1) translateY(0px)",
            opacity: "1",
        },
        {
            transform: "scale(0.6) translateY(20px)",
            opacity: "0",
        },
    ];

    export function dismiss() {
        root!!.animate(dismissAnimation, {
            duration: 300,
            iterations: 1,
            easing: "cubic-bezier(.59,.04,.92,.46)",
        }).onfinish = () => {
            try {
                callback();
            } catch {}
            root!!.classList.add("hidden!");
        };
    }
</script>

<div
    bind:this={root}
    class="anim absolute top-5 left-0 right-0 w-fit mx-auto z-50 bg-ctp-crust py-2 px-4 rounded border-ctp-red border"
>
    <div class="flex gap-2">
        <div>
            <div class="flex gap-2 text-lg font-bold leading-5">
                <TriangleAlert />
                <h2>{title}</h2>
            </div>
            <p class="text-sm">{description}</p>
        </div>
        <button class="-mr-3 -mt-1 hover:cursor-pointer" onclick={dismiss}>
            <X class="bg-ctp-red rounded text-white w-5 h-5" />
        </button>
    </div>
</div>

<style>
    @keyframes animateIn {
        0% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
        }
        30% {
            box-shadow: 0px 0px 20px 10px var(--color-ctp-red);
        }
        100% {
            transform: translateY(0px) scale(1);
            box-shadow: 0px 0px 10px 0px var(--color-ctp-red);
        }
    }
    .anim {
        animation: animateIn;
        animation-duration: 600ms;
        animation-timing-function: cubic-bezier(0.06, 0.62, 0.38, 0.92);
        animation-fill-mode: forwards;
    }
</style>
