<script>
    import { statutes } from '$lib/data.js';
    import { createEventDispatcher } from 'svelte';
	import PlusIcon from '$icons/PlusIcon.svelte';
	import EyeIcon from '$icons/EyeIcon.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
	import DeleteIcon from '$icons/DeleteIcon.svelte';
    import { formatDate } from '$lib/utilities.js';
    
    export let progress;
    export let createProgress;
    export let nameProject;

    const dispatch = createEventDispatcher();

    const edit = (item) => {
        dispatch('handleEdit', item);
    }

    const deleteItem = (id) => {
        dispatch('handleDelete', id);
    }

</script>

<section>
    <div class="flex justify-between">
        <h1 class="md:max-w-[700px] hidden md:block text-pretty">{nameProject}</h1>
        <ButtonLight styles="mb-4" action={createProgress} text="Agregar sub proyecto">
            <PlusIcon styles="pr-1" />
        </ButtonLight>
    </div>
    
    <div class="mt-4 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
    
        <table class="w-full table-auto text-sm text-left">
          <thead class="bg-ins-700 text-gray-100 font-medium border-b">
            <tr>
                <th class="py-3 px-6 max-w-16 w-10">#</th>
                <th class="py-3 px-2">Estatus</th>
                <th class="py-3 px-2">Nombre</th>
                <th class="py-3 px-2">Fecha activación</th>
                <th class="py-3 px-2">Municipios</th>
                <th class="py-3 px-2">% Avance</th>
                <th class="py-3 px-2">Descripción</th>
                <th class="py-3 px-6 w-8">
                </th>
            </tr>
          </thead>
          <tbody class="text-gray-600 divide-y">
              {#each progress as item, idx}
                  <tr class="bg-white">
                        <td class="px-6 py-4 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                        <td class="px-2 py-4 font-semibold text-sm max-w-48">
                            {statutes.find((s) => {return s.value === item.status})?.label ?? 'Sin estatus'}
                        </td>
                        <td class="px-2 py-4 font-semibold text-sm max-w-48">
                            {item.name}
                        </td>
                        <td class="px-2 py-4 whitespace-nowrap font-semibold truncate">
                            {formatDate(item.start)}
                        </td>
                        <td class="px-2 py-4 whitespace-nowrap font-semibold truncate">
                            {item.municipalities.length}
                        </td>
                        <td class="px-2 py-4 whitespace-nowrap font-semibold truncate">
                            {item.percent}%
                        </td>
                        <td class="px-2 py-1">
                            <div class="font-semibold max-w-[250px] flex items-center whitespace-pre-wrap">
                                {item.description || 'Sin descripción'}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                            <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> {edit(item)}}>
                                <EyeIcon />
                            </button>
                            <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> {deleteItem(item.id)}}>
                                <DeleteIcon />
                            </button>
                        </td>
                  </tr>
              {:else}
                  <tr class="bg-white">
                      <td colspan="8" class="p-4">
                          <section class="text-center flex items-center w-full justify-center">
                              <DependenceIcon size="20" />
                              <strong class="ml-2 font-semibold text-gray-700">No se encontraron sub proyectos</strong>
                          </section>
                      </td>
                  </tr>
              {/each}
          </tbody>
        </table>
    </div>
</section>