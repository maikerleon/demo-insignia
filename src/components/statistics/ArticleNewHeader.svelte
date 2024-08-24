<script>
    export let status;
    export let quantity;
    export let total;

    $: percentage = (quantity / total) * 100;
</script>

<article class="stat group w-full space-y-1.5 pr-2">
    <div class="stat-value text-2xl" style="color: {status.color_hex}">{percentage > 0 ? percentage.toFixed(2) : 0}%</div>

    <div class="stat-desc mt-0.5 text-gray-700">
        {#if 8 >= 50 }
        <strong class="text-green-600">↗︎</strong>
        {:else}
        <strong class="text-red-600">↘︎</strong> 
        {/if} 
        <strong style="color: {status.color_hex}">{quantity}</strong> 
        de 
        <strong style="color: {status.color_hex}">{total}</strong>
    </div>
    <div class="text-gray-900 flex gap-1 items-center">
        <div>
            <div class="w-5 h-5 rounded-md {status.color}"></div>
        </div>
        <span class="text-[12px] font-semibold">{status.label}</span>
    </div>
</article>