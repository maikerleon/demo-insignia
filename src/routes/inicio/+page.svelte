<script>
	import GridHome from '$components/home/GridHome.svelte';
	import RssIcon from '$icons/RssIcon.svelte';
	import ExternalLink from '$icons/ExternalLink.svelte';
	import ChevronRightIcon from '$icons/ChevronRightIcon.svelte';
	import ChevronLeftIcon from '$icons/ChevronLeftIcon.svelte';
	import CalendarClockIcon from '$icons/CalendarClockIcon.svelte';
	import ChartIcon from '$icons/ChartIcon.svelte';
	import DependenceIcon from '$icons/DependenceIcon.svelte';
	import AgendIcon from '$icons/AgendIcon.svelte';
	import BlackhoeIcon from '$icons/BlackhoeIcon.svelte';
    import { closeAlert, formatDate } from "$lib/utilities";
    import { fade } from 'svelte/transition';

    export let data;
    const {role, dependences, dependence, axis} = data;
    let dependenceSelected = '';

    closeAlert();

    let faqsList = [
        {
            "q": "¿Cómo recuperar la contraseña?",
            "a": "Para restablecer tu contraseña, selecciona la opción 'Restablecer contraseña' y recibirás un correo electrónico para establecer una nueva contraseña."
        },
        {
            "q": "¿Cómo registrar un proyecto?",
            "a": "Para registrar un proyecto, ve a la sección 'Proyectos', haz clic en 'Agregar proyecto' e ingresa toda la información requerida."
        },
        {
            "q": "¿Dónde ver las estadísticas?",
            "a": "Para ver las estadísticas, dirígete a la sección 'Estadísticas' donde podrás monitorear tu información."
        },
        {
            "q": "¿Cómo descargar el calendario?",
            "a": "Ve a 'Calendario', ajusta los filtros según necesites y selecciona 'Descargar' para obtener tu calendario."
        },
        {
            "q": "¿Cómo subir evidencias?",
            "a": "Para subir evidencias, accede a 'Proyectos', selecciona la acción deseada, sube la evidencia y haz clic en 'Actualizar acción'."
        },
        {
            "q": "¿Cómo descargar la tarjeta informativa de un proyecto?",
            "a": "En 'Proyectos', pasa el mouse por encima del nombre del proyecto que te interesa; verás la opción para descargar la tarjeta informativa del proyecto."
        }
    ];

    const getDateRanges = () => {
        const months = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonthIndex = currentDate.getMonth();

        const pastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
        const futureMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;

        const present = `${months[currentMonthIndex]} ${currentYear}`;
        const past = `${months[pastMonthIndex]} ${currentMonthIndex === 0 ? currentYear - 1 : currentYear}`;
        const future = `${months[futureMonthIndex]} ${currentMonthIndex === 11 ? currentYear + 1 : currentYear}`;

        return { past, present, future };
    };

    const dateRanges = getDateRanges();

    let selectedMonth = 'present';

    const changeMonth = (indicator) => {
        if (indicator === 'back') {
            selectedMonth = selectedMonth === 'present' ? 'past' : 'present';
        }else if (indicator === 'follow'){
            selectedMonth = selectedMonth === 'present' ? 'future' : 'present';
        }
        return;
    }

    let openFaqIndex = null;

    const toggleFaq = (index) => {
        openFaqIndex = openFaqIndex === index ? null : index;
    }

    let pendingEvents = {
        past: [],
        present: [],
        future: []
    };

    const searchEvents = async () => {

        if (!['super-admin', 'super-view', 'chief', 'governor'].includes(role)) return;

        try {
            
            const response = await fetch('/api/pending-events/');
            const resp = await response.text();
            const {success, data} = JSON.parse(resp);

            if( success ) {
                pendingEvents = {...data};
                return;
            }

            throw new Error;

        } catch (error) {
            pendingEvents = { past: [], present: [], future: [] };
        }
    }

    searchEvents();

