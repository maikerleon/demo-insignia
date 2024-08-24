<script>
	import ChevronUpIcon from '$icons/ChevronUpIcon.svelte';
	import ChevronDownIcon from '$icons/ChevronDownIcon.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
	import ExcelIcon from '$icons/ExcelIcon.svelte';
	import ChevronIcon from '$icons/ChevronIcon.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
	import { formatDate, formatNumber, messageAlert } from '$lib/utilities.js';
    import { statutes, municipalities as municipalities_temp, sources as sources_temp, themes, regions, sources as financial_sources, impact } from '$lib/data.js';
    import ExcelJS from 'exceljs';
    import FilterIcon from '$icons/FilterIcon.svelte';
    
    export let projects;
    export let dependences;
    export let selectedMunicipality;
    export let clicked;
    export let role;
    export let typeTable = 'project';
    export let axis = [];

    let dependences_temp = dependences ? [...dependences] : null;

    let modalData = {
        title: '',
        note: '',
    }

    const formatDateString = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('es', options).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$1/$2/$3');
    };

    const openNote = (name, note) => {
        modalData = {
            title: name,
            note: note,
        };
        const dialog = document.getElementById('note_modal');
        dialog.showModal();
    };

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
    let status = 'all';

    const handleVisibleDependences = () => {
		if (all_dependences) {
			dependences = [...dependences].map(dep => ({...dep, visible: true}));
		} else {
			dependences = [...dependences].map(dep => ({...dep, visible: false}));
		}
		filteredProjects();
	}

	const handleChangeVisibleDependence = () => {
		all_dependences = dependences.every(dep => dep.visible);
		filteredProjects();
	}

    const handleVisibleMunicipalities = () => {
		if (all_municipalities) {
			municipalities = [...municipalities].map(mun => ({...mun, visible: true}));
		} else {
			municipalities = [...municipalities].map(mun => ({...mun, visible: false}));
		}
		filteredProjects();
	}

	const handleChangeVisibleMunicipality = () => {
		all_municipalities = municipalities.every(mun => mun.visible);
		filteredProjects();
	}

    let orderByPercent = 'desc';

    const generateCols = () => {
        const currentYear = new Date().getFullYear();
        const cols = {};

        for (let year = 2023; year <= currentYear + 2; year++) {
            cols[year] = true;
        }

        return cols;
    };

    let cols = generateCols();
    let openedDrawer = false;
    let axis_filter = 'all';
    let theme_filter = 'all';
    let financial_sources_filter = 'all';
    let regions_filter = 'all';
    let executive_plan_filter = 'all';
    let right_way_filter = 'all';
    let start_filter = '';
    let start_end_filter = '';
    let secretaries_filter = 'all';

    const simpleDictionary = {
        'partial': 'Parcial',
        'yes': 'Sí',
        'no': 'No',
        'no-apply': 'No aplica'
    }

    const keys = Object.keys(simpleDictionary);

    const hasAnyFalseCols = (cols) => {
        return Object.values(cols).some(value => value === false);
    };

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

        if (orderByPercent) {
            data_temp.sort((a, b) => {
                const a_progress = getLatestProgress(a) ?? calculateProgressActions(a.actions.list);
                const b_progress = getLatestProgress(b) ?? calculateProgressActions(b.actions.list);
                return orderByPercent === 'asc' ? a_progress - b_progress : b_progress - a_progress;
            });
        }

        return data_temp;
    };


    let colsStatus =  statutes.map(s => ({...s, visible: true}));

    let resetFilter = false;

    const resetFilters = () => {
        status = 'all';
        search = '';
        all_municipalities = true;
        municipalities = municipalities.map(mun => ({...mun, visible: true}));
        all_dependences = true;
        dependences = dependences.map(dep => ({...dep, visible: true}));
        axis_filter = 'all';
        theme_filter = 'all';
        financial_sources_filter = 'all';
        regions_filter = 'all';
        executive_plan_filter = 'all';
        right_way_filter = 'all';
        secretaries_filter = 'all';
        start_filter = '';
        start_end_filter = '';
        cols = generateCols();
        filtered();
    }

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

    const generateExcelDownload = async () => {

        try {
            const templateResponse = await fetch('/template-statistics.xlsx');
            if (!templateResponse.ok) {
                throw new Error('No se pudo obtener la plantilla');
            }
            const arrayBuffer = await templateResponse.arrayBuffer();

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1);

            data_temp.forEach((project, index) => {
                const rowIndex = index + 2;
                const row = worksheet.getRow(rowIndex);

                row.getCell(1).value = project.name;
                row.getCell(2).value = formatDateString(project.start);
                row.getCell(3).value = formatDateString(project.end);
                row.getCell(4).value = project.dependence?.data?.label || 'Sin dependencia';
                row.getCell(5).value = `${getLatestProgress(project) || calculateProgressActions(project.actions.list)}%`;
                row.getCell(6).value = project.note || 'Sin nota';
                row.getCell(7).value = statutes.find(s=> s.value === project.status)?.label || 'Sin estatus';
                row.getCell(8).value = project.secretaries?.data ? project.secretaries?.data.map(s => s.label).join(', ') : 'Sin corresponsables';
                row.getCell(9).value = project.axis?.data ? project.axis?.data?.label : 'Sin eje';
                row.getCell(10).value = impact.find(i=> i.value === project.impact)?.label || 'Sin impacto';
                row.getCell(11).value = project.amount ? formatNumber(project.amount) : '0';
                row.getCell(12).value = project.finance_source_history.data ? project.finance_source_history.data[0].source : 0;

                row.commit();
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Proyectos (${formatDate(new Date())}).xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            messageAlert('error', 'Ha ocurrido un error inesperado, intente nuevamente.');
        }
    };

    $: validateFilter(clicked,selectedMunicipality);
    
    $: filteredProjects(search, orderByPercent, colsStatus, all_dependences, all_municipalities, dependences, municipalities, cols, axis_filter, theme_filter, financial_sources_filter, regions_filter, executive_plan_filter, right_way_filter, start_filter, start_end_filter, secretaries_filter);

</script>

<section class="mt-8 border-t-2 border-gray-300 py-4">

    <header class="flex sm:justify-between sm:items-end flex-col sm:flex-row">
        <div class="flex flex-col md:flex-row gap-x-3">
            {#if dependences }
                <div class="dropdown dropdown-bottom w-full sm:w-36 max-w-full sm:mr-2">
                    <span class="text-xs font-semibold text-gray-600 pl-0.5">Dependencias</span>
                    <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
                        Dependencias
                        <ChevronIcon size={18} styles="text-black" />
                    </div>
                    <div tabindex="-1" class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-lg w-64 truncate">
                        <ul class="dropdown-content-int">
                            <li class="w-full pr-2">
                                <label class="flex flex-row w-full justify-between active:bg-red-500" for="dep_all">
                                    Mostrar todas
                                    <input type="checkbox" class="checkbox checkbox-xs" id="dep_all" bind:checked={all_dependences} on:change={handleVisibleDependences} />
                                </label>
                            </li>
                            {#each dependences as dep }
                                <li class="w-full pr-2">
                                    <label class="flex flex-row w-full justify-between active:bg-red-500" for="dep_{dep.value}">
                                        {dep.label}
                                        <input type="checkbox" class="checkbox checkbox-xs" id="dep_{dep.value}" bind:checked={dep.visible} on:change={handleChangeVisibleDependence} />
                                    </label>
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}

            <div class="dropdown dropdown-bottom w-full sm:w-36 max-w-full sm:mr-2">
                <span class="text-xs font-semibold text-gray-600 pl-0.5">Estatus</span>
                <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
                    Estatus
                    <ChevronIcon size={18} styles="text-black" />
                </div>
                <div tabindex="-1" class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-lg w-64 truncate">
                    <ul class="dropdown-content-int">
                        {#each colsStatus as st }
                            <li class="w-full pr-2">
                                <label class="flex flex-row w-full justify-between active:bg-red-500" for="status_{st.value}">
                                    {st.label}
                                    <input type="checkbox" class="checkbox checkbox-xs" id="status_{st.value}" bind:checked={st.visible} />
                                </label>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        
            <div class="dropdown dropdown-bottom w-full sm:w-36 max-w-full sm:mr-2">
                <span class="text-xs font-semibold text-gray-600 pl-0.5">Municipios</span>
                <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
                    Municipios
                    <ChevronIcon size={18} styles="text-black" />
                </div>
                <div tabindex="-1" class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-lg w-64 truncate">
                    <ul class="dropdown-content-int">
                        <li class="w-full pr-2">
                            <label class="flex flex-row w-full justify-between active:bg-red-500" for="mun_all">
                                Mostrar todas
                                <input type="checkbox" class="checkbox checkbox-xs" id="mun_all" bind:checked={all_municipalities} on:change={handleVisibleMunicipalities} />
                            </label>
                        </li>
                        {#each municipalities as mun }
                            <li class="w-full pr-2">
                                <label class="flex flex-row w-full justify-between active:bg-red-500" for="dep_{mun.id}">
                                    {mun.name}
                                    <input type="checkbox" class="checkbox checkbox-xs" id="dep_{mun.id}" bind:checked={mun.visible} on:change={handleChangeVisibleMunicipality} />
                                </label>
                            </li>
                        {/each}
                    </ul>
                </div>
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
    
        <div class="sm:mt-0 mt-3">
            <ButtonLight text="Descargar Excel" action={generateExcelDownload} styles="mr-0.5 w-full flex justify-center sm:w-auto" > 
                <ExcelIcon size={20} styles='mr-2' />
            </ButtonLight>
        </div>
    </header>

    <div class="mt-8 flex gap-x-5">
        <div class="dropdown dropdown-bottom w-[55%] sm:w-48 max-w-full h-8">
            <span class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500">Años</span>
            <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none flex items-center justify-between">
                Años seleccionados
                <ChevronIcon size={18} styles="text-black" />
            </div>
            <ul tabindex="-1" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-lg w-52 -mt-5">
                {#each Object.entries(cols) as [year]}
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_{year}">
                            {year}
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_{year}" bind:checked={cols[year]} />
                        </label>
                    </li>
                {/each}
            </ul>
        </div>

        <!-- Filters -->

        <div class="drawer drawer-end w-full sm:w-fit max-w-full mt-[1px]">
            <input id="filters" type="checkbox" class="drawer-toggle" bind:checked={openedDrawer} />
            <div class="drawer-content">
            <label for="filters" class="drawer-button flex gap-2 items-center justify-center bg-white text-sm px-5 rounded-md shadow h-10 cursor-pointer">
                Más filtros <FilterIcon size={16} />
            </label>
            </div>
            <div class="drawer-side">
                <label for="filters" aria-label="close sidebar" class="drawer-overlay"></label>
                <div class="menu bg-base-200 text-base-content min-h-full w-80 px-2 py-4 pt-5 z-[99]">
                    
                    <h1 class="flex items-center text-2xl gap-2 px-1.5">
                        <FilterIcon size={24} />
                        Filtros
                    </h1>

                    <hr class="mt-5 mx-2">

                    <div class="mt-5 flex flex-col gap-y-2.5">

                        <div>
                            <label class="form-control w-auto px-2">
                                <div class="label">
                                <span class="label-text-alt">Eje de gobierno</span>
                                </div>
                                <select class="select select-bordered text-xs px-3" bind:value={axis_filter}>
                                    <option value='all' selected>Todos</option>
                                    {#each axis as {id, name} }
                                        <option value={id}>{name}</option>
                                    {/each}
                                </select>
                            </label>
                        </div>

                        <div>
                            <label class="form-control w-auto px-2">
                                <div class="label">
                                <span class="label-text-alt">Tema</span>
                                </div>
                                <select class="select select-bordered text-xs px-3" bind:value={theme_filter}>
                                    <option value='all' selected>Todos</option>
                                    {#each themes as {value, label} }
                                        <option value={value}>{label}</option>
                                    {/each}
                                </select>
                            </label>
                        </div>

                        <div>
                            <label class="form-control w-auto px-2">
                                <div class="label">
                                <span class="label-text-alt">Regiones</span>
                                </div>
                                <select class="select select-bordered text-xs px-3" bind:value={regions_filter}>
                                    <option value='all' selected>Todos</option>
                                    {#each regions as {value, label} }
                                        <option value={value}>{label}</option>
                                    {/each}
                                </select>
                            </label>
                        </div>

                        <div>
                            <label class="form-control w-auto px-2">
                                <div class="label">
                                <span class="label-text-alt">Fuente financiamiento</span>
                                </div>
                                <select class="select select-bordered text-xs px-3" bind:value={financial_sources_filter}>
                                    <option value='all' selected>Todos</option>
                                    {#each financial_sources as {value, label} }
                                        <option value={value}>{label}</option>
                                    {/each}
                                </select>
                            </label>
                        </div>

                        <div class="grid grid-cols-2">
                            <div>
                                <label class="form-control w-auto px-2">
                                    <div class="label">
                                    <span class="label-text-alt">Plan ejecutivo</span>
                                    </div>
                                    <select class="select select-bordered text-xs px-3" bind:value={executive_plan_filter}>
                                        <option value='all' selected>Todos</option>
                                        {#each keys as index }
                                            <option value={index}>{simpleDictionary[index]}</option>
                                        {/each}
                                    </select>
                                </label>
                            </div>
    
                            <div>
                                <label class="form-control w-auto px-2">
                                    <div class="label">
                                    <span class="label-text-alt">Derecho de vía</span>
                                    </div>
                                    <select class="select select-bordered text-xs px-3" bind:value={right_way_filter}>
                                        <option value='all' selected>Todos</option>
                                        {#each keys as index }
                                            <option value={index}>{simpleDictionary[index]}</option>
                                        {/each}
                                    </select>
                                </label>
                            </div>
                        </div>

                        {#if dependences }
                            <div>
                                <label class="form-control w-auto px-2">
                                    <div class="label">
                                    <span class="label-text-alt">Corresponsable</span>
                                    </div>
                                    <select class="select select-bordered text-xs px-3 max-w-[290px] pr-10" bind:value={secretaries_filter}>
                                        <option value='all' selected>Todos</option>
                                        {#each dependences_temp as {value, label} }
                                            <option value={value}>{label}</option>
                                        {/each}
                                    </select>
                                </label>
                            </div>
                        {/if}

                        <div>
                            <label class="form-control w-auto px-2">
                                <div class="label">
                                    <span class="label-text-alt">Rango fecha de activación</span>
                                </div>
                                <div class="flex items-center gap-x-1.5">
                                    <input type="date" class="input input-bordered w-auto text-xs px-2" bind:value={start_filter} />
                                    <span class="text-[10px]">hasta</span>
                                    <input type="date" class="input input-bordered w-auto text-xs px-2" bind:value={start_end_filter} />
                                </div>
                            </label>
                        </div>

                        {#if status !== 'all' || search !== '' || !all_municipalities || !all_dependences || axis_filter !== 'all' || theme_filter !== 'all' || financial_sources_filter !== 'all' || regions_filter !== 'all' || executive_plan_filter !== 'all' || right_way_filter !== 'all' || start_filter !== '' || start_end_filter !== '' || hasAnyFalseCols(cols)}
                            <div class="flex justify-center py-2 pt-5">
                                <button class="text-xs border-2 border-red-700 text-red-700 px-4 py-2 rounded-md flex justify-center items-center gap-2 font-bold hover:bg-red-700 hover:text-white" on:click={resetFilters}>
                                    Limpiar filtros
                                    <FilterIcon size={14} />
                                </button>
                            </div>
                        {/if}
                        
                    </div>

                </div>
            </div>
        </div>

    </div>

    <div class="mt-10 shadow-sm border rounded-lg overflow-x-auto max-w-[calc(100vw-20px)]">
        <table class="w-full table-auto text-sm text-left">
            <thead class="bg-ins-700 text-gray-100 font-medium border-b">
                <tr>
                    <th class="py-3 px-4 max-w-72 w-10">#</th>
                    <th class="py-3 px-2">Nombre</th>
                    <th class="py-3 px-2">Fecha</th>
                    <th class="py-3 px-2" class:hidden={typeTable !== 'project'}>Dependencia</th>
                    <th class="py-3 px-2" class:hidden={typeTable !== 'dependence'}>Corresponsable(s)</th>
                    <th class="py-3 px-2">
                        <div class="flex items-center space-x-2">
                            Avance
                            {#if orderByPercent !== 'asc'}
                                <button on:click={() => orderByPercent = 'asc'}>
                                    <ChevronDownIcon size={20} />
                                </button>
                                {:else}
                                <button on:click={() => orderByPercent = 'desc'}>
                                    <ChevronUpIcon size={20} />
                                </button>
                            {/if}
                        </div>
                    </th>
                    <th class="py-3 px-2">Recurso aplicado</th>
                    <th class="py-3 px-2">Nota</th>
                </tr>
            </thead>
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
                        <td class="px-2 py-3">
                            <div class="flex flex-col">
                                <span>{project.start ? formatDate(project.start) : '-'} </span>
                                <span>{project.end ? formatDate(project.end) : '-'}</span>
                            </div>
                        </td>
                        <td class="px-2 py-3 text-wrap max-w-52" class:hidden={typeTable !== 'project'}>{project.dependence?.data?.label ?? '-'}</td>
                        <td class="px-2 py-3 text-wrap max-w-52" class:hidden={typeTable !== 'dependence'}>
                            {project.secretaries?.data ? project.secretaries?.data.map(s => s.label).join(', ') : 'Sin corresponsables'}
                        </td>
                        <td class="px-2 py-3 text-wrap max-w-52">{getLatestProgress(project) ?? calculateProgressActions(project.actions.list)}%</td>
                        <td class="px-2 py-3 text-wrap max-w-52">
                            {project.finance_source_history?.data?.length > 0 ? formatNumber(Number(project.finance_source_history?.data[0].source)) : '$0'}
                        </td>
                        <td class="pl-2 pr-4 py-3 text-wrap max-w-52">
                            <div class="max-w-52 w-full truncate">
                                {#if project.note }
                                    <button class="hover:text-ins-600" on:click={()=>openNote(project.name, project.note)}>{project.note}</button>
                                {:else}
                                    Sin nota
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

<dialog id="note_modal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box sm:w-8/12 sm:min-w-[50%] sm:max-w-[800px]">
        <h3 class="font-bold text-lg">{modalData.title}</h3>
        <div class="w-full mt-5">
            {modalData.note ? modalData.note : 'No hay notas registradas.'}
        </div>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn hover:bg-red-600 hover:text-white">Cerrar</button>
            </form>
        </div>
    </div>
</dialog>

<style>
    .dropdown-content {
		top: 70px;
    	left: -4px;
		max-height: 200px;
	}
    .dropdown-content label:active {
        background: #d9d9d9 !important;
        color: initial !important;
    }
	.dropdown-content-int {
		overflow-y: auto;
		overflow-x: hidden;
		flex-direction: row;
	}
</style>