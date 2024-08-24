<script>
	import AgendIcon from '$icons/AgendIcon.svelte';
	import { messageAlert, handleLoading, closeAlert } from '$lib/utilities.js';
	import ImageDownloadIcon from '$icons/ImageDownloadIcon.svelte';
	import SectionTitle from '$components/SectionTitle.svelte';
	import GoBackIcon from '$icons/GoBackIcon.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
    import { fade } from 'svelte/transition';
    import moment from 'moment';
    import domtoimage from 'dom-to-image';
    import {sources as sources_data} from '$lib/data.js';

    export let handleToggleDiagram = null;
    export let dataDiagram;
    export let withoutHeader = false;

    const dictionaryCheckList = {
        'yes': 'Si',
        'no': 'No',
        'to-evaluate': 'Por evaluar',
        'no-apply': 'No aplica'
    }

    const generatePDF = async () => {

        const municipalities = dataDiagram.municipalities.data && dataDiagram.municipalities.data.length >= 38 ? 'Todos los municipios' : dataDiagram.municipalities.data.map(m => m.label).join(', ');
        const amount = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(dataDiagram.amount);
        const sources = dataDiagram.source?.list ? dataDiagram.source.list.map(m => {
            const sourceData = sources_data.find(s => s.value === m.source);
            return sourceData ? sourceData.label : '-';
        }).join(', ') : '-';

        const beneficiaries = dataDiagram.beneficiaries?.list.reduce((sum, item) => {
            const amount = Number(item.amount);
            if (!Number.isNaN(amount)) {
                return sum + amount;
            }
            return sum;
        }, 0);

        handleLoading('Generando tarjeta informativa...');

        const themeData = dataDiagram.theme?.data;

        const dataContent = {
            name: dataDiagram.name || 'Sin nombre',
            dependence: dataDiagram.dependence.data?.label || '-',
            start: dataDiagram.start || 'Sin fecha de inicio',
            amount: `$${amount}`,
            municipalities: municipalities,
            beneficiaries: `${new Intl.NumberFormat('es-MX').format(beneficiaries)} en total`,
            end: dataDiagram.end || 'Sin fecha de entrega',
            theme: Array.isArray(themeData) ? themeData.map(item => item.label).join(', ') : (themeData?.label || 'Sin tema'),
            axis: dataDiagram.axis.data?.label || '-',
            sources: sources || 'Sin fuentes',
            description: dataDiagram.description ? dataDiagram.description : 'Sin descripción',
            background: dataDiagram.background ? dataDiagram.background : 'Sin antecedentes',
            additionalInfo: dataDiagram.aditional_information ? dataDiagram.aditional_information : 'Sin información adicional',
            objective: dataDiagram.objectives?.list ? dataDiagram.objectives.list.map(o => o.objective).join(', ') : 'Sin objetivos',
        };

        downloadPdf('/api/generate-pdf-card/', dataContent, `Tarjeta informativa - ${dataDiagram.name}.pdf`);

    };

    const generateDiary = (actions_temp, name, description) => {    
        const actions = actions_temp.filter(item => 
            moment(item.start).isSame(moment(), 'month') && item.type === 'event'
        );

        if (actions.length === 0) {
            messageAlert('info', 'No hay eventos para este mes');
            return;
        }

        const actual_year = new Date().getFullYear();
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        const actual_month = months[moment().month()];

        let htmlContent = `<section style="background-color: white;">
            <div style="padding: 2rem;">
                <div style="width: 100%;display: flex;justify-content: flex-start;">
                    <img src="/logo.webp" alt="logo" style="max-width: 15rem; height:60px;">
                </div>
                <div style="width: 100%;display: flex;justify-content: center;align-items: center;flex-direction: column;">
                    <h1 style="font-size: 1.5rem;font-weight: 600;text-transform: uppercase;">Formato de agenda</h1>
                    <h1 style="font-weight: 600;font-size: 1.25rem;">${actual_month} ${actual_year}</h1>
                </div>
                <div style="width: 100%;border-width: 2px;border-color: black;margin-top: 1.25rem;display: grid;grid-template-columns: repeat(7, minmax(0, 1fr));">

                    <div style="display: grid;grid-template-columns: repeat(7, minmax(0, 1fr));grid-column: span 8 / span 8;">
                        <div style="display: flex;justify-content: center;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;background-color: #22543d;padding: 0.5rem;">
                            <h2 style="text-transform: uppercase;text-align: center;color: white;font-size: 1rem;">Nombre del evento</h2>
                        </div>
            
                        <div style="display: flex;justify-content: center;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;background-color: #22543d;padding: 0.5rem;">
                            <h2 style="text-transform: uppercase;text-align: center;color: white;font-size: 1rem;">Secretaría responsable</h2>
                        </div>
            
                        <div style="display: flex;justify-content: center;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;background-color: #22543d;padding: 0.5rem;">
                            <h2 style="text-transform: uppercase;text-align: center;color: white;font-size: 1rem;">Descripción de obra o programa</h2>
                        </div>
            
                        <div style="display: flex;justify-content: center;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;background-color: #22543d;padding: 0.5rem;">
                            <h2 style="text-transform: uppercase;text-align: center;color: white;font-size: 1rem;">Monto de inversión</h2>
                        </div>
            
                        <div style="display: flex;justify-content: center;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;background-color: #22543d;padding: 0.5rem;">
                            <h2 style="text-transform: uppercase;text-align: center;color: white;font-size: 1rem;">Municipios beneficiados</h2>
                        </div>
            
                        <div style="display: flex;justify-content: center;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;background-color: #22543d;padding: 0.5rem;">
                            <h2 style="text-transform: uppercase;text-align: center;color: white;font-size: 1rem;"># de beneficiarios totales</h2>
                        </div>
            
                        <div style="display: flex;justify-content: center;align-items: center;border-color: black;border-bottom-width: 2px;background-color: #22543d;padding: 0.5rem;">
                            <h2 style="text-transform: uppercase;text-align: center;color: white;font-size: 1rem;">Fecha propuesta de evento</h2>
                        </div>
                    </div>`;

        for (const action of actions ) {
            const municipalities = action.municipalities?.data ? action.municipalities.data.map(m => m.label).join(', ') : '-';

            htmlContent += `<div style="display: grid;grid-template-columns: repeat(7, minmax(0, 1fr));grid-column: span 8 / span 8;">
                        <div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;padding-left: 0.5rem;padding-right: 0.5rem;padding-top: 0.25rem;padding-bottom: 0.25rem;background-color: #f0fff4;">
                            <span style="font-weight: 600;font-size: 1rem;">${action.name}</span>
                        </div>
                        <div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;padding-left: 0.5rem;padding-right: 0.5rem;padding-top: 0.25rem;padding-bottom: 0.25rem;">
                            <span style="font-size: 1rem;">${action.dependence?.data?.label ?? '-'}</span>
                        </div>
                        <div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;padding-left: 0.5rem;padding-right: 0.5rem;padding-top: 0.25rem;padding-bottom: 0.25rem;">
                            <span style="font-size: 1rem;">${action.description ? action.description : 'Sin descripción'}</span>
                        </div>
                        <div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;padding-left: 0.5rem;padding-right: 0.5rem;padding-top: 0.25rem;padding-bottom: 0.25rem; display: flex; justify-content: center;">
                            <span style="font-size: 1rem;">$${new Intl.NumberFormat('es-MX').format(action.amount)}</span>
                        </div>
                        <div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;padding-left: 0.5rem;padding-right: 0.5rem;padding-top: 0.25rem;padding-bottom: 0.25rem;">
                            <span style="font-size: 1rem;">${municipalities}</span>
                        </div>
                        <div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;border-right-width: 2px;padding-left: 0.5rem;padding-right: 0.5rem;padding-top: 0.25rem;padding-bottom: 0.25rem; display: flex; justify-content: center;">
                            <span style="font-size: 1rem;">${action.beneficiaries}</span>
                        </div>
                        <div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;padding-left: 0.5rem;padding-right: 0.5rem;padding-top: 0.25rem;padding-bottom: 0.25rem; display: flex; justify-content: center;">
                            <span style="font-size: 1rem;">${action.start ? action.start : '-'}</span>
                        </div>
                    </div>`;
        }

        htmlContent += `<div style="grid-column: span 8 / span 8; display: flex; justify-content: start; width: 100%">
                        <span style="font-size: 1rem;padding-left: 0.5rem;padding-right: 0.5rem;padding-top: 0.25rem;padding-bottom: 0.25rem; width: 100%">${description}</span>
                    </div>

                </div>
            </div>
            <div style="padding: 0.5rem;margin-top: 5px">
                <div style="background-image: url('/figures.webp');background-repeat: repeat;background-size: 150px 150px;width: 100%;height: 7rem;background-color: #2f855a;"></div>
            </div>
        </section>`;

        html2pdf()
            .from(htmlContent)
            .set({ jsPDF: {orientation: 'landscape'} })
            .save(`Formato de Agenda (${actual_month}) - ${name}.pdf`);
    }

    const colors = [
        "#dc2626", // red-600
        "#ea580c", // orange-600
        "#ca8a04", // yellow-600
        "#16a34a", // green-600
        "#0d9488", // teal-600
        "#2563eb", // blue-600
        "#4f46e5", // indigo-600
        "#7c3aed", // purple-600
        "#db2777", // pink-600
        "#4b5563", // gray-600
        "#0891b2", // cyan-600
        "#84cc16",  // lime-600
        "#f59e0b", // amber-600
        "#f87171", // red-400
        "#fbbf24", // yellow-400
        "#34d399", // green-400
        "#3b82f6", // blue-400
        "#818cf8", // indigo-400
        "#f472b6", // pink-400
        "#9ca3af", // gray-400
        "#f6e05e", // amber-400
        "#fbbf24", // yellow-400
        "#f87171", // red-400
        "#f59e0b", // amber-600
        "#84cc16",  // lime-600
        "#0891b2", // cyan-600
        "#4b5563", // gray-600
        "#db2777", // pink-600
        "#7c3aed", // purple-600
        "#4f46e5", // indigo-600
        "#2563eb", // blue-600
        "#0d9488", // teal-600
        "#16a34a", // green-600
        "#ca8a04", // yellow-600
        "#ea580c", // orange-600
        "#dc2626", // red-600
        "#f87171", // red-400
        "#fbbf24", // yellow-400
        "#34d399", // green-400
        "#3b82f6", // blue-400
        "#818cf8", // indigo-400
        "#f472b6", // pink-400
        "#9ca3af", // gray-400
        "#f6e05e", // amber-400
        "#fbbf24", // yellow-400
        "#f87171", // red-400
        "#f59e0b", // amber-600
        "#84cc16",  // lime-600
        "#0891b2", // cyan-600
        "#4b5563", // gray-600
        "#db2777", // pink-600
        "#7c3aed", // purple-600
        "#4f46e5", // indigo-600
        "#2563eb", // blue-600
        "#0d9488", // teal-600
        "#16a34a", // green-600
        "#ca8a04", // yellow-600
        "#ea580c", // orange-600
        "#dc2626", // red-600
        "#f87171", // red-400
        "#fbbf24", // yellow-400
        "#34d399", // green-400
        "#3b82f6", // blue-400
        "#818cf8", // indigo-400
        "#f472b6", // pink-400
        "#9ca3af", // gray-400
        "#f6e05e", // amber-400
        "#fbbf24", // yellow-400
        "#f87171", // red-400
        "#f59e0b", // amber-600
        "#84cc16",  // lime-600
        "#0891b2", // cyan-600
        "#4b5563", // gray-600
        "#db2777", // pink-600
        "#7c3aed", // purple-600
        "#4f46e5", // indigo-600
        "#2563eb", // blue-600
        "#0d9488", // teal-600
        "#16a34a", // green-600
        "#ca8a04", // yellow-600
        "#ea580c", // orange-600
        "#dc2626", // red-600
        "#f87171", // red-400
        "#fbbf24", // yellow-400
        "#34d399", // green-400
        "#3b82f6", // blue-400
        "#818cf8", // indigo-400
        "#f472b6", // pink-400
        "#9ca3af", // gray-400
        "#f6e05e", // amber-400
        "#fbbf24", // yellow-400
        "#f87171", // red-400
        "#f59e0b", // amber-600
        "#84cc16",  // lime-600
        "#0891b2", // cyan-600
        "#4b5563", // gray-600
        "#db2777", // pink-600
        "#7c3aed", // purple-600
        "#4f46e5", // indigo-600
        "#2563eb", // blue-600
        "#0d9488" // teal-600
    ];

    const downloadDiagram = () => {
        const section = document.getElementById('diagram-gantt');
        const originalTransform = section.style.transform;
        const scale = 2;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                domtoimage.toPng(section, {
                    width: section.offsetWidth * scale,
                    height: section.offsetHeight * scale,
                    style: {
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    },
                })
                .then((dataUrl) => {
                    section.style.transform = originalTransform;

                    const link = document.createElement('a');
                    link.download = `Diagrama de Gantt - ${dataDiagram.name}.png`;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                })
                .catch((error) => {
                    messageAlert('error', 'Error al capturar la imagen')
                });
            });
        });
    };

    const getAbbreviatedMonths = (start, end) => {
        const monthsAbbr = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        let startDate = moment(start);
        let endDate = moment(end);
        let monthsBetweenDates = [];

        while (startDate.isBefore(endDate) || startDate.isSame(endDate, 'month')) {
            monthsBetweenDates.push(monthsAbbr[startDate.month()]);
            startDate.add(1, 'months');
        }

        return monthsBetweenDates;
    };

    const getMonthNumbers = (start, end) => {
        let startDate = moment(start);
        let endDate = moment(end);
        let monthsBetweenDates = [];

        while (startDate.isBefore(endDate) || startDate.isSame(endDate, 'month')) {
            monthsBetweenDates.push(startDate.month() + 1);
            startDate.add(1, 'months');
        }

        return monthsBetweenDates;
    };

    let dataMonth = getAbbreviatedMonths(dataDiagram.start, dataDiagram.end);
    let dataMonthNumbers = getMonthNumbers(dataDiagram.start, dataDiagram.end);

    const calculateActionSpan = (start, end) => {
    const monthsInSpanish = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const startMonthNumber = moment(start).month();
    const endMonthNumber = moment(end).month();
    
    const dataMonthAbbreviations = dataMonthNumbers.map(monthNumber => monthsInSpanish[monthNumber - 1]);
    
    const startMonthAbbreviation = monthsInSpanish[startMonthNumber];
    const endMonthAbbreviation = monthsInSpanish[endMonthNumber];
    
    const startIndex = dataMonthAbbreviations.findIndex(monthAbbr => monthAbbr === startMonthAbbreviation);
    const endIndex = dataMonthAbbreviations.findIndex(monthAbbr => monthAbbr === endMonthAbbreviation);

    const startColumn = startIndex + 1;
    const endColumn = endIndex + 2;

    return {
        class: `grid-area: 1 / ${startColumn} / 2 / ${endColumn}`,
        style: `background: linear-gradient(to right, ${colors[startIndex]}, ${colors[endIndex]})`
    };
}


    const actions = dataDiagram.actions.list.map(act => {
        return {
            ...act,
            span: calculateActionSpan(act.start, act.end)
        }
    });

    const redirectCalendar = () => {
        document.location.href = `/calendarios/proyecto/${dataDiagram.id}`;
    }

    const calculateConsumedPercentage = (consumed, total) => {
        if (total <= 0) {
            return 0 + '%';
        }

        const percentage = (consumed / total) * 100;
        return percentage.toFixed(2) + '%';
    };

    const generateSheet = async () => {

        handleLoading('Generando ficha técnica...');

        const actions = dataDiagram.actions.list.filter(
            item => item.name.length > 2 && (item.type === 'event' || item.type === 'event-start')
        );

        const recentActions = actions.reduce((acc, item) => {
            if (!acc[item.type] || new Date(item.start) > new Date(acc[item.type].start)) {
                acc[item.type] = item;
            }
            return acc;
        }, {});

        const eventDate = recentActions['event'] ? recentActions['event'].start : 'Sin fecha';
        const eventStartDate = recentActions['event-start'] ? recentActions['event-start'].start : 'Sin fecha';

        const dataContent = {
            name: dataDiagram.name || 'Sin nombre', // A
            event: eventDate, // B
            eventStart: eventStartDate, // C
            end: dataDiagram.end, // D
            amount: dataDiagram.amount || 0, // E
            municipalities: dataDiagram.municipalities?.data && dataDiagram.municipalities?.data.length > 0 ? dataDiagram.municipalities?.data.length : 0, // F
            supervision: dataDiagram.supervision ? 'SI' : 'NO', // G
            progress: dataDiagram.progress.data?.length > 0 ? dataDiagram.progress.data[0].general : 'Sin avances', // H
            finance_progress: calculateConsumedPercentage((dataDiagram.finance_source_history?.data?.length > 0 ? dataDiagram.finance_source_history?.data[0].source : 0), dataDiagram.amount), // I
            note: dataDiagram.note || 'Sin notas', // J
        };

        downloadPdf('/api/generate-pdf-sheet/', dataContent, `Ficha técnica - ${dataDiagram.name}.pdf`);

    };

    const downloadPdf = async (api, dataContent, name) => {
        const formData = new FormData();
        formData.append("dataContent", JSON.stringify(dataContent));
        const response = await fetch(api, {
            method: "POST",
            body: formData,
        });
        const resp = await response.text();
        const { pdfBuffer } = JSON.parse(resp);

        const binaryString = window.atob(pdfBuffer);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const pdfBlob = new Blob([bytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(pdfBlob);
        link.download = `${name}.pdf`;
        link.click();

        closeAlert();
    };

</script>

<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</svelte:head>

<div class="max-w-full mx-auto px-4 sm:px-2">
    {#if !withoutHeader }
        <div class="w-full flex flex-col justify-between">
            <SectionTitle title="Proyectos" />
            <section class="flex justify-between mt-6 sm:flex-row flex-col-reverse">
                <div class="flex gap-2 sm:flex-row flex-col">
                    <ButtonLight styles="pr-2 pl-2 pt-1 pb-1" text="Descargar diagrama" action={downloadDiagram} >
                        <ImageDownloadIcon size={20} styles="mr-2" />
                    </ButtonLight>
                    <ButtonLight styles="pr-2 pl-2 pt-1 pb-1" text="Ver calendario" action={redirectCalendar} >
                        <AgendIcon size={20} styles="mr-2" />
                    </ButtonLight>
                    <ButtonLight styles="pr-2 pl-2 pt-1 pb-1" text="Tarjeta informativa" action={generatePDF} >
                        <ImageDownloadIcon size={20} styles="mr-2" />
                    </ButtonLight>
                    <ButtonLight styles="pr-2 pl-2 pt-1 pb-1" text="Formato agenda" action={()=> generateDiary(dataDiagram.actions.list, dataDiagram.name, dataDiagram.description)} >
                        <ImageDownloadIcon size={20} styles="mr-2" />
                    </ButtonLight>
                    <ButtonLight styles="pr-2 pl-2 pt-1 pb-1" text="Ficha técnica" action={generateSheet} >
                        <ImageDownloadIcon size={20} styles="mr-2" />
                    </ButtonLight>
                </div>
                {#if handleToggleDiagram }
                    <ButtonLight text="Ir atrás" action={handleToggleDiagram} styles="sm:mb-0 mb-2" >
                        <GoBackIcon />
                    </ButtonLight>
                {/if}
            </section>
        </div>
    {/if}
    <section in:fade={{ duration: 300 }} out:fade={{ duration: 0 }} id="diagram-gantt"
        class="sm:p-6 p-3 mx-auto bg-white rounded-md shadow-md mb-4 mt-6 h-fit" 
    >
        <header class="flex sm:flex-row flex-col justify-center items-center gap-4">
            <!-- <figure class="sm:w-[10%] w-1/4">
                <img src="/orden-seguridad.webp" alt="Orden y Seguridad Coahuila">
            </figure> -->
            <div class="sm:w-[70%] w-full bg-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-lg text-center text-base sm:text-xl uppercase">{dataDiagram.name}</div>
            <aside class="sm:w-1/5 w-full truncate overflow-hidden max-w-full sm:border-none border-b-2 border-gray-200 sm:border-transparent sm:pb-0 pb-5">
                <ul class="text-sm max-w-full">
                    <li><strong>Responsable:</strong> <br>
                        <div class="px-2 py-1 rounded-sm bg-orange-600 text-white sm:flex flex-row items-center w-fit max-w-full block truncate">
                            <span class="font-bold border-r-2 pr-1">
                                {#if !dataDiagram.dependence.data?.logo || dataDiagram.dependence.data?.logo === '' }
                                    {dataDiagram.dependence.data?.abbr ?? '-'}
                                {:else}
                                    <img src={dataDiagram.dependence.data?.logo} alt="Logo de area" width="60">
                                {/if}
                            </span>
                            <div class="sm:pl-1 text-xs max-w-full truncate">{dataDiagram.dependence.data.label}</div>
                        </div>
                    </li>
                    <li class="sm:max-w-52 max-w-72 truncate"><strong>Compromiso:</strong> {dataDiagram.commitment.data?.label ?? '-'}</li>
                    <li class="sm:max-w-52 max-w-72 w-max truncate"><strong>Estrategia:</strong> {dataDiagram.strategy ?? '-'}</li>
                </ul>
            </aside>
        </header>
        
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-5">

            <div class="flex flex-row sm:col-span-12 sm:grid-cols-12 gap-4 sm:grid overflow-x-scroll sm:overflow-x-hidden sm:pb-0 pb-5">

                <div class="sm:col-span-2 flex flex-col gap-y-3">
                    <div class="h-10"></div>
                    {#each actions as act }
                        {#if act && act.name }
                            <div class="bg-gray-200 text-gray-700 max-w-[130px] sm:max-w-full w-full px-1.5 font-semibold truncate py-2 directional-mask text-xs pr-3">
                                {act.name}
                            </div>
                        {/if}
                    {/each}
                </div>

                <div class="sm:col-span-8 overflow-x-hidden sm:overflow-x-scroll px-5 overflow-y-hidden flex flex-col gap-y-3.5 pb-5 sm:w-full min-w-fit sm:min-w-0">
                    <div style="display: grid; grid-template-columns: repeat({dataMonth.length}, minmax(100px, 1fr)); gap: 1rem;" class="mb-4">
                        {#each dataMonth as month, idx }
                            <div style="grid-column: span 1; text-align: center; text-transform: capitalize; font-weight: 600; border-bottom: 2px solid {colors[idx]};">{month}</div>
                        {/each}
                    </div>
                    {#each actions as act }
                        {#if act && act.name }
                            <div style="display: grid; grid-template-columns: repeat({dataMonth.length}, minmax(100px, 1fr)); gap: 1rem">
                                <div style="{act.span.style}; {act.span.class}; height: 30px; border-radius: 3px; margin-bottom: -1px;"></div>
                            </div>
                        {/if}
                    {/each}
                </div>
                
                <div class="sm:col-span-2 flex flex-col gap-y-3">
                    <div class="h-10"></div>
                    {#each actions as act }
                        {#if act && act.name }
                            <div class="px-2 py-1 rounded-sm bg-ins-600 text-white flex flex-row items-center w-fit truncate max-w-40">
                                <span class="font-bold sm:border-r-2 pr-1">
                                    {#if !act.dependence?.data?.logo || act.dependence?.data?.logo === '' }
                                        {act.dependence?.data?.abbr ?? '-'}
                                    {:else}
                                        <img src={act.dependence?.data?.logo} alt="Logo de area" width="60">
                                    {/if}
                                </span>
                                <span class="pl-1 text-xs hidden sm:block truncate">{act.dependence?.data?.label ?? 'Desconocida'}</span>
                            </div>
                        {/if}
                    {/each}
                </div>

            </div>

        </div>
        
    </section>
</div>

<style>
    .directional-mask {
        clip-path: polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%);
    }
</style>