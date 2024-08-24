<script>
	import { handleLoading, messageAlert } from '$lib/utilities.js';
	import DownloadIcon from '$icons/DownloadIcon.svelte';
	import UserIcon from '$icons/UserIcon.svelte';
	import PhoneCallIcon from '$icons/PhoneCallIcon.svelte';
	import GoBackIcon from '$icons/GoBackIcon.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
	// import TargetIcon from '$icons/TargetIcon.svelte';
	// import BlackhoeIcon from '$icons/BlackhoeIcon.svelte';
    import { municipalities } from '$lib/data.js';
	// import ArticleStatisticsHeader from '$components/statistics/ArticleStatisticsHeader.svelte';
	import Map from '$components/statistics/Map.svelte';
    import EmailSendIcon from '$icons/EmailSendIcon.svelte';
    import TableProjectsStatistics from '$components/statistics/TableProjectsStatistics.svelte';
    import ChartDonut from '$components/statistics/ChartDonut.svelte';
    import domtoimage from 'dom-to-image';
    import HeaderStatistics from './HeaderStatistics.svelte';
    
    let selectedMunicipality = null;
    export let selectedDependence;
    export let principalSection;
    export let projects;
    export let projects_100_days;
    export let actions;
    export let dependence;
    export let dataProjects;
    export let role;
    export let axis;

    const allData = {
        projects: {...projects}, 
        projects_100_days: {...projects_100_days},
        actions: {...actions}
    };

    let filteredData = {...allData};
    const mapData = {details: [{...projects}]};
    
    const filterData = () => {
        if (selectedMunicipality === null) {
            filteredData = JSON.parse(JSON.stringify(allData));
        } else {
            if( allData.projects?.municipalities && allData.projects?.municipalities[`municipality_${selectedMunicipality}`] ) {
                filteredData.projects = {...allData.projects?.municipalities[`municipality_${selectedMunicipality}`]};
            } else{
                filteredData.projects = {real: 0, total: 0, totals_status: { active: 0, inactive: 0, process: 0, finished: 0}};
            }

            if( allData.projects_100_days?.municipalities && allData.projects_100_days?.municipalities[`municipality_${selectedMunicipality}`] ) {
                filteredData.projects_100_days = {...allData.projects_100_days?.municipalities[`municipality_${selectedMunicipality}`]};
            } else{
                filteredData.projects_100_days = {real: 0, total: 0, totals_status: { active: 0, inactive: 0, process: 0, finished: 0}};
            }

            if( allData.actions?.municipalities && allData.actions?.municipalities[`municipality_${selectedMunicipality}`] ) {
                filteredData.actions = {...allData.actions?.municipalities[`municipality_${selectedMunicipality}`]};
            } else{
                filteredData.actions = {real: 0, total: 0, totals_status: { active: 0, inactive: 0, process: 0, finished: 0}};
            }
        }
    }

    const downloadCapture = () => {
        handleLoading('Generando PDF...');
        const section = document.getElementById('section-capture');
        const originalTransform = section.style.transform;
        const scale = 2;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                captureProcess = true;
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
                                filename: `${dependence?.name ?? 'Secretaria'}.pdf`,
                                html2canvas: { scale: scale },
                                jsPDF: { unit: 'mm', format: [270, 297], orientation: 'landscape' },
                            })
                            .save();
                    };
                    messageAlert('success', 'PDF generado correctamente');
                    captureProcess = false;
                })
                .catch((error) => {
                    messageAlert('error', 'Error al capturar la imagen');
                });
            });
        });
    };

    $: filterData(selectedMunicipality);

    let clicked = false;
    let captureProcess = false;

</script>

<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</svelte:head>

