<script>
    import { getContext } from 'svelte';
	import FolderOffIcon from '$icons/FolderOffIcon.svelte';
	import ExternalLink from '$icons/ExternalLink.svelte';
	import EyeIcon from '$icons/EyeIcon.svelte';
	import PdfIcon from '$icons/PdfIcon.svelte';
	import ExcelIcon from '$icons/ExcelIcon.svelte';
	import WordIcon from '$icons/WordIcon.svelte';
	import LoaderIcon from '$icons/LoaderIcon.svelte';
	import FileUnknownIcon from '$icons/FileUnknownIcon.svelte';
    import { messageAlert, closeAlert, handleLoading, formatDateTime, formStyle, messageForAdminView } from '$lib/utilities.js';
	import SectionTitle from '$components/SectionTitle.svelte';
    import MenuProjects from '$components/projects/MenuProjects.svelte';
	import XCubeIcon from '$icons/XCubeIcon.svelte';
    import CheckedVerifyIcon from '$icons/CheckedVerifyIcon.svelte';
	import AlertHexaIcon from '$icons/AlertHexaIcon.svelte';
    import FolderLinkIcon from '$icons/FolderLinkIcon.svelte';
    import Recorder from '$components/approvals/Recorder.svelte';

    export let data;
    const {role} = data;

    const pendingApprovals = getContext('pendingApprovals');

    let search = '';
    let dataSee = [];
    let selectedTab = 'Pendientes';
    let files = [];
    let note = '';
    let actualType = '';
    let actualProject = '';
    let actualProgress = '';
    let approved = false;
    let audioURL = '';
    let recording = false;

    const tabItems = [
      { name: 'Pendientes', icon: AlertHexaIcon },
      { name: 'Aprobadas', icon: CheckedVerifyIcon },
      { name: 'Rechazadas', icon: XCubeIcon }
    ];

    const responseProgress = (project, progress, type) => {
        note = '';
        actualProject = project;
        actualProgress = progress;
        actualType = type;
        approved = false;
        audioURL = '';
        recording = false;
    }

    const filteredData = () => {
		dataSee = [...approvals];

		if (search) {
			dataSee = dataSee.filter(appr => {
                const searchTarget = `${appr.project_name} ${appr.general} ${appr.approved_by} ${appr.approved_at} ${appr.created_at}`.toLowerCase();
                const searchTerm = search.toLowerCase();

                return searchTarget.includes(searchTerm);
            });

		}
	}

    let approvals = [];

    const searchApprovals = async () => {

		try {
			
			handleLoading(`Consultando aprobaciones...`);

			const action = '/api/search-approvals/'
			
			const formData = new FormData();
			
			formData.append('type', typeSelected);

			const response = await fetch(action, {
				method: 'POST',
				body: formData
			});

			const resp = await response.text();
			const {success, data} = JSON.parse(resp);

			if( success ) {
				approvals = [...data];
                if ( typeSelected === 'pending' ) $pendingApprovals = data.length;
                filteredData();
				closeAlert();
				return;
			}

			throw new Error;

		} catch (error) {
			messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
		}
	}

    let typeSelected = 'pending';

    const handleTabChange = ({detail}) => {
        selectedTab = detail;
        typeSelected = selectedTab === 'Pendientes' ? 'pending' : selectedTab === 'Aprobadas' ? 'approved' : 'rejected';
        searchApprovals();
    }

    const saveApproval = async () => {

        if (recording) {
            messageAlert('error','Debe detener la grabación de audio antes de continuar.');
            return;
        }

        try {
            handleLoading(`Guardando decisión de avance...`);

            const action = '/api/save-approval/';

            const formData = new FormData();
            
            formData.append('project', actualProject);
            formData.append('progress', actualProgress);
            formData.append('type', actualType);
            formData.append('approved', approved ? 'approved' : 'rejected');
            formData.append('note', note);
            
            if (audioURL !== '') {
                const audioResponse = await fetch(audioURL);
                const audioBlob = await audioResponse.blob();
                formData.append('audio', audioBlob, `${crypto.randomUUID()}.mp3`);
            } else {
                formData.append('audio', '');
            }

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if(result.success) {
                searchApprovals();
                closeAlert();
                return;
            } 
            
            throw new Error;
            
        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
        }
    }


    searchApprovals();
