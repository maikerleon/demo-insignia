<script>
	import DeleteIcon from '$icons/DeleteIcon.svelte';
	import PlusIcon from '$icons/PlusIcon.svelte';
    import { createEventDispatcher } from 'svelte';
	import { formStyle, handleLoading, messageAlert, messageForAdminView } from '$lib/utilities.js';
	import ButtonNormal from '$components/ButtonNormal.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
	import GoBackIcon from '$icons/GoBackIcon.svelte';

    export let toggleTable;
    export let dataSee;
    export let project;
    export let role;

    const dispatch = createEventDispatcher();

    const labelStyle = "font-semibold text-base text-gray-600 ml-0.5";

    const updateData = () => {
        dispatch('handleAddNewStrategy', dataSee);
    }

    const createStrategy = async () => {

        if (dataSee.id !== "") return;

        handleLoading('Creando estrategia...');
        
        try {

            const action = '/api/create-socialization/'
            
            const formData = new FormData();
            
            formData.append('project', project);
            formData.append('socialization', JSON.stringify(dataSee));

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success, newId} = JSON.parse(resp);

            dataSee.id = newId;

            updateData();

            if( success ) {
                messageAlert('success',`Se ha creado la estrategia con éxito`);
                return;
            }

            throw new Error;

        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
        }
	}

    const deleteLink = (index) => {
        dataSee.links = dataSee.links.filter((link, i) => i !== index);
    }

    const addLink = () => {
        dataSee.links = [...dataSee.links, {link: '', description: ''}];
    }
    
</script>

<section>
    <div class="flex justify-end">
        <ButtonLight typeButton="button" styles="mb-4" action={toggleTable} text="Ir atrás">
            <GoBackIcon styles="pr-1" />
        </ButtonLight>
    </div>

    <div class="mt-5 flex-col gap-2 flex">

        <div>
            <div class="md:max-w-[70%] w-full ml-1">
                <label for="strategy" class="{labelStyle} text-pretty">¿Cómo se comunicó el proyecto al público de interés? (A través de qué medios, con cuánto tiempo de anticipación y si existe una estrategia para continuar informando)</label>
            </div>
            {#if dataSee.id === "" }
                <textarea type="text" name="strategy" id="strategy" bind:value={dataSee.strategy} class="mt-2 min-h-32 max-h-96 {formStyle}" placeholder="Describe brevemente la estrategia de socialización del proyecto"></textarea>
            {:else}
                <textarea type="text" name="strategy" id="strategy" value={dataSee.strategy} class="mt-2 min-h-32 max-h-96 {formStyle}" placeholder="Describe brevemente la estrategia de socialización del proyecto" readonly></textarea>
            {/if}
        </div>

        <div class="mt-8">
            <div class="flex justify-between">
                <h1 class="{labelStyle} text-pretty">Links probatorios</h1>
                {#if dataSee.id === ""}
                    <ButtonLight text="Agregar link" action={addLink}>
                        <PlusIcon size={16} styles="mr-1" />
                    </ButtonLight>
                {/if}
            </div>
            <div class="mt-5 grid grid-cols-1 gap-4">
                {#each dataSee.links as {link, description}, index }
                    <div class="grid grid-cols-2 bg-gray-100 rounded-md px-3 py-2 gap-4">
                        <div class="flex items-center gap-x-2">
                            <div class="w-3 h-3 bg-ins-700 rounded-full"></div>
                            <input type="text" bind:value={link} name="link" placeholder="Inserta el link" class="w-full focus:outline-ins-700/40 rounded-md p-2">
                        </div>
                        <div class="flex items-center gap-x-1">
                            <input type="text" bind:value={description} name="description" placeholder="Breve descripción o titular" class="w-full focus:outline-ins-700/40 rounded-md p-2">
                            {#if dataSee.links.length !== 1 && dataSee.id === ""}
                                <button class="ml-1 rounded-full group focus:outline-none focus:text-red-600 text-gray-400 hover:text-red-600" type="button" on:click={() => deleteLink(index)}>
                                    <DeleteIcon size={20} />
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>

    </div>

    {#if dataSee.id === "" }
        <div class="flex justify-end mt-8">
            
            {#if role === 'super-view' }            
                <ButtonNormal typeButton="button" action={messageForAdminView} text="Crear estrategia" />
            {:else}
                <ButtonNormal typeButton="button" action={createStrategy} text="Crear estrategia" />
            {/if}
        </div>

    {/if}
    
</section>