<script>
	import { sources } from '$lib/data.js';
	import ButtonLight from '$components/ButtonLight.svelte';
	import ImageDownloadIcon from '$components/icons/ImageDownloadIcon.svelte';
	import AlertHexaIcon from '$icons/AlertHexaIcon.svelte';
	import CheckedVerifyIcon from '$icons/CheckedVerifyIcon.svelte';
	import XCubeIcon from '$icons/XCubeIcon.svelte';
	import CardFile from '$components/projects/CardFile.svelte';
	import PlusIcon from '$icons/PlusIcon.svelte';
	import { formatNumber, formatDate, formatDateTime, formStyle, formatAmount, messageAlert, handleLoading } from '$lib/utilities.js';
    import MapAvailables from "$components/projects/MapAvailables.svelte";
	import ExternalLink from '$icons/ExternalLink.svelte';
    import DiagramGantt from '$components/DiagramGantt.svelte';
    import LessIcon from '$components/icons/LessIcon.svelte';
    import TableProject from '$components/executive/TableProject.svelte';
    import TableSubProjects from '$components/executive/TableSubProjects.svelte';
    import domtoimage from 'dom-to-image';

    export let data;
    const { project } = data;

    const calculateProgressActions = (actions) => {
        if ( !actions || actions.length === 0) return 0;
        let total = actions.length;
        let finished = actions.filter(action => action.status === "finished").length;
        return Math.round((finished / total) * 100);
    }

    const system_progress = calculateProgressActions(project.actions.list);

    const getLatestProgress = () => {

        let latestProgress = null;

        if (project.progress_supervisor && project.progress_supervisor.data.length > 0) {
            latestProgress = project.progress_supervisor.data.reduce((prev, current) => (prev.created_at > current.created_at ? prev : current));
            latestProgress.type_progress = 'supervisor';
        }
        else if (project.progress && project.progress.data.length > 0) {
            latestProgress = project.progress.data.reduce((prev, current) => (prev.created_at > current.created_at ? prev : current));
            latestProgress.type_progress = 'manager';
        }

        return latestProgress;
    }

    const latestProgress = getLatestProgress();

    let selected_progress;

    const openProgressDialog = (progress) => {
        selected_progress = progress;
        const dialog = document.getElementById('progress_dialog');
        dialog.showModal();
    };

    const validateLink = (link) => {
        if (link === '' || link === null || link === undefined) return false;
        return link.includes('http');
    }

    const getDateEnd = (project) => {
        if (project.status === 'finished') {
            if ( project.end_project?.date ) {
                return formatDate(project.end_project.date);
            }
        }
        return project.end ? formatDate(project.end) : 'Sin fecha';
    }

    let annexes = false;
    let downloadProcess = false;

    const downloadData = () => {
        handleLoading('Descargando PDF...');
        downloadProcess = true;

        const section = document.getElementById('content-executive');
        const originalTransform = section.style.transform;
        const scale = 2;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                downloadProcess = true;
                domtoimage.toPng(section, {
                    width: section.offsetWidth * scale,
                    height: section.offsetHeight * scale,
                    style: {
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left'
                    },
                })
                .then((dataUrl) => {
                    section.style.transform = originalTransform;
                    const img = new Image();
                    img.src = dataUrl;
                    img.onload = () => {
                        const pdf = html2pdf()
                            .from(img)
                            .set({
                                margin: 5,
                                filename: `Vista Ejecutiva - ${project.name}.pdf`,
                                html2canvas: { scale: scale },
                                jsPDF: { unit: 'mm', format: [270, 220], orientation: 'landscape' },
                            })
                            .save();
                    };
                    messageAlert('success', 'PDF descargado correctamente');
                    downloadProcess = false;
                })
                .catch((error) => {
                    messageAlert('error', 'Error al capturar la imagen');
                });
            });
        });
    };

</script>

<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</svelte:head>

