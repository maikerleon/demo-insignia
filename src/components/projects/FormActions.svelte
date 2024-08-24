<script>
	import BlackhoeIcon from '$icons/BlackhoeIcon.svelte';
	import LoaderIcon from '$icons/LoaderIcon.svelte';
	import FileUnknownIcon from '$icons/FileUnknownIcon.svelte';
	import WordIcon from '$icons/WordIcon.svelte';
	import ExcelIcon from '$icons/ExcelIcon.svelte';
	import PdfIcon from '$icons/PdfIcon.svelte';
	import EyeIcon from '$icons/EyeIcon.svelte';
    import { onMount } from 'svelte';
	import DeleteIcon from '$icons/DeleteIcon.svelte';
	import MultiPlusIcon from '$icons/MultiPlusIcon.svelte';
	import SectionTitle from '$components/SectionTitle.svelte';
	import { closeAlert, handleLoading, messageAlert, messageForAdminView, formStyle, formStyleSelect } from '$lib/utilities.js';
	import { actions_types } from '$lib/data.js';
	import { enhance } from '$app/forms';
    import GoBackIcon from '$icons/GoBackIcon.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import ButtonNormal from '$components/ButtonNormal.svelte';
    import Select from 'svelte-select';
    import Dropzone from 'dropzone';
    import { colonies as colonies_temp } from '$lib/colonies.js'
    import { priorities, statutes, types } from '$lib/data.js';
    import ExternalLink from '$icons/ExternalLink.svelte';
    import Swal from 'sweetalert2';

    export let role;
    export let form;
    export let dataSee;
    export let dependences;
    export let managers;
    export let onlyActions = false;
    export let dependence = '';
    export let municipality = '';
    export let coordination = [];

    let colonies = colonies_temp.map(col => ({label: col.colony, value: col.colony}));

    const municipalities = [...dataSee.project_municipalities.data];

    let dropzone;
    
    onMount(() => {
		dropzone = new Dropzone("#files", { 
			url: "/api/upload-evidence",
			dictDefaultMessage: "Arrastra tus evidencias aquí o haz clic para seleccionarlas",
            dictRemoveFile: "Eliminar",
			autoProcessQueue: false,
			maxFiles: 50,
            acceptedFiles: 'image/png,image/jpg,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            addRemoveLinks: true
		});

		dropzone.on("queuecomplete", function() {
			messageAlert('success',`Imágenes guardadas exitosamente!`);
			dropzone.removeAllFiles(true);
		});

		dropzone.on("error", function(file, errorMessage) {
			messageAlert('error','Error al subir los archivos, por favor vuelva a intentarlo!');
		});
	});

    const handleSendImages = async (action) => {
        return new Promise((resolve, reject) => {
            const files = dropzone.getQueuedFiles();

            if (files.length === 0) {
                resolve();
                return;
            }

            handleLoading("Subiendo evidencia...");

            let currentFileIndex = 0;

            dropzone.on("success", (file, response) => {
                if (dataSee.evidence?.data) {
                    dataSee.evidence.data = [...dataSee.evidence.data, {photo: file.dataURL, created_at: new Date().toISOString()}];
                }else {
                    dataSee.evidence.data = [{photo: file.dataURL, created_at: new Date().toISOString()}];
                }

                processNextFile();
            });

            dropzone.on("error", (file, errorMessage) => {
                reject(new Error(`Error al procesar el archivo ${file.name}: ${errorMessage}`));
            });

            const processNextFile = () => {
                if (currentFileIndex < files.length) {
                    const file = files[currentFileIndex];
                    const fileFormData = new FormData();
                    fileFormData.append('id', action);
                    fileFormData.append('file', file);

                    dropzone.options.params = Object.fromEntries(fileFormData.entries());
                    dropzone.options.uploadMultiple = false;
                    dropzone.processFile(file);

                    currentFileIndex++;
                } else {
                    resolve();
                }
            };

            processNextFile();
        });
    };

    const deleteEvidence = async (e, rsc) => {
        e.preventDefault();
        const result = await Swal.fire({
			title: "¡No podrás revertir esto!",
			text: `¿Estás seguro de eliminar está evidencia?`,
			icon: 'warning',
            focusCancel: true,
			showCancelButton: true,
			confirmButtonColor: '#1fabbb',
			cancelButtonColor: '#d33',
			confirmButtonText: '¡Sí, eliminarla!',
			cancelButtonText: 'Cancelar'
		});

		if (result.isConfirmed) {

            try {
                handleLoading("Eliminando evidencia...");

                const action = '/api/delete-evidence';
                const formData = new FormData();

                formData.append('action', dataSee.id);
                formData.append('evidence', rsc);

                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                const resp = await response.text();
                const {success} = JSON.parse(resp);

                if( success ) {
                    messageAlert('success', `Evidencia eliminada correctamente`);
                    dataSee.evidence.data = dataSee.evidence.data.filter(r => r.evidence !== rsc);
                    return;
                }

                throw new Error;

            } catch (error) {
                closeAlert();
                messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
            }
        }
    }

    const addAction = () => {
        dataSee.actions = [...dataSee.actions, {id: '', name: '', dependence: {data: null}, start: '', end: '', type: 'action', manager: {data: null}, status: 'active' }];
    }

    $: if (form) {
        if (form?.error) closeAlert();
        if (form?.success) {
            delete form.success;
            responseSuccess();
        }
    }

    const responseSuccess = async () => {
        await handleSendImages(dataSee.id);
        messageAlert('success', `Acción actualizada correctamente`);
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }

    const selectAllMunicipalities = () => {
        dataSee.municipalities = {...dataSee.project_municipalities}
    }

    const selectAllColonies = () => {
        dataSee.colonies = {data: colonies_temp.map(col => ({label: col.colony, value: col.colony}))}
    }

    const deleteAction = (index) => {
        dataSee.actions = dataSee.actions.filter((_, i) => i !== index);
    }
    
    const deleteActionRegistered = async ( id, index ) => {
        const result = await Swal.fire({
			title: "¡No podrás revertir esto!",
			text: `¿Estás seguro de eliminar está acción y sus desdobles?`,
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

                const action = '/api/delete-action/'
                
				const formData = new FormData();
				
                formData.append('action', id);

                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                const resp = await response.text();
                const {success} = JSON.parse(resp);

				if( success ) {
                    dataSee.actions = dataSee.actions.filter((_, i) => i !== index);
					messageAlert('success',`Se ha eliminado la acción y sus desdobles con éxito`);
                    return;
				}

                throw new Error;

			} catch (error) {
				messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
			}
		}
	}

    const userHasPermissionForAction = (action) => {
        if ( !onlyActions ) return true;

        if (['super-admin', 'super-view'].includes(role)) {
            return true;
        }

        if (role === 'dependence') {
            return action.dependence?.data?.value === dependence;
        } else if (role === 'coordination') {
            const actionMunicipalities = action.municipalities.data?.map(m => m.value) || [];
            return actionMunicipalities.some(municipalityId => coordination.includes(municipalityId));
        } else if (['municipality', 'register'].includes(role)) {
            const actionMunicipalities = action.municipalities.data?.map(m => m.value) || [];
            return actionMunicipalities.includes(municipality);
        }
        
        return false;
    }