<div id="section-capture">
    <header class="flex justify-between py-3 items-start sm:items-center sm:flex-row flex-col-reverse">
        <h1 class="uppercase text-2xl sm:text-3xl text-ins-600 font-bold">{dependence?.name ?? 'Secretaria'}</h1>
        {#if role !== 'dependence'}
            <ButtonLight styles="max-w-fit py-1 h-8 mb-3 sm:mb-0 min-w-fit {captureProcess ? 'opacity-0' : ''}" text='Ir atrás' action={() => {principalSection = true; selectedDependence = null;}}>
                <GoBackIcon />
            </ButtonLight>
        {/if}
    </header>
    <section class="grid grid-cols-1 sm:grid-cols-8 gap-x-5 pt-5 items-start" >
    
        <div class="col-span-1 md:col-span-8 justify-between flex mt-2 mb-8 items-center {captureProcess ? 'opacity-0' : ''}">
            <aside class="flex flex-row items-center gap-x-4 col-span-1 mb-8 sm:mb-0">
                <div>
                    <div class="sm:w-36 sm:h-36 w-24 h-24 overflow-hidden rounded-full border-4 border-ins-600 shadow-md">
                        {#if dependence?.admin?.photo && dependence?.admin?.photo !== ''}
                            <img src="{dependence?.admin?.photo}" alt="Foto de perfil del responsable de dependencia" class="w-full h-full object-cover">
                        {:else}
                            <UserIcon styles="w-full h-full" />
                        {/if}
                    </div>
                </div>
                <div class="flex flex-col text-2xl font-semibold text-gray-600 w-full">
                    <span>{dependence?.admin?.name ?? 'Sin'}</span>
                    <span>{dependence?.admin?.lastname_father ?? 'Encargado'}</span>
                    <span class="flex gap-4 mt-3">
                        {#if dependence?.admin?.phone}
                            <a href="tel:{dependence?.admin?.phone}" class="hover:text-ins-600 {captureProcess ? 'opacity-0' : ''}">
                                <PhoneCallIcon />
                            </a>
                        {/if}
                        {#if dependence?.admin?.email}
                            <a href="mailto:{dependence?.admin?.email}" class="hover:text-ins-600 {captureProcess ? 'opacity-0' : ''}">
                                <EmailSendIcon />
                            </a>
                        {/if}
                    </span>
                </div>
            </aside>
            <ButtonLight text="Descargar" action={downloadCapture} styles="mr-0.5 w-4/5 flex justify-center sm:w-auto h-fit" > 
                <DownloadIcon size={20} styles='mr-2' />
            </ButtonLight>
        </div>
    
        <div class="grid grid-cols-1 gap-x-5 items-center col-span-1 sm:col-span-8">
            <section class="flex justify-center items-center w-full col-span-1">
                <!-- <div class="grid grid-cols-1 sm:grid-cols-2 w-full gap-4 sm:stats shadow-md rounded-md bg-white/60"> -->
                    <!-- <ArticleStatisticsHeader title="Proyectos" sex="male" real={filteredData.projects?.real ?? 0} total={filteredData.projects?.total ?? 0} color="text-green-600" icon={BlackhoeIcon} /> -->
                    <!-- <ArticleStatisticsHeader title="Acciones" sex="female" real={filteredData.actions?.real ?? 0} total={filteredData.actions?.total ?? 0} color="text-blue-600" icon={TargetIcon} /> -->
                    <!-- <ArticleStatisticsHeader title="100 días" sex="male" real={filteredData.projects_100_days?.real ?? 0} total={filteredData.projects_100_days?.total ?? 0} color="text-orange-600" icon={CalendarClockIcon} /> -->
                    <HeaderStatistics {filteredData} {selectedMunicipality} {selectedDependence} />
                <!-- </div> -->
            </section>
        </div>
    
        <div class="grid grid-cols-1 sm:grid-cols-8 gap-x-10 items-center col-span-1 sm:col-span-8 mb-14">
    
            <div class="col-span-1 sm:col-span-3 mt-10">
                <Map bind:clicked={clicked} bind:selectedMunicipality={selectedMunicipality} projects={mapData} />
            </div>
            <div class="flex justify-start col-span-1 sm:col-span-5 flex-col w-full">
                
    
                <section class="w-full flex justify-center items-center mb-8 sm:mt-0 mt-5">
                    <h3 class="sm:text-3xl text-2xl uppercase font-bold">{selectedMunicipality ? municipalities.find( mun => mun.id === Number(selectedMunicipality) ).name : 'Estadísticas Generales'}</h3>
                </section>
    
                <div class="flex gap-4 flex-col">
                    <ChartDonut type="projects" data={filteredData.projects.totals_status} totalProjects={filteredData.projects.total} />
                    <!-- <Chart type="actions" data={filteredData.actions.totals_status} /> -->
                </div>
    
            </div>
    
        </div>
        
    </section>
</div>

<TableProjectsStatistics {role} projects={dataProjects.filter(p => p.dependence?.data?.value === selectedDependence)} dependences={null} {selectedMunicipality} {clicked} typeTable='dependence' {axis} />

<footer class="flex justify-center w-full sm:py-5 py-2">
    <i class="uppercase text-2xl font-semibold text-gray-600">{dependence?.abbr || 'ABBR'}</i>
</footer>