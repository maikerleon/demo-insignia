<script>
    import { onMount } from "svelte";
	import { createEventDispatcher } from 'svelte';
	import { closeAlert, handleLoading, messageAlert, messageForAdminView } from '$lib/utilities.js';
    import SectionTitle from '$components/SectionTitle.svelte';
	import { enhance } from '$app/forms';
	import { municipalities } from '$lib/data.js';
    import GoBackIcon from '$icons/GoBackIcon.svelte';
	import ImageIcon from '$icons/ImageIcon.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import ButtonNormal from '$components/ButtonNormal.svelte';
    import Dropzone from "dropzone";

    export let role;
    export let form;
    export let dependenceSee;
    export let handleToggleTable;

    let logo = dependenceSee.logo;
    let logo_img;

    const dispatch = createEventDispatcher();

    onMount(() => {
        logo_img = new Dropzone("#logo_img", { 
            url: "/api/update-logo-dependence",
            dictDefaultMessage: "Arrastra tu logo aquí o haz clic para seleccionarlo",
            dictRemoveFile: "Eliminar",
            autoProcessQueue: false,
            maxFiles: 1,
            acceptedFiles: 'image/png,image/jpg,image/jpeg',
            addRemoveLinks: true
        });

        logo_img.on("queuecomplete", function() {
            logo_img.removeAllFiles(true);
        });

        logo_img.on("error", function(file, errorMessage) {
            messageAlert('error','Error al subir los archivos, por favor vuelva a intentarlo!');
        });
	});

    const handleSendLogo = async () => {
        return new Promise((resolve, reject) => {

            let dropzoneTemp = logo_img;
            
            const filesTemp = dropzoneTemp.getQueuedFiles();

            if (filesTemp.length === 0) {
                resolve();
                return;
            }

            handleLoading('Subiendo logo de la dependencia...');

            let currentFileIndex = 0;

            dropzoneTemp.on("success", (file, {url}) => {
                logo = url;
                dependenceSee.logo = url; 
                processNextFile();
            });

            dropzoneTemp.on("error", (file, errorMessage) => {
                reject(new Error(`Error al procesar el archivo ${file.name}: ${errorMessage}`));
            });

            const processNextFile = () => {
                if (currentFileIndex < filesTemp.length) {
                    const file = filesTemp[currentFileIndex];
                    const fileFormData = new FormData();
                    fileFormData.append('dependence', dependenceSee.id);
                    fileFormData.append('file', file);

                    dropzoneTemp.options.params = Object.fromEntries(fileFormData.entries());
                    dropzoneTemp.options.uploadMultiple = false;
                    dropzoneTemp.processFile(file);

                    currentFileIndex++;
                } else {
                    resolve();
                }
            };

            processNextFile();
        });
    };

    const beforeUpdateData = async () => {
        await handleSendLogo();
        messageAlert('success', `Dependencia ${form?.create ? 'registrada' : 'actualizada'} correctamente`);
        dispatch('handleAddDependence', {detail: dependenceSee, create: form?.create});
        delete form.success;
    }

    $: if (form) {
        if ( role !== 'super-view' ) {
            if (form?.data) {
                dependenceSee = form.data;
                delete form.data;
            }
            if (form?.error) closeAlert();
            if (form?.success) {
                beforeUpdateData();
            }
        }
    }

</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/basic.min.css" integrity="sha512-MeagJSJBgWB9n+Sggsr/vKMRFJWs+OUphiDV7TJiYu+TNQD9RtVJaPDYP8hA/PAjwRnkdvU+NsTncYTKlltgiw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/dropzone.min.css" integrity="sha512-qkeymXyips4Xo5rbFhX+IDuWMDEmSn7Qo7KpPMmZ1BmuIA95IPVYsVZNn8n4NH/N30EY7PUZS3gTeTPoAGo1mA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-col justify-between">
        <SectionTitle title="Areas" />
        <section class="flex justify-end mt-6">
            <ButtonLight text="Ir atrás" action={handleToggleTable} >
                <GoBackIcon />
            </ButtonLight>
        </section>
    </div>
    <section class="p-6 mx-auto bg-white rounded-md shadow-md mb-4 mt-6">
        <form autocomplete="off" method="post" use:enhance action="{role !== 'super-view' ? '?/dependence' : ''}">

            <input type="text" hidden id="id" name="id" bind:value={dependenceSee.id}>
            
            <div class="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-3">

                <div>
                    <label class="text-gray-700" for="name">Nombre</label>
                    <input id="name" name="name" type="text" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={dependenceSee.name} placeholder="Nombre">
                </div>

                <div>
                    <label class="text-gray-700" for="phone">Teléfono</label>
                    <input id="phone" name="phone" type="tel" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={dependenceSee.phone} placeholder="Telélefono">
                </div>

                <div class="sm:max-w-32 max-w-full">
                    <label class="text-gray-700" for="abbr">Abreviación</label>
                    <input id="abbr" name="abbr" type="text" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={dependenceSee.abbr} placeholder="Abreviación">
                </div>
                
                <div class="col-span-1 sm:col-span-2">
                    <label class="text-gray-700" for="street">Calle</label>
                    <input id="street" name="street" type="text" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={dependenceSee.address.street} placeholder="Calle 1, calle 2">
                </div>

                <div>
                    <label class="text-gray-700" for="number">Número</label>
                    <input id="number" name="number" type="number" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={dependenceSee.address.number} placeholder="#">
                </div>

                <section>
                    <label class="text-gray-700 ml-1 " for="municipality">Municipio</label>
                    <select bind:value={dependenceSee.address.municipality} class="mt-2 w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:border-ins-700/30 focus:ring-ins-700 focus:ring focus:ring-opacity-20" id="municipality" name="municipality">
                        <option disabled value={0}>Seleccione un municipio</option>
                        {#each municipalities as mun }
                            <option value={mun.id}>{mun.name}</option>
                        {/each}
                    </select>
                </section>

                <div>
                    <label class="text-gray-700" for="cp">Código postal</label>
                    <input id="cp" name="cp" type="number" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={dependenceSee.address.cp} placeholder="00000">
                </div>

                <div>
                    <label class="text-gray-700" for="coordinates">Coordenadas</label>
                    <input id="coordinates" name="coordinates" type="tel" class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring" bind:value={dependenceSee.address.coordinates} placeholder="48.856614, 2.352221">
                </div>

                <div class="p-5 col-span-1 text-gray-300 flex justify-center items-center">
                    {#if !logo || logo === '' }
                        <ImageIcon size={200} />
                    {:else}
                        <figure>
                            <img src={logo} loading="lazy" alt="Logo de dependencia">
                        </figure>
                    {/if}
                </div>
                <div class="p-5 col-span-1 md:col-span-2">
                    <div id="logo_img" class="dropzone w-full mt-5 font-semibold text-gray-500 bg-white"></div>
                    <p class="mt-3 text-sm leading-relaxed text-left text-gray-500">
                        Selecciona un logo, preferiblemente de 500x500
                    </p>
                </div>

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
                    {#if dependenceSee.name.length > 3 }
                        <ButtonNormal text="Guardar datos" action={handleLoading} />
                    {/if}
                {/if}
            </div>
        </form>
    </section>
</div>

<style>
    .dropzone {
		border: dashed 3px silver;
	}
</style>