</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/basic.min.css" integrity="sha512-MeagJSJBgWB9n+Sggsr/vKMRFJWs+OUphiDV7TJiYu+TNQD9RtVJaPDYP8hA/PAjwRnkdvU+NsTncYTKlltgiw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/dropzone.min.css" integrity="sha512-qkeymXyips4Xo5rbFhX+IDuWMDEmSn7Qo7KpPMmZ1BmuIA95IPVYsVZNn8n4NH/N30EY7PUZS3gTeTPoAGo1mA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-col justify-between">
        <SectionTitle styles='uppercase' title="{dataSee.project_name}" />
        <section class="flex justify-end mt-6">
            {#if onlyActions }
                {#if ['super-admin','super-view','dependence'].includes(role) }
                    <a href="/proyectos/detalle/{dataSee.project}" data-sveltekit-reload data-sveltekit-preload-data="false" data-sveltekit-replacestate class="border border-ins-500 hover:outline-none bg-gray-100/70 hover:bg-ins-600 text-ins-500 px-6 py-2 rounded-md text-sm flex items-center hover:text-white font-semibold focus-visible:outline-none mr-2">
                        <BlackhoeIcon styles="mr-1" /> Ir al proyecto
                    </a>
                {/if}
                <a href="{dataSee.project === dataSee.father ? `/acciones` : `/acciones/accion/${dataSee.father}`}" data-sveltekit-reload data-sveltekit-preload-data="false" data-sveltekit-replacestate class="border border-ins-500 hover:outline-none bg-gray-100/70 hover:bg-ins-600 text-ins-500 px-6 py-2 rounded-md text-sm flex items-center hover:text-white font-semibold focus-visible:outline-none">
                    <GoBackIcon /> Ir atrás
                </a>
            {:else}
                <a href="{dataSee.project === dataSee.father ? `/proyectos/detalle/${dataSee.project}` : `/proyectos/accion/${dataSee.father}`}" data-sveltekit-reload data-sveltekit-preload-data="false" data-sveltekit-replacestate class="border border-ins-500 hover:outline-none bg-gray-100/70 hover:bg-ins-600 text-ins-500 px-6 py-2 rounded-md text-sm flex items-center hover:text-white font-semibold focus-visible:outline-none">
                    <GoBackIcon /> Ir atrás
                </a>
            {/if}
        </section>
    </div>
    <section class="p-6 mx-auto bg-white rounded-md shadow-md mb-4 mt-6">
        <form autocomplete="off" method="post" use:enhance action="?/action">

            <input type="text" hidden id="id" name="id" bind:value={dataSee.id}>
            <input type="text" hidden id="project_id" name="project_id" bind:value={dataSee.project_id}>
            <input type="number" hidden id="level" name="level" bind:value={dataSee.level}>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                {#if dataSee.project_type }
                    <div class="col-span-1 sm:col-span-2 flex justify-between items-center mb-3">
                        <h3 class="text-2xl font-semibold text-ins-700">Nivel {dataSee.level} (acciones)</h3>
                        <span class="text-base font-semibold mr-2 text-ins-700 border border-ins-700 rounded-full px-3 py-0.5">{types.find(t => t.value === dataSee.project_type)?.label || 'Sin tipo'}</span>
                    </div>
                {/if}

                <div class="gap-2 grid grid-cols-1 col-span-1 sm:col-span-2">
                    <label class="text-gray-700" for="name">Nombre de la acción</label>
                    <input id="name" name="name" type="text" class="{formStyle}" bind:value={dataSee.name} placeholder="Nombre">
                </div>

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="dependence">Dependencia</label>
                    <Select items={dependences} bind:value={dataSee.dependence.data} showChevron placeholder="seleccione la dependencia" name="dependence" id="dependence">
                        <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                    </Select>
                </div>

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="manager">Responsable</label>
                    <Select items={managers} bind:value={dataSee.manager.data} showChevron placeholder="seleccione el responsable" name="manager" id="manager">
                        <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                    </Select>
                </div> 

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="start">Fecha de inicio</label>
                    <input id="start" name="start" type="date" class="{formStyle}" bind:value={dataSee.start} placeholder="Inicio">
                </div>

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="end">Fecha de fin</label>
                    <input id="end" name="end" type="date" class="{formStyle}" bind:value={dataSee.end} placeholder="Fin">
                </div>

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="municipalities">Municipios <button type="button" on:click={selectAllMunicipalities} class="text-xs text-ins-500">(seleccionar todos)</button></label>
                    <Select items={municipalities} bind:value={dataSee.municipalities.data} multiple showChevron placeholder="seleccione los municipios" name="municipalities" id="municipalities">
                        <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                    </Select>
                </div>

                <div class="gap-2 grid-cols-1 hidden">
                    <label class="text-gray-700" for="colonies">Colonias <button type="button" on:click={selectAllColonies} class="text-xs text-ins-500">(seleccionar todos)</button></label>
                    <Select items={colonies} bind:value={dataSee.colonies.data} multiple showChevron placeholder="seleccione los colonias" name="colonies" id="colonies">
                        <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                    </Select>
                </div>

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="people">Persona asignada</label>
                    <Select items={managers} bind:value={dataSee.people.data} showChevron placeholder="seleccione la persona asignada" name="people" id="people">
                        <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                    </Select>
                </div>

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="amount">Inversión</label>
                    <input id="amount" name="amount" type="number" class="{formStyle}" placeholder="Monto" bind:value={dataSee.amount}>
                </div>

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="beneficiaries">Beneficiarios</label>
                    <input id="beneficiaries" name="beneficiaries" type="number" class="{formStyle}" placeholder="Beneficiarios" bind:value={dataSee.beneficiaries}>
                </div>

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="status">Estatus</label>
                    <select id="status" name="status" type="text" class="{formStyleSelect}" placeholder="Estatus" bind:value={dataSee.status}>
                        <option value={null}>Seleccione un estatus</option>
                        {#each statutes as stat}
                            <option value={stat.value}>{stat.label}</option>
                        {/each}
                    </select>
                </div>

                <div class="gap-2 grid grid-cols-1">
                    <label class="text-gray-700" for="priority">Prioridad</label>
                    <select id="priority" name="priority" type="text" class="{formStyleSelect}" placeholder="Prioridad" bind:value={dataSee.priority}>
                        <option value={null}>Seleccione una prioridad</option>
                        {#each priorities as priority}
                            <option value={priority.value}>{priority.label}</option>
                        {/each}
                    </select>
                </div>

                <div class="gap-2 grid grid-cols-1 col-span-1 sm:col-span-2">
                    <label class="text-gray-700" for="comments">Comentarios</label>
                    <textarea id="comments" name="comments" type="text" class="{formStyle} min-h-28" placeholder="Comentarios" bind:value={dataSee.comments}></textarea>
                </div>

                <div class="gap-2 grid grid-cols-1 col-span-1 sm:col-span-2">
                    <label class="text-gray-700" for="description">Descripción</label>
                    <textarea id="description" name="description" type="text" class="{formStyle} min-h-28" placeholder="Descripción" bind:value={dataSee.description}></textarea>
                </div>

                <div class="collapse collapse-plus bg-base-200 col-span-1 sm:col-span-2 mt-5 rounded-md">
                    <input type="checkbox" name="photos_box" class="peer" /> 
                    <div class="collapse-title bg-gray-700 text-white peer-checked:bg-ins-600 peer-checked:white">
                      Evidencia fotográfica
                    </div>
                    <div class="collapse-content bg-gray-700 text-white peer-checked:bg-ins-600 peer-checked:white"> 
                        {#if dataSee.evidence?.data && dataSee.evidence?.data.length > 0}
                            <div class="mt-8 mx-2 grid sm:grid-cols-4 grid-cols-2 gap-4 col-span-2">
                                {#each dataSee.evidence.data as ev }
                                    {#if ['.png', '.jpeg', '.jpg'].includes(ev.ext) }                                        
                                        <div class="bg-base-200 hover:shadow-lg shadow-md transition-shadow duration-700 p-5 rounded-lg flex items-center justify-between relative group overflow-hidden hover:bg-gray-200">
                                            {#if ['.png', '.jpeg', '.jpg'].includes(ev.ext) }
                                                <img loading="lazy" src={ev.evidence} class="object-cover h-40 w-full rounded-md" alt="Imagen de proyecto de {ev.created_at}">
                                            {/if}
                                            {#if role === 'super-admin' }
                                                <div class="flex flex-row absolute bottom-2 gap-2 justify-center items-center w-full left-0 group-hover:opacity-100 opacity-0 transition-opacity duration-150">
                                                    
                                                    <a href={ev.evidence} target="_blank" class="cursor-pointer bg-ins-600 text-gray-50 text-xs font-medium px-2 py-1 rounded-md hover:bg-ins-700">
                                                        <EyeIcon size={18} />
                                                    </a>
                                                    
                                                    <button type="button" class="cursor-pointer bg-red-600 text-gray-50 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-700" on:click|stopPropagation={(e)=>{deleteEvidence(e,ev.evidence)}} >
                                                        <DeleteIcon size={18} />
                                                    </button> 
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}
                                {/each}
                            </div>			
                        {/if}
                    </div>
                </div>

                <div class="collapse collapse-plus bg-base-200 col-span-1 sm:col-span-2 rounded-md">
                    <input type="checkbox" class="peer" name="evidences_box"/> 
                    <div class="collapse-title bg-gray-700 text-white peer-checked:bg-ins-600 peer-checked:white">
                      Evidencia documental
                    </div>
                    <div class="collapse-content bg-gray-700 text-white peer-checked:bg-ins-600 peer-checked:white"> 
                        {#if dataSee.evidence?.data && dataSee.evidence?.data.length > 0}
                            <div class="mt-8 mx-2 grid sm:grid-cols-4 grid-cols-2 gap-4 col-span-2">
                                {#each dataSee.evidence.data as ev }
                                    {#if !['.png', '.jpeg', '.jpg'].includes(ev.ext) }                                        
                                        <div class="bg-base-200 hover:shadow-lg shadow-md transition-shadow duration-700 p-5 rounded-lg flex items-center justify-between relative group overflow-hidden hover:bg-gray-200">
                                            {#if ['.pdf'].includes(ev.ext)}
                                                <div class="flex items-center justify-center w-full text-gray-400">
                                                    <PdfIcon size={80} />
                                                </div>
                                            {:else if ['.xls','.xlsx'].includes(ev.ext)}
                                                <div class="flex items-center justify-center w-full text-gray-400">
                                                    <ExcelIcon size={80} />
                                                </div>
                                            {:else if ['.doc','.docx'].includes(ev.ext)}
                                            <div class="flex items-center justify-center w-full text-gray-400">
                                                    <WordIcon size={80} />
                                                </div>
                                            {:else if !ev.ext }
                                                <div class="flex items-center justify-center w-full text-gray-400 rotate-animation">
                                                    <LoaderIcon size={80} />
                                                </div>
                                            {:else}
                                                <div class="flex items-center justify-center w-full text-gray-400">
                                                    <FileUnknownIcon size={80} />
                                                </div>
                                            {/if}
                                            {#if role === 'super-admin' }
                                                <div class="flex flex-row absolute bottom-2 gap-2 justify-center items-center w-full left-0 group-hover:opacity-100 opacity-0 transition-opacity duration-150">
                                                    
                                                    <a href={ev.evidence} target="_blank" class="cursor-pointer bg-ins-600 text-gray-50 text-xs font-medium px-2 py-1 rounded-md hover:bg-ins-700">
                                                        <EyeIcon size={18} />
                                                    </a>
                                                    
                                                    <button type="button" class="cursor-pointer bg-red-600 text-gray-50 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-700" on:click|stopPropagation={(e)=>{deleteEvidence(e,ev.evidence)}} >
                                                        <DeleteIcon size={18} />
                                                    </button> 
            
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}
                                {/each}
                            </div>			
                        {/if}
                    </div>
                </div>

                <div class="col-span-1 sm:col-span-2 mt-4">
                    <label class="text-gray-700" for="files">Evidencias</label>
                    <div id="files" name="files" class="dropzone w-full mt-2 font-semibold text-gray-500 bg-white "></div>
                </div>

                <section class="col-span-1 sm:col-span-2 grid grid-cols-1 gap-2 mt-5">
                    <div class="flex justify-end mb-2">
                        <ButtonLight text="Agregar acción" action={addAction} typeButton="button" >
                            <MultiPlusIcon size={20} styles="mr-1" />
                        </ButtonLight>
                    </div>

                    <div class="grid grid-cols-1 gap-6 mt-5 overflow-x-scroll pb-6">
                        {#each dataSee?.actions as act, index }
                            <div class="grid custom-grid-cols-8 items-center gap-2 bg-gray-100 p-3 rounded-md w-fit">
                                <input type="text" hidden value={act.id} name="id_action_{index}">
                                <div class="col-span-2 flex items-center gap-x-2">
                                    {#if act.id }
                                        <a href="/proyectos/accion/{act.id}" class="h-5 w-5 text-gray-400 hover:text-ins-600">
                                            <ExternalLink size={23} />
                                        </a>
                                    {/if}
                                    <div class="flex flex-col gap-y-0.5 w-full">
                                        <label for="start_action_{index}" class="text-xs font-semibold text-gray-600">Nombre</label>
                                        <input type="text" class="{formStyle}" placeholder="Nombre" name="name_action_{index}" bind:value={act.name}>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-y-0.5">
                                    <label for="start_action_{index}" class="text-xs font-semibold text-gray-600">Fecha de inicio</label>
                                    <div class="{formStyle}">
                                        <input class="text-sm font-light text-gray-600 bg-transparent focus:outline-gray-300" type="date" min={dataSee.start} max={dataSee.end} id="start_action_{index}" name="start_action_{index}" bind:value={act.start} />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-y-0.5">
                                    <label for="start_action_{index}" class="text-xs font-semibold text-gray-600">Fecha de fin</label>
                                    <div class="{formStyle}">
                                        <input class="text-sm font-light text-gray-600 bg-transparent focus:outline-gray-300" type="date" min={dataSee.start} max={dataSee.end} name="end_action_{index}" bind:value={act.end} />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-y-0.5">
                                    <label for="start_action_{index}" class="text-xs font-semibold text-gray-600">Tipo</label>
                                    <select class="{formStyleSelect}" bind:value={act.type} name="type_action_{index}">
                                        {#each actions_types as type }
                                            <option value={type.value}>{type.label}</option>
                                        {/each}
                                    </select>
                                </div>
                                <div class="flex flex-col gap-y-0.5">
                                    <label for="start_action_{index}" class="text-xs font-semibold text-gray-600">Estatus</label>
                                    <select class="{formStyleSelect}" bind:value={act.status} name="status_action_{index}">
                                        <option value={null} disabled>Seleccione un estatus</option>
                                        {#each statutes as st }
                                            <option value={st.value}>
                                                {st.label}
                                            </option>
                                        {/each}
                                    </select>
                                </div>
                                <div class="flex flex-col gap-y-0.5">
                                    <label for="start_action_{index}" class="text-xs font-semibold text-gray-600">Dependencia</label>
                                    <Select clearable={false} id="dependence_action_{index}" name="dependence_action_{index}" items={dependences} bind:value={act.dependence.data} placeholder="seleccione una dependencia">
                                        <div class="text-center p-3 text-gray-400 text-xs" slot="empty">No se encontraron resultados</div>
                                    </Select>
                                </div>
                                <div class="flex gap-x-2 items-center">
                                    <div class="flex flex-col gap-y-0.5 w-full">
                                        <label for="start_action_{index}" class="text-xs font-semibold text-gray-600">Encargado</label>
                                        <Select clearable={false} items={managers} placeholder="seleccione el encargado" id="manager_action_{index}" name="manager_action_{index}" bind:value={act.manager.data}>
                                            <div class="text-center p-3 text-gray-400 text-xs" slot="empty">No se encontraron resultados</div>
                                        </Select>      
                                    </div>    
                                    {#if dataSee?.actions.length !== 1 }
                                        {#if act.id }
                                            <button class="ml-2 rounded-full group focus:outline-none focus:text-red-600 text-gray-400 hover:text-red-600" type="button" on:click={() => deleteActionRegistered(act.id, index)}>
                                                <DeleteIcon size={22} />
                                            </button>
                                        {:else}
                                            <button class="ml-2 rounded-full group focus:outline-none focus:text-red-600 text-gray-400 hover:text-red-600" type="button" on:click={() => deleteAction(index)}>
                                                <DeleteIcon size={22} />
                                            </button>
                                        {/if}                                
                                    {/if}
                                </div>                          
                            </div>
                        {/each}
                    </div>
                    
                </section>

            </div>
    
            <section class="mt-4">
                {#if form?.error }
                    <p class="ml-1 text-sm text-red-700 text-pretty">*{form?.message}</p>
                {/if}
            </section>
    
            <div class="flex justify-end mt-12">
                {#if role === 'super-view' }
                    {#if dataSee.name.length > 3 }
                        <ButtonNormal text="Actualizar acción" action={messageForAdminView} />
                    {/if}
                {:else}
                    {#if dataSee.name.length > 3 }
                        <ButtonNormal text="Actualizar acción" action={() => handleLoading("Actualizando acción...")} />
                    {/if}
                {/if}
                
            </div>
        </form>
    </section>
</div>

<style>
    .dropzone {
		border: dashed 2px silver;
	}
    :global(.value-container) {
        overflow-y: auto !important;
        max-height: 200px !important;
    }
    :global(.svelte-select-max-w) {
        max-width: 320px;
    }
    @keyframes rotate-animation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    .rotate-animation {
        animation: rotate-animation 3s linear infinite;
    }
    :global(.select-actions) {
        width: 100%;
        font-size: 12px !important;
        padding-left: 4px !important;
        background: transparent !important;
        border: none !important;
        font-weight: bold !important;
        color: #414141 !important;
    }
    :global(.select-actions input) {
        width: 100%;
        font-size: 12px !important;
        font-weight: bold !important;
        color: #414141 !important;
    }
    :global(.select-actions-dependence .selected-item) {
        font-size: 14px !important;
        font-weight: 500 !important;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
        white-space: nowrap;
    }
    .custom-grid-cols-8 {
        grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    @media (min-width: 640px){
        .custom-grid-cols-8 {
            grid-template-columns: repeat(8, minmax(165px, 1fr)) !important;
        }
    }
</style>