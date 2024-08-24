<script>
	import ArticleNewHeader from '$components/statistics/ArticleNewHeader.svelte';
	import FilterIcon from './../icons/FilterIcon.svelte';
	import ChevronDownIcon from '$icons/ChevronDownIcon.svelte';
	import ChevronUpIcon from '$icons/ChevronUpIcon.svelte';
	import GoBackIcon from '$icons/GoBackIcon.svelte';
	import ExcelIcon from '$icons/ExcelIcon.svelte';
	// import ButtonNormal from '$components/ButtonNormal.svelte';
	import ChevronIcon from '$icons/ChevronIcon.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
	import { messageAlert, handleLoading, messageForAdminView, formatDate, closeAlert, formatAmount, formatDateMonthAndYear } from '$lib/utilities.js';
    import SectionTitle from '$components/SectionTitle.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import { statutes, municipalities as municipalities_temp, sources as sources_temp, themes, regions, sources as financial_sources } from '$lib/data.js';
    import Pagination from '$components/Pagination.svelte';
    import ExcelJS from 'exceljs';
    import SearchIcon from '$icons/SearchIcon.svelte';
    import { onMount } from 'svelte';

    export let role;
    export let typeProject;
    export let dependenceSelected;
    export let dependences_temp;
    export let axis;
    export let search;

    const simpleDictionary = {
        'partial': 'Parcial',
        'yes': 'Sí',
        'no': 'No',
        'no-apply': 'No aplica'
    }

    const keys = Object.keys(simpleDictionary);

    const sources = sources_temp.reduce((acc, curr) => {
        acc[curr.value] = curr.label;
        return acc;
    }, {});

    let projects = [];
    let dataFiltered = projects ? [...projects] : [];
    let all_municipalities = true;
    let municipalities = municipalities_temp.map(mun => ({...mun, visible: true}));
    let dependences = dependences_temp.map(mun => ({...mun, visible: true}));

    let status = 'all';
    let orderByDate = !['missing', 'future'].includes(typeProject) ? 'desc' : '';
    let orderByDateEvent = ['missing', 'future'].includes(typeProject) ? 'desc' : '';
    let all_dependences = true;

    let openedDrawer = false;

    let totalsByStatus = {};

    statutes.forEach(status => {
        totalsByStatus[status.value] = 0;
    });

    const filtered = () => {
        if (projects === null) return;

        dataFiltered = projects.filter(ax => {
            const searchString = search.toLowerCase();
            const searchWords = searchString.split(' ');

            const matchesSearch = searchWords.every(word => (
                (ax.name && ax.name.toLowerCase().includes(word)) ||
                (ax.start && ax.start.toLowerCase().includes(word)) ||
                (ax.end && ax.end.toLowerCase().includes(word)) ||
                (ax.dependence.data.label && ax.dependence.data.label.toLowerCase().includes(word)) ||
                (ax.manager.data.label && ax.manager.data.label.toLowerCase().includes(word))
            ));

            const systemStatus = statutes.find(s => s.value === ax.status)?.value || 'without-status';
            // const statusProgress = ax.progress.data && ax.progress.data.length > 0 ? ax.progress.data[0].status : systemStatus;

            const matchesStatus = status === 'all' || systemStatus === status;

            const startYear = new Date(ax.start).getFullYear();
            const matchesYear = cols[startYear] && cols[startYear] === true;

            // Filtros adicionales
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

            const response = matchesSearch && matchesStatus && matchesYear &&
                            matchesAxis && matchesTheme && matchesFinancialSources &&
                            matchesRegions && matchesExecutivePlan && matchesRightWay &&
                            matchesStart && matchesStartEnd && matchesSecretaries;

            return response;
        });

        dataFiltered = dataFiltered.filter(project => {
            if (all_municipalities) {
                return project;
            } else {
                return project.municipalities?.data?.some(municipality => municipalities.find(m => m.id === municipality.value && m.visible));
            }
        });

        dataFiltered = dataFiltered.filter(project => {
            if (all_dependences) {
                return true;
            } else {
                const dependenceData = project.dependence?.data;
                return dependenceData && dependences.some(d => d.id === dependenceData.value && d.visible);
            }
        });

        if (orderByDate === 'asc') {
            dataFiltered.sort((a, b) => new Date(a.start) - new Date(b.start));
        } else if (orderByDate === 'desc') {
            dataFiltered.sort((a, b) => new Date(b.start) - new Date(a.start));
        }

        if (orderByDateEvent === 'asc') {
            dataFiltered.sort((a, b) => new Date(a.date_event) - new Date(b.date_event));
        } else if (orderByDateEvent === 'desc') {
            dataFiltered.sort((a, b) => new Date(b.date_event) - new Date(a.date_event));
        }

        statutes.forEach(status => {
            totalsByStatus[status.value] = dataFiltered.filter(project => project.status === status.value).length;
        });

    };

    const getStatusFromProgress = ({data}, status) => {

        const systemStatus = statutes.find(s => s.value === status)?.value || 'without-status'

        // if (!data || data.length === 0) {
            return systemStatus;
        // }
        // const process = data[0];
        // return statutes.find(s => s.value === process.status)?.value || systemStatus;
    }

    let startRecord = 0;
    let perPage = 50;
    let endRecord = perPage;

    const changePage = ({detail}) => {
        startRecord = detail.startRecord-1;
        endRecord = detail.endRecord;
    }

    const generateCols = () => {
        const currentYear = new Date().getFullYear();
        const cols = {};

        for (let year = 2023; year <= currentYear + 2; year++) {
            cols[year] = true;
        }

        return cols;
    };

    let cols = generateCols();

    const hasAnyFalseCols = (cols) => {
        return Object.values(cols).some(value => value === false);
    };

    // let modalData = {
    //     id: null,
    //     title: '',
    //     note: '',
    // }

    // const openNewNote = (project) => {
    //     modalData = {
    //         id: project.id,
    //         title: project.name,
    //         note: project.note_meet,
    //     };
    //     const dialog = document.getElementById('new_note');
    //     dialog.showModal();
    // };

    // const saveNote = async () => {

    //     if(role === 'super-view') { 
    //         messageForAdminView();
    //         return;
    //     }

    //     document.getElementById('new_note').close();
    //     handleLoading();

    //     try {

    //         const action = '/api/save-note-meet-project/'
            
    //         const formData = new FormData();
            
    //         formData.append('project', modalData.id);
    //         formData.append('note', modalData.note);

    //         const response = await fetch(action, {
    //             method: 'POST',
    //             body: formData
    //         });

    //         const resp = await response.text();
    //         const {success} = JSON.parse(resp);

    //         if( success ) {
    //             const projectId = projects.findIndex(a => a.id === modalData.id);
    //             if (projectId !== -1) {
    //                 projects[projectId].note_meet = modalData.note;
    //             }
    //             filtered();
    //             messageAlert('success',`Nota actualizada correctamente.`);
    //             return;
    //         }

    //         throw new Error;

    //     } catch (error) {
    //         messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
    //         document.getElementById('new_note').showModal();
    //     }
    // }

    const generateExcelDownload = async () => {
        handleLoading('Generando Excel...');
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('PROYECTOS');

            const titleStyle = {
                font: { bold: true, color: { argb: 'FFFFFFFF' } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e6f80' } },
                alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
            };

            const rowStyle = { height: 25, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true } };

            const contentStyle = {
                alignment: { vertical: 'middle', wrapText: true }
            };

            const borderStyle = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };

            worksheet.getRow(1).height = 30;

            let colIndex = 0;
            const activeFields = Object.values(fields).filter(field => field.active);
            activeFields.forEach(field => {
                const cell = worksheet.getCell(`${String.fromCharCode(65 + colIndex)}1`);
                cell.value = field.label.toUpperCase();
                cell.style = titleStyle;
                cell.border = borderStyle;
                worksheet.getColumn(colIndex + 1).width = field.label.length + 30;
                colIndex++;
            });

            let startRow = 2;

            for (const project of dataFiltered) {
                worksheet.getRow(startRow).height = rowStyle.height;

                colIndex = 0;
                activeFields.forEach(field => {
                    const cellAddress = `${String.fromCharCode(65 + colIndex)}${startRow}`;
                    const cell = worksheet.getCell(cellAddress);
                    switch (field.value) {
                        case 'status':
                            cell.value = statutes.find(s => s.value === getStatusFromProgress(project.progress, project.status))?.label || 'Sin estatus';
                            break;
                        case 'name':
                            cell.value = project.name || 'Sin nombre de proyecto';
                            break;
                        case 'dependence':
                            cell.value = project.dependence?.data?.label || 'Sin dependencia';
                            break;
                        case 'secretaries':
                            cell.value = project.secretaries?.data ? project.secretaries?.data.map(s => s.label).join(', ') : 'Sin corresponsables';
                            break;
                        case 'start':
                            cell.value = ['general', 'past'].includes(typeProject) ? formatDate(project.start) : formatDateMonthAndYear(project.start);
                            break;
                        case 'date_event':
                            cell.value = project.date_event ? formatDate(project.date_event) : 'Sin fecha';
                            break;
                        case 'vobo':
                            cell.value = simpleDictionary[project.vobo];
                            break;
                        case 'executive_plan':
                            cell.value = simpleDictionary[project.executive_plan];
                            break;
                        case 'municipalities':
                            cell.value = project.municipalities?.data ? project.municipalities?.data.map(s => s.label).join(', ') : 'Sin municipios';
                            break;
                        case 'regions':
                            cell.value = project.regions?.data ? project.regions?.data.map(s => s.label).join(', ') : 'Sin región';
                            break;
                        case 'axis':
                            cell.value = project.axis.data?.label || 'Sin eje';
                            break;
                        case 'transverse_axis':
                            cell.value = project.transverse_axis.data?.label || 'Sin eje transversal';
                            break;
                        case 'theme':
                            cell.value = Array.isArray(project.theme?.data) ? project.theme?.data.map(s => s.label).join(', ') : project.theme?.data?.label || 'Sin tema';
                            break;
                        case 'commitment':
                            cell.value = project.commitment.data?.label || 'Sin compromiso';
                            break;
                        case 'amount':
                            cell.value = `${formatAmount(project.amount) || '0'}$`;
                            break;
                        case 'source':
                            cell.value = project.source?.list && project.source?.list.length > 0 ? project.source?.list.map(s => sources[s.source] || 'Sin fuente financiamiento').join(', ') : 'Sin fuente financiamiento';
                            break;
                        case 'finance_progress':
                            cell.value = calculateConsumedPercentage((project.finance_source_history?.data?.length > 0 ? project.finance_source_history?.data[0].source : 0), project.amount ) || 0;
                            break;
                        case 'percent_progress':
                            cell.value = `${!getLatestProgress(project) ? 0 : getLatestProgress(project).type_progress === 'supervisor' ? getLatestProgress(project).percent : getLatestProgress(project).percent}%`;
                            break;
                        case 'description_progress':
                            cell.value = project.progress_supervisor?.data.length > 0 ? project.progress_supervisor?.data[0].general : project.progress?.data.length > 0 ? project.progress?.data[0].general : 'Sin descripción';
                            break;
                        case 'supervision':
                            cell.value = project.supervision ? 'Si' : 'No';
                            break;
                        case 'political_consideration':
                            cell.value = project.political_consideration || '-';
                            break;
                        case 'right_way':
                            cell.value = simpleDictionary[project.right_way] || 'No';
                            break;
                        case 'planning':
                            cell.value = project.planning || '-';
                            break;
                        default:
                            cell.value = '-';
                    }
                    cell.style = contentStyle;
                    cell.border = borderStyle;
                    colIndex++;
                });

                startRow++;
            }

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Proyectos (${typeProjectsDictionary[typeProject]}) ${dependenceSelected && dependenceSelected !== 'all' ? `(${dependenceSelected?.name || 'Sin secretaria'})` : ''} ${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            closeAlert();
        } catch (error) {
            messageAlert('error', 'Ha ocurrido un error inesperado, intente nuevamente.');
        }
    };

    const typeProjectsDictionary = {
        general: 'Catálogo general',
        past: '¿Qué hemos hecho?',
        missing: '¿Qué nos falta?',
        future: '¿Qué sigue?'
    }

    onMount(() => {
        getProjects();
    });

    const getProjects = async () => {
        try {
            handleLoading();
            const action = '/api/get-project/'
            const formData = new FormData();
            formData.append('typeProject', typeProject);

            if ( dependenceSelected !== 'all' ) {
                formData.append('dependence', dependenceSelected.id);
            } else {
                formData.append('dependence', dependenceSelected);
            }
            
            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });
            const resp = await response.text();
            const {success, data} = JSON.parse(resp);

            if ( typeProject === 'missing' ) {
                data.sort((a, b) => b.featured - a.featured);
            }

            projects = data;
            
            filtered();

            if (!success) throw new Error(message);
            
            closeAlert();

        } catch (error) {
            messageAlert('error', 'Ha ocurrido un error inesperado, intente nuevamente.');
        }
    }

    const getLatestProgress = (proj) => {
        let latestProgress = null;

        if (proj.progress_supervisor && proj.progress_supervisor.data.length > 0) {
            latestProgress = proj.progress_supervisor.data.reduce((prev, current) => (prev.created_at > current.created_at ? prev : current));
            latestProgress.type_progress = 'supervisor';
        }
        else if (proj.progress && proj.progress.data.length > 0) {
            latestProgress = proj.progress.data.reduce((prev, current) => (prev.created_at > current.created_at ? prev : current));
            latestProgress.type_progress = 'manager';
        }

        return latestProgress;
    }

    const handleVisibleDependences = () => {
		if (all_dependences) {
			dependences = [...dependences].map(mun => ({...mun, visible: true}));
		} else {
			dependences = [...dependences].map(mun => ({...mun, visible: false}));
		}
		filtered();
	}

	const handleChangeVisibleDependence = () => {
		all_dependences = dependences.every(mun => mun.visible);
		filtered();
	}

    const handleVisibleMunicipalities = () => {
		if (all_municipalities) {
			municipalities = [...municipalities].map(mun => ({...mun, visible: true}));
		} else {
			municipalities = [...municipalities].map(mun => ({...mun, visible: false}));
		}
		filtered();
	}

	const handleChangeVisibleMunicipality = () => {
		all_municipalities = municipalities.every(mun => mun.visible);
		filtered();
	}

    // const handleUpdateFeatured = async (id, featured) => {

    //     if (typeProject !== 'missing') return;

    //     try {
    //         handleLoading();
    //         const action = '/api/update-featured/'
    //         const formData = new FormData();
    //         formData.append('id', id);
    //         formData.append('featured', featured);

    //         const response = await fetch(action, {
    //             method: 'POST',
    //             body: formData
    //         });
    //         const resp = await response.text();
    //         const {success} = JSON.parse(resp);

    //         const index = projects.findIndex(p => p.id === id);
    //         projects[index].featured = featured;
    //         if ( typeProject === 'missing' ) {
    //             projects.sort((a, b) => b.featured - a.featured);
    //         }
    //         filtered();

    //         if (!success) throw new Error(message);
            
    //         closeAlert();

    //     } catch (error) {
    //         messageAlert('error', 'Ha ocurrido un error inesperado, intente nuevamente.');
    //     }
    // }

    const calculateConsumedPercentage = (consumed, total) => {
        if (total <= 0) {
            return 0 + '%';
        }

        const percentage = (consumed / total) * 100;
        return percentage.toFixed(2) + '%';
    };

    let fields = {
        status: {
            value: 'status',
            active: false,
            label: 'Estatus'
        },
        name: {
            value: 'name',
            active: false,
            label: 'Nombre'
        },
        dependence: {
            value: 'dependence',
            active: false,
            label: 'Secretaria'
        },
        secretaries: {
            value: 'secretaries',
            active: false,
            label: 'Corresponsable(s)'
        },
        start: {
            value: 'start',
            active: false,
            label: ['general', 'past'].includes(typeProject) ? 'Fecha activación' : 'Fecha de programación'
        },
        date_event: {
            value: 'date_event',
            active: false,
            label: 'Fecha evento'
        },
        vobo: {
            value: 'vobo',
            active: false,
            label: 'VoBo financiero'
        },
        executive_plan: {
            value: 'executive_plan',
            active: false,
            label: 'Plan ejecutivo'
        },
        municipalities: {
            value: 'municipalities',
            active: false,
            label: 'Municipios'
        },
        regions: {
            value: 'regions',
            active: false,
            label: 'Región'
        },
        axis: {
            value: 'axis',
            active: false,
            label: 'Eje gobierno'
        },
        transverse_axis: {
            value: 'transverse_axis',
            active: false,
            label: 'Eje transversal'
        },
        theme: {
            value: 'theme',
            active: false,
            label: 'Temas'
        },
        commitment: {
            value: 'commitment',
            active: false,
            label: 'Compromiso'
        },
        amount: {
            value: 'amount',
            active: false,
            label: 'Inversión'
        },
        source: {
            value: 'source',
            active: false,
            label: 'Fuente financiamiento'
        },
        finance_progress: {
            value: 'finance_progress',
            active: false,
            label: 'Avance financiero'
        },
        percent_progress: {
            value: 'percent_progress',
            active: false,
            label: '% avance'
        },
        description_progress: {
            value: 'description_progress',
            active: false,
            label: 'Descripción avance'
        },
        supervision: {
            value: 'supervision',
            active: false,
            label: 'Supervisión'
        },
        political_consideration: {
            value: 'political_consideration',
            active: false,
            label: 'Consideración política'
        },
        right_way: {
            value: 'right_way',
            active: false,
            label: 'Derecho de vía'
        },
        planning: {
            value: 'planning',
            active: false,
            label: 'Planeación'
        }
    };

    let newField;

    const fieldsVisible = () => {

        if(typeProject === 'general') {
            if ( dependenceSelected?.abbr === 'SIDUM' ) {
                newField = ['status', 'name', 'municipalities', 'amount', 'source', 'finance_progress', 'percent_progress'];
            } else {
                newField = ['status', 'name', 'dependence', 'secretaries', 'start', 'date_event', 'vobo', 'executive_plan', 'municipalities', 'regions', 'axis', 'transverse_axis', 'theme', 'commitment', 'amount', 'source', 'finance_progress', 'percent_progress', 'description_progress', 'supervision', 'political_consideration', 'right_way', 'planning'];
            }
        } else if (typeProject === 'past') {
            if ( dependenceSelected?.abbr === 'SIDUM' ) {
                newField = ['status', 'name', 'municipalities', 'amount', 'source', 'finance_progress', 'percent_progress', 'supervision'];
            } else {
                newField = ['status', 'name', 'dependence', 'secretaries', 'start', 'date_event', 'vobo', 'executive_plan', 'municipalities', 'regions', 'axis', 'transverse_axis', 'theme', 'commitment', 'amount', 'source', 'finance_progress', 'percent_progress', 'description_progress', 'supervision', 'political_consideration', 'right_way', 'planning'];
            }
        } else if (typeProject === 'missing') {
            newField = ['status', 'name', 'municipalities', 'amount', 'date_event', 'source', 'vobo', 'executive_plan', 'right_way'];
        } else if (typeProject === 'future') {
            newField = ['status', 'name', 'municipalities', 'amount', 'date_event', 'source', 'vobo', 'executive_plan', 'right_way'];
        }
        
        newField.forEach(field => {
            fields[field].active = true;
        });
    }

    let axis_filter = 'all';
    let theme_filter = 'all';
    let financial_sources_filter = 'all';
    let regions_filter = 'all';
    let executive_plan_filter = 'all';
    let right_way_filter = 'all';
    let start_filter = '';
    let start_end_filter = '';
    let secretaries_filter = 'all';
    let fields_all = false;

    fieldsVisible();

    // {#if status !== 'all' || search !== '' || !all_municipalities || !all_dependences || axis_filter !== 'all' || theme_filter !== 'all' || financial_sources_filter !== 'all' || regions_filter !== 'all' || executive_plan_filter !== 'all' || right_way_filter !== 'all' || start_filter !== '' || start_end_filter !== '' || hasAnyFalseCols(cols)}

    const resetFilter = () => {
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
        fieldsVisible();
        filtered();
    }

    const updateFields = () => {
        fields_all = Object.values(fields).every(f => f.active === true);
    }

    const changeAllFields = () => {
        fields = Object.entries(fields).reduce((acc, [key, value]) => {
            acc[key] = {...value, active: fields_all};
            return acc;
        }, {});
    }

    $: filtered(search, cols, orderByDate, orderByDateEvent, axis_filter, theme_filter, financial_sources_filter, regions_filter, executive_plan_filter, right_way_filter, start_filter, start_end_filter, secretaries_filter);

    $: updateFields(fields);

