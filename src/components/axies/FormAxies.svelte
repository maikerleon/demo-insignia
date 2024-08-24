<script>
	import MultiPlusIcon from '$icons/MultiPlusIcon.svelte';
	import SectionTitle from '$components/SectionTitle.svelte';
	import { createEventDispatcher } from 'svelte';
	import { closeAlert, handleLoading, messageAlert, messageForAdminView } from '$lib/utilities.js';
	import { enhance } from '$app/forms';
    import GoBackIcon from '$icons/GoBackIcon.svelte';
    import DeleteIcon from '$icons/DeleteIcon.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import ButtonNormal from '$components/ButtonNormal.svelte';
    export let role;
    export let form;
    export let axisSee;
    export let handleToggleTable;
        
    const dispatch = createEventDispatcher();

    const addAction = () => {
        axisSee.actions.list = [...axisSee.actions.list, {action: ''}];
    }

    $: if (form) {
        if( role !== 'super-view' ) {
            if (form?.data) {
                axisSee = form.data;
                delete form.data;
            }
            if (form?.error) closeAlert();
            if (form?.success) {
                messageAlert('success', `Eje ${form?.create ? 'registrado' : 'actualizado'} correctamente`);
                dispatch('handleAdd', {detail: axisSee, create: form?.create});
                delete form.success;
            }
        }
    }

    const deleteAction = (index) => {
        axisSee.actions.list = axisSee.actions.list.filter((_, i) => i !== index);
    }

</script>

<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-col justify-between">
        <SectionTitle title="Ejes" />
        <section class="flex justify-end mt-6">
            <ButtonLight text="Ir atrás" action={handleToggleTable} >
                <GoBackIcon />
            </ButtonLight>
        </section>
    </div>
    <section class="p-6 mx-auto bg-white rounded-md shadow-md mb-4 mt-6">
        <form autocomplete="off" method="post" use:enhance action="{role !== 'super-view' ? '?/axis' : ''}">

            <input type="text" hidden id="id" name="id" bind:value={axisSee.id}>
            
            <div class="grid grid-cols-1 gap-4 mt-4">

                <div>
                    <label class="text-gray-700" for="name">Nombre</label>
                    <input id="name" name="name" type="text" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={axisSee.name} placeholder="Nombre">
                </div>

                <div>
                    <label class="text-gray-700" for="objective">Objetivo</label>
                    <textarea id="objective" name="objective" type="text" class="min-h-32 block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={axisSee.objective} placeholder="Describe el objetivo"></textarea>
                </div>

                <div>
                    <label class="text-gray-700" for="strategy">Estrategia</label>
                    <textarea id="strategy" name="strategy" type="text" class="min-h-32 block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={axisSee.strategy} placeholder="Describe la estrategia"></textarea>
                </div>

                <hr class="mt-4 mb-2.5">

                <div class="flex justify-end mb-2">
                    <ButtonLight text="Agregar acción" action={addAction} typeButton="button" >
                        <MultiPlusIcon size={20} styles="mr-1" />
                    </ButtonLight>
                </div>

                {#each axisSee.actions.list as act, index }
                    <div class="flex justify-between items-center">
                        <input type="text" name="actions" class="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" placeholder="ingresa una acción" bind:value={act.action}>
                        {#if axisSee.actions.list.length !== 1 }
                            <button class="ml-2 rounded-full group focus:outline-none focus:text-red-600 text-gray-400 hover:text-red-600" type="button" on:click={() => deleteAction(index)}>
                                <DeleteIcon size={22} />
                            </button>
                        {/if}
                    </div>
                {/each}
                
            </div>
    
            <section class="mt-4">
                {#if form?.error }
                    <p class="ml-1 text-sm text-red-700 text-pretty">*{form?.message}</p>
                {/if}
            </section>
    
            <div class="flex justify-end mt-6">
                {#if role === 'super-view' }
                    <ButtonNormal typeButton="button" text="Guardar datos" action={messageForAdminView} />
                {:else}
                    {#if axisSee.name.length > 3 }
                        <ButtonNormal text="Guardar datos" action={handleLoading} />
                    {/if}
                {/if}
                
            </div>
        </form>
    </section>
</div>