<section class="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-10 text-gray-600">
    <div class="grid-cols-1 sm:grid-cols-3 col-span-1 sm:col-span-3 grid gap-x-8 gap-y-10 sm:p-2 p-3" id="content-executive">
        <header class="col-span-1 sm:col-span-3">
            <h1 class="font-bold text-2xl sm:text-3xl sm:text-left text-center text-pretty">{project.name}</h1>
            <div class="w-full flex justify-end mt-5" class:opacity-0={downloadProcess}>
                <ButtonLight styles="pr-2 pl-2 py-2" text="Descargar" action={downloadData} >
                    <ImageDownloadIcon size={20} styles="mr-2" />
                </ButtonLight>
            </div>
        </header>
        <div class="col-span-1 flex flex-col justify-center items-center gap-y-10">
            <div class="flex flex-col justify-center items-center">
                <span class="text-3xl font-bold text-ins-600">
                    {!latestProgress ? system_progress : latestProgress.type_progress === 'supervisor' ? latestProgress.percent : latestProgress.percent}%
                </span>
                <span class="text-lg font-semibold">Avance</span>
            </div>
            <div class="w-full flex justify-center items-center">
                <div class="w-[90%] sm:w-full">
                    <MapAvailables municipalities={project.municipalities?.data} />
                </div>
            </div>
        </div>
        <div class="col-span-1 sm:col-span-2 flex items-start flex-col gap-y-4">
            <header class="w-full">
                <h2 class="text-center text-2xl font-semibold">{project.dependence?.data?.label ? project.dependence?.data?.label : 'Sin area'}</h2>
            </header>
    
            <div class="flex flex-col gap-2 w-full">
                <h3 class="text-md font-semibold">Planeación</h3>
                <div class="whitespace-pre-wrap bg-ins-700/10 rounded-md p-4 text-sm w-full">{project.planning ? project.planning : 'Sin planeación.'}</div>
            </div>
    
            <div class="flex sm:gap-6 gap-4 w-full flex-col sm:flex-row">
                <div class="flex gap-2 flex-col">
                    <h3 class="text-md font-semibold">Inicio</h3>
                    <div class="text-nowrap bg-ins-700/10 rounded-md py-4 px-10 text-sm w-full">{project.start ? formatDate(project.start) : 'Sin fecha'}</div>
                </div>
                <div class="flex gap-2 flex-col">
                    <h3 class="text-md font-semibold">Fin</h3>
                    <div class="text-nowrap bg-ins-700/10 rounded-md py-4 px-10 text-sm w-full">{getDateEnd(project)}</div>
                </div>
                <div class="flex gap-2 flex-col w-auto">
                    <h3 class="text-md font-semibold">Secretarias corresponsables</h3>
                    <div class="whitespace-pre-wrap bg-ins-700/10 rounded-md p-4 text-sm w-full">{project.secretaries?.data ? project.secretaries?.data.map(s => s.label).join(', ') : 'Sin corresponsables'}</div>
                </div>
            </div>
    
            <div class="flex flex-col gap-2 w-full">
                <h3 class="text-md font-semibold">Impacto</h3>
                <div class="whitespace-pre-wrap bg-ins-700/10 rounded-md p-4 text-sm w-full grid" style="grid-template-columns: repeat({project.beneficiaries?.list.length <= 3 ? 3 : project.beneficiaries?.list.length > 5 ? 5 : project.beneficiaries?.list.length}, 1fr);">
                    {#if project.status === 'finished' }
                        {#each project.end_project.beneficiaries as benef }
                            <article class="bg-white text-gray-600 font-semibold px-2 py-4 rounded-md flex flex-col justify-center items-start gap-y-1">
                                <div class="w-full flex justify-center">
                                    <h2 class="text-center bg-ins-700 rounded-md px-3 py-1 text-white w-fit flex items-center">
                                        #{benef.amount ? formatAmount(benef.amount) : 0}
                                    </h2>
                                </div>
                                <footer class="w-full">
                                    <h3 class="text-center text-sm">{benef.group?.label}</h3>
                                </footer>
                            </article>
                        {:else}
                            <span>Sin Beneficiarios.</span>
                        {/each}
                    {:else}
                        {#each project.beneficiaries?.list as benef }
                            <article class="bg-white text-gray-600 font-semibold px-2 py-4 rounded-md flex flex-col justify-center items-start gap-y-1">
                                <div class="w-full flex justify-center">
                                    <h2 class="text-center bg-ins-700 rounded-md px-3 py-1 text-white w-fit flex items-center">
                                        #{formatAmount(benef.amount)}
                                    </h2>
                                </div>
                                <footer class="w-full">
                                    <h3 class="text-center text-sm">{benef.group?.label ?? 'Sin grupo'}</h3>
                                </footer>
                            </article>
                        {:else}
                            <span>Sin Beneficiarios.</span>
                        {/each}
                    {/if}
                </div>
            </div>
    
            <div class="flex flex-col gap-2 w-full">
                <h3 class="text-md font-semibold">Supervisión</h3>
                <div class="text-sm w-full sm:gap-x-6 gap-3 flex flex-col sm:flex-row">
                    <div class="bg-ins-700/10 rounded-md p-4 sm:w-2/5 w-full grid grid-cols-1 justify-start">
                        {#each project.progress_supervisor?.data as prog }
                            <button on:click={()=> openProgressDialog(prog)} class="italic w-fit hover:text-ins-700 underline flex gap-x-1 items-center group">
                                Ver avance ({formatDate(prog.created_at)})
                                <ExternalLink size={16} styles="hidden group-hover:flex" />
                            </button>
                        {:else}
                            <span>Sin avances.</span>
                        {/each}
                    </div>
                    
                    <div class="bg-ins-700/10 rounded-md p-4 sm:w-3/5 w-full grid h-fit" style="grid-template-columns: 1fr 50px 1fr 50px 1fr;">
                        <div class="space-y-2 flex flex-col justify-center items-center">
                            <header class="font-semibold text-base">Total</header>
                            <div>
                                {formatNumber(project.amount)}
                            </div>
                        </div>
                        <div class="divider divider-horizontal divide-ins-700"></div>
                        <div class="space-y-2 flex flex-col justify-center items-center">
                            <header class="font-semibold text-base">Ejercido</header>
                            <div>
                                {#if project.status === 'finished' }
                                    ${project.end_project.total_amount ? formatNumber(project.end_project.total_amount) : 0}
                                {:else}
                                    {#if project.finance_source_history?.data && project.finance_source_history?.data.length > 0 }
                                        ${formatNumber(project.finance_source_history?.data[0].source)}
                                    {:else}
                                        $0
                                    {/if}
                                {/if}
                            </div>
                        </div>
                        <div class="divider divider-horizontal divide-ins-700"></div>
                        <div class="space-y-2 flex flex-col justify-center items-center">
                            <header class="font-semibold text-base">Fuente</header>
                            <div>
                                <td class="whitespace-nowrap max-w-52 truncate py-1">
                                    <ul class="max-h-[84px] overflow-y-auto overflow-x-hidden w-full px-8">
                                         {#each project.source.list as ss }
                                             <li>{ss.source ? sources.find(s=> s.value === ss.source)?.label : 'Sin fuente'}</li>
                                         {:else}
                                             <li>Sin fuentes</li>
                                         {/each}
                                    </ul>
                                </td>
                            </div>
                        </div>
                    </div>
    
                </div>
            </div>
    
            <div class="flex flex-col gap-2 w-full">
                <h3 class="text-md font-semibold">Socialización</h3>
                <div class="text-sm w-full bg-ins-700/10 rounded-md p-4 flex flex-col gap-y-2">
                    <header>
                        {#if project.socialization?.data && project.socialization?.data.length > 0 }
                            <h1 class="text-pretty">{project.socialization?.data[0].strategy}</h1>
                        {:else}
                            <h1 class="text-balance">Sin estrategias registradas.</h1>
                        {/if}
                        
                    </header>
                    <div class="ml-2 space-y-1">
                        {#if project.socialization?.data && project.socialization?.data.length > 0 && project.socialization?.data[0].links.length > 0}
                            {#each project.socialization.data[0].links as {link, description} }
                                {#if validateLink(link) }
                                    <a href={link} target="_blank" class="italic w-fit hover:text-ins-700 underline flex gap-x-1 items-center group">
                                        Ver detalle ({description})
                                        <ExternalLink size={16} styles="hidden group-hover:flex" />
                                    </a>
                                {/if}
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
    
        </div>
    
        <div class="col-span-1 sm:col-span-3 w-full">
            <TableProject data={project} advance={`${!latestProgress ? system_progress : latestProgress.type_progress === 'supervisor' ? latestProgress.percent : latestProgress.percent}`} />
        </div>
        <div class="col-span-1 sm:col-span-3 w-full">
            <TableSubProjects data={project.sub_projects?.data} />
        </div>
    </div>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class="p-2 sm:p-0 w-full col-span-1 sm:col-span-3">
        <details class="collapse bg-base-200 border-2 border-gray-500/10 mt-5 w-full sm:p-2 p-1" on:click={()=> {annexes = !annexes}}>
            <summary class="collapse-title text-xl font-medium w-full">
                <div class="flex justify-between w-full flex-row text-gray-600 px-3 items-center">
                    <span class="text-ins-700">Anexos</span>
                    <span>
                        {#if !annexes }
                            <PlusIcon size={24} styles="text-ins-700" />
                        {:else}
                            <LessIcon size={24} styles="text-ins-700" />
                        {/if}
                    </span>
                </div>
            </summary>
            <div class="collapse-content p-1"> 
                <section class="w-full p-6 bg-gray-100 rounded-md gap-3 flex flex-col">
                    <h3 class="text-md font-semibold">Descripción del proyecto</h3>
                    <div class="whitespace-pre-wrap bg-ins-700/10 rounded-md p-4 text-sm w-full">
                        {#if project.status === 'finished' }
                            {project.end_project.description ? project.end_project.description : project.description ? project.description : 'Sin descripción.'}
                        {:else}
                            {project.description ? project.description : 'Sin descripción.'}
                        {/if}
                    </div>
                </section>
            </div>
            <div class="sm:px-5 px-2">
                <header class="px-2">
                    <h1 class="text-md font-semibold">
                        Diagrama de Gantt
                    </h1>
                </header>
                <DiagramGantt dataDiagram={project} withoutHeader={true} />
            </div>
        </details>
    </div>
</section>

<dialog id="progress_dialog" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box sm:w-8/12 sm:min-w-[50%] sm:max-w-[800px] text-gray-600">
        <h1 class="font-bold text-lg text-center">Avance de supervisor</h1>
        <div class="w-full mt-5 min-full max-h-[500px] overflow-y-auto p-3 overflow-x-hidden">
            <header class="space-y-2">
                <h2 class="font-semibold">Avance general</h2>
                <p class="p-2 bg-ins-700/10 rounded-md text-balance">{selected_progress?.general ? selected_progress?.general : 'Sin avance general.'}</p>
            </header>
            <div class="sm:stats flex flex-col sm:flex-row justify-center items-center mt-4 mb-4">
  
                <div class="stat w-full sm:w-1/4">
                <div class="stat-figure text-ins-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div class="stat-title">% de avance</div>
                <div class="stat-value">
                    {selected_progress?.percent}%
                </div>
                <div class="stat-desc">Valor manual</div>
                </div>
                
                <div class="stat w-full sm:w-1/4">
                <div class="stat-figure text-ins-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </div>
                <div class="stat-title">% de avance del sistema</div>
                <div class="stat-value">{selected_progress?.system_progress ?? 0}%</div>
                <div class="stat-desc">Tomado del sistema</div>
                </div>
                
                <div class="stat w-full sm:w-1/4">
                <div class="stat-figure text-ins-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                </div>
                <div class="stat-title">Proyecto con desdoble</div>
                <div class="stat-value">{selected_progress?.sub_actions ? 'Si' : 'No'}</div>
                <div class="stat-desc">Tomado del sistema</div>
                </div>
                
            </div>

            <div class="mt-5">
                <CardFile files={selected_progress?.files} {project} gridColums="sm:grid-cols-6 grid-cols-2" onlyRead={true} />                    
            </div>

            <div class="mt-8 items-center flex-row flex">
                <div><span class="font-semibold text-sm text-gray-600 ml-0.5">¿Asiste Manolo?</span></div>
                <input type="checkbox" checked={selected_progress?.governor_attend} class="checkbox checkbox-success ml-3 disabled:opacity-100 disabled:border-none" disabled />
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-between items-center mt-8">
                <div class="form-control max-w-fit">
                    <label class="cursor-pointer label">
                        <span class="font-semibold text-sm text-gray-600 ml-0.5">¿Requiere aprobación?</span>
                        <input type="checkbox" checked={selected_progress?.need_approve} class="checkbox checkbox-success ml-3 disabled:opacity-100 disabled:border-none" disabled />
                    </label>
                </div>
        
                {#if selected_progress?.need_approve }
                    <div class="flex justify-center sm:justify-end items-center sm:mr-20">
                        {#if selected_progress?.approved === 'rejected' }
                            <div class="flex flex-col gap-1">
                                <span class="flex flex-row justify-center items-center tooltip" data-tip="Fue rechazado">
                                    <strong>Rechazado</strong>
                                    <XCubeIcon styles="ml-2 text-red-600" size={30} />
                                </span>     
                                <span class="text-xs font-normal mt-3">
                                    <strong>Nota:</strong>
                                    {selected_progress?.response === '' ? 'Sin nota' : selected_progress?.response}
                                </span>
                                <span class="text-xs font-normal">
                                    <strong>Rechazado por:</strong>
                                    {selected_progress?.approved_by === '' ? 'Desconocido' : selected_progress?.approved_by}
                                </span>
                                <span class="text-xs font-normal">
                                    <strong>Rechazado el:</strong>
                                    {selected_progress?.approved_at === '' ? 'Desconocida' : formatDateTime(selected_progress?.approved_at)}
                                </span>
                                {#if selected_progress?.audio }
                                    <audio class="h-9 mt-2" controls> 
                                        <source src="{selected_progress?.audio}" type="audio/mp3"> No soportado.
                                    </audio>
                                {/if}
                            </div>               
                        {:else if selected_progress?.approved === 'approved'}  
                            <div class="flex flex-col gap-1">
                                <span class="flex flex-row justify-center items-center tooltip" data-tip="Fue aprobado">
                                    <strong>Aprobado</strong>
                                    <CheckedVerifyIcon styles="ml-2 text-green-600" size={30} />
                                </span>     
                                <span class="text-xs font-normal mt-3">
                                    <strong>Nota:</strong>
                                    {selected_progress?.response === '' ? 'Sin nota' : selected_progress?.response}
                                </span>
                                <span class="text-xs font-normal">
                                    <strong>Aprobado por:</strong>
                                    {selected_progress?.approved_by === '' ? 'Desconocido' : selected_progress?.approved_by}
                                </span>
                                <span class="text-xs font-normal">
                                    <strong>Aprobado el:</strong>
                                    {selected_progress?.approved_at === '' ? 'Desconocida' : formatDateTime(selected_progress?.approved_at)}
                                </span>
                                {#if selected_progress?.audio }
                                    <audio class="h-9 mt-2" controls> 
                                        <source src="{selected_progress?.audio}" type="audio/mp3"> No soportado.
                                    </audio>
                                {/if}
                            </div>               
                        {:else}
                            <span class="font-semibold text-sm text-gray-600 ml-0.5">¿Ya fue aprobado?</span>
                            <span class="tooltip" data-tip="Pendiente de aprobación">
                                <AlertHexaIcon styles="ml-2 text-orange-600" size={30} />
                            </span>                    
                        {/if}
                    </div>
                {/if}
            </div>

            <div class="mt-5 flex-col gap-2 {selected_progress?.need_approve ? 'flex' : 'hidden' }">

                <div>
                    <label for="approval_details" class="font-semibold text-sm text-gray-600 ml-0.5">Describe la aprobación</label>
                    <input type="text" name="approval_details" id="approval_details" value={selected_progress?.approval_details} class="mt-2 {formStyle}" placeholder="Describe la aprobación" readonly>
                </div>
        
                <div>
                    <CardFile files={selected_progress?.files_approved} {project} gridColums="sm:grid-cols-6 grid-cols-2" onlyRead={true} />                    
                </div>
        
                {#if selected_progress?.id === "" }
        
                    <div class="mt-5">
                        <label for="files_approved" class="font-semibold text-sm text-gray-600 ml-0.5">Fotos</label>
                        <div id="files_approved" name="files_approved" class="dropzone w-full mt-2 font-semibold text-gray-500 bg-white"></div>
                    </div>
        
                {/if}
        
            </div>
            
        </div>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn hover:bg-red-600 hover:text-white">Cerrar</button>
            </form>
        </div>
    </div>
</dialog>