</script>
  
<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-1 sm:px-2">
    <div class="flex sm:justify-between mb-5 items-center sm:flex-row flex-col-reverse gap-4 sm:gap-1">
        <h2 class="text-xl sm:text-3xl font-semibold text-ins-700 uppercase max-w-[80%] text-pretty">{dependenceSelected === 'all' ? 'Todos los proyectos' : dependenceSelected.name}</h2>
        <div class="flex justify-end w-full sm:w-fit">
            <ButtonLight text="Ir Atrás" styles='max-h-10' action={() => typeProject = null}>
                <GoBackIcon size={20} styles='mr-1' />
            </ButtonLight>
        </div>
    </div>
    <div class="w-full flex flex-row justify-start items-center">
        <SectionTitle title="Proyectos ({typeProjectsDictionary[typeProject]})" />
    </div>
    <div class="grid grid-cols-1 gap-1 shadow-md rounded-md bg-white mt-8 mb-10">
        <div class="sm:flex grid grid-cols-2 gap-6 w-full sm:stats pt-4">
            {#each statutes as st }
                <ArticleNewHeader status={st} quantity={totalsByStatus[st.value]} total={dataFiltered.length || 0} /> 
            {/each}
        </div>
    </div>
    <section class="flex justify-between sm:flex-row flex-col items-center mt-14 w-full">
        <div class="flex gap-x-2 gap-y-8 sm:gap-x-2 sm:gap-y-2 mb-3 sm:mb-0 w-full sm:w-auto flex-wrap justify-between sm:justify-start">
            <div class="w-[40%] sm:w-fit max-w-full relative">
                <label class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500" for="status">Estatus</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="status" id="status" bind:value={status} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each statutes as st}
                        <option value={st.value}>{st.label}</option>
                    {/each}
                </select>
            </div>
           
            <div class="dropdown dropdown-bottom w-[55%] sm:w-48 max-w-full h-8">
                <span class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500">Años</span>
                <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none flex items-center justify-between">
                    Años seleccionados
                    <ChevronIcon size={18} styles="text-black" />
                </div>
                <ul tabindex="-1" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-lg w-52">
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

            <div class="dropdown dropdown-bottom w-full sm:w-36 max-w-full">
                <span class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500">Municipios</span>
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
                                <label class="flex flex-row w-full justify-between active:bg-red-500" for="mun_{mun.id}">
                                    {mun.name}
                                    <input type="checkbox" class="checkbox checkbox-xs" id="mun_{mun.id}" bind:checked={mun.visible} on:change={handleChangeVisibleMunicipality} />
                                </label>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>

            {#if dependenceSelected === 'all' }
                <div class="dropdown dropdown-bottom w-full sm:w-36 max-w-full sm:mr-2">
                    <span class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500">Secretarias</span>
                    <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
                        Secretarias
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
                                    <label class="flex flex-row w-full justify-between active:bg-red-500" for="dep_{dep.id}">
                                        {dep.name}
                                        <input type="checkbox" class="checkbox checkbox-xs" id="dep_{dep.id}" bind:checked={dep.visible} on:change={handleChangeVisibleDependence} />
                                    </label>
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}

        </div>
    </section>

    <section class="sm:mt-8 mt-2 flex justify-between sm:flex-row flex-col sm:gap-0 gap-8">
        <div class="flex sm:gap-4 gap-8 sm:flex-row flex-col">
            <div class="relative sm:w-72 transition-all duration-300 w-[100%] flex items-center">
                <SearchIcon />
                <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
            </div>
            <div class="dropdown dropdown-bottom w-full sm:w-56 max-w-full h-8">
                <span class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500">Columnas</span>
                <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none flex items-center justify-between">
                    Columnas seleccionadas
                    <ChevronIcon size={18} styles="text-black" />
                </div>
                <ul tabindex="-1" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-lg w-52 flex flex-col flex-nowrap overflow-y-auto">
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="field_all">
                            Mostrar todas
                            <input type="checkbox" class="checkbox checkbox-xs" id="field_all" bind:checked={fields_all} on:change={changeAllFields} />
                        </label>
                    </li>
                    {#each Object.values(fields) as field}
                        <li class="w-full">
                            <label class="flex flex-row w-full justify-between active:bg-red-500" for="field_{field.value}">
                                {field.label}
                                <input type="checkbox" class="checkbox checkbox-xs" id="field_{field.value}" bind:checked={field.active} />
                            </label>
                        </li>
                    {/each}
                </ul>
            </div>

            <!-- Filters -->

            <div class="drawer drawer-end w-full sm:w-fit max-w-full">
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

                            <div>
                                <label class="form-control w-auto px-2">
                                    <div class="label">
                                    <span class="label-text-alt">Corresponsable</span>
                                    </div>
                                    <select class="select select-bordered text-xs px-3 max-w-[290px] pr-10" bind:value={secretaries_filter}>
                                        <option value='all' selected>Todos</option>
                                        {#each dependences_temp as {id, name} }
                                            <option value={id}>{name}</option>
                                        {/each}
                                    </select>
                                </label>
                            </div>

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
                                    <button class="text-xs border-2 border-red-700 text-red-700 px-4 py-2 rounded-md flex justify-center items-center gap-2 font-bold hover:bg-red-700 hover:text-white" on:click={resetFilter}>
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
        <div class="flex gap-x-2">
            <ButtonLight text="Descargar proyectos" action={generateExcelDownload} styles="mr-0.5 w-full flex justify-center sm:w-auto" > 
                <ExcelIcon size={20} styles='mr-2' />
            </ButtonLight>
        </div>
    </section>

    <div class="mt-4 shadow-sm border rounded-lg overflow-x-auto overflow-y-hidden custom-max-w w-full">
        <table class="w-full table-auto text-sm text-left overflow-x-auto overflow-y-hidden border-collapse">
            <thead class="bg-ins-700 text-gray-100 font-medium border-b">
            <tr>
                <th class="py-3 px-4 max-w-16 w-10">#</th>
                {#each Object.values(fields) as f }
                    {#if f.value !== 'start' && f.value !== 'date_event' }
                        {#if f.active }<th class="py-3 px-2 text-nowrap">{f.label}</th>{/if}
                    {:else}
                        {#if f.active }
                            <th class="py-3 px-2 text-nowrap w-fit">
                                <div class="flex items-center space-x-2">
                                    {f.label}
                                    {#if f.value === 'start' }
                                        {#if orderByDate !== 'asc'}
                                            <button on:click={() => {orderByDate = 'asc'; orderByDateEvent = ''}}>
                                                <ChevronDownIcon size={20} />
                                            </button>
                                            {:else}
                                            <button on:click={() => {orderByDate = 'desc'; orderByDateEvent = ''}}>
                                                <ChevronUpIcon size={20} />
                                            </button>
                                        {/if}
                                    {:else}
                                        {#if orderByDateEvent !== 'asc'}
                                            <button on:click={() => {orderByDateEvent = 'asc'; orderByDate = ''}}>
                                                <ChevronDownIcon size={20} />
                                            </button>
                                            {:else}
                                            <button on:click={() => {orderByDateEvent = 'desc'; orderByDate = ''}}>
                                                <ChevronUpIcon size={20} />
                                            </button>
                                        {/if}
                                    {/if}
                                </div>
                            </th>
                        {/if}
                    {/if}
                {/each}
            </tr>
            </thead>
            <tbody class="text-gray-600 divide-y">
                {#each dataFiltered as item, idx}
                    {#if idx >= startRecord && idx < endRecord}
                        <tr class="bg-white h-auto sm:h-[84px]">
                            <td class="px-4 py-3 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                            <td class:hidden={!fields.status.active} class="px-2 py-4 max-w-12">
                                {#if typeProject !== 'past'}
                                    <div class="flex justify-center relative">
                                        <!-- <button on:click={() => handleUpdateFeatured(item.id, !item.featured)} class="focus:outline-none"> -->
                                            <div data-tip={statutes.find(s=> s.value === getStatusFromProgress(item.progress, item.status))?.label || 'Sin estatus'} class="w-5 h-5 tooltip {statutes.find(s=> s.value === getStatusFromProgress(item.progress, item.status))?.color || 'bg-gray-400'} rounded-md"></div>
                                            {#if item.vobo === 'no' || item.executive_plan === 'no' }
                                                <div class="absolute right-3 top-0">
                                                    <div class="h-2.5 w-2.5 bg-red-700 border border-white z-50 rounded-md"></div>
                                                </div>
                                            {/if}
                                        <!-- </button> -->
                                    </div>
                                {:else}
                                    <div class="flex justify-center">
                                        <div data-tip={statutes.find(s=> s.value === getStatusFromProgress(item.progress, item.status))?.label || 'Sin estatus'} class="w-5 h-5 tooltip {statutes.find(s=> s.value === getStatusFromProgress(item.progress, item.status))?.color || 'bg-gray-400'} rounded-md"></div>
                                    </div>
                                {/if}
                            </td>
                            <td class:hidden={!fields.name.active} class="px-2 py-3">
                                <div class="w-[300px]" class:text-red-600={item.vobo === 'no' || item.executive_plan === 'no'}>
                                    {#if role !== 'dependence' }
                                        <a href="/proyectos/ejecutiva/{item.id}" target="_blank" class="hover:text-ins-500">
                                            {item.name}
                                        </a>
                                    {:else}
                                        {item.name}
                                    {/if}
                                </div>
                            </td>
                            <td class:hidden={!fields.dependence.active} class="px-2 py-3">
                                <div class="w-[300px]">
                                    {item.dependence?.data?.label || 'Sin dependencia'}
                                </div>
                            </td>
                            <td class:hidden={!fields.secretaries.active} class="px-2 py-3">
                                <div class="min-w-[100px]">
                                    {item.secretaries?.data ? item.secretaries?.data.map(s => s.label).join(', ') : 'Sin corresponsables'}
                                </div>
                            </td>
                            <td class:hidden={!fields.start.active} class="px-2 py-3 w-[150px]">
                                {#if ['general', 'past'].includes(typeProject)}
                                    {formatDate(item.start)}
                                {:else}
                                    {formatDateMonthAndYear(item.start)}
                                {/if}
                            </td>
                            <td class:hidden={!fields.date_event.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {item.date_event ? formatDate(item.date_event) : 'Sin fecha'}
                                </div>
                            </td>
                            <td class:hidden={!fields.vobo.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {simpleDictionary[item.vobo]}
                                </div>
                            </td>
                            <td class:hidden={!fields.executive_plan.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {simpleDictionary[item.executive_plan]}
                                </div>
                            </td>
                            <td class:hidden={!fields.municipalities.active} class="px-2 py-3">
                                <div class="w-[200px]">
                                    <!-- <div class="tooltip tooltip-right" data-tip="{item.municipalities?.data ? item.municipalities?.data.map(s => s.label).join(', ') : 'Sin municipios'}"> -->
                                        <!-- {item.municipalities?.data.length || 0} -->
                                        {item.municipalities?.data ? item.municipalities.data.length >= 38 ? 'Todos' : item.municipalities?.data.map(s => s.label).join(', ') : 'Sin municipios'}
                                    <!-- </div> -->
                                </div>
                            </td>
                            <td class:hidden={!fields.regions.active} class="px-2 py-3">
                                <div class="w-[200px]">
                                    {item.regions?.data ? item.regions?.data.map(s => s.label).join(', ') : 'Sin región'}
                                </div>
                            </td>
                            <td class:hidden={!fields.axis.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {item.axis.data?.label || 'Sin eje'}
                                </div>
                            </td>
                            <td class:hidden={!fields.transverse_axis.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {item.transverse_axis.data?.label || 'Sin eje transversal'}
                                </div>
                            </td>
                            <td class:hidden={!fields.theme.active} class="px-2 py-3">
                                <div class="w-[200px]">
                                    {#if Array.isArray(item.theme?.data) }
                                        {item.theme?.data ? item.theme?.data.map(s => s.label).join(', ') : 'Sin temas'}
                                    {:else}
                                        {item.theme?.data?.label || 'Sin tema'}
                                    {/if}
                                </div>
                            </td>
                            <td class:hidden={!fields.commitment.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {item.commitment.data?.label || 'Sin compromiso'}
                                </div>
                            </td>
                            <td class:hidden={!fields.amount.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {formatAmount(item.amount) || '0'}$
                                </div>
                            </td>
                            <td class:hidden={!fields.source.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {item.source?.list && item.source?.list.length > 0 ? item.source?.list.map(s => sources[s.source] || 'Sin fuente financiamiento').join(', ') : 'Sin fuente financiamiento'}
                                </div>
                            </td>
                            <td class:hidden={!fields.finance_progress.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {calculateConsumedPercentage((item.finance_source_history?.data?.length > 0 ? item.finance_source_history?.data[0].source : 0), item.amount ) || 0}
                                </div>
                            </td>
                            <td class:hidden={!fields.percent_progress.active} class="px-2 py-3">
                                <div class="w-[80px]">
                                    {!getLatestProgress(item) ? 0 : getLatestProgress(item).type_progress === 'supervisor' ? getLatestProgress(item).percent : getLatestProgress(item).percent}%
                                </div>
                            </td>
                            <td class:hidden={!fields.description_progress.active} class="px-2 py-3 whitespace-pre-wrap">
                                <div class="w-[400px]">
                                    {item.progress_supervisor?.data.length > 0 ? item.progress_supervisor?.data[0].general : item.progress?.data.length > 0 ? item.progress?.data[0].general : 'Sin descripción'}
                                </div>
                            </td>
                            <td class:hidden={!fields.supervision.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {item.supervision ? 'Si' : 'No'}
                                </div>
                            </td>
                            <td class:hidden={!fields.political_consideration.active} class="px-2 py-3">
                                <div class="w-[200px]">
                                    {item.political_consideration || '-'}
                                </div>
                            </td>
                            <td class:hidden={!fields.right_way.active} class="px-2 py-3">
                                <div class="w-[100px]">
                                    {simpleDictionary[item.right_way] || 'No'}
                                </div>
                            </td>
                            <td class:hidden={!fields.planning.active} class="px-2 py-3">
                                <div class="w-[200px]">
                                    {item.planning || '-'}
                                </div>
                            </td>
                            <!-- <td class="pl-1 pr-4 py-3 whitespace-nowrap">
                                <button class="hover:outline-none rounded-full hover:text-ins-400 p-1.5 transition-colors duration-300" on:click={()=> openNewNote(item)}>
                                    {item.note_meet || 'Sin notas'}
                                </button>
                            </td> -->
                        </tr>
                    {/if}
                {:else}
                    <tr class="bg-white">
                        <td colspan="24" class="p-4">
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
    <footer class="flex w-full mt-5">
        <Pagination total={dataFiltered.length} {perPage} on:handleChangePage={changePage} typeDocuments="proyectos" {openedDrawer} />
    </footer>
</div>

<!-- 
<dialog id="new_note" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box sm:w-8/12 sm:min-w-[50%] sm:max-w-[800px]">
        <h3 class="font-bold text-lg">{modalData.title}</h3>
        <div class="w-full mt-5">
            {#if ['super-admin', 'super-view', 'executive', 'chief', 'governor'].includes(role) }
                <textarea class="w-full min-h-20 outline-gray-300 p-3 bg-gray-100 rounded-md" placeholder="Ingresa una nota" name="note" id="note" bind:value={modalData.note}></textarea>
            {:else}
                {modalData.note ? modalData.note : 'No hay notas registradas.'}
            {/if}
        </div>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn hover:bg-red-600 hover:text-white">{['super-admin', 'super-view', 'executive', 'chief', 'governor'].includes(role) ? 'Cancelar' : 'Cerrar'}</button>
            </form>
            {#if ['super-admin', 'super-view', 'executive', 'chief', 'governor'].includes(role) }
                <ButtonNormal action={saveNote} text="Actualizar" typeButton="button" styles="py-1" />
            {/if}
        </div>
    </div>
</dialog> -->

<style>
    .dropdown-content {
        top: 150% !important;
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
    @media (min-width: 768px) {
        .custom-max-w {
            max-width: calc(100vw - 390px) !important;
        }
    }
</style>