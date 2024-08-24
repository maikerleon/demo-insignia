<script>
	import ProgressBoltIcon from '$icons/ProgressBoltIcon.svelte';
	import ExcelIcon from '$icons/ExcelIcon.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
    import ButtonLight from '$components/ButtonLight.svelte';
    import { priorities, statutes, transverse_axis as transverse_axis_data } from '$lib/data.js';
    import Pagination from '$components/Pagination.svelte';
    import ExcelJS from 'exceljs';
    import {messageAlert, formatDate} from '$lib/utilities.js';
    import SearchIcon from '$icons/SearchIcon.svelte';

    export let handleToggleTable;
    export let projects;
    export let dataSee;

    let search = '';
    let dataFiltered = projects ? [...projects] : [];

    let status = 'all';
    // let priority = 'all';
    let transverse_axis = 'all';

    const seeProgress = (project) => {
        dataSee = project;
        handleToggleTable();
    }

    const formatDateString = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('es', options).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$1/$2/$3');
    };

    const generateExcelDownload = async () => {

        try {
            const templateResponse = await fetch('/template.xlsx');
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
                row.getCell(2).value = formatDateString(project.start);
                row.getCell(3).value = formatDateString(project.end);
                row.getCell(4).value = project.dependence?.data?.label ?? 'Sin area';
                row.getCell(5).value = getStatusFromProgress(project.progress, project.status);

                row.commit();
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Catálago de Proyectos (${formatDate(new Date())}).xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            messageAlert('error', 'Ha ocurrido un error inesperado, intente nuevamente.');
        }
    };

    const filtered = () => {
        if (projects === null) return;

        dataFiltered = projects.filter(ax => {
            const searchString = search.toLowerCase();
            const searchWords = searchString.split(' ');

            const matchesSearch = searchWords.every(word => (
                (ax.name && ax.name.toLowerCase().includes(word)) ||
                (ax.start && ax.start.toLowerCase().includes(word)) ||
                (ax.end && ax.end.toLowerCase().includes(word)) ||
                (ax.dependence.data.label && ax.dependence.data.label.toLowerCase().includes(word))
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

    let startRecord = 0;
    let perPage = 25;
    let endRecord = perPage;

    const changePage = ({detail}) => {
        startRecord = detail.startRecord-1;
        endRecord = detail.endRecord;
    }

    $: filtered(search);

</script>
  
<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <section class="flex justify-between sm:flex-row flex-col items-center mt-9 w-full">
        <div class="flex gap-x-2 gap-y-8 sm:gap-x-2 sm:gap-y-2 flex-row mb-3 sm:mb-0 w-full sm:w-auto flex-wrap justify-between sm:justify-start">
            <div class="w-[45%] sm:w-32 max-w-full relative">
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
            <div class="w-[45%] sm:w-48 max-w-full relative">
                <label class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500" for="transverse_axis">Eje transversal</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="transverse_axis" id="transverse_axis" bind:value={transverse_axis} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each transverse_axis_data as ta}
                        <option value={ta.value}>{ta.label}</option>
                    {/each}
                </select>
            </div>
        </div>
    </section>

    <section class="mt-2 flex justify-between items-center">
        <div class="relative {!search ? 'sm:w-72 sm:hover:w-96' : 'sm:w-96' } transition-all duration-300 w-[100%]">
            <SearchIcon />
            <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
        </div>
        <ButtonLight text="Descargar Excel" action={generateExcelDownload} styles="mr-0.5 w-4/5 flex justify-center sm:w-auto border-orange-500 text-orange-500 hover:bg-orange-500" > 
            <ExcelIcon size={20} styles='mr-2' />
        </ButtonLight>
    </section>

    <div class="mt-4 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
      <table class="w-full table-auto text-sm text-left">
        <thead class="bg-ins-700 text-gray-100 font-medium border-b">
          <tr>
              <th class="py-3 px-4 max-w-16 w-10">#</th>
                <th class="py-3 px-4">Nombre</th>
                <th class="py-3 px-4">area</th>
                <th class="py-3 px-4">Estatus</th>
              <th class="py-3 pl-1 pr-4 w-8"></th>
          </tr>
        </thead>
        <tbody class="text-gray-600 divide-y">
            {#each dataFiltered as item, idx}
                {#if idx >= startRecord && idx < endRecord}
                    <tr class="bg-white h-auto sm:h-[84px]">
                        <td class="px-4 py-3 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                        <td class="px-4 py-3 whitespace-normal max-w-[450px] flex flex-row items-center gap-2 relative sm:h-[84px]">
                            <div class="w-[20px] h-[20px]">
                                <div class="w-full h-full {getStatusFromProgress(item.progress, item.status, true)} mask mask-hexagon"></div>
                            </div>
                            <div class="flex flex-col max-w-[380px]">
                                <div class="tooltip" data-tip="{item.name}">
                                    <div class="text-base font-semibold truncate text-left">
                                        <a href="/proyectos/ejecutiva/{item.id}" target="_blank">{item.name}</a>
                                    </div>
                                </div>
                                <span class="text-xs">{item.start} a {item.end}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap max-w-28 truncate">
                            {item.dependence.data.label}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap max-w-28 truncate">
                            { getStatusFromProgress(item.progress, item.status) }
                        </td>
                        <td class="pl-1 pr-4 py-3 whitespace-nowrap">
                            <button class="flex space-x-2 hover:outline-none rounded-full hover:bg-ins-700 hover:text-white py-1.5 px-3 transition-colors duration-300" on:click={() => seeProgress(item)}>
                                <ProgressBoltIcon size={20} />
                                <span class="text-sm">Avances de supervisor</span>
                            </button>
                        </td>
                    </tr>
                {/if}
            {:else}
                <tr class="bg-white">
                    <td colspan="4" class="p-4">
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