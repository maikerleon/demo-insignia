<script>
	import ButtonLight from '$components/ButtonLight.svelte';
	import ExcelIcon from '$icons/ExcelIcon.svelte';
	import ButtonNormal from '$components/ButtonNormal.svelte';
	import ChevronIcon from '$icons/ChevronIcon.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
	import { messageAlert, handleLoading, messageForAdminView, formatNumber, formatDateTime, formatDateString, formatDate } from '$lib/utilities.js';
    import SectionTitle from '$components/SectionTitle.svelte';
    import { statutes, types as types_temp, transverse_axis as transverse_axis_data, sources } from '$lib/data.js';
    import Pagination from '$components/Pagination.svelte';
    import SearchIcon from '$icons/SearchIcon.svelte';
    import ExcelJS from 'exceljs';

    export let projects;
    export let role;

    let search = '';
    let dataFiltered = projects ? [...projects] : [];

    let status = 'all';
    let priority = 'all';
    let transverse_axis = 'all';

    let modalData = {
        id: null,
        title: '',
        amount: 0,
        accumulative: 0,
        percentage: '0%',
        comment: '',
    }

    let modalHistoryData = {
        id: null,
        title: '',
        source: 0,
        history: []
    }

    const filtered = () => {
        if (projects === null) return;

        dataFiltered = projects.filter(ax => {
            const searchString = search.toLowerCase();
            const searchWords = searchString.split(' ');

            const type = types_temp.find(t => t.value === ax.type);

            const matchesSearch = searchWords.every(word => (
                (ax.name && ax.name.toLowerCase().includes(word)) ||
                (ax.start && ax.start.toLowerCase().includes(word)) ||
                (ax.end && ax.end.toLowerCase().includes(word)) ||
                (type && type.label.toLowerCase().includes(word)) ||
                (ax.dependence.data.label && ax.dependence.data.label.toLowerCase().includes(word)) ||
                (ax.manager.data.label && ax.manager.data.label.toLowerCase().includes(word))
            ));

            const matchesStatus = status === 'all' || ax.status === status;
            const matchesPriority = priority === 'all' || ax.priority === priority;
            const matchesTransverseAxis = transverse_axis === 'all' || ax.transverse_axis?.data?.value === transverse_axis;

            const response = matchesSearch && matchesStatus && matchesPriority && matchesTransverseAxis;
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

    $: filtered(search);

    let cols = {
        project: true,
        resource_applied: true,
        resource_accumulated: true,
        percent_total: true,
        source: true,
        comment: true
    }

    const calculateConsumedPercentage = (consumed, total) => {
        if (total <= 0) {
            return 0 + '%';
        }

        const percentage = (consumed / total) * 100;
        return percentage.toFixed(2) + '%';
    };

    const openUpdateSource = (project) => {
        modalHistoryData = {
            id: project.id,
            title: project.name,
            source: project.finance_source_history?.data ? project.finance_source_history?.data[0]?.source : '',
            history: project.finance_source_history?.data ?? []
        };
        const dialog = document.getElementById('update_source');
        dialog.showModal();
    };

    const updateSource = async () => {

        if(role === 'super-view') { 
            messageForAdminView();
            return;
        }

        document.getElementById('update_source').close();

        if( !Number(modalHistoryData.source) || Number(modalHistoryData.source) < 0 ) {
            messageAlert('error','Ingrese un recurso ejercido válido.');
            setTimeout(()=>{
                document.getElementById('update_source').showModal();
            },1500);
            return;
        }

        handleLoading();

        try {

            const action = '/api/update-source-history/'
            
            const formData = new FormData();
            
            formData.append('project', modalHistoryData.id);
            formData.append('source', modalHistoryData.source);

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success, history} = JSON.parse(resp);

            if( success ) {
                const projectId = projects.findIndex(a => a.id === modalHistoryData.id);
                if (projectId !== -1) {
                    projects[projectId].finance_source_history.data = history;
                }
                filtered();
                messageAlert('success',`Recurso ejercido actualizado correctamente.`);
                return;
            }

            throw new Error;

        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
            setTimeout(()=>{
                document.getElementById('update_source').showModal();
            },1500);
        }
    }

    const openNewComment = (project) => {
        modalData = {
            id: project.id,
            title: project.name,
            amount: project.amount,
            accumulative: Number(project.finance_source_history?.data?.length > 0 ? project.finance_source_history?.data[0].source : 0),
            percentage: calculateConsumedPercentage(Number(project.finance_source_history?.data?.length > 0 ? project.finance_source_history?.data[0].source : 0), project.amount),
            comment: project.finance_note,
        };
        const dialog = document.getElementById('new_comment');
        dialog.showModal();
    };

    const saveComment = async () => {

        if(role === 'super-view') { 
            messageForAdminView();
            return;
        }

        document.getElementById('new_comment').close();
        handleLoading();

        try {

            const action = '/api/save-comment-finance/'
            
            const formData = new FormData();
            
            formData.append('project', modalData.id);
            formData.append('comment', modalData.comment);

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success} = JSON.parse(resp);

            if( success ) {
                const projectId = projects.findIndex(a => a.id === modalData.id);
                if (projectId !== -1) {
                    projects[projectId].finance_note = modalData.comment;
                }
                filtered();
                messageAlert('success',`Comentario actualizado correctamente.`);
                return;
            }

            throw new Error;

        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
            setTimeout(()=>{
                document.getElementById('new_comment').showModal();
            },1500);
        }
    }

    const generateExcelDownload = async () => {

        try {
            const templateResponse = await fetch('/template-finance.xlsx');
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
                row.getCell(2).value = project.start;
                row.getCell(3).value = project.end;
                row.getCell(4).value = formatNumber(project.amount) ?? 0;
                row.getCell(5).value = project.finance_source_history?.data?.length > 0 ? formatNumber(Number(project.finance_source_history?.data[0].source)) : '$0';
                row.getCell(6).value = calculateConsumedPercentage((project.finance_source_history?.data?.length > 0 ? project.finance_source_history?.data[0].source : 0), project.amount );
                if ( project.source?.list && project.source.list.length > 0 ) {
                    row.getCell(7).value = project.source.list.map(ss => ss.source ? sources.find(s=> s.value === ss.source)?.label : 'Sin fuente').join('\n');
                }else {
                    row.getCell(7).value = 'Sin fuentes';
                }

                row.getCell(8).value = project.finance_note ? project.finance_note : 'Sin comentario';

                row.commit();
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Finanzas (${formatDate(new Date())}).xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            messageAlert('error', 'Ha ocurrido un error inesperado, intente nuevamente.');
        }
    };

</script>
  
<div class="sm:max-w-screen-xl max-w-screen-sm mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-row justify-start items-center">
        <SectionTitle title="Avance Finanzas" />
    </div>
    <section class="flex justify-between sm:flex-row-reverse flex-col items-center mt-9 w-full">
        <div class="flex gap-2 flex-row mb-3 sm:mb-0 w-full sm:w-auto flex-wrap justify-between sm:justify-start">
            <div class="w-[45%] sm:w-32 max-w-full relative">
                <label class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500" for="status">Estatus</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="status" id="status" bind:value={status} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each statutes as st}
                        <option value={st.value}>{st.label}</option>
                    {/each}
                </select>
            </div>
            <div class="w-[45%] sm:w-48 max-w-full relative">
                <label class="absolute text-xs -top-5 left-0.5 font-semibold text-gray-500" for="transverse_axis">Eje transversal</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="transverse_axis" id="transverse_axis" bind:value={transverse_axis} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each transverse_axis_data as ta}
                        <option value={ta.value}>{ta.label}</option>
                    {/each}
                </select>
            </div>
            <div class="dropdown dropdown-bottom w-[45%] sm:w-32 max-w-full h-8">
                <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
                    Columnas
                    <ChevronIcon size={18} styles="text-black" />
                </div>
                <ul tabindex="-1" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-lg w-52">
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_name">
                            Proyecto
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_name" bind:checked={cols.project} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_type">
                            Recurso comprometido
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_type" bind:checked={cols.resource_applied} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_dependence">
                            Recurso ejercido
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_dependence" bind:checked={cols.resource_accumulated} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_manager">
                            Avance financiero
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_manager" bind:checked={cols.percent_total} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_status">
                            Fuente
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_status" bind:checked={cols.source} />
                        </label>
                    </li>
                    <li class="w-full">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="col_comment">
                            Comentario
                            <input type="checkbox" class="checkbox checkbox-xs" id="col_comment" bind:checked={cols.comment} />
                        </label>
                    </li>
                </ul>
            </div>
        </div>
        <div class="relative {!search ? 'sm:w-72 sm:hover:w-96' : 'sm:w-96' } transition-all duration-300 w-full sm:mt-0 mt-3">
            <SearchIcon />
            <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
        </div>
    </section>

    <div class="flex justify-end mt-5">
        <ButtonLight text="Descargar Excel" action={generateExcelDownload} styles="mr-0.5 w-full flex justify-center sm:w-auto" > 
            <ExcelIcon size={20} styles='mr-2' />
        </ButtonLight>
    </div>

    <div class="mt-8 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
      <table class="w-full table-auto text-sm text-left">
        <thead class="bg-ins-700 text-gray-100 font-medium border-b">
          <tr>
              <th class="py-3 px-4 max-w-16 w-10">#</th>
              {#if cols.project}
                <th class="py-3 px-2">Proyecto</th>
              {/if}
              {#if cols.resource_applied}
                <th class="py-3 px-2">Recurso comprometido</th>
              {/if}
              {#if cols.resource_accumulated}
                <th class="py-3 px-2">Recurso ejercido</th>
              {/if}
              {#if cols.percent_total}
                <th class="py-3 px-2">Avance financiero</th>
              {/if}
              {#if cols.source}
                <th class="py-3 px-8">Fuente</th>
              {/if}
              {#if cols.comment}
                <th class="py-3 px-8">Comentario</th>
              {/if}
          </tr>
        </thead>
        <tbody class="text-gray-600 divide-y">
            {#each dataFiltered as item, idx}
                {#if idx >= startRecord && idx < endRecord}
                    <tr class="bg-white h-auto sm:h-[84px]">
                        <td class="px-4 py-3 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                        {#if cols.project}
                            <td class="px-2 py-3 max-w-72">
                                <div class="flex flex-col justify-center truncate w-full">
                                    <div class="tooltip truncate text-left" data-tip="{item.name}">
                                        <div class="text-base font-semibold truncate">{item.name}</div>
                                    </div>
                                    <span class="text-xs">{item.start} a {item.end}</span>
                                </div>
                            </td>
                        {/if}
                        {#if cols.resource_applied}
                            <td class="px-2 py-3 whitespace-normal max-w-52 truncate">
                                {formatNumber(item.amount)}
                            </td>
                        {/if}
                        {#if cols.resource_accumulated}
                            <td class="px-2 py-3 whitespace-nowrap max-w-52 truncate">
                                <button on:click={()=> openUpdateSource(item)} class="hover:text-ins-600 truncate max-w-full">
                                    {item.finance_source_history?.data?.length > 0 ? formatNumber(Number(item.finance_source_history?.data[0].source)) : '$0'}
                                </button>
                            </td>
                        {/if}
                        {#if cols.percent_total}
                            <td class="px-2 py-3 whitespace-nowrap max-w-28 truncate">
                                {calculateConsumedPercentage((item.finance_source_history?.data?.length > 0 ? item.finance_source_history?.data[0].source : 0), item.amount )}
                            </td>
                        {/if}
                        {#if cols.source}
                            <td class="whitespace-nowrap max-w-52 truncate py-1">
                               <ul class="max-h-[84px] overflow-y-auto overflow-x-hidden w-full px-8">
                                    {#each item.source.list as ss }
                                        <li>{ss.source ? sources.find(s=> s.value === ss.source)?.label : 'Sin fuente'}</li>
                                    {:else}
                                        <li>Sin fuentes</li>
                                    {/each}
                               </ul>
                            </td>
                        {/if}
                        {#if cols.comment}
                            <td class="px-8 py-3 whitespace-nowrap max-w-52 truncate">
                                <button on:click={()=> openNewComment(item)} class="hover:text-ins-600 truncate max-w-full">
                                    {item.finance_note ? item.finance_note : 'Sin comentario'}
                                </button>
                            </td>
                        {/if}
                    </tr>
                {/if}
            {:else}
                <tr class="bg-white">
                    <td colspan="10" class="p-4">
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

<dialog id="new_comment" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box sm:w-8/12 sm:min-w-[50%] sm:max-w-[800px]">
        <h3 class="font-bold text-lg">{modalData.title}</h3>
        <div class="flex justify-center">
            <div class="stats stats-vertical lg:stats-horizontal shadow mt-2 bg-ins-700 text-white">
  
                <div class="stat">
                  <div class="stat-title text-white text-xs">Recurso comprometido</div>
                  <div class="stat-value text-base">{formatNumber(modalData.amount)}</div>
                </div>
                
                <div class="stat">
                  <div class="stat-title text-white text-xs">Recurso ejercido</div>
                  <div class="stat-value text-base">{formatNumber(modalData.accumulative)}</div>
                </div>
                
                <div class="stat">
                  <div class="stat-title text-white text-xs">Avance financiero</div>
                  <div class="stat-value text-base">{modalData.percentage}</div>
                </div>
                
            </div>

        </div>
        <div class="w-full mt-5">
            <textarea class="w-full min-h-20 outline-gray-300 p-3 bg-gray-100 rounded-md" placeholder="Ingresa un comentario" name="comment" id="comment" bind:value={modalData.comment}></textarea>
        </div>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn hover:bg-red-600 hover:text-white">Cancelar</button>
            </form>
            <ButtonNormal action={saveComment} text="Actualizar" typeButton="button" styles="py-2" />
        </div>
    </div>
</dialog>

<dialog id="update_source" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box sm:w-8/12 sm:min-w-[50%] sm:max-w-[800px]">
        <h3 class="font-bold text-lg">{modalHistoryData.title}</h3>
        <div class="w-full mt-5">
            <input type="number" class="w-full min-h-10 outline-gray-300 p-3 bg-gray-100 rounded-md text-center text-gray-500 font-semibold" placeholder="$0" name="source_history" id="source_history" bind:value={modalHistoryData.source} />
        </div>
        <div class="bg-gray-100 border-2 border-gray-200 mt-5 p-4 rounded-md">
            {#each modalHistoryData?.history as {source, created_at} }
                <div class="flex w-full justify-between">
                    <span>{formatNumber(Number(source))}</span>
                    <span>{formatDateTime(created_at)}</span>
                </div>
            {:else}
                <div class="flex justify-center items-center">
                    <span class="text-lg text-gray-400 font-semibold">Sin historial</span>
                </div>
            {/each}
        </div>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn hover:bg-red-600 hover:text-white">Cancelar</button>
            </form>
            <ButtonNormal action={updateSource} text="Actualizar" typeButton="button" styles="py-2" />
        </div>
    </div>
</dialog>

<style>
    .dropdown-content {
        top: 150% !important;
        left: -55% !important;
    }
    .dropdown-content label:active {
        background: #d9d9d9 !important;
        color: initial !important;
    }
</style>