<script>
	import ExcelIcon from '$icons/ExcelIcon.svelte';
	import DownloadIcon from '$icons/DownloadIcon.svelte';
	import ButtonNormal from '$components/ButtonNormal.svelte';
	import NotNoteIcon from '$icons/NotNoteIcon.svelte';
	import NotesIcon from '$icons/NotesIcon.svelte';
	import DuplicateIcon from '$icons/DuplicateIcon.svelte';
	import ChartHistoryIcon from '$icons/ChartHistoryIcon.svelte';
	import ChevronIcon from '$icons/ChevronIcon.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    import Swal from 'sweetalert2';
	import { messageAlert, handleLoading, messageForAdminView, formatDate, formatDateString } from '$lib/utilities.js';
	import DeleteIcon from '$icons/DeleteIcon.svelte';
    import EditIcon from '$icons/EditIcon.svelte';
    import SectionTitle from '$components/SectionTitle.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import { statutes, transverse_axis as transverse_axis_data } from '$lib/data.js';
    import Pagination from '$components/Pagination.svelte';
    import ExcelJS from 'exceljs';
    import SearchIcon from '$icons/SearchIcon.svelte';

    export let handleToggleTable;
    export let reset;
    export let projects;
    export let role;
    export let search;

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

    onMount(() => {
        window.scrollTo({
        top: 0,
        behavior: 'smooth'
        });
    });

    const downloadData = () => {
        const data_temp = {data: projects};
        const data = JSON.stringify(data_temp);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
        URL.revokeObjectURL(url);
        messageAlert('success', 'Data descargada correctamente.');
    }

    let dataFiltered = projects ? [...projects] : [];

    const dispatch = createEventDispatcher();

    let status = 'all';
    // let priority = 'all';
    let transverse_axis = 'all';

    const filtered = () => {
        if (projects === null) return;

        dataFiltered = projects.filter(ax => {
            const searchString = search.toLowerCase();
            const searchWords = searchString.split(' ');

            // const type = types_temp.find(t => t.value === ax.type);

            const matchesSearch = searchWords.every(word => (
                (ax.name && ax.name.toLowerCase().includes(word)) ||
                (ax.start && ax.start.toLowerCase().includes(word)) ||
                (ax.end && ax.end.toLowerCase().includes(word)) ||
                // (type && type.label.toLowerCase().includes(word)) ||
                (ax.dependence.data.label && ax.dependence.data.label.toLowerCase().includes(word)) ||
                (ax.manager.data.label && ax.manager.data.label.toLowerCase().includes(word))
            ));

            const systemStatus = statutes.find(s => s.value === ax.status)?.value || 'without-status';
            // const statusProgress = ax.progress.data && ax.progress.data.length > 0 ? ax.progress.data[0].status : systemStatus;

            const matchesStatus = status === 'all' || systemStatus === status;
            // const matchesPriority = priority === 'all' || ax.priority === priority;
            const matchesTransverseAxis = transverse_axis === 'all' || ax.transverse_axis?.data?.value === transverse_axis;

            const response = matchesSearch && matchesStatus && matchesTransverseAxis;
            return response;
        });
    };

    let startRecord = 0;
    let perPage = 25;
    let endRecord = perPage;

    const changePage = ({detail}) => {
        startRecord = detail.startRecord-1;
        endRecord = detail.endRecord;
    }

    const deleteProject = async ( id ) => {
        
        if(role === 'super-view') { 
            messageForAdminView();
            return;
        }

        const result = await Swal.fire({
			title: "¡No podrás revertir esto!",
			text: `¿Estás seguro de eliminar esté proyecto y sus acciones?`,
			icon: 'warning',
            focusCancel: true,
			showCancelButton: true,
			confirmButtonColor: '#1fabbb',
			cancelButtonColor: '#d33',
			confirmButtonText: '¡Sí, eliminarlo!',
			cancelButtonText: 'Cancelar'
		});

		if (result.isConfirmed) {
			handleLoading();

			try {

                const action = '/api/delete-project/'
                
				const formData = new FormData();
				
                formData.append('project', id);

                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                const resp = await response.text();
                const {success} = JSON.parse(resp);

				if( success ) {
                    const adminIndex = projects.findIndex(a => a.id === id);
                    if (adminIndex !== -1) {
                        projects.splice(adminIndex, 1);
                    }
                    filtered();
					messageAlert('success',`Se ha eliminado el proyecto con éxito`);
                    return;
				}

                throw new Error;

			} catch (error) {
				messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
			}
		}
	}

    $: filtered(search);

    const handleAdd = () => {
        reset();
        handleToggleTable();
    }

    const edit = (project) => {
        dispatch('handleEdit', project);
    }

    const duplicate = (project) => {
        let dataSend = {...project};
        dataSend.id = '';
        dispatch('handleDuplicate', dataSend);
    }

    const diagram = (project) => {
        dispatch('handleSeeDiagram', project);
    }

    let cols = {
        name: true,
        // type: true,
        dependence: true,
        manager: true,
        status: true
    }

    let modalData = {
        id: null,
        title: '',
        note: '',
    }

    const openNewNote = (project) => {
        modalData = {
            id: project.id,
            title: project.name,
            note: project.note,
        };
        const dialog = document.getElementById('new_note');
        dialog.showModal();
    };

    const saveNote = async () => {

        if(role === 'super-view') { 
            messageForAdminView();
            return;
        }

        document.getElementById('new_note').close();
        handleLoading();

        try {

            const action = '/api/save-note-project/'
            
            const formData = new FormData();
            
            formData.append('project', modalData.id);
            formData.append('note', modalData.note);

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success} = JSON.parse(resp);

            if( success ) {
                const projectId = projects.findIndex(a => a.id === modalData.id);
                if (projectId !== -1) {
                    projects[projectId].note = modalData.note;
                }
                filtered();
                messageAlert('success',`Nota actualizada correctamente.`);
                return;
            }

            throw new Error;

        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
            document.getElementById('new_note').showModal();
        }
    }

    const getStatusFromProgress = ({data}, status, color = false) => {
        if ( !color ) {
            const systemStatus = statutes.find(s => s.value === status)?.label || 'Sin estatus';
            // if (!data || data.length === 0) {
                return systemStatus;
            // }
            // const process = data[0];
            // return statutes.find(s => s.value === process.status)?.label || systemStatus;
        } else {
            const systemStatusColor = statutes.find(s => s.value === status)?.color || 'bg-gray-500';
            // if (!data || data.length === 0) {
                return systemStatusColor;
            // }
            // const process = data[0];
            // return statutes.find(s => s.value === process.status)?.color || systemStatusColor;
        }
    }

    const generateExcelDownload = async () => {

        try {
            const templateResponse = await fetch('/template-projects.xlsx');
            if (!templateResponse.ok) {
                throw new Error('No se pudo obtener la plantilla');
            }
            const arrayBuffer = await templateResponse.arrayBuffer();

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1);

            dataFiltered.forEach((project, index) => {
                const rowIndex = index + 2;
                const row = worksheet.getRow(rowIndex);

                row.getCell(1).value = project.name;
                row.getCell(2).value = statutes.find(s => s.value === project.status)?.label || 'Sin estatus';
                row.getCell(3).value = project.dependence?.data?.label || 'Sin secretaria';
                row.getCell(4).value = project.secretaries?.data ? project.secretaries?.data.map(s => s.label).join(', ') : 'Sin corresponsables';
                row.getCell(5).value = project.beneficiaries.list.length > 0 ? project.beneficiaries.list.reduce((acc, b) => acc + b.amount, 0) : 0;
                row.getCell(6).value = project.municipalities.data ? project.municipalities.data.map(b => b.label).join(', ') : 'Sin municipios';
                row.getCell(7).value = project.amount || 0;
                row.getCell(8).value = project.progress.data.length > 0 ? `${project.progress.data[0].percent}%` : 'Sin avance';
                row.getCell(9).value = project.progress.data.length > 0 ? project.progress.data[0].general : 'Sin descripción';
                row.getCell(10).value = project.progress_supervisor.data.length > 0 ? `${project.progress_supervisor.data[0].percent}%` : 'Sin avance';
                row.getCell(11).value = project.progress_supervisor.data.length > 0 ? project.progress_supervisor.data[0].general : 'Sin descripción';
                row.getCell(12).value = (project.sub_projects && project.sub_projects.data && project.sub_projects.data.length > 0) ? project.sub_projects.data.map((subProject, index) => `${index + 1}. ${subProject.name}`).join("\n") : "Sin subproyectos";

                if (project.status === 'finished') {
                    row.getCell(13).value = project.end_project.date ? formatDateString(project.end_project.date) : 'Sin fecha';
                    row.getCell(14).value = typeEnd.find(t => t.value === project.end_project.type)?.label || 'Sin tipo';
                    row.getCell(15).value = project.end_project.total_amount || 0;
                    row.getCell(16).value = project.end_project.description || 'Sin descripción';
                    row.getCell(17).value = project.end_project.beneficiaries.length > 0 ? project.end_project.beneficiaries.map((b, index) => `${index + 1}. ${b.group.label} - ${b.amount}`).join("\n") : 'Sin beneficiarios';
                    row.getCell(18).value = project.impact?.list && project.impact?.list.length > 0 ? project.impact?.list.map((b, index) => `${index + 1}. ${b.name} ${b.value_closed}`).join("\n") : 'Sin impacto';
                    row.getCell(19).value = project.end_project.location.address || 'Sin dirección';
                    row.getCell(20).value = project.end_project.location.coordinates || 'Sin coordenadas';
                }

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
    
</script>
  
<div class="sm:max-w-screen-xl w-full mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-row justify-start items-center">
        <SectionTitle title="Proyectos" />
    </div>
    <section class="flex justify-between sm:flex-row flex-col items-center mt-9 w-full">
        <div class="flex gap-x-2 gap-y-2 sm:gap-x-2 sm:gap-y-2 flex-row mb-3 sm:mb-0 w-full sm:w-auto flex-wrap justify-between sm:justify-start">
            <div class="w-[47%] sm:w-32 max-w-full relative">
                <label class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500" for="status">Estatus</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="status" id="status" bind:value={status} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each statutes as st}
                        <option value={st.value}>{st.label}</option>
                    {/each}
                </select>
            </div>
            <!-- <div class="w-[45%] sm:w-32 max-w-full relative">
                <label class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500" for="priority">Prioridad</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="priority" id="priority" bind:value={priority} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each priorities as pr}
                        <option value={pr.value}>{pr.label}</option>
                    {/each}
                </select>
            </div> -->
            <div class="w-[47%] sm:w-48 max-w-full relative">
                <label class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500" for="transverse_axis">Eje transversal</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="transverse_axis" id="transverse_axis" bind:value={transverse_axis} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each transverse_axis_data as ta}
                        <option value={ta.value}>{ta.label}</option>
                    {/each}
                </select>
            </div>
            <div class="dropdown dropdown-bottom w-[100%] sm:w-32 max-w-full h-8">
                <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
                    Columnas
                    <ChevronIcon size={18} styles="text-black" />
                </div>
                <ul tabindex="-1" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-lg w-52">
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_name">
                            Nombre
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_name" bind:checked={cols.name} />
                        </label>
                    </li>
                    <!-- <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_type">
                            Tipo
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_type" bind:checked={cols.type} />
                        </label>
                    </li> -->
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_dependence">
                            area
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_dependence" bind:checked={cols.dependence} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_manager">
                            Encargado
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_manager" bind:checked={cols.manager} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_status">
                            Estatus
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_status" bind:checked={cols.status} />
                        </label>
                    </li>
                </ul>
            </div>
        </div>
        {#if role === 'super-admin' }
            <ButtonLight text="Agregar proyecto" action={handleAdd} styles="sm:w-fit w-full flex justify-center sm:w-auto sm:mt-0 mt-2" > 
                <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 icon icon-tabler icon-tabler-user-plus" width="18" height="18" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                    <path d="M16 19h6" />
                    <path d="M19 16v6" />
                    <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                </svg>
            </ButtonLight>
        {/if}
    </section>

    <section class="mt-2 flex justify-between sm:flex-row flex-col-reverse gap-4 sm:gap-0">
        <div class="relative {!search ? 'sm:w-72 sm:hover:w-96' : 'sm:w-96' } transition-all duration-300 w-[100%]">
            <SearchIcon />
            <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
        </div>
        <div class="flex gap-2 flex-col sm:flex-row">
            <ButtonLight text="Descargar data" action={downloadData} styles="w-full flex justify-center sm:w-auto" > 
                <DownloadIcon size={18} styles="mr-2" />
            </ButtonLight>
            <ButtonLight text="Descargar proyectos" action={generateExcelDownload} styles="mr-0.5 w-full flex justify-center sm:w-auto" > 
                <ExcelIcon size={20} styles='mr-2' />
            </ButtonLight>
        </div>
    </section>

    <div class="mt-4 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
      <table class="w-full table-zebra text-sm text-left">
        <thead class="bg-ins-700 text-gray-100 font-medium border-b">
          <tr>
              <th class="py-3 px-4 max-w-16 w-10">#</th>
              {#if cols.name}
                <th class="py-3 px-4">Nombre</th>
              {/if}
              {#if cols.type}
                <th class="py-3 px-4">Tipo</th>
              {/if}
              {#if cols.dependence}
                <th class="py-3 px-4">area</th>
              {/if}
              {#if cols.manager}
                <th class="py-3 px-4">Encargado</th>
              {/if}
              {#if cols.status}
                <th class="py-3 px-4">Estatus</th>
              {/if}
              <th class="py-3 pl-1 pr-4 w-8"></th>
          </tr>
        </thead>
        <tbody class="text-gray-600 divide-y">
            {#each dataFiltered as item, idx}
                {#if idx >= startRecord && idx < endRecord}
                    <tr class="bg-white h-auto sm:h-[84px]">
                        <td class="px-4 py-3 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                        {#if cols.name}
                            <td class="px-4 py-3 whitespace-normal max-w-72 flex flex-row items-center gap-2 relative sm:h-[84px]">
                                <div 
                                    class="w-5 h-5 {getStatusFromProgress(item.progress, item.status, true)} mask mask-hexagon"
                                ></div>
                                <div class="flex flex-col max-w-52">
                                    <div class="tooltip" data-tip="{item.name}">
                                        <div class="text-base font-semibold truncate text-left">{item.name}</div>
                                    </div>
                                    <span class="text-xs">{item.start} a {item.end}</span>
                                </div>
                            </td>
                        {/if}
                        <!-- {#if cols.type}
                            <td class="px-4 py-3 whitespace-normal max-w-28 truncate">
                                {item.type === "projects" ? "Proyectos" : "100 días"}
                            </td>
                        {/if} -->
                        {#if cols.dependence}
                            <td class="px-4 py-3 whitespace-nowrap max-w-28 truncate">
                                {item.dependence.data.label}
                            </td>
                        {/if}
                        {#if cols.manager}
                            <td class="px-4 py-3 whitespace-nowrap max-w-28 truncate">
                                {item.manager.data.label}
                            </td>
                        {/if}
                        {#if cols.status}
                            <td class="px-4 py-3 whitespace-nowrap max-w-28 truncate">
                                { getStatusFromProgress(item.progress, item.status) }
                            </td>
                        {/if}
                        <td class="pl-1 pr-4 py-3 whitespace-nowrap">
                            <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> diagram(item)}>
                                <ChartHistoryIcon size={20} />
                            </button>
                            {#if item.note }
                                <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> openNewNote(item)}>
                                    <NotesIcon size={20} />
                                </button>
                            {:else}
                                <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> openNewNote(item)}>
                                    <NotNoteIcon size={20} />
                                </button>
                            {/if}
                            <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> edit(item)}>
                                <EditIcon size={20} />
                            </button>
                            {#if role === 'super-admin' }
                                <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={()=> duplicate(item)}>
                                    <DuplicateIcon size={20} />
                                </button>
                                <button class="hover:outline-none rounded-full hover:bg-ins-700 hover:text-white p-1.5 transition-colors duration-300" on:click={() => deleteProject(item.id)}>
                                    <DeleteIcon size={20} />
                                </button>
                            {/if}
                        </td>
                    </tr>
                {/if}
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
    <footer class="flex w-full mt-5">
        <Pagination total={dataFiltered.length} {perPage} on:handleChangePage={changePage} typeDocuments="proyectos" />
    </footer>
</div>


<dialog id="new_note" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box sm:w-8/12 sm:min-w-[50%] sm:max-w-[800px]">
        <h3 class="font-bold text-lg">{modalData.title}</h3>
        <div class="w-full mt-5">
            {#if ['super-admin', 'super-view', 'executive'].includes(role) }
                <textarea class="w-full min-h-20 outline-gray-300 p-3 bg-gray-100 rounded-md" placeholder="Ingresa una nota" name="note" id="note" bind:value={modalData.note}></textarea>
            {:else}
                {modalData.note ? modalData.note : 'No hay notas registradas.'}
            {/if}
        </div>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn hover:bg-red-600 hover:text-white">{['super-admin', 'super-view', 'executive'].includes(role) ? 'Cancelar' : 'Cerrar'}</button>
            </form>
            {#if ['super-admin', 'super-view', 'executive'].includes(role) }
                <ButtonNormal action={saveNote} text="Actualizar" typeButton="button" styles="py-1" />
            {/if}
        </div>
    </div>
</dialog>

<style>
    .dropdown-content {
        top: 150% !important;
    }
    .dropdown-content label:active {
        background: #d9d9d9 !important;
        color: initial !important;
    }
</style>