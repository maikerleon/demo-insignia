<script>
	import { statutes } from '$lib/data.js';
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

    if ( bucket === 'progress_supervisor' && dataSee.id === '' ) {
        dataSee.governor_attend = false;
    }

    const dispatch = createEventDispatcher();

    const labelStyle = "font-semibold text-sm text-gray-600 ml-0.5";

    let files;
    let files_approved;

    const updateData = () => {
        dispatch('handleAddNewProgress', dataSee);
    }

    onMount(() => {
		if ( dataSee.id === "" ) {
            files = new Dropzone("#files", { 
                url: "/api/upload-files-progress",
                dictDefaultMessage: "Arrastra tus archivos aquí o haz clic para seleccionarlos",
                dictRemoveFile: "Eliminar",
                autoProcessQueue: false,
                maxFiles: 50,
                acceptedFiles: 'image/png,image/jpg,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                addRemoveLinks: true
            });

            files.on("queuecomplete", function() {
                files.removeAllFiles(true);
            });

            files.on("error", function(file, errorMessage) {
                messageAlert('error','Error al subir los archivos, por favor vuelva a intentarlo!');
            });

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

    const getImageDimensionsFromFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const width = this.width;
                const height = this.height;
                resolve({ width, height });
            };
            img.src = event.target.result;
            };

            reader.onerror = function(error) {
            reject(error);
            };

            reader.readAsDataURL(file);
        });
    }

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

            dropzoneTemp.on("success", async (file, {url}) => {
                
                const {width, height} = await getImageDimensionsFromFile(file);

                let newData = {file: url, created_at: new Date().toISOString(), ext: url.split('.').pop()};
                if (width && height) {
                    newData.width = width;
                    newData.height = height;
                }
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

        await handleSendImages('files');
        await handleSendImages('files_approved');
        handleLoading('Creando avances...');
        
        try {

            const action = '/api/create-progress/'
            
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
                messageAlert('success',`Se ha creado el avance con éxito`);
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

    <div class="flex flex-col gap-2">
        <label for="general" class="{labelStyle}">Avance general</label>
        {#if dataSee.id === "" }
            <textarea name="general" id="general" class="{formStyle} h-32" bind:value={dataSee.general} placeholder="Ingrese el detalle del avance"></textarea>
        {:else}
            <textarea name="general" id="general" class="{formStyle} h-32" value={dataSee.general} placeholder="Ingrese el detalle del avance" readonly></textarea>
        {/if}
        
    </div>

    <div class="md:stats flex flex-col md:flex-row justify-center items-center mt-4 mb-4">
  
        <div class="stat w-full">
          <div class="stat-figure text-ins-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div class="stat-title">% de avance</div>
          <div class="stat-value">
            {#if dataSee.id === "" }
                <input type="number" bind:value={dataSee.percent} on:keyup={()=> { dataSee.percent = dataSee.percent > 100 ? 100 : dataSee.percent < 0 ? 0 : dataSee.percent }} max={100} min={0} class="w-28 focus:outline-none">
            {:else}
                {dataSee.percent}
            {/if}
            %
          </div>
          <div class="stat-desc">Valor manual</div>
        </div>
        
        <div class="stat w-full">
          <div class="stat-figure text-ins-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          </div>
          <div class="stat-title">% de avance del sistema</div>
          <div class="stat-value">{dataSee.system_progress ?? 0}%</div>
          <div class="stat-desc">Tomado del sistema</div>
        </div>
        
        <div class="stat w-full">
          <div class="stat-figure text-ins-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
          </div>
          <div class="stat-title">Proyecto con desdoble</div>
          <div class="stat-value">{dataSee.sub_actions ? 'Si' : 'No'}</div>
          <div class="stat-desc">Tomado del sistema</div>
        </div>

        {#if bucket === 'progress' }
            <div class="stat w-full">
                <div class="w-full">
                    <label for="status" class="{labelStyle}">Estatus</label>
                    {#if !dataSee.id }
                        <select name="status" id="status" class="{formStyle} h-12 mt-2" bind:value={dataSee.status}>
                            <option value={null} disabled>Seleccione un estatus</option>
                            {#each statutes as st }
                                <option value={st.value}>{st.label}</option>
                            {/each}
                        </select>
                    {:else}
                        <span class="text-sm font-semibold">({statutes.find(s => s.value === dataSee.status)?.label || 'Desconocido'})</span>
                    {/if}
                </div>
            </div>
        {/if}
        
    </div>


    <div class="mt-5">
        <CardFile bind:files={dataSee.files} {project} gridColums="md:grid-cols-6 grid-cols-2" onlyRead={true} />                    
    </div>

    {#if dataSee.id === "" }

        <div class="mt-5">
            <label for="files" class="{labelStyle}">Soporte fotográfico de avance</label>
            <div id="files" name="files" class="dropzone w-full mt-2 font-semibold text-gray-500 bg-white "></div>
        </div>

    {/if}

    {#if bucket === 'progress_supervisor' }
        <div class="mt-8 items-center flex-row flex">
            <div><span class="{labelStyle}">¿Asiste Manolo?</span></div>
            {#if dataSee.id === "" }
                <input type="checkbox" bind:checked={dataSee.governor_attend} class="checkbox checkbox-success ml-3" />
            {:else}
                <input type="checkbox" checked={dataSee.governor_attend} class="checkbox checkbox-success ml-3 disabled:opacity-100 disabled:border-none" disabled />
            {/if}
        </div>
    {/if}
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 justify-between items-center mt-8">
        <div class="form-control max-w-fit">
            <label class="cursor-pointer label">
                <span class="{labelStyle}">¿Requiere aprobación?</span>
                {#if dataSee.id === "" }
                    <input type="checkbox" bind:checked={dataSee.need_approve} class="checkbox checkbox-success ml-3" />
                {:else}
                    <input type="checkbox" checked={dataSee.need_approve} class="checkbox checkbox-success ml-3 disabled:opacity-100 disabled:border-none" disabled />
                {/if}
                
            </label>
        </div>

        {#if dataSee.need_approve }
            <div class="flex justify-center md:justify-end items-center md:mr-20">
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
                    <span class="{labelStyle}">¿Ya fue aprobado?</span>
                    <span class="tooltip" data-tip="Pendiente de aprobación">
                        <AlertHexaIcon styles="ml-2 text-orange-600" size={30} />
                    </span>                    
                {/if}
            </div>
        {/if}
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
            <CardFile bind:files={dataSee.files_approved} {project} gridColums="md:grid-cols-6 grid-cols-2" onlyRead={true} />                    
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
                <ButtonNormal typeButton="button" action={messageForAdminView} text="Crear avance" />
            {:else}
                <ButtonNormal typeButton="button" action={createProgress} text="Crear avance" />
            {/if}
        </div>

    {/if}
    
</section>

<style>
    .dropzone {
		border: dashed 2px silver;
	}
</style>