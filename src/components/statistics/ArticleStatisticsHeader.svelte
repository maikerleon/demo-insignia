<script>
    export let color;
    export let title;
    export let total;
    export let real;
    export let icon;

    $: percentage = Math.ceil((real / total) * 100); 

</script>

<article class="stat group w-full">
    <div class="stat-figure text-secondary">
        <svelte:component this={icon} styles="{color} group-hover:scale-150 transition-all duration-300" size={30} />
    </div>
    <div class="stat-title font-semibold text-gray-900">{title}</div>
    <div class="stat-value {color}">{isNaN(percentage) ? 0 : percentage}%</div>
    <div class="stat-desc mt-0.5 text-gray-700">
        {#if percentage >= 50 }
            <strong class="text-green-600">↗︎</strong>
        {:else}
            <strong class="text-red-600">↘︎</strong> 
        {/if} 
        <strong class="{color}">{real}</strong> 
        de 
        <strong class="{color}">{total}</strong>
    </div>
</article>