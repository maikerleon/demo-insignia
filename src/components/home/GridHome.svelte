<script>
	import { formatDateTime } from '$lib/utilities.js';
    import FeedLinks from '$components/home/FeedLinks.svelte';
    import TableProjectsFilters from '$components/home/TableProjectsFilters.svelte';

    export let dependences;
    export let dependenceSelected;
    export let role;
    export let dependenceId;
    export let axis;

    let typeProject;
    let search = '';
    let dependenceUnique = null;

    const selectDependence = (dependence) => {
        dependenceSelected = dependence;
    }

    if ( role === 'dependence' ) {
        dependenceUnique = dependences.find( dep => dep.id === dependenceId );
    }

</script>

{#if !dependenceSelected }
    {#if role !== 'dependence' }
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            {#each dependences as dependence }
                <button class="rounded-md bg-gray-300/60 text-gray-600 py-3 px-2 justify-center items-center hover:bg-gray-300 transition-all space-y-1 min-h-28" on:click={()=>selectDependence(dependence)}>
                    <h1 class="text-center text-balance text-sm font-semibold">{dependence.name}</h1>
                    {#if dependence.logo && dependence.logo !== '' }
                        <figure class="flex justify-center">
                            <img class="w-24 transition-all" src={dependence.logo} alt="Logo de {dependence.name}">
                        </figure>
                    {:else}
                        <h2 class="text-3xl uppercase font-semibold">
                            {dependence.abbr}
                        </h2>
                    {/if}
                    <time class="text-xs" datetime={dependence.last_log_date ?? 'Sin fecha'}>{dependence.last_log_date ? formatDateTime(dependence.last_log_date) : 'Sin último ingreso'}</time>
                </button>
            {/each}
            <button class="rounded-md bg-gray-300/60 text-gray-600 py-3 px-2 justify-center items-center hover:bg-gray-300 transition-all space-y-1 min-h-28" on:click={()=>selectDependence('all')}>
                <h1 class="text-center text-balance text-sm font-semibold uppercase">Todos</h1>
                    <h2 class="sm:text-3xl text-xl uppercase font-semibold">Proyectos</h2>
            </button>
        </div>
    {:else}
        <div class="grid grid-cols-1 gap-3">
            <button class="rounded-md bg-gray-300/60 text-gray-600 py-3 px-2 justify-center items-center hover:bg-gray-300 transition-all space-y-1 min-h-28" on:click={()=>selectDependence(dependenceUnique)}>
                <h1 class="text-center text-balance text-sm font-semibold">{dependenceUnique.name}</h1>
                {#if dependenceUnique.logo && dependenceUnique.logo !== '' }
                    <figure class="flex justify-center">
                        <img class="w-16 transition-all" src={dependenceUnique.logo} alt="Logo de {dependenceUnique.name}">
                    </figure>
                {:else}
                    <h2 class="text-3xl uppercase font-semibold">
                        {dependenceUnique.abbr}
                    </h2>
                {/if}
                <time class="text-xs" datetime={dependenceUnique.last_log_date ?? 'Sin fecha'}>{dependenceUnique.last_log_date ? formatDateTime(dependenceUnique.last_log_date) : 'Sin último ingreso'}</time>
            </button>
        </div>
    {/if}
{:else}
    <div class="md:mt-10">
        {#if !typeProject }
            <FeedLinks bind:dependenceSelected={dependenceSelected} bind:typeProject={typeProject} />
        {:else}
            <TableProjectsFilters bind:search={search} bind:typeProject={typeProject} bind:dependenceSelected={dependenceSelected} {role} dependences_temp={dependences} {axis} />
        {/if}
    </div>
{/if}