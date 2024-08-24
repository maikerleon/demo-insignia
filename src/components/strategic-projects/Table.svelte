<script>
	
	import DependenceIcon from '$icons/DependenceIcon.svelte';
    import { statutes, municipalities as municipalities_temp } from '$lib/data.js';
    
    export let projects;
    export let dependences;
    export let selectedMunicipality;
    export let clicked;
    export let role;

    const calculateProgressActions = (actions) => {
        if ( !actions || actions.length === 0) return 0;
        let total = actions.length;
        let finished = actions.filter(action => action.status === "finished").length;
        return Math.round((finished / total) * 100);
    }

    const getLatestProgress = (project) => {
        let latestProgress = null;

        if (project.progress_supervisor && project.progress_supervisor.data.length > 0) {
            latestProgress = project.progress_supervisor.data.reduce((prev, current) => (prev.created_at > current.created_at ? prev : current));
            latestProgress.type_progress = 'supervisor';
        }
        else if (project.progress && project.progress.data.length > 0) {
            latestProgress = project.progress.data.reduce((prev, current) => (prev.created_at > current.created_at ? prev : current));
            latestProgress.type_progress = 'manager';
        }

        if ( !latestProgress ) return null;
        
        if ( latestProgress.type_progress === 'supervisor' ) {
            return latestProgress.percent;
        } else {
            return latestProgress.system_progress;
        }
    }

    let municipalities = municipalities_temp.map(mun => ({...mun, visible: true}));

    let data_temp = projects ? [...projects] : [];
	let all_dependences = true;
    let all_municipalities = true;
    let search = '';

	const handleChangeVisibleMunicipality = () => {
		all_municipalities = municipalities.every(mun => mun.visible);
		filteredProjects();
	}

    let orderBy = 'status';

    const generateCols = () => {
        const currentYear = new Date().getFullYear();
        const cols = {};

        for (let year = 2023; year <= currentYear + 2; year++) {
            cols[year] = true;
        }

        return cols;
    };

    let cols = generateCols();
    let axis_filter = 'all';
    let theme_filter = 'all';
    let financial_sources_filter = 'all';
    let regions_filter = 'all';
    let executive_plan_filter = 'all';
    let right_way_filter = 'all';
    let start_filter = '';
    let start_end_filter = '';
    let secretaries_filter = 'all';

    const filteredProjects = () => {
        data_temp = [...projects];

        data_temp = data_temp.filter(ax => {
            const startYear = new Date(ax.start).getFullYear();
            const matchesYear = cols[startYear] && cols[startYear] === true;

            const matchesAxis = axis_filter === 'all' || (ax.axis && ax.axis.data && ax.axis.data.value === axis_filter);
            
            const matchesTheme = theme_filter === 'all' || 
                (ax.theme && ax.theme.data && 
                (Array.isArray(ax.theme.data) ? 
                    ax.theme.data.some(theme => theme.value === theme_filter) :
                    ax.theme.data.value === theme_filter
                ));

            const matchesFinancialSources = financial_sources_filter === 'all' || (ax.source && ax.source.list && ax.source.list.some(source => source.source === financial_sources_filter));
            const matchesRegions = regions_filter === 'all' || (ax.regions && ax.regions.data && ax.regions.data.some(region => region.value === regions_filter));
            const matchesExecutivePlan = executive_plan_filter === 'all' || (ax.executive_plan && ax.executive_plan === executive_plan_filter);
            const matchesRightWay = right_way_filter === 'all' || (ax.right_way && ax.right_way === right_way_filter);
            const matchesStart = start_filter === '' || (ax.start && new Date(ax.start) >= new Date(start_filter));
            const matchesStartEnd = start_end_filter === '' || (ax.start && new Date(ax.start) <= new Date(start_end_filter));
            const matchesSecretaries = secretaries_filter === 'all' || (ax.secretaries && ax.secretaries.data && ax.secretaries.data.some(sec => sec.value === secretaries_filter));

            const matchesDependence = !dependences || all_dependences || dependences.some(dep => dep.value === ax.dependence?.data?.value && dep.visible);

            const matchesMunicipality = all_municipalities || ax.municipalities?.data?.some(municipality => municipalities.some(m => m.id === municipality.value && m.visible));

            const statusData = ax.status ?? null;
            const matchesStatus = statusData && colsStatus.some(d => d.value === statusData && d.visible);

            const matchesSearch = !search || ax.name.toLowerCase().includes(search.toLowerCase());

            const response = matchesYear && matchesAxis && matchesTheme && matchesFinancialSources && matchesRegions && 
                            matchesExecutivePlan && matchesRightWay && matchesStart && matchesStartEnd && matchesSecretaries &&
                            matchesDependence && matchesMunicipality && matchesStatus && matchesSearch;

            return response;
        });

        if (orderBy) {
            data_temp.sort((a, b) => {
                if (orderBy === 'status') {
                    const statusOrder = ['active-process', 'finished', 'not-activated', 'approved-waiting', 'waiting-approval'];
                    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                } else if (orderBy === 'priority') {
                    const priorityOrder = ['high', 'medium', 'low'];
                    return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
                } else if (orderBy === 'start') {
                    return new Date(b.start) - new Date(a.start);
                }
                return 0;
            });
        }

        return data_temp;
    };


    let colsStatus =  statutes.map(s => ({...s, visible: true}));

    let resetFilter = false;

    const validateFilter = () => {
        if (clicked && selectedMunicipality) {
            municipalities = [...municipalities].map(mun => ({...mun, visible: (mun.id === selectedMunicipality ? true : false)}));
            handleChangeVisibleMunicipality();
            resetFilter = true;
        } else if (!clicked && !selectedMunicipality && resetFilter) {
            municipalities = [...municipalities].map(mun => ({...mun, visible: true }));
            handleChangeVisibleMunicipality();
            resetFilter = false;
        };
    }

    $: validateFilter(clicked,selectedMunicipality);
    
    $: filteredProjects(search, orderBy, colsStatus, all_dependences, all_municipalities, dependences, municipalities, cols, axis_filter, theme_filter, financial_sources_filter, regions_filter, executive_plan_filter, right_way_filter, start_filter, start_end_filter, secretaries_filter);