</script>

{#if !dependenceSelected }
    <section class="grid-cols-2 sm:grid-cols-5 grid gap-1 sm:gap-10 items-center p-3 sm:p-0">
        
            <article class="col-span-2 sm:col-span-3 flex items-center sm:order-1 order-2 sm:mt-0 mt-5">
                <div class="text-gray-600 gap-x-12 items-center justify-between">
                    <div class="flex-none space-y-5 px-4 sm:px-0 mt-5">
                        <h1 class="text-lg text-ins-600 font-medium">Nunca antes ha sido tan fácil...</h1>
                        <h2 class="text-4xl text-gray-800 font-extrabold sm:text-5xl">¡Registra, actualiza y da seguimiento!</h2>
                    </div>
                    <div class="space-y-3 text-center mt-10 bg-white/50 px-4 py-2 rounded-md transition-all duration-300">
                        {#if !['super-admin', 'super-view', 'governor', 'chief'].includes(role) }
                            {#each faqsList as item, index (item.q)}
                                <div role="button" tabindex="-1" class="w-full space-y-3 mt-5 overflow-hidden {faqsList.length !== index+1 ? 'border-b' : '' }" on:keypress={() => toggleFaq(index)} on:click={() => toggleFaq(index)}>
                                <h4 class="cursor-pointer pb-5 flex items-center justify-between text-lg text-gray-700 font-medium text-left">
                                    {item.q}
                                    <svg xmlns="http://www.w3.org/2000/svg" class="{openFaqIndex === index ? 'rotate-180' : ''} transition-all duration-300 h-5 w-5 text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" /> </svg>
                                </h4>
                                {#if openFaqIndex === index}
                                    <div in:fade={{ duration: 300 }} class="answer duration-300 ease-in-out">
                                    <p class="text-gray-500 pb-3 text-left">
                                        {item.a}
                                    </p>
                                    </div>
                                {/if}
                                </div>
                            {/each}
                        {:else}
                            <div class="flex flex-col justify-center items-center gap-2">
                                <header class="bg-ins-600 rounded-md text-gray-100 text-lg uppercase font-semibold p-2 flex flex-row justify-center items-center gap-2 w-full">
                                    <CalendarClockIcon size={28} />
                                    <h3>Próximos eventos</h3>
                                </header>
                                <section class="grid grid-cols-12 w-full items-center gap-x-5">
                                    <div class="col-span-2">
                                        {#if selectedMonth === 'past' }
                                            <button class="text-gray-300 rounded-xl p-1 border border-gray-300 cursor-not-allowed" disabled>
                                                <ChevronLeftIcon size={28} styles="stroke-2" />
                                            </button>
                                        {:else}
                                            <button class="hover:text-white text-orange-600 hover:bg-ins-600 rounded-xl p-1 border border-orange-600" on:click={() => changeMonth('back')}>
                                                <ChevronLeftIcon size={28} styles="stroke-2" />
                                            </button>
                                        {/if}
                                    </div>
                                    <div class="col-span-8">
                                        <h4 class="bg-ins-700 text-white rounded-md p-1 uppercase">{dateRanges[selectedMonth]}</h4>
                                        <div class="py-8 px-4 flex flex-col gap-2">
                                            {#each pendingEvents[selectedMonth] as event }
                                                <article class="flex-row flex items-center bg-gray-200 py-1 px-3 rounded-md border border-gray-500/50">
                                                    <div class="flex flex-col w-11/12 justify-start [&>span]:w-fit py-2 text-left">
                                                        <span class="text-xs">{formatDate(event.start)}</span>
                                                        <div class="w-4/5 truncate">{event.name}</div>
                                                    </div>
                                                    <div>
                                                        <a href="/proyectos/accion/{event.id}" class="group">
                                                            <ExternalLink size={20} styles="group-hover:scale-125 group-hover:text-ins-600 duration-300 transition-all" />
                                                        </a>
                                                    </div>
                                                </article>
                                            {:else}
                                                <article class="flex-row flex items-center bg-gray-200 py-3 px-3 rounded-md border border-gray-500/50">
                                                    <span>Sin eventos</span>
                                                </article>
                                            {/each}
                                        </div>
                                    </div>
                                    <div class="col-span-2">
                                        {#if selectedMonth === 'future' }
                                            <button class="text-gray-300 rounded-xl p-1 border border-gray-300 cursor-not-allowed" disabled>
                                                <ChevronRightIcon size={28} styles="stroke-2" />
                                            </button>
                                        {:else}
                                            <button class="hover:text-white text-orange-600 hover:bg-ins-600 rounded-xl p-1 border border-orange-600" on:click={() => changeMonth('follow')}>
                                                <ChevronRightIcon size={28} styles="stroke-2" />
                                            </button>
                                        {/if}
                                    </div>
                                </section>
                            </div>
                        {/if}
                    </div>
                </div>
            </article>

            <article class="col-span-2 sm:order-2 order-1">
                <div class="flex-none">
                    <img
                        src="/home.webp"
                        class="sm:rounded-tl-[108px] shadow-md max-w-full"
                        alt="Inicio Insignia"
                    />
                </div>
                {#if ['super-admin', 'super-view', 'governor', 'chief'].includes(role) }
                    <div class="flex-none mt-12 text-white">
                        <ul class="grid grid-cols-2 gap-3 items-center justify-center [&>*]:bg-ins-700 [&>*]:rounded-md">
                            <li>
                                <a href="/{['governor', 'chief'].includes(role) ? 'catalogo-proyectos' : 'proyectos'}" class="hover:scale-[1.03] transition-all duration-300 flex justify-center items-center flex-col px-1 py-3 gap-3 hover:bg-ins-600 w-full rounded-md">
                                    {['governor', 'chief'].includes(role) ? 'Catálogo Proyectos' : 'Proyectos'}
                                    <BlackhoeIcon size={60} />
                                </a>
                            </li>
                            <li>
                                <a href="/calendarios" class="hover:scale-[1.03] transition-all duration-300 flex justify-center items-center flex-col px-1 py-3 gap-3 hover:bg-ins-600 w-full rounded-md">
                                    Calendarios
                                    <AgendIcon size={60} />
                                </a>
                            </li>
                            <li>
                                {#if ['governor', 'chief'].includes(role) }
                                    <a href="/feed" class="hover:scale-[1.03] transition-all duration-300 flex justify-center items-center flex-col px-1 py-3 gap-3 hover:bg-ins-600 w-full rounded-md">
                                        Feed
                                        <RssIcon size={60} />
                                    </a>
                                {:else}
                                    <a href="/dependencias" class="hover:scale-[1.03] transition-all duration-300 flex justify-center items-center flex-col px-1 py-3 gap-3 hover:bg-ins-600 w-full rounded-md">
                                        Dependencias
                                        <DependenceIcon size={60} />
                                    </a>
                                {/if}
                            </li>
                            <li>
                                <a href="/estadisticas" class="hover:scale-[1.03] transition-all duration-300 flex justify-center items-center flex-col px-1 py-3 gap-3 hover:bg-ins-600 w-full rounded-md">
                                    Estadísticas
                                    <ChartIcon size={60} />
                                </a>
                            </li>
                        </ul>
                    </div>
                {/if}
                
            </article>

    </section>
{/if}

{#if !dependenceSelected }
    {#if !['governor', 'chief'].includes(role) }
        <hr class="border-b border-gray-400/10 mt-12">
    {/if}
{/if}

<div class="md:mt-12 p-3 sm:p-0">
    {#if ['super-admin', 'super-view', 'governor', 'chief', 'dependence'].includes(role) }
        <GridHome {dependences} dependenceId={dependence} bind:dependenceSelected={dependenceSelected} {role} {axis} />
    {/if}
</div>