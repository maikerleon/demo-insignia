<script>
	import DependenceIcon from '$icons/DependenceIcon.svelte';
    import { createEventDispatcher } from 'svelte';
    import Swal from 'sweetalert2';
	import { messageAlert, handleLoading, messageForAdminView } from '$lib/utilities.js';
	import DeleteIcon from '$icons/DeleteIcon.svelte';
    import EditIcon from '$icons/EditIcon.svelte';
    import SectionTitle from '$components/SectionTitle.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import SearchIcon from '$icons/SearchIcon.svelte';
    
    export let handleToggleTable;
    export let reset;
    export let axies;
    export let role;

    let search = '';
    let dataFiltered = axies ? [...axies] : [];

    const dispatch = createEventDispatcher();

    const filtered = () => {

        if (axies === null) return;

        dataFiltered = axies.filter(ax => {
            const searchString = search.toLowerCase();
            const searchWords = searchString.split(' ');

            return searchWords.every(word => (
                (ax.name && ax.name.toLowerCase().includes(word)) ||
                (ax.objective && ax.objective.toLowerCase().includes(word)) ||
                (ax.strategy && ax.strategy.toLowerCase().includes(word))
            ));
        });
    };

    const deleteAxis = async ( id ) => {

        if(role === 'super-view') { 
            messageForAdminView();
            return;
        }

        const result = await Swal.fire({
			title: "¡No podrás revertir esto!",
			text: `¿Estás seguro de eliminar esté eje?`,
			icon: 'warning',
            focusCancel: true,
			showCancelButton: true,
			confirmButtonColor: '#1fabbb',
			cancelButtonColor: '#d33',
			confirmButtonText: '¡Sí, eliminarlo!',
			cancelButtonText: 'Cancelar'
		});

		if (result.isConfirmed) {
			handleLoading();

			try {

                const action = '/api/delete-axis/'
                
				const formData = new FormData();
				
                formData.append('axis', id);

                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                const resp = await response.text();
                const {success} = JSON.parse(resp);

				if( success ) {
                    const adminIndex = axies.findIndex(a => a.id === id);
                    if (adminIndex !== -1) {
                        axies.splice(adminIndex, 1);
                    }
                    filtered();
					messageAlert('success',`Se ha eliminado el eje con éxito`);
                    return;
				}

                throw new Error;

			} catch (error) {
				messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
			}
		}
	}

    $: filtered(search);

    const handleAdd = () => {
        reset();
        handleToggleTable();
    }

    const edit = (axis) => {
        dispatch('handleEdit', axis);
    }
    
  </script>
  
<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-row justify-start items-center">
        <SectionTitle title="Ejes" />
    </div>
    <section class="flex justify-between items-center mt-6 flex-col sm:flex-row">
        <div class="relative {!search ? 'sm:w-40 hover:w-96' : 'sm:w-96' } transition-all duration-300 w-[90%]">
            <SearchIcon />
            <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-400"/>
        </div>
        <ButtonLight text="Agregar eje" action={handleAdd} styles="mt-2 sm:mt-0 w-3/5 sm:w-auto flex justify-center"> 
            <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 icon icon-tabler icon-tabler-user-plus" width="18" height="18" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                <path d="M16 19h6" />
                <path d="M19 16v6" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
              </svg>
        </ButtonLight>
    </section>

    <div class="mt-4 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
      <table class="w-full table-auto text-sm text-left">
        <thead class="bg-ins-700 text-gray-100 font-medium border-b">
          <tr>
              <th class="py-3 px-6 max-w-16 w-10">#</th>
              <th class="py-3 px-6">Nombre</th>
              <th class="py-3 px-6">Objetivo</th>
              <th class="py-3 px-6">Estrategia</th>
              <th class="py-3 px-6 w-8">
                <EditIcon />
              </th>
              <th class="py-3 px-6 w-8">
                <DeleteIcon />
              </th>
          </tr>
        </thead>
        <tbody class="text-gray-600 divide-y">
            {#each dataFiltered as item, idx}
                <tr class="bg-white">
                    <td class="px-6 py-4 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-semibold max-w-20 truncate">
                        {item.name}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap max-w-28 truncate">
                        {item.objective !== '' && item.objective ? item.objective : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap max-w-28 truncate">
                        {item.strategy !== '' && item.strategy ? item.strategy : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> edit(item)}>
                            <EditIcon />
                        </button>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={() => deleteAxis(item.id)}>
                            <DeleteIcon />
                        </button>
                    </td>
                </tr>
            {:else}
                <tr class="bg-white">
                    <td colspan="6" class="p-4">
                        <section class="text-center flex items-center w-full justify-center">
                            <DependenceIcon size="20" />
                            <strong class="ml-2 font-semibold text-gray-700">No se encontraron ejes</strong>
                        </section>
                    </td>
                </tr>
            {/each}
        </tbody>
      </table>
    </div>
</div>