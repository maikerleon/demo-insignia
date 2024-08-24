<script>
	import { enhance } from '$app/forms';
    import { createEventDispatcher, onMount } from 'svelte';
    import Select from 'svelte-select';
    import Dropzone from 'dropzone';
    import CardFile from '$components/projects/CardFile.svelte';
    import Swal from 'sweetalert2';
	import SimpleCraneIcon from '$icons/SimpleCraneIcon.svelte';
    import SectionTitle from '$components/SectionTitle.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import ButtonNormal from '$components/ButtonNormal.svelte';
    import CheckList from '$components/projects/CheckList.svelte';
    import MenuProjects from '$components/projects/MenuProjects.svelte';
    import Progress from '$components/projects/Progress.svelte';
	import Socialization from '$components/projects/Socialization.svelte';
    import Approvals from '$components/projects/Approvals.svelte';
	import ExternalLink from '$icons/ExternalLink.svelte';
	import MultiPlusIcon from '$icons/MultiPlusIcon.svelte';
    import GoBackIcon from '$icons/GoBackIcon.svelte';
	import PlusIcon from '$icons/PlusIcon.svelte';
    import DeleteIcon from '$icons/DeleteIcon.svelte';
	import LockedIcon from '$icons/LockedIcon.svelte';
    import ProgressBoltIcon from '$icons/ProgressBoltIcon.svelte';
    import ProgressCheckIcon from '$icons/ProgressCheckIcon.svelte';
    import CheckListIcon from '$icons/CheckListIcon.svelte';
    import DetailsIcon from '$icons/DetailsIcon.svelte';
	import EyeCheckIcon from '$icons/EyeCheckIcon.svelte';
    import { priorities, statutes, commitments, themes, poblations, regions, sources, municipalities as municipalities_temp, impact, actions_types, transverse_axis, poblations_age } from '$lib/data.js';
	import { closeAlert, handleLoading, messageAlert, messageForAdminView, formStyle, formStyleSelect } from '$lib/utilities.js';
    import BroadcastIcon from '$icons/BroadcastIcon.svelte';
    import SubProjects from '$components/projects/SubProjects.svelte';
    import DownloadEndProject from '$components/projects/DownloadEndProject.svelte';

    export let role;
    export let form;
    export let dataSee;
    export let handleToggleTable;
    export let goBack = true;
    export let axies;
    export let managers;
    export let dependences;

    const originalStatus = dataSee.status;

    let evidence;

    onMount(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

		if ( dataSee.id !== "" ) {
            evidence = new Dropzone("#evidence", { 
                url: "/api/upload-evidence-end-project",
                dictDefaultMessage: "Arrastra tus archivos aquí o haz clic para seleccionarlos",
                dictRemoveFile: "Eliminar",
                autoProcessQueue: false,
                maxFiles: 50,
                acceptedFiles: 'image/png,image/jpg,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                addRemoveLinks: true
            });

            evidence.on("queuecomplete", function() {
                updateEvidence(dataSee.end_project.evidence);
                evidence.removeAllFiles(true);
            });

            evidence.on("error", function(file, errorMessage) {
                messageAlert('error','Error al subir los archivos, por favor vuelva a intentarlo!');
            });
        }
	});

    const handleSendEvidence = async () => {
        return new Promise((resolve, reject) => {

            let countFiles;
            try {
                countFiles = evidence.getQueuedFiles();
            } catch (error) {
                countFiles = [];
            }
            
            if (countFiles.length === 0) {
                resolve();
                messageAlert('success', `Proyecto ${form?.create ? 'registrado' : 'actualizado'} correctamente`);
                dispatch('handleAdd', {detail: dataSee, create: form?.create});
                return;
            }

            handleLoading('Subiendo evidencia...');

            let currentFileIndex = 0;

            evidence.on("success", (file, {url}) => {
                const newData = {file: url, created_at: new Date().toISOString(), ext: url.split('.').pop()};

                if (dataSee?.end_project.evidence && dataSee?.end_project.evidence.length > 0) {
                    dataSee.end_project.evidence = [...dataSee.end_project.evidence, newData];
                }else {
                    dataSee.end_project.evidence = [newData];
                }

                processNextFile();
            });

            evidence.on("error", (file, errorMessage) => {
                reject(new Error(`Error al procesar el archivo ${file.name}: ${errorMessage}`));
            });

            const processNextFile = () => {
                if (currentFileIndex < countFiles.length) {
                    const file = countFiles[currentFileIndex];
                    const fileFormData = new FormData();
                    fileFormData.append('project', dataSee.id);
                    fileFormData.append('file', file);

                    evidence.options.params = Object.fromEntries(fileFormData.entries());
                    evidence.options.uploadMultiple = false;
                    evidence.processFile(file);

                    currentFileIndex++;
                } else {
                    resolve();
                }
            };

            processNextFile();
        });
    };

    const updateEvidence = async (dataEvidence) => {

        handleLoading('Guardando evidencia...');
        
        try {

            const action = '/api/update-evidence-end-project/'

            const formData = new FormData();

            formData.append('project', dataSee.id);
            formData.append('evidence', JSON.stringify(dataEvidence));

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success} = JSON.parse(resp);

            if( success ) {
                messageAlert('success', `Proyecto ${form?.create ? 'registrado' : 'actualizado'} correctamente`);
                dispatch('handleAdd', {detail: dataSee, create: form?.create});
                return;
            }

            throw new Error;

        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
        }
    }

    $: if (form) {
        if ( role !== 'super-view' ) {
            if (form?.data) {

                form.data.check_list = dataSee.check_list;
                form.data.progress = dataSee.progress;
                form.data.progress_supervisor = dataSee.progress_supervisor;
                form.data.approvals = dataSee.approvals;
                form.data.sub_projects = dataSee.sub_projects;
                form.data.socialization = dataSee.socialization;

                dataSee = form.data;
                delete form.data;
            }
            if (form?.error) closeAlert();
            if (form?.success) {
                handleSendEvidence();
                delete form.success;
            }
        }
        
    }

    const tabItems = [
        { name: 'Detalles', icon: DetailsIcon },
        { name: 'Check list', icon: CheckListIcon },
        { name: 'Avances', icon: ProgressCheckIcon },
        { name: 'Sub Proyectos', icon: SimpleCraneIcon },
        { name: 'Avances de supervisor', icon: ProgressBoltIcon },
        { name: 'Aprobaciones', icon: EyeCheckIcon },
        { name: 'Socialización', icon: BroadcastIcon }
    ];

    let selectedTab = 'Detalles';
    let typeEnd = [
        {
            label: 'Evento',
            value: 'event'
        },
        {
            label: 'Entrega',
            value: 'delivery'
        },
        {
            label: 'Otro',
            value: 'other'
        }
    ]

    let municipalities = municipalities_temp.map(mun => ({label: mun.name, value: mun.id}));
        
    const dispatch = createEventDispatcher();

    const addAction = () => {
        dataSee.actions.list = [...dataSee.actions.list, {id: '', name: '', dependence: {data: null}, start: '', end: '', type: 'action', manager: {data: null}, status: 'active-process' }];
    }

    const addSource = () => {
        dataSee.source.list = [...dataSee.source.list, {source: null, type: '', amount: 0, beneficiaries: 0}];
    }

    const addBeneficiaries = () => {
        dataSee.end_project.beneficiaries = dataSee.end_project.beneficiaries ? [...dataSee.end_project.beneficiaries, { amount: null, group: null }] : [{ amount: null, group: null }];
    }

    const addBeneficiariesGeneral = () => {
        dataSee.beneficiaries.list = dataSee.beneficiaries.list ? [...dataSee.beneficiaries.list, { amount: null, group: null, group_age: null }] : [{ amount: null, group: null, group_age: null }];
    }

    const addIndicator = () => {
        dataSee.indicators.list = [...dataSee.indicators.list, {name: '', type_value: 'amount', value: 0, position: 0, source: ''}];
    }

    const addObjective = () => {
        dataSee.objectives.list = [...dataSee.objectives.list, {objective: ''}];
    }

    const deleteAction = (index) => {
        dataSee.actions.list = dataSee.actions.list.filter((_, i) => i !== index);
    }

    const deleteObjective = (index) => {
        dataSee.objectives.list = dataSee.objectives.list.filter((_, i) => i !== index);
    }

    const deleteSource = (index) => {
        dataSee.source.list = dataSee.source.list.filter((_, i) => i !== index);
    }

    const deleteIndicator = (index) => {
        dataSee.indicators.list = dataSee.indicators.list.filter((_, i) => i !== index);
    }

    const deleteBeneficiaries = (index) => {
        dataSee.end_project.beneficiaries = dataSee.end_project.beneficiaries.filter((_, i) => i !== index);
    }

    const deleteBeneficiariesGeneral = (index) => {
        dataSee.beneficiaries.list = dataSee.beneficiaries.list.filter((_, i) => i !== index);
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
                    dataSee.actions.list = dataSee.actions.list.filter((_, i) => i !== index);
					messageAlert('success',`Se ha eliminado la acción y sus desdobles con éxito`);
                    return;
				}

                throw new Error;

			} catch (error) {
				messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
			}
		}
	}

    const selectAllMunicipalities = () => {
        dataSee.municipalities = {data: municipalities.map(mun => ({label: mun.label, value: mun.value}))}
    }

    const selectAllRegions = () => {
        dataSee.regions = {data: regions.map(reg => ({label: reg.label, value: reg.value, municipalities: reg.municipalities}))}
        updateMunicipalitiesByRegions();
        selectAllMunicipalities();
    }

    const handleTabChange = ({detail}) => {
        selectedTab = detail;
    }

    const cancelClosedProject = () => {
        if (originalStatus === 'finished') {
            dataSee.status = 'active-process';
        } else {
            dataSee.status = originalStatus;
        }
    }

    const updateMunicipalitiesByRegions = () => {
        const regionsSelected = dataSee.regions.data.map(region => region.municipalities);
        municipalities = [...municipalities_temp].map(mun => {
            let region;
            try {
                region = regionsSelected.find(region => region.includes(mun.id));
            } catch (error) {
                region = null;
            }
            if (region) {
                return {label: mun.name, value: mun.id};
            }
        }).filter(mun => mun);
    }

    const clearRegions = () => {
        dataSee.regions.data = [];
        dataSee.municipalities.data = [];
        updateMunicipalitiesByRegions();
    }

    const updateEndDateAction = (start, id, type) => {
        if ( type !== 'event-start') return;
        const index = dataSee.actions.list.findIndex(action => action.id === id);
        dataSee.actions.list[index].end = start;
    }

