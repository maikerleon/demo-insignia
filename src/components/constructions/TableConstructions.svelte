<script>
	import ExcelIcon from '$icons/ExcelIcon.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
    import { fly, fade } from 'svelte/transition';
	import { messageAlert, messageForAdminView, formatDateSlash, calculateTimeDifference, formatDate } from '$lib/utilities.js';
    import SectionTitle from '$components/SectionTitle.svelte';
    import { statutes } from '$lib/data.js';
    import Pagination from '$components/Pagination.svelte';
    import { onMount } from 'svelte';
    import ExcelJS from 'exceljs';
    import SearchIcon from '$icons/SearchIcon.svelte';

    export let projects;
    export let role;
    let notification = false;
    let type_notification = '';

    let search = '';
    let dataFiltered = projects ? [...projects] : [];

    let status = 'all';

    let modalData = {
        id: null,
        title: '',
        amount: 0,
        accumulative: 0,
        percentage: '0%',
        comment: '',
    }

    const filtered = () => {
        if (projects === null) return;

        dataFiltered = projects.filter(ax => {
            const searchString = search.toLowerCase();
            const searchWords = searchString.split(' ');

            const matchesSearch = searchWords.every(word => (
                (ax.name && ax.name.toLowerCase().includes(word)) ||
                (ax.start && ax.start.toLowerCase().includes(word)) ||
                (ax.end && ax.end.toLowerCase().includes(word)) ||
                (ax.observations && ax.observations.toLowerCase().includes(word)) ||
                (ax.segnaletica && ax.segnaletica.toLowerCase().includes(word)) ||
                (ax.link && ax.link.toLowerCase().includes(word))
            ));

            const matchesStatus = status === 'all' || ax.status === status;
            const response = matchesSearch && matchesStatus;

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

    let timer = null;

    const handleInput = (project, field, value) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            saveData(project, field, value);
        }, 1500);
    };

    const handleBlur = (project, field, value) => {
        if (timer) {
            saveData(project, field, value);
        }
        clearTimeout(timer);
    };

    const saveData = async (project, field, value) => {
        
        if(role === 'super-view') { 
            messageForAdminView();
            return;
        }

        try {

            const action = '/api/save-constructions-updates/'

            const formData = new FormData();

            formData.append('project', project);
            formData.append('field', field);
            formData.append('value', value);

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success} = JSON.parse(resp);

            if( success ) {
                timer = null;
                type_notification = field === 'observations' ? 'observación' : field === 'segnaletica' ? 'señalética' : 'enlace';
                notification = true;
                setTimeout(() => {
                    notification = false;
                }, 2000);
                return;
            }

            throw new Error;

        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado al guardar los cambios.');
        }
    };

    onMount(() => {
        return () => clearTimeout(timer);
    });

    const generateExcelDownload = async () => {

        try {
            const templateResponse = await fetch('/template-constructions.xlsx');
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
                row.getCell(2).value = project.link || 'Sin enlace';
                row.getCell(3).value = `${project.start ? formatDateSlash(project.start) : '-'} - ${project.end ? formatDateSlash(project.end) : '-'} | ${calculateTimeDifference(project.start, project.end)}`;
                row.getCell(4).value = statutes.find(s => s.value === project.status)?.label || 'Sin estatus';
                row.getCell(5).value = project.progress_supervisor?.data[0]?.general || 'Sin observaciones';
                row.getCell(6).value = project.segnaletica || 'Sin señalética';
                row.getCell(7).value = `${project.progress_supervisor?.data[0]?.percent || 0}%`;
                row.getCell(8).value = project.address;
                row.commit();
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Obras (${formatDate(new Date())}).xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            messageAlert('error', 'Ha ocurrido un error inesperado, intente nuevamente.');
        }
    };

</script>
  
