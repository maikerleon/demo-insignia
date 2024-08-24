<script>
    export let dependence;
    export let dataSee;
    export let principalSection;
    export let selectedDependence;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex w-full gap-2 hover:bg-gray-100 cursor-pointer items-center py-1 px-3 rounded-2xl tooltip" data-tip="Cumplidos {dataSee.real} de {dataSee.total}" on:click={() => { principalSection = false; selectedDependence = dependence.id; }}>
    <div class="w-fit">
        <span class="uppercase font-semibold text-xl">{dependence.abbr}</span>
    </div>
    <div class="w-full flex flex-col gap-1 relative">
        <progress class="progress w-full h-5 bg-gray-300 progress-green" value={dataSee.real} max={dataSee.total}></progress>
        <div class="absolute text-xs mt-0.5 left-[10%] w-[200px] flex justify-center">
            <span class="text-center">{dataSee.real} <strong>/</strong> {dataSee.total}</span>
        </div>
    </div>
</div>

<style>
    .progress-green::-webkit-progress-value {
        background-color: #17a34a;
    }
</style>