</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/basic.min.css" integrity="sha512-MeagJSJBgWB9n+Sggsr/vKMRFJWs+OUphiDV7TJiYu+TNQD9RtVJaPDYP8hA/PAjwRnkdvU+NsTncYTKlltgiw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/dropzone.min.css" integrity="sha512-qkeymXyips4Xo5rbFhX+IDuWMDEmSn7Qo7KpPMmZ1BmuIA95IPVYsVZNn8n4NH/N30EY7PUZS3gTeTPoAGo1mA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-col justify-between">
        <SectionTitle title="Proyectos" />
        {#if goBack }
            <section class="flex justify-end mt-6">
                <ButtonLight text="Ir atrás" action={handleToggleTable} >
                    <GoBackIcon />
                </ButtonLight>
            </section>
        {:else}
            <section class="flex justify-end mt-6">
                <a href="/proyectos" class="border border-ins-700 hover:outline-none bg-gray-100/70 hover:bg-ins-700 text-ins-700 px-6 py-2 rounded-md text-sm flex items-center hover:text-white font-semibold focus-visible:outline-none">
                    <GoBackIcon /> Ir atrás
                </a>
            </section>
        {/if}
    </div>

    <section class="p-6 mx-auto bg-white rounded-md shadow-md mb-4 mt-6">
        
        {#if dataSee.id && dataSee.id !== "" }
            <MenuProjects {selectedTab} on:change={handleTabChange} {tabItems} />
        {/if}

        {#if selectedTab === 'Detalles' }
            <form autocomplete="off" method="post" use:enhance action="{role !== 'super-view' ? '?/project' : ''}">

                <input type="text" hidden id="id" name="id" bind:value={dataSee.id}>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="name">
                            Nombre del proyecto
                            {#if dataSee.duplicate }
                                <span class="text-red-600 font-semibold text-xs"> (Duplicado)</span> 
                            {/if}
                        </label>
                        {#if role === 'super-admin' }
                            <input id="name" name="name" type="text" class="{formStyle}" bind:value={dataSee.name} placeholder="Nombre">
                        {:else}
                        <input id="name" name="name" type="text" value={dataSee.name} hidden>
                            <span class="font-semibold">{dataSee.name}</span>
                        {/if}
                    </div>
                    <div class="gap-2 grid grid-cols-2 h-14 sm:h-auto">
                        <label class="label cursor-pointer flex justify-between bg-gray-100 rounded-lg px-5 py-1">
                            <span class="text-sm mr-2">Proyecto estratégico</span> 
                            <input type="checkbox" class="checkbox" bind:checked={dataSee.strategic_project} name="strategic_project" />
                        </label>
                        <label class="label cursor-pointer flex justify-between bg-gray-100 rounded-lg px-5 py-1">
                            <span class="text-sm mr-2">Supervisión</span> 
                            <input type="checkbox" class="checkbox" bind:checked={dataSee.supervision} name="supervision" />
                        </label>
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="dependence">area</label>
                        <Select items={dependences} bind:value={dataSee.dependence.data} showChevron placeholder="seleccione la area" name="dependence" id="dependence">
                            <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                        </Select>
                    </div>
                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="manager">Encargado</label>
                        {#if role === 'super-admin' }
                            <Select items={managers} bind:value={dataSee.manager.data} showChevron placeholder="seleccione el encargado" name="manager" id="manager">
                                <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                            </Select>
                        {:else}
                            <Select items={managers} bind:value={dataSee.manager.data} showChevron placeholder="seleccione el encargado" name="manager" id="manager" containerStyles="display: none;">
                                <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                            </Select>
                            <span class="font-semibold">{dataSee.manager.data?.label ?? 'Sin manager'}</span>
                        {/if}
                    </div>
                    
                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="start">Fecha de inicio</label>
                        <input id="start" name="start" type="date" class="{formStyle}" placeholder="Inicio" bind:value={dataSee.start}>
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="end">Fecha de fin</label>
                        <input id="end" name="end" type="date" class="{formStyle}" placeholder="Fin" bind:value={dataSee.end}>
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="axis">Eje de impacto</label>
                        <Select items={axies} bind:value={dataSee.axis.data} showChevron placeholder="seleccione el eje de impacto" name="axis" id="axis">
                            <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                        </Select>
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="transverse_axis">Eje transversal</label>
                        <Select items={transverse_axis} bind:value={dataSee.transverse_axis.data} showChevron placeholder="seleccione el eje transversal" name="transverse_axis" id="transverse_axis">
                            <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                        </Select>
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="commitment">Compromiso</label>
                        <Select items={commitments} bind:value={dataSee.commitment.data} showChevron placeholder="seleccione el compromiso" name="commitment" id="commitment">
                            <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                        </Select>
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="secretaries">Secretarias corresponsables</label>
                        <Select items={dependences} multiple bind:value={dataSee.secretaries.data} showChevron placeholder="seleccione las secretarias" name="secretaries" id="secretaries">
                            <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                        </Select>
                    </div>

                    <!-- <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="type">Tipo de proyecto</label>
                        <select id="type" name="type" type="text" class="{formStyleSelect}" placeholder="Tipo" bind:value={dataSee.type}>
                            <option value={null}>Seleccione un tipo</option>
                            {#each types as type}
                                <option value={type.value}>{type.label}</option>
                            {/each}
                        </select>
                    </div> -->

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="type">Impacto</label>
                        <select id="impact" name="impact" type="text" class="{formStyleSelect}" placeholder="Impacto" bind:value={dataSee.impact}>
                            <option value={null}>Seleccione un impacto</option>
                            {#each impact as imp}
                                <option value={imp.value}>{imp.label}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="theme">Tema de impacto</label>
                        <Select items={themes} bind:value={dataSee.theme.data} showChevron placeholder="seleccione el tema" name="theme" id="theme" multiple>
                            <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                        </Select>
                    </div>
                    
                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="strategy">Estrategia</label>
                        <input id="strategy" name="strategy" type="text" class="{formStyle}" bind:value={dataSee.strategy} placeholder="Estrategia">
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="amount">Inversión</label>
                        <input id="amount" name="amount" type="number" class="{formStyle}" placeholder="Monto" bind:value={dataSee.amount}>
                    </div>

                    <section class="gap-3 grid grid-cols-1 sm:grid-cols-2 col-span-1 sm:col-span-2 bg-gray-100 py-3 px-4 rounded-md mt-4 mb-2 items-center">

                        <div class="col-span-2 flex sm:flex-row flex-col justify-between items-center mb-4 mt-2">
                            <h4 class="font-semibold text-xl text-ins-600">Beneficiarios</h4>
                            <div class="flex justify-end">
                                <ButtonLight text="Agregar beneficiarios" action={addBeneficiariesGeneral} typeButton="button" styles="text-ins-600 border-ins-600 hover:bg-ins-600">
                                    <MultiPlusIcon size={20} styles="mr-1" />
                                </ButtonLight>
                            </div>
                        </div>

                        {#each dataSee?.beneficiaries?.list ?? [] as ben, index }
                            <div class="col-span-2 items-center flex sm:flex-row flex-col gap-2 sm:bg-transparent bg-gray-100 sm:p-0 p-2 sm:rounded-none rounded-md">

                                <div class="flex flex-col w-full">
                                    <label for="amount_beneficiaries_general_{index}" class="text-gray-700">
                                        # Beneficiarios
                                    </label>
                                    <div class="relative mt-2 text-gray-500">
                                        <input type="number" placeholder="Cantidad" class="{formStyle}" bind:value={ben.amount} name="amount_beneficiaries_general_{index}" id="amount_beneficiaries_general_{index}" />
                                    </div>
                                </div>

                                <div class="flex flex-col w-full gap-2">
                                    <label class="text-gray-800" for="group_beneficiaries_general_{index}">Grupo</label>
                                    <Select items={poblations} bind:value={ben.group} showChevron placeholder="seleccione el grupo" name="group_beneficiaries_general_{index}" id="group_beneficiaries_general_{index}">
                                        <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                                    </Select>
                                </div>

                                <div class="flex flex-col w-full gap-2">
                                    <label class="text-gray-800" for="group_age_beneficiaries_general_{index}">Grupo por edad</label>
                                    <Select items={poblations_age} bind:value={ben.group_age} showChevron placeholder="seleccione el grupo" name="group_age_beneficiaries_general_{index}" id="group_age_beneficiaries_general_{index}">
                                        <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                                    </Select>
                                </div>

                                {#if dataSee.beneficiaries.length !== 1 }
                                    <button class="ml-2 mt-7 rounded-full group focus:outline-none focus:text-red-600 text-gray-400 hover:text-red-600" type="button" on:click={() => deleteBeneficiariesGeneral(index)}>
                                        <DeleteIcon size={22} />
                                    </button>
                                {/if}

                            </div>
                        {:else}
                            <div class="flex w-full justify-center items-center p-5 col-span-2 text-xl text-gray-400 uppercase bg-gray-100 rounded-md">
                                Sin beneficiarios
                            </div>
                        {/each}

                    </section>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="regions">Regiones <button type="button" on:click={selectAllRegions} class="text-xs text-ins-500">(seleccionar todas)</button></label>
                        <Select items={regions} bind:value={dataSee.regions.data} on:change={updateMunicipalitiesByRegions} on:clear={clearRegions} multiple showChevron placeholder="seleccione las regiones" name="regions" id="regions">
                            <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                        </Select>
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="municipalities">Municipios <button type="button" on:click={selectAllMunicipalities} class="text-xs text-ins-500">(seleccionar todos)</button></label>
                        <Select items={municipalities} bind:value={dataSee.municipalities.data} multiple showChevron placeholder="seleccione los municipios" name="municipalities" id="municipalities">
                            <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                        </Select>
                    </div>

                    <section class="gap-3 grid grid-cols-1 sm:grid-cols-2 col-span-1 sm:col-span-2 bg-gray-100 py-3 px-4 rounded-md mt-4 mb-2 items-center">
                        
                        <div class="col-span-1 sm:col-span-2 flex flex-col-reverse sm:flex-row justify-between sm:items-center mb-4 mt-2">
                            <h4 class="font-semibold text-xl text-ins-600">Fuentes del recurso</h4>

                            <div class="flex justify-end sm:mb-0 mb-2">
                                <ButtonLight text="Agregar fuente" action={addSource} typeButton="button" >
                                    <MultiPlusIcon size={20} styles="mr-1" />
                                </ButtonLight>
                            </div>
                        </div>

                        {#each dataSee.source.list as src, index }
                            <div class="col-span-1 sm:col-span-2 flex sm:flex-row flex-col w-full items-center justify-start gap-2 sm:bg-transparent bg-gray-300 sm:rounded-none rounded-md sm:p-0 p-2">
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="text-gray-700 text-xs font-semibold" for="source_source_{index}">Fuente del recurso</label>
                                    <select id="source_source_{index}" name="source_source_{index}" type="text" class="{formStyleSelect}" bind:value={src.source} placeholder="Fuente">
                                        <option value={null}>Seleccione una fuente</option>
                                        {#each sources as source}
                                            <option value={source.value}>{source.label}</option>
                                        {/each}
                                    </select>
                                </div>
            
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="text-gray-700 text-xs font-semibold" for="type_source_{index}">Nombre del recurso</label>
                                    <input id="type_source_{index}" name="type_source_{index}" type="text" class="{formStyle}" placeholder="Tipo" bind:value={src.type}>
                                </div>
            
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="text-gray-700 text-xs font-semibold" for="amount_source_{index}">Inversión</label>
                                    <input id="amount_source_{index}" name="amount_source_{index}" type="number" class="{formStyle}" placeholder="Inversión" bind:value={src.amount}>
                                </div>
            
                                <div class="flex-col gap-2 w-full hidden">
                                    <label class="text-gray-700 text-xs font-semibold" for="beneficiaries_source_{index}">Beneficiarios</label>
                                    <input id="beneficiaries_source_{index}" name="beneficiaries_source_{index}" type="number" class="{formStyle}" placeholder="Beneficiarios" bind:value={src.beneficiaries}>
                                </div>
                                {#if dataSee.source.list.length !== 1 }
                                    <button class="ml-2 mt-4 rounded-full group focus:outline-none focus:text-red-600 text-gray-400 hover:text-red-600" type="button" on:click={() => deleteSource(index)}>
                                        <DeleteIcon size={22} />
                                    </button>
                                {/if}
                            </div>
                        {/each}

                    </section>

                    <section class="gap-3 grid grid-cols-1 sm:grid-cols-2 col-span-1 sm:col-span-2 bg-gray-100 py-3 px-4 rounded-md mt-4 mb-2 items-center">
                        
                        <div class="col-span-1 sm:col-span-2 flex flex-col-reverse sm:flex-row justify-between sm:items-center mb-4 mt-2">
                            <h4 class="font-semibold text-xl text-ins-600">Indicadores de impacto</h4>

                            <div class="flex justify-end sm:mb-0 mb-2">
                                <ButtonLight text="Agregar indicador" action={addIndicator} typeButton="button" >
                                    <MultiPlusIcon size={20} styles="mr-1" />
                                </ButtonLight>
                            </div>
                        </div>

                        {#each dataSee.indicators.list as ind, index }
                            <div class="col-span-1 sm:col-span-2 flex sm:flex-row flex-col w-full items-center justify-start gap-2 sm:bg-transparent bg-gray-300 sm:rounded-none rounded-md sm:p-0 p-2">

                                <div class="flex flex-col gap-2 w-full">
                                    <label class="text-gray-700 text-xs font-semibold" for="name_indicator_{index}">Nombre</label>
                                    <input id="name_indicator_{index}" name="name_indicator_{index}" type="text" class="{formStyle}" placeholder="Nombre" bind:value={ind.name}>
                                </div>
            
                                <div class="flex flex-col w-full">
                                    <label for="value_indicator_{index}" class="text-gray-700 text-xs font-semibold">
                                        Valor
                                    </label>
                                    <div class="relative mt-2 text-gray-500">
                                        <span class="h-6 text-gray-400 absolute left-3 inset-y-0 my-auto">
                                            {ind.type_value === 'amount' ? '#' : '%'}
                                        </span>
                                        <input type="number" placeholder="valor" class="{formStyle} pl-8" bind:value={ind.value} name="value_indicator_{index}" id="value_indicator_{index}" />
                                        <div class="absolute inset-y-0 right-3 flex items-center">
                                            <select class="group-hover:shadow-none focus:outline-none h-10" name="type_value_indicator_{index}" id="type_value_indicator_{index}" bind:value={ind.type_value}>
                                                <option value="amount">#</option>
                                                <option value="percent">%</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
            
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="text-gray-700 text-xs font-semibold" for="position_indicator_{index}">Posición</label>
                                    <input id="position_indicator_{index}" name="position_indicator_{index}" type="number" class="{formStyle}" placeholder="Posición" bind:value={ind.position} max={32} 
                                        on:keyup={() => { if (ind.position > 32) ind.position = 32}}
                                    >
                                </div>
                                
                                <div class="flex flex-col gap-2 w-full">
                                    <label class="text-gray-700 text-xs font-semibold" for="source_indicator_{index}">Fuente</label>
                                    <input id="source_indicator_{index}" name="source_indicator_{index}" type="text" class="{formStyle}" placeholder="Fuente" bind:value={ind.source}>
                                </div>

                                {#if dataSee.indicators.list.length !== 1 }
                                    <button class="ml-2 mt-4 rounded-full group focus:outline-none focus:text-red-600 text-gray-400 hover:text-red-600" type="button" on:click={() => deleteIndicator(index)}>
                                        <DeleteIcon size={22} />
                                    </button>
                                {/if}
                            </div>
                        {/each}

                    </section>

                    <div class="min-h-20 grid {dataSee.have_address ? 'grid-cols-1 col-span-1' : 'grid-cols-2 col-span-1 sm:col-span-2'}">
                        <div class="gap-2 grid-cols-1 grid col-span-1">
                            <label class="label cursor-pointer flex justify-start bg-gray-100 rounded-lg px-5 py-1">
                                <span class="text-base mr-2">¿Tiene dirección?</span>
                                <input type="checkbox" class="checkbox" bind:checked={dataSee.have_address} name="have_address" />
                            </label>
                        </div>
                    </div>

                    {#if dataSee.have_address }
                        <div class="gap-2 grid grid-cols-1">
                            <label class="text-gray-700" for="address">Dirección</label>
                            <input id="address" name="address" type="text" class="{formStyle}" bind:value={dataSee.address} placeholder="Dirección">
                        </div>
                    {/if}

                    <div class="col-span-2 grid grid-cols-3 gap-4">
                        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
                            <label for="executive_plan" class="font-semibold text-sm text-gray-600 ml-0.5">Plan ejecutivo</label>
                            <div class="flex flex-row gap-1 mt-2 sm:gap-4">
                                <div class="form-control flex flex-row">
                                    <label class="label cursor-pointer">
                                      <span class="label-text">Si</span> 
                                      <input type="radio" value="yes" name="executive_plan" class="ml-2 radio checked:bg-green-500" bind:group={dataSee.executive_plan} />
                                    </label>
                                </div>
                                <div class="form-control flex flex-row">
                                    <label class="label cursor-pointer">
                                      <span class="label-text">Parcial</span> 
                                      <input type="radio" value="partial" name="executive_plan" class="ml-2 radio checked:bg-blue-500" bind:group={dataSee.executive_plan} />
                                    </label>
                                </div>
                                <div class="form-control flex flex-row">
                                    <label class="label cursor-pointer">
                                      <span class="label-text">No</span> 
                                      <input type="radio" value="no" name="executive_plan" class="ml-2 radio checked:bg-red-500" bind:group={dataSee.executive_plan} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
                            <label for="vobo" class="font-semibold text-sm text-gray-600 ml-0.5">VoBo finanzas</label>
                            <div class="flex flex-row gap-1 mt-2 sm:gap-4">
                                <div class="form-control flex flex-row">
                                    <label class="label cursor-pointer">
                                      <span class="label-text">Si</span> 
                                      <input type="radio" value="yes" name="vobo" class="ml-2 radio checked:bg-green-500" bind:group={dataSee.vobo} />
                                    </label>
                                </div>
                                <div class="form-control flex flex-row">
                                    <label class="label cursor-pointer">
                                      <span class="label-text">Parcial</span> 
                                      <input type="radio" value="partial" name="vobo" class="ml-2 radio checked:bg-blue-500" bind:group={dataSee.vobo} />
                                    </label>
                                </div>
                                <div class="form-control flex flex-row">
                                    <label class="label cursor-pointer">
                                      <span class="label-text">No</span> 
                                      <input type="radio" value="no" name="vobo" class="ml-2 radio checked:bg-red-500" bind:group={dataSee.vobo} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
                            <label for="right_way" class="font-semibold text-sm text-gray-600 ml-0.5">Derecho de vía</label>
                            <div class="flex flex-row gap-1 mt-2 sm:gap-4">
                                <div class="form-control flex flex-row">
                                    <label class="label cursor-pointer">
                                      <span class="label-text">Si</span> 
                                      <input type="radio" value="yes" name="right_way" class="ml-2 radio checked:bg-green-500" bind:group={dataSee.right_way} />
                                    </label>
                                </div>
                                <div class="form-control flex flex-row">
                                    <label class="label cursor-pointer">
                                      <span class="label-text">No</span> 
                                      <input type="radio" value="no" name="right_way" class="ml-2 radio checked:bg-red-500" bind:group={dataSee.right_way} />
                                    </label>
                                </div>
                                <div class="form-control flex flex-row">
                                    <label class="label cursor-pointer">
                                      <span class="label-text">No aplica</span> 
                                      <input type="radio" value="no-apply" name="right_way" class="ml-2 radio checked:bg-blue-500" bind:group={dataSee.right_way} />
                                    </label>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    <div class="col-span-2 grid grid-cols-1 gap-2">
                        <label class="text-gray-700" for="political_consideration">
                            Consideración política
                        </label>
                        <input id="political_consideration" name="political_consideration" type="text" class="{formStyle}" bind:value={dataSee.political_consideration} placeholder="Consideración política">
                    </div>

                    <div class="gap-2 grid grid-cols-1">
                        <label class="text-gray-700" for="status">Estatus</label>
                        <select id="status" name="status" type="text" class="{formStyleSelect}" placeholder="Estatus" bind:value={dataSee.status}>
                            <option value={null} disabled>Seleccione un estatus</option>
                            {#each statutes as stat}
                                {#if stat.value === 'finished' }
                                    {#if dataSee.status === 'finished' }
                                        <option value={stat.value}>{stat.label}</option>
                                    {/if}
                                {:else}
                                    <option value={stat.value}>{stat.label}</option>
                                {/if}
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
                        <label class="text-gray-700" for="description">Descripción</label>
                        <textarea id="description" name="description" type="text" class="{formStyle} min-h-28" placeholder="Descripción" bind:value={dataSee.description}></textarea>
                    </div>

                    <div class="gap-2 grid grid-cols-1 col-span-1 sm:col-span-2">
                        <label class="text-gray-700" for="background">Antecedentes</label>
                        <textarea id="background" name="background" type="text" class="{formStyle} min-h-28" placeholder="Antecedentes" bind:value={dataSee.background}></textarea>
                    </div>

                    <div class="gap-2 grid grid-cols-1 col-span-1 sm:col-span-2">
                        <label class="text-gray-700" for="aditional_information">Información adicional</label>
                        <textarea id="aditional_information" name="aditional_information" type="text" class="{formStyle} min-h-28" placeholder="Información adicional" bind:value={dataSee.aditional_information}></textarea>
                    </div>

                    <div class="gap-2 grid grid-cols-1 col-span-1 sm:col-span-2">
                        <label class="text-gray-700" for="planning">Planeación</label>
                        <textarea id="planning" name="planning" type="text" class="{formStyle} min-h-28" placeholder="Descripción breve de la planeación" bind:value={dataSee.planning}></textarea>
                    </div>

                    <section class="col-span-1 sm:col-span-2 grid grid-cols-1 gap-2 mt-5">
                        <div class="flex justify-between mb-2 items-end">
                            <span class="text-sm font-semibold">
                                Objetivos
                            </span>
                            <ButtonLight text="Agregar objetivo" action={addObjective} typeButton="button" >
                                <MultiPlusIcon size={20} styles="mr-1" />
                            </ButtonLight>
                        </div>
        
                        {#each dataSee.objectives.list as obj, index }
                            <div class="flex justify-between items-center">
                                <input type="text" name="objectives" class="{formStyle}" placeholder="ingresa un objetivo" bind:value={obj.objective}>
                                {#if dataSee.objectives.list.length !== 1 }
                                    <button class="ml-2 rounded-full group focus:outline-none focus:text-red-600 text-gray-400 hover:text-red-600" type="button" on:click={() => deleteObjective(index)}>
                                        <DeleteIcon size={22} />
                                    </button>
                                {/if}
                            </div>
                        {/each}
                    </section>

                    <section class="col-span-1 sm:col-span-2 grid grid-cols-1 gap-2 mt-5">
                        <div class="flex justify-between mb-2 items-end">
                            <span class="text-sm font-semibold">
                                Acciones
                            </span>
                            <ButtonLight text="Agregar acción" action={addAction} typeButton="button" >
                                <MultiPlusIcon size={20} styles="mr-1" />
                            </ButtonLight>
                        </div>

                        <div class="grid grid-cols-1 gap-6 mt-5 overflow-x-scroll pb-6">
                            {#each dataSee.actions.list as act, index }
                                <div class="grid custom-grid-cols-8 items-center gap-2 bg-gray-100 p-3 rounded-md w-fit">
                                    <input type="text" hidden value={act.id} name="id_action_{index}">
                                    <div class="col-span-2 flex items-center gap-x-2">
                                        {#if act.id }
                                            <a href="/proyectos/accion/{act.id}" class="h-5 w-5 text-gray-400 hover:text-ins-600">
                                                <ExternalLink size={23} />
                                            </a>
                                        {/if}
                                        <div class="flex flex-col gap-y-0.5 w-full">
                                            <label for="name_action_{index}" class="text-xs font-semibold text-gray-600">Nombre</label>
                                            <input type="text" class="{formStyle}" placeholder="Nombre" name="name_action_{index}" bind:value={act.name}>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-y-0.5">
                                        <label for="start_action_{index}" class="text-xs font-semibold text-gray-600">Fecha de inicio</label>
                                        <div class="{formStyle}">
                                            <input class="text-sm font-light text-gray-600 bg-transparent focus:outline-gray-300" type="date" min={dataSee.start} max={dataSee.end} id="start_action_{index}" name="start_action_{index}" bind:value={act.start} on:change={()=>updateEndDateAction(act.start, act.id, act.type)} />
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-y-0.5">
                                        <label for="end_action_{index}" class="text-xs font-semibold text-gray-600">Fecha de fin</label>
                                        <div class="{formStyle}">
                                            <input class="text-sm font-light text-gray-600 bg-transparent focus:outline-gray-300" type="date" min={dataSee.start} max={dataSee.end} name="end_action_{index}" bind:value={act.end} />
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-y-0.5">
                                        <label for="type_action_{index}" class="text-xs font-semibold text-gray-600">Tipo</label>
                                        <select class="{formStyleSelect}" bind:value={act.type} name="type_action_{index}" on:change={()=>updateEndDateAction(act.start, act.id, act.type)}>
                                            {#each actions_types as type }
                                                <option value={type.value}>{type.label}</option>
                                            {/each}
                                        </select>
                                    </div>
                                    <div class="flex flex-col gap-y-0.5">
                                        <label for="status_action_{index}" class="text-xs font-semibold text-gray-600">Estatus</label>
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
                                        <label for="dependence_action_{index}" class="text-xs font-semibold text-gray-600">area</label>
                                        <Select clearable={false} id="dependence_action_{index}" name="dependence_action_{index}" items={dependences} bind:value={act.dependence.data} placeholder="seleccione una area">
                                            <div class="text-center p-3 text-gray-400 text-xs" slot="empty">No se encontraron resultados</div>
                                        </Select>
                                    </div>
                                    <div class="flex gap-x-2 items-center">
                                        <div class="flex flex-col gap-y-0.5 w-full">
                                            <label for="manager_action_{index}" class="text-xs font-semibold text-gray-600">Encargado</label>
                                            <Select clearable={false} items={managers} placeholder="seleccione el encargado" id="manager_action_{index}" name="manager_action_{index}" bind:value={act.manager.data}>
                                                <div class="text-center p-3 text-gray-400 text-xs" slot="empty">No se encontraron resultados</div>
                                            </Select>      
                                        </div>    
                                        {#if dataSee.actions.list.length !== 1 }
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

                <details class="collapse bg-base-200 mt-5 {dataSee.status === 'finished' ? '' : 'hidden'}">
                    <summary class="collapse-title text-xl font-medium">
                        <div class="flex justify-between w-full flex-row text-gray-600">
                            <span class="text-red-700">Cierre de proyecto</span>
                            <span><PlusIcon size={24} /></span>
                        </div>
                    </summary>
                    <div class="collapse-content">
                        <section class="w-full p-4 bg-red-300 border-red-600 border-2 mt-10 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input type="text" hidden name="evidence_json" value={dataSee?.end_project?.evidence ? JSON.stringify(dataSee?.end_project?.evidence) : []}>
                            <div class="sm:col-span-3 col-span-1 flex justify-between">
                                <h2 class="text-red-700 font-bold uppercase text-2xl mt-2">Cierre de proyecto</h2>
                                {#if dataSee.end_project?.created_at }                                    
                                    <DownloadEndProject dataSee={dataSee} />
                                {/if}
                            </div>
                            <div class="flex flex-col gap-y-2">
                                <label class="text-gray-800 font-semibold text-md" for="date_closed">Fecha</label>
                                <input type="date" class="{formStyle}" name="date_closed" id="date_closed" bind:value={dataSee.end_project.date} />
                            </div>
                            <div class="flex flex-col gap-y-2">
                                <label class="text-gray-800 font-semibold text-md" for="type_closed">Tipo de cierre</label>
                                <select class="{formStyleSelect}" name="type_closed" id="type_closed" bind:value={dataSee.end_project.type}>
                                    <option value="" disabled>Seleccione un tipo</option>
                                    {#each typeEnd as tp }
                                        <option value={tp.value}>{tp.label}</option>
                                    {/each}
                                </select>
                            </div>
                            <div class="flex flex-col gap-y-2">
                                <label class="text-gray-800 font-semibold text-md" for="total_closed">Inversión total</label>
                                <input type="number" class="{formStyle}" name="total_closed" id="total_closed" bind:value={dataSee.end_project.total_amount} />
                            </div>
                            <div class="flex flex-col gap-y-2 sm:col-span-3 col-span-1">
                                <label class="text-gray-800 font-semibold text-md" for="description_closed">Descripción</label>
                                <textarea type="date" class="{formStyle} h-36" name="description_closed" id="description_closed" bind:value={dataSee.end_project.description} placeholder="Descripción del cierre del proyecto"></textarea>
                            </div>
        
                            <section class="gap-3 grid grid-cols-2 sm:col-span-3 col-span-1 bg-red-100 py-3 px-4 rounded-md mt-4 mb-2 items-center">
                                
                                <div class="col-span-2 flex sm:flex-row flex-col justify-between items-center mb-4 mt-2">
                                    <h4 class="font-semibold text-red-700">Beneficiarios finales</h4>
                                    <div class="flex justify-end">
                                        <ButtonLight text="Agregar beneficiarios" action={addBeneficiaries} typeButton="button" styles="text-red-600 border-red-600 hover:bg-red-600">
                                            <MultiPlusIcon size={20} styles="mr-1" />
                                        </ButtonLight>
                                    </div>
                                </div>
        
                                {#each dataSee?.end_project?.beneficiaries ?? [] as ben, index }
                                    <div class="col-span-2 items-center flex sm:flex-row flex-col gap-2 sm:bg-transparent bg-gray-100 sm:p-0 p-2 sm:rounded-none rounded-md">
        
                                        <div class="flex flex-col w-full">
                                            <label for="amount_beneficiaries_{index}" class="text-gray-700">
                                                # Beneficiarios
                                            </label>
                                            <div class="relative mt-2 text-gray-500">
                                                <input type="number" placeholder="Cantidad" class="{formStyle}" bind:value={ben.amount} name="amount_beneficiaries_{index}" id="amount_beneficiaries_{index}" />
                                            </div>
                                        </div>
        
                                        <div class="flex flex-col w-full gap-2">
                                            <label class="text-gray-800" for="group_beneficiaries_{index}">Grupo</label>
                                            <Select items={poblations} bind:value={ben.group} showChevron placeholder="seleccione el grupo" name="group_beneficiaries_{index}" id="group_beneficiaries_{index}">
                                                <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                                            </Select>
                                        </div>
        
                                        {#if dataSee.end_project.beneficiaries.length !== 1 }
                                            <button class="ml-2 mt-7 rounded-full group focus:outline-none focus:text-red-600 text-gray-400 hover:text-red-600" type="button" on:click={() => deleteBeneficiaries(index)}>
                                                <DeleteIcon size={22} />
                                            </button>
                                        {/if}
        
                                    </div>
                                {:else}
                                    <div class="flex w-full justify-center items-center p-5 col-span-2 text-xl text-gray-400 uppercase bg-gray-100 rounded-md">
                                        Sin beneficiarios
                                    </div>
                                {/each}
        
                            </section>
        
                            <section class="gap-3 grid grid-cols-2 sm:col-span-3 col-span-1 bg-red-100 py-3 px-4 rounded-md mt-4 mb-2 items-center">
                                
                                <div class="col-span-2 flex justify-between items-center mb-4 mt-2">
                                    <h4 class="font-semibold text-red-700">Indicadores de impacto</h4>
                                </div>
        
                                {#each dataSee.indicators.list as ind, index }
                                        <div class="col-span-2 items-center flex sm:flex-row flex-col gap-2 sm:bg-transparent bg-gray-100 sm:p-0 p-2 sm:rounded-none rounded-md">
        
                                        <div class="flex flex-col gap-2 w-full">
                                            <label class="text-gray-800 text-xs font-semibold" for="name_indicator_{index}">Nombre</label>
                                            <input readonly id="demo_name_indicator_{index}" name="demo_name_indicator_{index}" type="text" class="{formStyle} cursor-not-allowed" placeholder="Nombre" value={ind.name}>
                                        </div>
                    
                                        <div class="flex flex-col gap-2 w-full">
                                            <label class="text-gray-800 text-xs font-semibold" for="source_indicator_{index}">Fuente</label>
                                            <input readonly id="demo_source_indicator_{index}" name="demo_source_indicator_{index}" type="text" class="{formStyle} cursor-not-allowed" placeholder="Fuente" bind:value={ind.source}>
                                        </div>
        
                                        <div class="flex flex-col w-full">
                                            <label for="value_closed_indicator_{index}" class="text-gray-700 text-xs font-semibold">
                                                Valor de cierre
                                            </label>
                                            <div class="relative mt-2 text-gray-500">
                                                <span class="h-6 text-gray-400 absolute left-3 inset-y-0 my-auto">
                                                    {ind.type_value === 'amount' ? '#' : '%'}
                                                </span>
                                                <input type="number" placeholder="valor de cierre" class="{formStyle} pl-8" bind:value={ind.value_closed} name="value_closed_indicator_{index}" id="value_closed_indicator_{index}" />
                                            </div>
                                        </div>
        
                                    </div>
                                {/each}
        
                            </section>
        
                            <div class="mt-5 col-span-1 sm:col-span-3">
                                {#if dataSee?.end_project?.evidence && dataSee?.end_project?.evidence.length > 0}
                                    <CardFile bind:files={dataSee.end_project.evidence} project={dataSee.id} gridColums="sm:grid-cols-5 grid-cols-2" APIDelete="delete-evidence-end-project" tableDelete="end_project_evidence" />  
                                {/if}                      
                            </div>
        
                            <div class="col-span-1 sm:col-span-3">
                                <label for="evidence" class="text-gray-800 font-semibold text-md">Evidencia</label>
                                <div id="evidence" name="evidence" class="dropzone w-full mt-2 font-semibold text-gray-500 bg-white"></div>
                            </div>
        
                            <div class="flex flex-col gap-y-2 sm:col-span-2 col-span-1">
                                <label class="text-gray-800 font-semibold text-md" for="address_closed">Dirección <span class="text-xs text-red-700">(opcional)</span></label>
                                <input type="text" class="{formStyle}" name="address_closed" id="address_closed" bind:value={dataSee.end_project.location.address} placeholder="Dirección (en caso de ser de obra)" />
                            </div>
        
                            <div class="flex gap-x-3 items-center">
                                <div class="flex flex-col gap-y-2 flex-1">
                                    <label class="text-gray-800 font-semibold text-md" for="coordinates_closed">Coordenadas <span class="text-xs text-red-700">(opcional)</span></label>
                                    <input type="text" class="{formStyle}" name="coordinates_closed" id="coordinates_closed" bind:value={dataSee.end_project.location.coordinates} placeholder="Coordenadas (opcional)" />
                                </div>
                                {#if dataSee.end_project.location.address || dataSee.end_project.location.coordinates }
                                    <div class="w-8 mt-6">
                                        <a href="https://www.google.com/maps/place/{dataSee.end_project.location.coordinates ? dataSee.end_project.location.coordinates.replace(' ', '+') : dataSee.end_project.location.address.replace(' ', '+')}" target="_blank">
                                            <ExternalLink size={26} />
                                        </a>
                                    </div>
                                {/if}
                            </div>
        
                        </section>
                    </div>
                </details>
        
                <section class="mt-4">
                    {#if form?.error }
                        <p class="ml-1 text-sm text-red-700 text-pretty">*{form?.message}</p>
                    {/if}
                </section>
        
                <div class="flex justify-end mt-12 gap-x-2">
                    {#if role === 'super-view' }
                        <ButtonNormal typeButton="button" text="{dataSee.id === '' ? 'Crear proyecto' : 'Actualizar proyecto'}" action={messageForAdminView} />
                    {:else}
                        {#if dataSee.name.length > 3 }
                            {#if dataSee.id !== '' && dataSee.status !== 'finished' }
                                <ButtonLight typeButton="button" text="Cerrar proyecto" styles="text-red-600 border-red-600 hover:bg-red-700 group" action={()=>{dataSee.status = 'finished'}}>
                                    <LockedIcon styles="text-red-600 group-hover:text-white mr-1" size={20} />
                                </ButtonLight>
                            {/if}
                            {#if dataSee.id !== '' && dataSee.status === 'finished' }
                                <ButtonLight typeButton="button" text="Cancelar cierre de proyecto" styles="text-red-600 border-red-600 hover:bg-red-700 group" action={cancelClosedProject}>
                                    <LockedIcon styles="text-red-600 group-hover:text-white mr-1" size={20} />
                                </ButtonLight>
                            {/if}
                            <ButtonNormal text="{dataSee.id === '' ? 'Crear proyecto' : 'Actualizar proyecto'}" action={handleLoading} />
                        {/if}
                    {/if}
                </div>

            </form>
        {:else if selectedTab === 'Check list' }
            <CheckList checkList={dataSee.check_list} project={dataSee.id} {role} />
        {:else if selectedTab === 'Avances' }
            <Progress bind:progress={dataSee.progress.data} project={dataSee.id} subactions={dataSee.subactions} actions={dataSee.actions.list} bucket="progress" {role} />
        {:else if selectedTab === 'Avances de supervisor'}
            <Progress bind:progress={dataSee.progress_supervisor.data} project={dataSee.id} subactions={dataSee.subactions} actions={dataSee.actions.list} bucket="progress_supervisor" {role} />
        {:else if selectedTab === 'Aprobaciones'}
            <Approvals bind:progress={dataSee.approvals.data} project={dataSee.id} bucket="approvals" {role} />
        {:else if selectedTab === 'Socialización'}
            <Socialization bind:socialization={dataSee.socialization.data} project={dataSee.id} {role} />
        {:else if selectedTab === 'Sub Proyectos'}
            <SubProjects bind:progress={dataSee.sub_projects.data} nameProject={dataSee.name} project={dataSee.id} bucket="sub_projects" {role} dependence={dataSee.dependence} />
        {/if}

    </section>
</div>

<style>
    :global(.value-container) {
        overflow-y: auto !important;
        max-height: 200px !important;
        width: 165px;

    }
    :global(.svelte-select-max-w) {
        max-width: 320px;
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
    .dropzone {
		border: dashed 2px rgb(255, 98, 98);
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