<div class="w-full mx-auto px-4 sm:px-2">
    <div class="w-full flex flex-row justify-start items-center">
        <SectionTitle title="Estatus de proyectos" />
    </div>
    <section class="flex justify-between sm:flex-row-reverse flex-col items-center mt-9 w-full">
        <div class="flex gap-2 flex-row mb-3 sm:mb-0 w-full sm:w-auto flex-wrap justify-between sm:justify-start">
            <div class="w-[45%] sm:w-32 max-w-full relative">
                <label class="absolute text-sm -top-5 left-0.5 font-semibold text-gray-500" for="status">Estatus</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="status" id="status" bind:value={status} on:change={filtered}>
                    <option value="all" selected>Todos</option>
                    {#each statutes as st}
                        <option value={st.value}>{st.label}</option>
                    {/each}
                </select>
            </div>
            <div class="w-[45%] sm:w-32 max-w-full relative">
                <label class="absolute text-sm -top-5 left-0.5 font-semibold text-gray-500" for="results">Resultados</label>
                <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" name="results" id="results" bind:value={perPage}>
                    <option value={25} selected>25 resultados</option>
                    <option value={50}>50 resultados</option>
                    <option value={100}>100 resultados</option>
                </select>
            </div>
        </div>
        <div class="relative {!search ? 'sm:w-72 sm:hover:w-96' : 'sm:w-96' } transition-all duration-300 w-full sm:mt-0 mt-3">
            <SearchIcon />
            <input name="search" type="text" bind:value={search} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
        </div>
    </section>

    <div class="flex justify-end mt-5">
        <ButtonLight text="Descargar Obras" action={generateExcelDownload} styles="mr-0.5 w-4/5 flex justify-center sm:w-auto" > 
            <ExcelIcon size={20} styles='mr-2' />
        </ButtonLight>
    </div>

    <div class="mt-8 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
      <table class="w-full table-auto text-sm text-left">
        <thead class="bg-ins-700 text-gray-100 font-medium border-b">
            <tr>
                <th class="py-3 pl-4 pr-2 max-w-16 w-10">#</th>
                <th class="py-3 px-1">Proyecto</th>
                <th class="py-3 px-1">Enlace</th>
                <th class="py-3 px-1">Fecha/Duración</th>
                <th class="py-3 px-1">Estatus</th>
                <th class="py-3 px-1">Observaciones</th>
                <th class="py-3 px-1">Señalética</th>
                <th class="py-3 pl-2 pr-4">% Avance</th>
            </tr>
        </thead>
        <tbody class="text-gray-600 divide-y">
            {#each dataFiltered as item, idx}
                {#if idx >= startRecord && idx < endRecord}
                    <tr class="bg-white h-auto sm:h-[84px]">
                        <td class="pl-4 pr-1 py-3 whitespace-nowrap max-w-3 font-semibold">{idx+1}</td>
                        <td class="px-2 py-3 max-w-72">
                            <div class="flex justify-center w-full items-center gap-x-2">
                                <div>
                                    <div class="mask mask-hexagon-2 w-5 h-5 {statutes.find(s=> s.value === item.status)?.color ?? 'bg-gray-400'}"></div>
                                </div>
                                <div class="text-sm font-semibold">{item.name}</div>
                            </div>
                        </td>
                        <td class="px-2 py-3 max-w-full w-44">
                            <div class="flex justify-center items-center w-44">
                                <textarea class="text-sm resize-none max-h-40 p-2 focus:overflow-y-auto w-44 overflow-hidden focus:bg-ins-700/10 rounded-md focus:outline-ins-700/20" name="link_{idx}" id="link_{idx}" placeholder="Ingresa el enlace" bind:value={item.link} on:input={()=>handleInput(item.id, 'link', item.link)} on:blur={()=>handleBlur(item.id, 'link', item.link)}></textarea>
                            </div>
                        </td>
                        <td class="pl-2 pr-3 py-3 text-sm whitespace-normal">
                            <div class="flex-col flex justify-center items-center">
                                <span class="text-xs">
                                    {item.start ? formatDateSlash(item.start) : '-'} - {item.end ? formatDateSlash(item.end) : '-'}
                                </span>
                                <span>{calculateTimeDifference(item.start, item.end)}</span>
                            </div>
                        </td>
                        <td class="pl-3 pr-2 py-3 text-sm whitespace-normal max-w-28 font-semibold">
                            {statutes.find(s => s.value === item.status)?.label || 'Sin estatus'}
                        </td>
                        <td class="px-2 py-3 max-w-full w-52">
                            <div class="flex justify-center items-center w-52">
                                <textarea class="text-sm resize-none max-h-40 p-2 w-52 overflow-hidden rounded-md focus:outline-none" value={item.progress_supervisor?.data[0]?.general ?? 'Sin observaciones'} readonly></textarea>
                            </div>
                        </td>
                        <td class="px-2 py-3 max-w-full w-52">
                            <div class="flex justify-center items-center w-48">
                                <textarea class="text-sm resize-none max-h-40 p-2 focus:overflow-y-auto w-52 overflow-hidden focus:bg-ins-700/10 rounded-md focus:outline-ins-700/20" name="segnaletica_{idx}" id="segnaletica_{idx}" placeholder="Ingresa la señalética" bind:value={item.segnaletica} on:input={()=>handleInput(item.id, 'segnaletica', item.segnaletica)} on:blur={()=>handleBlur(item.id, 'segnaletica', item.segnaletica)}></textarea>
                            </div>
                        </td>
                        <td class="pl-2 pr-4 py-3 max-w-full w-52">
                            <span class="text-lg font-semibold">{item.progress_supervisor?.data[0]?.percent || item.progress?.data[0]?.percent || 0}%</span>
                        </td>
                    </tr>
                {/if}
            {:else}
                <tr class="bg-white">
                    <td colspan={8} class="p-4">
                        <section class="text-center flex items-center w-full justify-center">
                            <DependenceIcon size="20" />
                            <strong class="ml-2 font-semibold text-gray-700">No se encontraron obras</strong>
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

{#if notification }
    <div class="mt-12 mx-4 px-4 rounded-md border-l-4 border-ins-600 bg-ins-50 -top-10 right-0 max-w-96 absolute shadow-md" in:fly={{ y: 20, duration: 1000 }} out:fade>
        <div class="flex justify-between py-3">
            <div class="flex">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 rounded-full text-ins-600" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd" />
                    </svg>
                </div>
                <div class="self-center ml-3">
                    <span class="text-ins-600 font-semibold">
                        ¡Actualizado con éxito!
                    </span>
                    <p class="text-ins-600 mt-1">
                        La {type_notification} se ha actualizado correctamente.
                    </p>
                </div>
            </div>
            <button class="self-start text-ins-600" on:click={()=>notification = false}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd" />
                </svg>
            </button>
        </div>
    </div>
{/if}