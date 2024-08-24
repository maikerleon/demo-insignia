<script>
	import ChevronIcon from '$icons/ChevronIcon.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
    import EditIcon from '$icons/EditIcon.svelte';
    import SectionTitle from '$components/SectionTitle.svelte';
    import { priorities, statutes, types as types_temp } from '$lib/data.js';
    import Pagination from '$components/Pagination.svelte';

    export let actions;
    export let role;

    let search = '';
    let dataFiltered = actions ? [...actions] : [];
    let status = 'all';
    let priority = 'all';

    const filtered = () => {
        if (actions === null) return;

        dataFiltered = actions.filter(ax => {
            const searchString = search.toLowerCase();
            const searchWords = searchString.split(' ');

            const type = types_temp.find(t => t.value === ax.type);

            const matchesSearch = searchWords.every(word => (
                (ax.name && ax.name.toLowerCase().includes(word)) ||
                (ax.start && ax.start.toLowerCase().includes(word)) ||
                (ax.project_name && ax.project_name.toLowerCase().includes(word)) ||
                (ax.end && ax.end.toLowerCase().includes(word)) ||
                (ax.dependence?.data?.label && ax.dependence?.data?.label.toLowerCase().includes(word)) ||
                (ax.manager?.data?.label && ax.manager?.data?.label.toLowerCase().includes(word))
            ));

            const matchesStatus = status === 'all' || ax.status === status;
            const matchesPriority = priority === 'all' || ax.priority === priority;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    };

    let startRecord = 0;
    let perPage = 25;
    let endRecord = perPage;

    const changePage = ({detail}) => {
        startRecord = detail.startRecord-1;
        endRecord = detail.endRecord;
    }


    $: filtered(search);

    let cols = {
        name: true,
        project: true,
        dependence: true,
        manager: true,
        status: true
    }
    
</script>
  
<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-row justify-start items-center">
        <SectionTitle title="Acciones" />
    </div>
    <section class="flex justify-between sm:flex-row flex-col items-center mt-9 w-full">
        <div class="flex gap-2 flex-row mb-3 sm:mb-0 w-full sm:w-auto flex-wrap justify-between sm:justify-start">
            <div class="w-[45%] sm:w-32 max-w-full relative">
                <label class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500" for="status">Estatus</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="status" id="status" bind:value={status} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each statutes as st}
                        <option value={st.value}>{st.label}</option>
                    {/each}
                </select>
            </div>
            <div class="w-[45%] sm:w-32 max-w-full relative">
                <label class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500" for="priority">Prioridad</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="priority" id="priority" bind:value={priority} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each priorities as priority}
                        <option value={priority.value}>{priority.label}</option>
                    {/each}
                </select>
            </div>
            <div class="dropdown dropdown-bottom w-[45%] sm:w-32 max-w-full h-8">
                <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
                    Columnas
                    <ChevronIcon size={18} styles="text-black" />
                </div>
                <ul tabindex="-1" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-lg w-52">
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_name">
                            Nombre
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_name" bind:checked={cols.name} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_project">
                            Proyecto
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_project" bind:checked={cols.project} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_dependence">
                            Dependencia
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_dependence" bind:checked={cols.dependence} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_manager">
                            Encargado
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_manager" bind:checked={cols.manager} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_status">
                            Estatus
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_status" bind:checked={cols.status} />
                        </label>
                    </li>
                </ul>
            </div>
            <div class="relative {!search ? 'sm:w-52 sm:hover:w-96' : 'sm:w-96' } transition-all duration-300 w-[45%]">
                <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
            </div>
        </div>
    </section>

    <div class="mt-4 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
      <table class="w-full table-auto text-sm text-left">
        <thead class="bg-ins-700 text-gray-100 font-medium border-b">
          <tr>
              <th class="py-3 px-2 pl-4 max-w-16 w-10">#</th>
              {#if cols.name}
                <th class="py-3 px-2">Nombre</th>
              {/if}
              {#if cols.project}
                <th class="py-3 px-2">Proyecto</th>
              {/if}
              {#if cols.dependence}
                <th class="py-3 px-2">Dependencia</th>
              {/if}
              {#if cols.manager}
                <th class="py-3 px-2">Encargado</th>
              {/if}
              {#if cols.status}
                <th class="py-3 px-2">Estatus</th>
              {/if}
              <th class="pr-3 pl-1 w-10"></th>
          </tr>
        </thead>
        <tbody class="text-gray-600 divide-y">
            {#each dataFiltered as item, idx}
                {#if idx >= startRecord && idx < endRecord}
                    <tr class="bg-white h-auto sm:h-[84px]">
                        <td class="px-2 py-3 pl-4 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                        {#if cols.name}
                            <td class="px-2 py-3 whitespace-normal max-w-72 flex flex-row items-center gap-2 relative sm:h-[84px]">
                                <div 
                                    class="w-5 h-5 {priorities.find(p => p.value === item.priority)?.color ?? 'bg-gray-400'} mask mask-hexagon"
                                ></div>
                                <div class="flex flex-col max-w-52">
                                    <span class="text-base font-semibold truncate">{item.name}</span>
                                    <span class="text-xs">{item.start} a {item.end}</span>
                                </div>
                            </td>
                        {/if}
                        {#if cols.project}
                            <td class="px-2 py-3 whitespace-nowrap max-w-28 truncate">
                                {#if ['super-admin', 'super-view'].includes(role) }
                                    <a href="/proyectos/detalle/{item.project}" target="_blank" class="text-ins-600 hover:border-b border-ins-600">
                                        {item.project_name ?? 'Sin proyecto'}
                                    </a>
                                {:else}
                                    {item.project_name ?? 'Sin proyecto'}
                                {/if}
                            </td>
                        {/if}
                        {#if cols.dependence}
                            <td class="px-2 py-3 whitespace-nowrap max-w-28 truncate">
                                {item.dependence?.data?.label ?? 'Sin dependencia'}
                            </td>
                        {/if}
                        {#if cols.manager}
                            <td class="px-2 py-3 whitespace-nowrap max-w-28 truncate">
                                {item.manager?.data?.label ?? 'Sin encargado'}
                            </td>
                        {/if}
                        {#if cols.status}
                            <td class="px-2 py-3 whitespace-nowrap max-w-28 truncate">
                                { statutes.find(s => s.value === item.status)?.label ?? 'Sin estatus'}
                            </td>
                        {/if}
                        <td class="pr-3 py-3 w-10">
                            <a href='/acciones/accion/{item.id}' class="flex max-w-fit w-10 rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300">
                                <EditIcon size={20} />
                            </a>
                        </td>
                    </tr>
                {/if}
            {:else}
                <tr class="bg-white">
                    <td colspan="7" class="p-4">
                        <section class="text-center flex items-center w-full justify-center">
                            <DependenceIcon size="20" />
                            <strong class="ml-2 font-semibold text-gray-700">No se encontraron proyectos</strong>
                        </section>
                    </td>
                </tr>
            {/each}
        </tbody>
      </table>
    </div>
    <footer class="flex w-full mt-5">
        <Pagination total={dataFiltered.length} {perPage} on:handleChangePage={changePage} typeDocuments="acciones" />
    </footer>
</div>

<style>
    .dropdown-content {
        top: 150% !important;
    }
    .dropdown-content label:active {
        background: #d9d9d9 !important;
        color: initial !important;
    }
</style>