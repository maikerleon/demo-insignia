<script>
    import { fly } from 'svelte/transition';
    import ChevronUpIcon from '$icons/ChevronUpIcon.svelte';
	import ChevronDownIcon from '$icons/ChevronDownIcon.svelte';
    import { formatDate } from "$lib/utilities";
	import CalendarClockIcon from '$icons/CalendarClockIcon.svelte';
    import ChevronLeftIcon from '$icons/ChevronLeftIcon.svelte';
    import ChevronRightIcon from '$icons/ChevronRightIcon.svelte';
    import ExternalLink from '$icons/ExternalLink.svelte';
    import ArticleFeed from "$components/feed/ArticleFeed.svelte";

    export let data;
    let { progress, progress_supervisor, role } = data;

    let startProjectProgress = -1;
    let endProjectProgress = 2;
    let startProjectProgressSupervisor = -1;
    let endProjectProgressSupervisor = 2;

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

    let pendingEvents = {
        past: [],
        present: [],
        future: []
    };

    const searchApprovals = async () => {

        if (!['super-admin', 'governor'].includes(role)) return;

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

    const handleUpProgress = (total, type) => {
        if( type === 'progress') {
            if ( startProjectProgress === -1 ) return;
            startProjectProgress--;
            endProjectProgress--;
        }else{
            if ( startProjectProgressSupervisor === -1 ) return;
            startProjectProgressSupervisor--;
            endProjectProgressSupervisor--;
        }
    }

    const handleDownProgress = (total, type) => {
        if( type === 'progress') {
            if ( endProjectProgress === total ) return;
            startProjectProgress++;
            endProjectProgress++;
        }else{
            if ( endProjectProgressSupervisor === total ) return;
            startProjectProgressSupervisor++;
            endProjectProgressSupervisor++;
        }
    }

    searchApprovals();

</script>

<section class="flex flex-col-reverse sm:grid sm:grid-cols-12 gap-5 sm:p-0 p-4">

    <div class="col-span-1 sm:col-span-9 flex flex-col gap-4">

        <div class="bg-gray-100 rounded-lg pr-3 py-6 flex">
            <aside class="flex justify-center items-center p-1">
                <div class="flex justify-between items-center flex-col h-64">
                    {#if startProjectProgressSupervisor === -1 }
                        <ChevronUpIcon size={60} styles="text-gray-400 cursor-not-allowed"/>
                    {:else}
                        <button class="text-ins-700 hover:scale-110 transition-all" on:click={()=>handleUpProgress(progress_supervisor.length, 'progress_supervisor')}>
                            <ChevronUpIcon size={60}/>
                        </button>
                    {/if}
                    {#if endProjectProgressSupervisor === progress_supervisor.length }
                            <ChevronDownIcon size={60} styles="text-gray-400 cursor-not-allowed"/>
                    {:else}
                        <button class="text-ins-700 hover:scale-110 transition-all" on:click={()=>handleDownProgress(progress_supervisor.length, 'progress_supervisor')}>
                            <ChevronDownIcon size={60}/>
                        </button>
                    {/if}
                </div>
            </aside>
    
            <div class="flex flex-col gap-4">
                <header class="bg-ins-700 w-fit px-2 rounded-md mb-1">
                    <h2 class="text-gray-100 uppercase text-xl p-2">Avances proyectos supervisor</h2>
                </header>
                {#each progress_supervisor as prog, idx }
                    {#if idx > startProjectProgressSupervisor && idx < endProjectProgressSupervisor }
                        <div in:fly={{ y: 100, duration: 100 * idx }}>
                            <ArticleFeed progress={prog} />
                        </div>
                    {/if}
                {:else}
                    <article>
                        <span>No hay proyectos</span>
                    </article>
                {/each}
            </div>
        </div>

        <div class="bg-gray-100 rounded-lg pr-3 py-6 flex">
            <aside class="flex justify-center items-center p-1">
                <div class="flex justify-between items-center flex-col h-64">
                    {#if startProjectProgress === -1 }
                        <ChevronUpIcon size={60} styles="text-gray-400 cursor-not-allowed"/>
                    {:else}
                        <button class="text-ins-700 hover:scale-110 transition-all" on:click={()=>handleUpProgress(progress.length, 'progress')}>
                            <ChevronUpIcon size={60}/>
                        </button>
                    {/if}
                    {#if endProjectProgress === progress.length }
                            <ChevronDownIcon size={60} styles="text-gray-400 cursor-not-allowed"/>
                    {:else}
                        <button class="text-ins-700 hover:scale-110 transition-all" on:click={()=>handleDownProgress(progress.length, 'progress')}>
                            <ChevronDownIcon size={60}/>
                        </button>
                    {/if}
                </div>
            </aside>
    
            <div class="flex flex-col gap-4">
                <header class="bg-ins-700 w-fit px-2 rounded-md mb-1">
                    <h2 class="text-gray-100 uppercase text-xl p-2">Avances enlaces estratégicos</h2>
                </header>
                {#each progress as prog, idx }
                    {#if idx > startProjectProgress && idx < endProjectProgress }
                        <div in:fly={{ y: 100, duration: 100 * idx }}>
                            <ArticleFeed progress={prog} />
                        </div>
                    {/if}
                {:else}
                    <article>
                        <span>No hay proyectos</span>
                    </article>
                {/each}
            </div>
        </div>

    </div>

    <div class="flex sm:relative">
        <div class="flex sm:fixed flex-col justify-center items-center col-span-3 gap-1 bg-gray-100 px-3 py-4 rounded-md h-fit sm:w-[18%] w-full">
            <header class="bg-orange-600 rounded-md text-gray-100 text-lg uppercase font-semibold p-2 flex flex-row justify-center items-center gap-2 w-full mb-2">
                <CalendarClockIcon size={20} />
                <h2 class="text-sm">Próximos eventos</h2>
            </header>
            <section class="grid grid-cols-12 w-full items-center gap-x-1">
                <div class="col-span-2 flex justify-center">
                    {#if selectedMonth === 'past' }
                        <button class="text-gray-300 rounded-xl p-1 border border-gray-300 cursor-not-allowed" disabled>
                            <ChevronLeftIcon size={20} styles="stroke-2" />
                        </button>
                    {:else}
                        <button class="hover:text-white text-orange-600 hover:bg-orange-600 rounded-xl p-1 border border-orange-600" on:click={() => changeMonth('back')}>
                            <ChevronLeftIcon size={20} styles="stroke-2" />
                        </button>
                    {/if}
                </div>
                <div class="col-span-8">
                    <h4 class="bg-orange-700 text-white rounded-md p-1 uppercase text-center text-sm">{dateRanges[selectedMonth]}</h4>
                    <div class="py-6 flex flex-col gap-1 w-full">
                        {#each pendingEvents[selectedMonth] as event }
                            <article class="flex-row flex items-center bg-gray-200 px-1.5 rounded-md border border-gray-500/50">
                                <div class="flex flex-col w-11/12 justify-start [&>span]:w-fit py-2 text-left">
                                    <span class="text-xs">{formatDate(event.start)}</span>
                                    <div class="w-4/5 truncate text-sm">{event.name}</div>
                                </div>
                                <div>
                                    <a href="/proyectos/accion/{event.id}" class="group">
                                        <ExternalLink size={20} styles="group-hover:scale-110 group-hover:text-ins-600 duration-300 transition-all" />
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
                <div class="col-span-2 flex justify-center">
                    {#if selectedMonth === 'future' }
                        <button class="text-gray-300 rounded-xl p-1 border border-gray-300 cursor-not-allowed" disabled>
                            <ChevronRightIcon size={20} styles="stroke-2" />
                        </button>
                    {:else}
                        <button class="hover:text-white text-orange-600 hover:bg-orange-600 rounded-xl p-1 border border-orange-600" on:click={() => changeMonth('follow')}>
                            <ChevronRightIcon size={20} styles="stroke-2" />
                        </button>
                    {/if}
                </div>
            </section>
        </div>
    </div>
</section>