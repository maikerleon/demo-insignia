<script>
    import { createEventDispatcher } from 'svelte';
    import ChevronRightIcon from '$icons/ChevronRightIcon.svelte';
    import ChevronLeftIcon from '$icons/ChevronLeftIcon.svelte';
    import DoubleChevronLeftIcon from '$icons/DoubleChevronLeftIcon.svelte';
    import DoubleChevronRightIcon from '$icons/DoubleChevronRightIcon.svelte';

    export let total;
    export let perPage = 10;
    export let typeDocuments;
    export let openedDrawer = false;
    
    const dispatch = createEventDispatcher();
    
    let currentPage = 1;
    $: totalPages = Math.ceil(total / perPage);

    $: startRecord = (currentPage - 1) * perPage + 1;
    $: endRecord = Math.min(startRecord + perPage - 1, total);
    $: visiblePages = calculateVisiblePages(currentPage, totalPages);
    $: if (total) {
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
    }

    const changePage = (page) => currentPage = page;

    function calculateVisiblePages(currentPage, totalPages) {
        let startPage, endPage;

        if (totalPages <= 5) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 3) {
                startPage = 1;
                endPage = 5;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - 4;
                endPage = totalPages;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
        }

        dispatch('handleChangePage', {startRecord, endRecord});
        
        return Array.from({ length: (endPage + 1) - startPage }, (_, i) => startPage + i);
    }
</script>

<section class="flex justify-between items-center w-full px-1 flex-col sm:flex-row">
    <div class="text-gray-500 mb-5 sm:mb-0">
        <span class="font-medium text-gray-700">{startRecord} - {endRecord}</span> de {total} {typeDocuments}
    </div>
    <div class="flex w-full sm:justify-end justify-center" class:opacity-0={openedDrawer}>
        <button on:click={() => changePage(1)}
                disabled={currentPage === 1}
                class="hidden items-center justify-center px-2 py-2 mx-1 text-gray-700 transition-colors duration-300 transform bg-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed sm:flex">
                <DoubleChevronLeftIcon />
        </button>

        <button on:click={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                class="flex items-center justify-center px-2 py-2 mx-1 text-gray-700 transition-colors duration-300 transform bg-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeftIcon />
        </button>

        {#each visiblePages as page}
            <button on:click={() => changePage(page)}
                    class="px-4 py-2 mx-1 transition-colors duration-300 transform rounded-md sm:inline hover:bg-ins-600 hover:text-white {page === currentPage ? 'bg-ins-700 text-white' : 'bg-white text-gray-700'}">
                {page}
            </button>
        {/each}

        <button on:click={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                class="flex items-center justify-center px-2 py-2 mx-1 text-gray-700 transition-colors duration-300 transform bg-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRightIcon />
        </button>

        <button on:click={() => changePage(totalPages)}
                disabled={currentPage === totalPages}
                class="hidden items-center justify-center px-2 py-2 mx-1 text-gray-700 transition-colors duration-300 transform bg-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed sm:flex">
                <DoubleChevronRightIcon />
        </button>
    </div>
</section>
