<script>
	import { formatDate } from '$lib/utilities.js';
	import { statutes } from '$lib/data.js';
    import UserQuestionIcon from '$icons/UserQuestionIcon.svelte';
    export let data;
</script>

<div class="mt-4 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
    <table class="w-full table-auto text-sm text-left">
      <thead class="bg-ins-700 text-gray-100 font-medium border-b">
        <tr>
            <th class="py-3 px-4">#</th>
            <th class="py-3 px-2 max-w-16">Estatus</th>
            <th class="py-3 px-2">Proyecto</th>
            <th class="py-3 px-2">Fecha activación</th>
            <th class="py-3 px-2">% avance</th>
            <th class="py-3 pl-2 pr-4">Descripción avance</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 divide-y">
          {#each data as sp, idx}
              <tr class="bg-white">
                  <td class="pr-2 pl-4 py-4 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                  <td class="px-2 py-4 max-w-16">
                    <div class="flex justify-center">
                        <div data-tip={statutes.find(s=> s.value === sp.status)?.label || 'Sin estatus'} class="w-5 h-5 tooltip {statutes.find(s=> s.value === sp.status)?.color || 'bg-gray-400'} rounded-md"></div>
                    </div>
                  </td>
                  <td class="px-2 py-4">{sp.name}</td>
                  <td class="px-2 py-4">{formatDate(sp.start)}</td>
                  <td class="px-2 py-4">{sp.percent}%</td>
                  <td class="px-2 py-4 max-w-[400px] whitespace-pre-wrap">{sp.description}</td>
                </tr>
          {:else}
              <tr class="bg-white">
                  <td colspan="7" class="p-4">
                      <section class="text-center flex items-center w-full justify-center">
                          <UserQuestionIcon size="20" />
                          <strong class="ml-2 font-semibold text-gray-700">No se encontraron sub proyectos</strong>
                      </section>
                  </td>
              </tr>
          {/each}
      </tbody>
    </table>
</div>