<script>
    import { messageAlert, handleLoading, messageForAdminView } from '$lib/utilities.js';
    import { createEventDispatcher } from 'svelte';
    import Swal from 'sweetalert2';
	import PhoneOffIcon from '$icons/PhoneOffIcon.svelte';
	import DeleteIcon from '$icons/DeleteIcon.svelte';
    import EditIcon from '$icons/EditIcon.svelte';
    import UserIcon from '$icons/UserIcon.svelte';
    import UserQuestionIcon from '$icons/UserQuestionIcon.svelte';
    import SectionTitle from '$components/SectionTitle.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    export let admins;
    export let handleToggleTable;
    export let resetAdminSee;
    export let dependences;
    export let role;
    import SearchIcon from '$icons/SearchIcon.svelte';

    let search = '';
    let adminsFiltered = admins ? [...admins] : [];

    const dispatch = createEventDispatcher();

    const filteredAdmins = () => {

        if (admins === null) return;

        adminsFiltered = admins.filter(admin => {
            const searchString = search.toLowerCase();
            const searchWords = searchString.split(' ');

            return searchWords.every(word => (
                (admin.name && admin.name.toLowerCase().includes(word)) ||
                (admin.lastname_father && admin.lastname_father.toLowerCase().includes(word)) ||
                (admin.lastname_mother && admin.lastname_mother.toLowerCase().includes(word)) ||
                (admin.email && admin.email.toLowerCase().includes(word)) ||
                (admin.phone && admin.phone.toLowerCase().includes(word))
            ));
        });
    };

    const deleteAdmin = async ( id, admin ) => {
        
        if(role === 'super-view') { 
            messageForAdminView();
            return;
        }
        
        const title = admin === 'super-admin' ? 'administrador' : 'usuario';
        const result = await Swal.fire({
			title: "¡No podrás revertir esto!",
			text: `¿Estás seguro de eliminar este ${title} ?`,
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

                const action = '/api/delete-admin/'
                
				const formData = new FormData();
				
                formData.append('admin', id);

                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                const resp = await response.text();
                const {success} = JSON.parse(resp);

				if( success ) {
                    const adminIndex = admins.findIndex(a => a.id === id);
                    if (adminIndex !== -1) {
                        admins.splice(adminIndex, 1);
                    }
                    filteredAdmins();
					messageAlert('success',`Se ha eliminado el ${title} con éxito`);
                    return;
				}

                throw new Error;

			} catch (error) {
				messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
			}
		}
	}

    $: filteredAdmins(search);

    const handleAddRole = () => {
        resetAdminSee();
        handleToggleTable();
    }

    const editAdmin = (admin) => {
        dispatch('handleEditAdmin', admin);
    }
    
  </script>
  
<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-row justify-start items-center">
        <SectionTitle title="Roles de usuarios" />
    </div>
    <section class="flex justify-between items-center mt-6 flex-col sm:flex-row">
        <div class="relative {!search ? 'sm:w-40 hover:w-96' : 'sm:w-96' } transition-all duration-300 w-[90%]">
            <SearchIcon />
            <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-400"/>
        </div>
        <ButtonLight text="Agregar rol" action={handleAddRole} styles="mt-2 sm:mt-0 w-3/5 sm:w-auto flex justify-center" >
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
              <th class="py-3 px-4">#</th>
              <th class="py-3 px-2">Nombre</th>
              <th class="py-3 px-2">Teléfono</th>
              <th class="py-3 px-2">Dependencia</th>
              <th class="py-3 px-2 w-8">
                <EditIcon />
              </th>
              <th class="py-3 px-4 w-8">
                <DeleteIcon />
              </th>
          </tr>
        </thead>
        <tbody class="text-gray-600 divide-y">
            {#each adminsFiltered as ad, idx}
                <tr class="bg-white">
                    <td class="px-4 py-4 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                    <td class="flex items-center gap-x-3 py-3 px-2 whitespace-nowrap w-52">
                        {#if ad?.photo }
                            <img src={ad?.photo} class="object-cover skeleton w-10 h-10 rounded-full" alt="Foto de {ad.name}"/>
                        {:else}
                            <div class="w-20">
                                <UserIcon /> 
                            </div>
                        {/if}
                        <div>
                            <span class="block text-gray-700 text-sm font-medium">{ad.name} {ad.lastname_father} {ad.lastname_mother ?? ''}</span>
                            <span class="block text-gray-700 text-xs">{ad.email}</span>
                        </div>
                    </td>
                    <td class="px-2 py-4 whitespace-nowrap">
                        {#if ad.phone !== '' }
                            {ad.phone}
                        {:else}
                            <PhoneOffIcon />
                        {/if}
                    </td>
                    <td class="px-2 py-4 whitespace-nowrap max-w-28 truncate">{ad.dependence ? dependences.find(d => d.id === ad.dependence).name : 'N/A'}</td>
                    <td class="px-2 py-4 whitespace-nowrap">
                        <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> editAdmin(ad)}>
                            <EditIcon />
                        </button>
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap">
                        <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={() => deleteAdmin(ad.id, ad.role)}>
                            <DeleteIcon />
                        </button>
                    </td>
                </tr>
            {:else}
                <tr class="bg-white">
                    <td colspan="6" class="p-4">
                        <section class="text-center flex items-center w-full justify-center">
                            <UserQuestionIcon size="20" />
                            <strong class="ml-2 font-semibold text-gray-700">No se encontraron usuarios</strong>
                        </section>
                    </td>
                </tr>
            {/each}
        </tbody>
      </table>
    </div>
</div>