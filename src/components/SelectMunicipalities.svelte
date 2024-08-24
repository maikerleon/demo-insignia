<script>
	import { municipalities } from '$lib/data.js';

    export let coordination;
    
    const initMunicipalitiesFromCoordination = () => {
        if (!coordination || coordination.length === 0) return;

        selectedMunicipalities = [...municipalities].filter(mun => coordination.includes(mun.id)).map(mun => ({ label: mun.name, value: mun.id }));
        availableMunicipalities = [...municipalities].filter(mun => !coordination.includes(mun.id)).map(mun => ({ label: mun.name, value: mun.id }));
    };
    
    let availableMunicipalities = [...municipalities].map(mun => ({ label: mun.name, value: mun.id }));
    let selectedMunicipalities = [];

    const addMunicipalities = (mun) => () => {
        selectedMunicipalities = [...selectedMunicipalities, mun];
        availableMunicipalities = availableMunicipalities.filter((m) => m.value !== mun.value);
    };

    const removeMunicipalities = (mun) => () => {
        availableMunicipalities = [...availableMunicipalities, mun];
        selectedMunicipalities = selectedMunicipalities.filter((m) => m.value !== mun.value);
    };

    initMunicipalitiesFromCoordination();

</script>

<style>
    .btn-form-municipality:focus {
        background: transparent !important;
        color: #000 !important;
    }
    .btn-form-municipality:active {
        background: #1fabbb !important;
    }
</style>

<span class="w-full mt-5 font-normal text-gray-800">Municipios</span>
<input type="text" hidden value={JSON.stringify(selectedMunicipalities)} name="coordination">
<div class="flex w-full  mt-5">
    <div class="sm:w-1/2 h-64 flex-grow card place-items-center bg-ins-100 shadow-sm rounded-md border-2 border-ins-500/70">
        {#if availableMunicipalities.length !== 0 }
            <ul class="m-2 menu w-full overflow-y-auto grid grid-cols-3 gap-4">
                {#each availableMunicipalities as mun }
                    <li>
                        <button type="button" class="btn-form-municipality px-5 text-black bg-ins-200/30 hover:bg-ins-300" on:click={addMunicipalities(mun)}>{mun.label}</button>
                    </li>
                {/each}
            </ul>
        {:else}
            <div class="flex justify-center items-center h-full">
                <span class="text-lg text-gray-700 font-bold">
                    Sin municipios
                </span>
            </div>
        {/if}
    </div>
    <div class="divider divider-horizontal"><i class="fa-solid fa-right-left"></i></div>
    <div class="sm:w-1/2 h-64 flex-grow card place-items-center bg-ins-100 shadow-sm rounded-md border-2 border-ins-500/70">
        {#if selectedMunicipalities.length !== 0 }
            <ul class="m-2 menu w-full overflow-y-auto grid grid-cols-3 gap-4">
                {#each selectedMunicipalities as mun }
                    <li>
                        <button type="button" class="btn-form-municipality px-5 text-black bg-ins-200/30 hover:bg-ins-300" on:click={removeMunicipalities(mun)}>{mun.label}</button>
                    </li>
                {/each}
            </ul>
        {:else}
            <div class="flex justify-center items-center h-full">
                <span class="text-lg text-gray-700 font-bold">
                    Sin municipios
                </span>
            </div>
        {/if}
    </div>
</div>