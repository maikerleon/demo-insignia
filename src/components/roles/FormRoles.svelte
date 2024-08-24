<script>
	import SectionTitle from '$components/SectionTitle.svelte';
	import { createEventDispatcher } from 'svelte';
	import { closeAlert, handleLoading, messageAlert, messageForAdminView, rolesDirectory, formStyleSelect } from '$lib/utilities.js';
	import { enhance } from '$app/forms';
	import { municipalities } from '$lib/data.js';
    import GoBackIcon from '$icons/GoBackIcon.svelte';
    import SelectMunicipalities from '$components/SelectMunicipalities.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import ButtonNormal from '$components/ButtonNormal.svelte';
    export let role;
    export let form;
    export let adminSee;
    export let handleToggleTable;
    export let dependences;
    export let coordination;

    const dispatch = createEventDispatcher();

    $: if (form) {
        if ( role !== 'super-view' ) {
            if (form?.data) {
                adminSee = form.data;
                delete form.data;
            }
            if (form?.error) closeAlert();
            if (form?.success) {
                messageAlert('success', `Usuario ${form?.create ? 'registrado' : 'actualizado'} correctamente`);
                dispatch('handleAddAdmin', {detail: adminSee, create: form?.create});
                delete form.success;
            }
        }
    }

</script>

<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-col justify-between">
        <SectionTitle title="Roles de usuarios" />
        <section class="flex justify-end mt-6">
            <ButtonLight text="Ir atrás" action={handleToggleTable} >
                <GoBackIcon />
            </ButtonLight>
        </section>
    </div>
    <section class="p-6 mx-auto bg-white rounded-md shadow-md mb-4 mt-6">
        <form autocomplete="off" method="post" use:enhance action="{role !== 'super-view' ? '?/rol' : ''}">

            <input type="text" hidden id="id" name="id" bind:value={adminSee.id}>
            
            <div class="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                
                <div class="col-span-1 sm:col-span-2 grid sm:grid-cols-4 gap-4">
                    <section>
                        <label class="text-gray-700 ml-1" for="role">Rol de usuario</label>
                        <select bind:value={adminSee.role} class="{formStyleSelect} mt-2" id="role" name="role">
                            <option disabled value={null}>Seleccione un rol</option>
                            {#each rolesDirectory as rol }
                                {#if rol.who.includes(role)}
                                    <option value={rol.role}>{rol.title}</option>
                                {/if}
                            {/each}
                        </select>
                    </section>
                </div>
    
                <div>
                    <label class="text-gray-700" for="name">Nombre</label>
                    <input id="name" name="name" type="text" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={adminSee.name}>
                </div>
    
                <div>
                    <label class="text-gray-700" for="lastname_father">Apellido Paterno</label>
                    <input id="lastname_father" name="lastname_father" type="text" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={adminSee.lastname_father}>
                </div>
    
                <div>
                    <label class="text-gray-700" for="lastname_mother">Apellido Materno</label>
                    <input id="lastname_mother" name="lastname_mother" type="text" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={adminSee.lastname_mother}>
                </div>

                <div>
                    <label class="text-gray-700" for="phone">Teléfono</label>
                    <input id="phone" name="phone" type="tel" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={adminSee.phone}>
                </div>

                <div>
                    <label class="text-gray-700" for="email">Correo electrónico</label>
                    <input id="email" name="email" type="email" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={adminSee.email}>
                </div>

                {#if ['dependence','coordination','municipality','register'].includes(adminSee.role) && ['super-admin','super-view'].includes(role)}
                    <section>
                        <label class="text-gray-700" for="dependence">Dependencia</label>
                        <div class="relative w-full mt-2">
                            <select bind:value={adminSee.dependence} class="{formStyleSelect}" id="dependence" name="dependence">
                                <option disabled value={null}>Seleccione una dependencia</option>
                                {#each dependences as dep }
                                    <option value={dep.id}>{dep.name}</option>
                                {/each}
                            </select>
                        </div>
                    </section>
                {/if}

                {#if adminSee.role === 'coordination' && ['super-admin','super-view','dependence'].includes(role)}
                    <section class="col-span-1 sm:col-span-2">
                        <SelectMunicipalities coordination={adminSee.coordination.municipalities} />
                    </section>
                {/if}

                {#if ['municipality', 'register'].includes(adminSee.role) &&  ['super-admin','super-view','dependence','coordination'].includes(role) }
                    <section>
                        <label class="text-gray-700" for="municipality">Municipio</label>
                        <div class="relative w-full mt-2">
                            <select bind:value={adminSee.municipality} class="{formStyleSelect}" id="municipality" name="municipality">
                                <option disabled value={null}>Seleccione un municipio</option>
                                {#each municipalities as mun }
                                    {#if role === 'coordination' }
                                        {#if coordination.includes(mun.id) }
                                            <option value={mun.id}>{mun.name}</option>
                                        {/if}
                                    {:else}
                                        <option value={mun.id}>{mun.name}</option>
                                    {/if}
                                {/each}
                            </select>
                        </div>
                    </section>
                {/if}
    
            </div>
    
            <section class="mt-4">
                {#if form?.error }
                    <p class="ml-1 text-sm text-red-700 text-pretty">*{form?.message}</p>
                {/if}
            </section>
    
            <div class="flex justify-end mt-6">
                {#if role === 'super-view' }
                    {#if adminSee.role }
                        <ButtonNormal typeButton="button" text="Guardar datos" action={messageForAdminView} />
                    {/if}
                {:else}
                    {#if adminSee.role }
                        <ButtonNormal text="Guardar datos" action={handleLoading} />
                    {/if}
                {/if}
                
            </div>
        </form>
    </section>
</div>