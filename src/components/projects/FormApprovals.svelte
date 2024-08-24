<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import Dropzone from 'dropzone';
	import { formStyle, handleLoading, messageAlert, formatDateTime, messageForAdminView } from '$lib/utilities.js';
	import CardFile from '$components/projects/CardFile.svelte';
	import ButtonNormal from '$components/ButtonNormal.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
	import GoBackIcon from '$icons/GoBackIcon.svelte';
	import AlertHexaIcon from '$icons/AlertHexaIcon.svelte';
    import CheckedVerifyIcon from '$icons/CheckedVerifyIcon.svelte';
    import XCubeIcon from '$icons/XCubeIcon.svelte';

    export let toggleTable;
    export let dataSee;
    export let project;
    export let bucket;
    export let role;

    const dispatch = createEventDispatcher();

    const labelStyle = "font-semibold text-sm text-gray-600 ml-0.5";

    let files_approved;

    const updateData = () => {
        dispatch('handleAddNewProgress', dataSee);
    }

    onMount(() => {
		if ( dataSee.id === "" ) {
            files_approved = new Dropzone("#files_approved", { 
                url: "/api/upload-files-progress",
                dictDefaultMessage: "Arrastra tus archivos aquí o haz clic para seleccionarlos",
                dictRemoveFile: "Eliminar",
                autoProcessQueue: false,
                maxFiles: 50,
                acceptedFiles: 'image/png,image/jpg,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                addRemoveLinks: true
            });

            files_approved.on("queuecomplete", function() {
                files_approved.removeAllFiles(true);
            });

            files_approved.on("error", function(file, errorMessage) {
                messageAlert('error','Error al subir los archivos, por favor vuelva a intentarlo!');
            });
        }
	});

    const handleSendImages = async (type) => {
        return new Promise((resolve, reject) => {

            let dropzoneTemp;
            let messageLoading;

            if ( type === 'files' ) {
                dropzoneTemp = files;
                messageLoading = "Subiendo soporte fotográfico...";
            } else {
                dropzoneTemp = files_approved;
                messageLoading = "Subiendo fotos...";
            }
            
            const filesTemp = dropzoneTemp.getQueuedFiles();

            if (filesTemp.length === 0) {
                resolve();
                return;
            }

            handleLoading(messageLoading);

            let currentFileIndex = 0;

            dropzoneTemp.on("success", (file, {url}) => {
                const newData = {file: url, created_at: new Date().toISOString(), ext: url.split('.').pop()};
                if ( type === 'files' ) {
                    if (dataSee?.files) {
                        dataSee.files = [...dataSee.files, newData];
                    }else {
                        dataSee.files = [newData];
                    }
                } else {
                    if (dataSee?.files_approved) {
                        dataSee.files_approved = [...dataSee.files_approved, newData];
                    }else {
                        dataSee.files_approved = [newData];
                    }
                }

                processNextFile(type);
            });

            dropzoneTemp.on("error", (file, errorMessage) => {
                reject(new Error(`Error al procesar el archivo ${file.name}: ${errorMessage}`));
            });

            const processNextFile = (type) => {
                if (currentFileIndex < filesTemp.length) {
                    const file = filesTemp[currentFileIndex];
                    const fileFormData = new FormData();
                    fileFormData.append('project', project);
                    fileFormData.append('file', file);
                    fileFormData.append('typeFile', type);
                    fileFormData.append('bucket', bucket);

                    dropzoneTemp.options.params = Object.fromEntries(fileFormData.entries());
                    dropzoneTemp.options.uploadMultiple = false;
                    dropzoneTemp.processFile(file);

                    currentFileIndex++;
                } else {
                    resolve();
                }
            };

            processNextFile(type);
        });
    };

    const createProgress = async () => {

        if (dataSee.id !== "") return;

        await handleSendImages('files_approved');
        handleLoading('Creando aprobación...');
        
        try {

            const action = '/api/create-approvals/'
            
            const formData = new FormData();
            
            formData.append('project', project);
            formData.append('bucket', bucket);
            formData.append('progress', JSON.stringify(dataSee));

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success, newId} = JSON.parse(resp);

            dataSee.id = newId;

            updateData();

            if( success ) {
                messageAlert('success',`Se ha creado la aprobación con éxito`);
                return;
            }

            throw new Error;

        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
        }
	}
    
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/basic.min.css" integrity="sha512-MeagJSJBgWB9n+Sggsr/vKMRFJWs+OUphiDV7TJiYu+TNQD9RtVJaPDYP8hA/PAjwRnkdvU+NsTncYTKlltgiw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/dropzone.min.css" integrity="sha512-qkeymXyips4Xo5rbFhX+IDuWMDEmSn7Qo7KpPMmZ1BmuIA95IPVYsVZNn8n4NH/N30EY7PUZS3gTeTPoAGo1mA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<section>
    <div class="flex justify-end">
        <ButtonLight typeButton="button" styles="mb-4" action={toggleTable} text="Ir atrás">
            <GoBackIcon styles="pr-1" />
        </ButtonLight>
    </div>

    <div class="grid grid-cols-1 gap-4 justify-start items-center mt-0">
        <div class="flex justify-center sm:justify-start items-center sm:mr-20">
            {#if dataSee.approved === 'rejected' }
                <div class="flex flex-col gap-1">
                    <span class="flex flex-row justify-center items-center tooltip" data-tip="Fue rechazado">
                        <strong>Rechazado</strong>
                        <XCubeIcon styles="ml-2 text-red-600" size={30} />
                    </span>     
                    <span class="text-xs font-normal mt-3">
                        <strong>Nota:</strong>
                        {dataSee.response === '' ? 'Sin nota' : dataSee.response}
                    </span>
                    <span class="text-xs font-normal">
                        <strong>Rechazado por:</strong>
                        {dataSee.approved_by === '' ? 'Desconocido' : dataSee.approved_by}
                    </span>
                    <span class="text-xs font-normal">
                        <strong>Rechazado el:</strong>
                        {dataSee.approved_at === '' ? 'Desconocida' : formatDateTime(dataSee.approved_at)}
                    </span>
                    {#if dataSee.audio }
                        <audio class="h-9 mt-2" controls> 
                            <source src="{dataSee.audio}" type="audio/mp3"> No soportado.
                        </audio>
                    {/if}
                </div>               
            {:else if dataSee.approved === 'approved'}  
                <div class="flex flex-col gap-1">
                    <span class="flex flex-row justify-center items-center tooltip" data-tip="Fue aprobado">
                        <strong>Aprobado</strong>
                        <CheckedVerifyIcon styles="ml-2 text-green-600" size={30} />
                    </span>     
                    <span class="text-xs font-normal mt-3">
                        <strong>Nota:</strong>
                        {dataSee.response === '' ? 'Sin nota' : dataSee.response}
                    </span>
                    <span class="text-xs font-normal">
                        <strong>Aprobado por:</strong>
                        {dataSee.approved_by === '' ? 'Desconocido' : dataSee.approved_by}
                    </span>
                    <span class="text-xs font-normal">
                        <strong>Aprobado el:</strong>
                        {dataSee.approved_at === '' ? 'Desconocida' : formatDateTime(dataSee.approved_at)}
                    </span>
                    {#if dataSee.audio }
                        <audio class="h-9 mt-2" controls> 
                            <source src="{dataSee.audio}" type="audio/mp3"> No soportado.
                        </audio>
                    {/if}
                </div>               
            {:else}
                {#if dataSee.id !== '' }
                    <span class="{labelStyle}">¿Ya fue aprobado?</span>
                    <span class="tooltip" data-tip="Pendiente de aprobación">
                        <AlertHexaIcon styles="ml-2 text-orange-600" size={30} />
                    </span>            
                {/if}        
            {/if}
        </div>
    </div>

    <div class="mt-5 flex-col gap-2 {dataSee.need_approve ? 'flex' : 'hidden' }">

        <div>
            <label for="approval_details" class="{labelStyle}">Describe la aprobación</label>
            {#if dataSee.id === "" }
                <input type="text" name="approval_details" id="approval_details" bind:value={dataSee.approval_details} class="mt-2 {formStyle}" placeholder="Describe la aprobación">
            {:else}
                <input type="text" name="approval_details" id="approval_details" value={dataSee.approval_details} class="mt-2 {formStyle}" placeholder="Describe la aprobación" readonly>
            {/if}
        </div>

        <div>
            <CardFile bind:files={dataSee.files_approved} {project} gridColums="sm:grid-cols-6 grid-cols-2" onlyRead={true} />                    
        </div>

        {#if dataSee.id === "" }

            <div class="mt-5">
                <label for="files_approved" class="{labelStyle}">Fotos</label>
                <div id="files_approved" name="files_approved" class="dropzone w-full mt-2 font-semibold text-gray-500 bg-white"></div>
            </div>

        {/if}

    </div>

    {#if dataSee.id === "" }
        <div class="flex justify-end mt-8">
            
            {#if role === 'super-view' }            
                <ButtonNormal typeButton="button" action={messageForAdminView} text="Crear aprobación" />
            {:else}
                <ButtonNormal typeButton="button" action={createProgress} text="Crear aprobación" />
            {/if}
        </div>

    {/if}
    
</section>

<style>
    .dropzone {
		border: dashed 2px silver;
	}
</style>