</script>

<section class="mt-8 py-4">

    <header class="flex sm:justify-between sm:items-end flex-col sm:flex-row">
        <div class="flex flex-col md:flex-row gap-3">

            <div class="flex flex-col space-y-1" style="padding-top: 5.5px;">
                <span class="text-xs font-semibold text-gray-600 pl-0.5">Ordenar por</span>
                <select name="orderBy" class="text-sm w-full py-2.5 px-2 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700" bind:value={orderBy}>
                    <option value="status">Estatus</option>
                    <option value="priority">Prioridad</option>
                    <option value="start">Fecha de inicio</option>
                </select>
            </div>
          
            <div>
                <span class="text-xs font-semibold text-gray-600 pl-0.5">Buscador</span>
                <div class="relative {!search ? 'sm:w-72 sm:hover:w-96' : 'sm:w-96' } transition-all duration-300 w-[100%]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
                </div>
            </div>

        </div>
    </header>

    <div class="mt-10 shadow-sm border rounded-lg overflow-x-auto max-w-[calc(100vw-20px)]" style="height: 400px !important;">
        <table class="w-full table-auto text-sm text-left">
            <tbody class="text-gray-600 divide-y">
                {#each data_temp as project, idx }
                    <tr class="bg-white h-auto sm:h-[84px]">
                        <td class="px-4 py-3 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                        <td class="px-4 py-3 max-w-72 text-wrap">
                            <div class="flex items-center gap-x-2">
                                <div>
                                    <div class="rounded-md w-[20px] h-[20px] {statutes.find(s=> s.value === project.status)?.color ?? 'bg-gray-400'}"></div>
                                </div>
                                {#if role !== 'dependence' }
                                    <a target="_blank" href={`/proyectos/ejecutiva/${project.id}`} class="text-ins-600 hover:text-ins-700 uppercase">{project.name}</a>
                                {:else}
                                    {project.name}
                                {/if}
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr class="bg-white">
                        <td colspan="7" class="p-4">
                            <section class="text-center flex items-center w-full justify-center">
                                <DependenceIcon size="20" />
                                <strong class="ml-2 font-semibold text-gray-700">No se encontraron proyectos</strong>
                            </section>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</section>