</script>

<section class="flex justify-center flex-col w-full items-center">

    <div class="w-[95%] flex justify-center flex-col">
        <SectionTitle styles="uppercase" title="Aprobaciones" />

        <div class="bg-gray-100 rounded-md p-4 mt-10 w-full">
            <section class="mt-3 flex flex-col w-full">
            
                <MenuProjects {selectedTab} on:change={handleTabChange} {tabItems} />
                
                <div class="flex items-end w-full">
                    <div class="relative {!search ? 'sm:w-96 hover:w-[50%]' : 'sm:w-[50%]' } transition-all duration-300 w-[90%]">
                        <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" bind:value={search} name="searching" on:keyup={filteredData} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
                    </div>
                </div>
        
            </section>
        
            <div class="mt-4 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
                <table class="w-full table-auto text-sm text-left">
                    <thead class="bg-ins-800 text-gray-100">
                        <tr class="[&>*]:uppercase [&>*]:text-gray-100">
                            <th class="text-left p-2 pl-5">#</th>
                            <th class="text-left p-2">Proyecto</th>
                            <th class="text-left p-2">Tipo</th>
                            <th class="text-left p-2">Descripción</th>
                            <th class="text-left p-2">Archivos</th>
                            <th class="text-left p-2">Fecha de registro</th>
                            <th class="text-left p-2">Detalle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each dataSee as {project_name, general, approved, response, approved_at, approved_by, files_approved, created_at, project_id, progress_id, type, audio},idx }
                            <tr class="text-sm bg-white group border-t border-gray-300 hover:bg-ins-700 hover:text-gray-100">
                                <td class="p-2 pl-5 uppercase max-w-52 truncate font-bold">{idx+1}</td>
                                <td class="p-2 uppercase">
                                    <div class="flex flex-col max-w-52 [&>span]:truncate [&>span]:max-w-full">
                                        <span>{project_name === "" ? "Sin nombre" : project_name}</span>
                                        <a class="group-hover:border-gray-100 group-hover:text-gray-100 hover:bg-ins-900 border border-ins-600 text-ins-600 font-semibold text-xs px-2 py-0.5 w-fit rounded-md my-1 flex" href="/proyectos/detalle/{project_id}" target="_blank">
                                            Ver proyecto
                                            <ExternalLink size={14} styles="ml-1" />
                                        </a>                        
                                    </div>
                                </td>
                                <td class="p-2">{type === "progress" ? "Avance" : type === 'progress_supervisor' ? 'Supervisor' : 'Aprobaciones'}</td>
                                <td class="p-2">{general === "" ? "Sin descripción" : general}</td>
                                <td class="p-2">
                                    <div class="flex justify-center mr-5">
                                        {#if files_approved && files_approved.length > 0 }
                                            <button class="flex justify-center items-center" on:click={() => files = files_approved }>
                                                <label for="folder" class="cursor-pointer">
                                                    <FolderLinkIcon />
                                                </label>
                                            </button>
                                        {:else}
                                            <span class="hover:cursor-not-allowed">
                                                <FolderOffIcon />
                                            </span>
                                        {/if}
                                    </div>
                                </td>
                                <td class="p-2">{formatDateTime(created_at)}</td>
                                <td class="p-2 font-semibold">
                                    <div class="flex flex-row [&>span]:text-sm">
                                        {#if approved === 'pending' }
                                        <button on:click={()=> responseProgress(project_id, progress_id, type)} class='w-40 sm:w-fit'>
                                            <label for="form-approval" class="border border-ins-500 hover:outline-none bg-gray-100 hover:bg-ins-600 text-ins-500 px-2.5 sm:px-6 py-2 rounded-md text-sm flex items-center hover:text-white font-semibold focus-visible:outline-none w-fi cursor-pointer">
                                                <AlertHexaIcon size={18} styles="mr-1.5" />Aprobar solicitud
                                            </label>
                                        </button>
                                        {:else if approved === 'approved'}
                                            <div class="custom-dropdown">
                                                <div tabindex="-1" role="button" class="flex flex-col gap-1">
                                                    <div class="flex">
                                                        Aprobado
                                                        <CheckedVerifyIcon styles="ml-1.5 text-green-600 group-hover:text-gray-100" size={20} />
                                                    </div>
                                                    {#if audio }
                                                        <audio class="h-6 w-[105px]" controls> 
                                                            <source src="{audio}" type="audio/mp3"> No soportado.
                                                        </audio>
                                                    {/if}
                                                </div>
                                                <div class="custom-dropdown-content absolute dropdown-content z-[1] p-4 shadow bg-ins-900 rounded-md w-52 right-1 mt-2">
                                                    <div class="flex flex-col gap-1">
                                                        <span class="text-xs font-semibold">Nota:</span>
                                                        <span class="text-xs font-normal">{response === '' ? 'Sin nota' : response}</span>
                                                    </div>
                                                    <div class="flex flex-col gap-1 mt-3">
                                                        <span class="text-xs font-semibold">Aprobado por:</span>
                                                        <span class="text-xs font-normal">{approved_by === '' ? 'Desconocido' : approved_by}</span>
                                                    </div>
                                                    <div class="flex flex-col gap-1 mt-3">
                                                        <span class="text-xs font-semibold">Fecha de aprobación:</span>
                                                        <span class="text-xs font-normal">{approved_at === '' ? 'Desconocida' : formatDateTime(approved_at)}</span>
                                                    </div>
                                                </div>
                                            </div>                                        
                                        {:else}
                                            <div class="custom-dropdown">
                                                <div tabindex="-1" role="button" class="flex flex-col gap-1">
                                                    <div class="flex">
                                                        Rechazado 
                                                        <XCubeIcon styles="ml-1.5 text-red-600 group-hover:text-gray-100" size={20} />
                                                    </div>
                                                    {#if audio }
                                                        <audio class="h-6 w-[105px]" controls> 
                                                            <source src="{audio}" type="audio/mp3"> No soportado.
                                                        </audio>
                                                    {/if}
                                                </div>
                                                <div class="custom-dropdown-content absolute dropdown-content z-[1] p-4 shadow bg-ins-900 rounded-md w-52 right-1 mt-2">
                                                    <div class="flex flex-col gap-1">
                                                        <span class="text-xs font-semibold">Nota:</span>
                                                        <span class="text-xs font-normal">{response === '' ? 'Sin nota' : response}</span>
                                                    </div>
                                                    <div class="flex flex-col gap-1 mt-3">
                                                        <span class="text-xs font-semibold">Rechazado por:</span>
                                                        <span class="text-xs font-normal">{approved_by === '' ? 'Desconocido' : approved_by}</span>
                                                    </div>
                                                    <div class="flex flex-col gap-1 mt-3">
                                                        <span class="text-xs font-semibold">Fecha de rechazo:</span>
                                                        <span class="text-xs font-normal">{approved_at === '' ? 'Desconocida' : formatDateTime(approved_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {:else}
                            <tr class="bg-white border-t border-gray-300 hover:bg-ins-700 hover:text-gray-100 group">
                                <td colspan={7} class="text-center p-4">
                                    <span class="text-gray-700 group-hover:text-gray-100 font-semibold">Sin resultados...</span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</section>

<input type="checkbox" id="folder" class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box w-[800px] max-w-full">
    <h3 class="font-bold text-lg">Archivos de aprobación del avance</h3>
    {#if files && files.length > 0}
        <section class="grid grid-cols-2 sm:grid-cols-4 py-4 gap-4">
            {#each files as file }
                <div class="bg-base-200 hover:shadow-lg shadow-md transition-shadow duration-700 p-1 rounded-lg flex items-center justify-between relative group overflow-hidden hover:bg-gray-200 h-36">
                    {#if ['png', 'jpeg', 'jpg'].includes(file.ext) }
                        <img loading="lazy" src={file.file} class="object-cover h-32 px-1 w-full rounded-md" alt="Archivo de check list subido el {file.created_at}">
                    {:else if ['pdf'].includes(file.ext)}
                        <div class="flex items-center justify-center w-full text-gray-800">
                            <PdfIcon size={80} />
                        </div>
                    {:else if ['xls','xlsx'].includes(file.ext)}
                        <div class="flex items-center justify-center w-full text-gray-800">
                            <ExcelIcon size={80} />
                        </div>
                    {:else if ['doc','docx'].includes(file.ext)}
                        <div class="flex items-center justify-center w-full text-gray-800">
                            <WordIcon size={80} />
                        </div>
                    {:else if !file.ext }
                        <div class="flex items-center justify-center w-full text-gray-800 rotate-animation">
                            <LoaderIcon size={80} />
                        </div>
                    {:else}
                        <div class="flex items-center justify-center w-full text-gray-800">
                            <FileUnknownIcon size={80} />
                        </div>
                    {/if}
                    <div class="flex flex-row absolute bottom-2 gap-2 justify-end items-center w-full left-0 group-hover:opacity-100 opacity-0 transition-opacity duration-150 pr-3 pb-1">
                        <a href={file.file} target="_blank" class="cursor-pointer bg-ins-600 text-gray-50 text-xs font-medium px-2 py-1 rounded-md hover:bg-ins-700">
                            <EyeIcon size={18} />
                        </a>
                    </div>
                </div>
            {/each}
        </section>
    {:else}
        <section class="flex justify-center items-center p-4 h-20 font-semibold text-lg text-gray-600 flex-row">
            <FolderOffIcon size={24} styles="mr-2" />
            Sin archivos para este avance...
        </section>
    {/if}
    <div class="modal-action">
      <label for="folder" class="btn">Cerrar</label>
    </div>
  </div>
</div>

<div class="drawer drawer-end">
    <input id="form-approval" type="checkbox" class="drawer-toggle" />
    <div class="drawer-side">
      
        <label for="form-approval" aria-label="close sidebar" class="drawer-overlay"></label>
      
        <div class="p-4 w-80 min-h-full bg-base-200 text-base-content flex justify-between flex-col">

            <div class="flex flex-col justify-center">
                <header class="flex justify-center">
                    <h2 class="font-bold text-ins-600 text-xl mb-5">Decisión de avance</h2>
                </header>
    
                <div class="flex justify-center">
                    <label class="swap swap-rotate" for="approved">
                        <input type="checkbox" id="approved" bind:checked={approved} />
                        <CheckedVerifyIcon size={60} styles="text-green-600 swap-on" />
                        <XCubeIcon size={60} styles="text-red-600 swap-off" />
                    </label>
                </div>

                <div>
                    <label for="response" class="font-semibold text-gray-700 text-sm">Nota:</label>
                    <input type="text" name="response" id="response" bind:value={note} class="mt-2 {formStyle}" placeholder="Opcional">
                </div>

                <Recorder bind:audioURL={audioURL} bind:recording={recording} />

            </div>

            <div class="flex justify-center">
                <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                
                {#if !recording }
                    {#if role === 'super-view'}
                        <label for="form-approval" class="border border-ins-500 hover:outline-none bg-gray-100/70 hover:bg-ins-600 text-ins-500 px-6 py-2 rounded-md text-sm flex items-center hover:text-white font-semibold focus-visible:outline-none" on:click={messageForAdminView} role="button">
                            <AlertHexaIcon size={18} styles="mr-1.5" />
                            {approved ? 'Aprobar' : 'Rechazar'} avance
                        </label>
                    {:else}
                        <label for="form-approval" class="border border-ins-500 hover:outline-none bg-gray-100/70 hover:bg-ins-600 text-ins-500 px-6 py-2 rounded-md text-sm flex items-center hover:text-white font-semibold focus-visible:outline-none" on:click={saveApproval} role="button">
                            <AlertHexaIcon size={18} styles="mr-1.5" />
                            {approved ? 'Aprobar' : 'Rechazar'} avance
                        </label>
                    {/if}
                    
                {/if}
            </div>

        </div>

    </div>
  </div>

  <style>
    .custom-dropdown .custom-dropdown-content {
        display: none;
    }
    .custom-dropdown:hover .custom-dropdown-content {
        display: block;
    }
  </style>