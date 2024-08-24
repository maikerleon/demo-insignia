<script>
    import DependenceIcon from '$icons/DependenceIcon.svelte';
    import { createEventDispatcher } from 'svelte';
    import Swal from 'sweetalert2';
    import { messageAlert, handleLoading, messageForAdminView } from '$lib/utilities.js';
    import PhoneOffIcon from '$icons/PhoneOffIcon.svelte';
    import DeleteIcon from '$icons/DeleteIcon.svelte';
    import EditIcon from '$icons/EditIcon.svelte';
    import SectionTitle from '$components/SectionTitle.svelte';
    import DirectionIcon from '$icons/DirectionIcon.svelte';
    import NoLocationIcon from '$icons/NoLocationIcon.svelte';
    import LocationMapIcon from '$icons/LocationMapIcon.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import SearchIcon from '$icons/SearchIcon.svelte';
    import { dndzone } from 'svelte-dnd-action';

    export let handleToggleTable;
    export let resetDependenceSee;
    export let dependences;
    export let role;

    let search = '';
    let dependencesFiltered = dependences ? [...dependences] : [];

    const dispatch = createEventDispatcher();

    const filteredDependences = () => {
        if (dependences === null) return;

        dependencesFiltered = dependences.filter(dep => {
            const searchString = search.toLowerCase();
            const searchWords = searchString.split(' ');

            return searchWords.every(word => (
                (dep.name && dep.name.toLowerCase().includes(word)) ||
                (dep.abbr && dep.abbr.toLowerCase().includes(word)) ||
                (dep.address?.street && dep.address?.street.toLowerCase().includes(word)) ||
                (dep.address?.cp && dep.address?.cp.toLowerCase().includes(word)) ||
                (dep.phone && dep.phone.toLowerCase().includes(word))
            ));
        });
    };

    const deleteDependence = async ( id ) => {
        if(role === 'super-view') { 
            messageForAdminView();
            return;
        }

        const result = await Swal.fire({
            title: "¡No podrás revertir esto!",
            text: `¿Estás seguro de eliminar está area?`,
            icon: 'warning',
            focusCancel: true,
            showCancelButton: true,
            confirmButtonColor: '#1fabbb',
            cancelButtonColor: '#d33',
            confirmButtonText: '¡Sí, eliminarla!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            handleLoading();

            try {
                const action = '/api/delete-dependence/';
                const formData = new FormData();
                formData.append('dependence', id);

                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                const resp = await response.text();
                const {success} = JSON.parse(resp);

                if( success ) {
                    const adminIndex = dependences.findIndex(a => a.id === id);
                    if (adminIndex !== -1) {
                        dependences.splice(adminIndex, 1);
                    }
                    filteredDependences();
                    messageAlert('success',`Se ha eliminado la area con éxito`);
                    return;
                }

                throw new Error;
            } catch (error) {
                messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
            }
        }
    }

    $: filteredDependences(search);

    const handleAdd = () => {
        resetDependenceSee();
        handleToggleTable();
    }

    const editDependence = (dependence) => {
        dispatch('handleEditDependence', dependence);
    }

    const handleDndUpdateFinalized = async (detail) => {
        handleLoading();
        handleDndUpdate(detail);
        try {
            const action = '/api/update-dependence-order-by/';
            const formData = new FormData();
            formData.append('dependences', JSON.stringify(dependences));

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success} = JSON.parse(resp);

            if( success ) {
                Swal.close();
                return;
            }

            throw new Error;
        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
        }
    }

    const handleDndUpdate = ({ detail }) => {
        dependencesFiltered = detail.items;

        dependencesFiltered = dependencesFiltered.map((dep, index) => {
            return { ...dep, order_by: index + 1 };
        });

        dependences = [...dependencesFiltered];

    };
</script>
  
<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-row justify-start items-center">
        <SectionTitle title="Areas" />
    </div>
    <section class="flex justify-between items-center mt-6 flex-col sm:flex-row">
        <div class="relative {!search ? 'sm:w-40 hover:w-96' : 'sm:w-96' } transition-all duration-300 w-[90%]">
            <SearchIcon />
            <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-400"/>
        </div>
        <ButtonLight text="Agregar area" action={handleAdd} styles="mt-2 sm:mt-0 w-3/5 sm:w-auto flex justify-center" >
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
              <th class="py-3 px-6">#</th>
              <th class="py-3 px-6">Nombre</th>
              <th class="py-3 px-6">Teléfono</th>
              <th class="py-3 px-6">Abreviación</th>
              <th class="py-3 px-6 w-8">
                <EditIcon />
              </th>
              <th class="py-3 px-6 w-8">
                <DeleteIcon />
              </th>
          </tr>
        </thead>
        <tbody class="text-gray-600 divide-y" use:dndzone={{ items: dependencesFiltered, flipDurationMs: 100, dragDisabled: false }} on:consider={handleDndUpdate} on:finalize={handleDndUpdateFinalized}>
            {#each dependencesFiltered as dep, idx (dep.id)}
                <tr class="bg-white" key={dep.id}>
                    <td class="px-6 py-4 whitespace-nowrap max-w-3 font-semibold">{idx + 1}</td>
                    <td class="flex items-center gap-x-3 py-3 px-6 whitespace-nowrap">
                        <div>
                            <span class="block text-gray-700 text-sm font-medium">{dep.order_by} - {dep.name}</span>           
                            {#if dep.address.street !== '' && dep.address.street }
                                <a target="_blank" href="https://www.google.com/maps?q={dep.address.street}{dep.address.cp !== '' && dep.address.cp ? `, ${dep.address.cp}` : ''}" class="flex text-gray-700 text-xs gap-1 items-center">
                                    <DirectionIcon size={16} />
                                    {dep.address.street}
                                </a>
                            {:else if dep.address.coordinates !== '' && dep.address.coordinates }
                                <a target="_blank" href="https://www.google.com/maps?q={dep.address.coordinates}" class="flex text-gray-700 text-xs gap-1 items-center">
                                    <LocationMapIcon size={16} />
                                    {dep.address.coordinates}
                                </a>
                            {:else}
                                <span class="flex text-gray-700 text-xs gap-1 items-center">
                                    <NoLocationIcon size={16} />
                                    Sin dirección
                                </span>
                            {/if}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        {#if dep.phone}
                            {dep.phone}
                        {:else}
                            <PhoneOffIcon />
                        {/if}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">{dep.abbr !== '' && dep.abbr ? dep.abbr : '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> editDependence(dep)}>
                            <EditIcon />
                        </button>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={() => deleteDependence(dep.id)}>
                            <DeleteIcon />
                        </button>
                    </td>
                </tr>
            {:else}
                <tr class="bg-white">
                    <td colspan="6" class="p-4">
                        <section class="text-center flex items-center w-full justify-center">
                            <DependenceIcon size="20" />
                            <strong class="ml-2 font-semibold text-gray-700">No se encontraron Areas</strong>
                        </section>
                    </td>
                </tr>
            {/each}
        </tbody>
      </table>
    </div>
</div>
