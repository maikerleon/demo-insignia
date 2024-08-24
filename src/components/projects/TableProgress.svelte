<script>
	import ProgressBoltIcon from '$icons/ProgressBoltIcon.svelte';
    import { createEventDispatcher } from 'svelte';
	import EyeIcon from '$icons/EyeIcon.svelte';
	import ProgressCheckIcon from '$icons/ProgressCheckIcon.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
    import { formatDate } from '$lib/utilities.js';
    
    export let progress;
    export let bucket;
    export let role;
    export let createProgress;

    const dispatch = createEventDispatcher();

    const edit = (item) => {
        dispatch('handleEdit', item);
    }

</script>

<section>
    {#if bucket === 'progress_supervisor' && ['super-admin', 'super-view', 'governor', 'chief', 'supervisor'].includes(role) || bucket === 'progress' && ['super-admin', 'super-view', 'governor', 'chief', 'dependence'].includes(role)}
        <div class="flex justify-end">
            <ButtonLight styles="mb-4" action={createProgress} text="Agregar avance">
                {#if bucket === 'progress' }
                    <ProgressCheckIcon styles="pr-1" />
                {:else}
                    <ProgressBoltIcon styles="pr-1" />
                {/if}
            </ButtonLight>
        </div>
    {/if}
    
    <div class="mt-4 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
    
        <table class="w-full table-auto text-sm text-left">
          <thead class="bg-ins-700 text-gray-100 font-medium border-b">
            <tr>
                <th class="py-3 px-6 max-w-16 w-10">#</th>
                <th class="py-3 px-2 w-4/6">Avance</th>
                <th class="py-3 px-2">Fecha</th>
                <th class="py-3 px-2">%</th>
                <th class="py-3 px-6 w-8">
                  <EyeIcon />
                </th>
            </tr>
          </thead>
          <tbody class="text-gray-600 divide-y">
              {#each progress as item, idx}
                  <tr class="bg-white">
                      <td class="px-6 py-4 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                      <td class="px-2 py-4 whitespace-nowrap font-semibold max-w-20 truncate">
                          <div class="max-w-full truncate">{item.general}</div>
                      </td>
                      <td class="px-2 py-4">{formatDate(item.created_at)}</td>
                      <td class="px-2 py-4">{item?.percent && item.percent !== 0 ? item.percent : item.system_progress}%</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                          <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> {edit(item)}}>
                              <EyeIcon />
                          </button>
                      </td>
                  </tr>
              {:else}
                  <tr class="bg-white">
                      <td colspan="5" class="p-4">
                          <section class="text-center flex items-center w-full justify-center">
                              <DependenceIcon size="20" />
                              <strong class="ml-2 font-semibold text-gray-700">No se encontraron avances</strong>
                          </section>
                      </td>
                  </tr>
              {/each}
          </tbody>
        </table>
    </div>
</section>