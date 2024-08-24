<script>
    import { Splide, SplideSlide } from '@splidejs/svelte-splide';
    import '@splidejs/svelte-splide/css/sea-green';
	import { formatDate } from '$lib/utilities.js';
    import PhotoSwipeLightbox from 'photoswipe/lightbox';
    import 'photoswipe/style.css';
    import { onMount } from 'svelte';

    export let progress;

    const options= {
        type: 'loop',
        gap   : '1rem',
        perPage: 3,
        rewind: true,
        perMove: 2,
        height: '8rem',
    }

    onMount(() => {
    let lightbox = new PhotoSwipeLightbox({
      gallery: `#${progress.name.replace(/[^a-zA-Z]/g, '').toLowerCase()}`,
      children: 'a',
      showHideAnimationType: 'zoom',
      pswpModule: () => import('photoswipe'),
    });
    lightbox.init();})

</script>

<article class="bg-white p-4 rounded-md grid grid-cols-1 sm:grid-cols-6 text-gray-500">
    <header class="col-span-1 sm:col-span-6">
        <h3 class="text-gray-600 font-bold text-base sm:text-lg uppercase">{progress.name}</h3>
    </header>
    <div class="col-span-1 sm:col-span-5">
        <section>
            <div class="mt-3">{progress.progress?.general}</div>
            <div class="pswp-gallery" id={progress.name.replace(/[^a-zA-Z]/g, '').toLowerCase()}>
                {#if progress.progress?.files.length > 0}
                
                    <Splide aria-label="Fotos de avance" {options} >
                        {#each progress.progress?.files as {file, width, height} }
                            <SplideSlide>
                                <a href={file} data-pswp-width={width ?? 1000} data-pswp-height={height ?? 1000} target="_blank" rel="noreferrer" >
                                    <img src={file} alt={progress.name} class="rounded-md w-full h-[7rem] object-cover" />
                                </a>
                            </SplideSlide>
                        {/each}
                    </Splide>
                    
                {/if}
            </div>
        </section>

    </div>
    <div class="col-span-1 flex justify-end sm:justify-center items-center">
        <div class="radial-progress bg-ins-700 text-white border-4 border-ins-700 font-bold" style="--value:{progress.progress?.percent};" role="progressbar">{progress.progress?.percent}%</div>
    </div>
    <footer class="col-span-1 sm:col-span-6 ml-0.5">
        <span class="text-sm font-semibold">{formatDate(progress.progress?.created_at)}</span>
    </footer>
</article>

<style>
    :global(.splide__arrow svg) {
        fill:#1e6f80 !important;
        height: 1.5em;
        width: 1.5em;
    }
    :global(.splide) {
        padding: 1.2em 3em;
    }
    :global(.splide) {
        background: #f2f2f2;
        border-radius: 10px;
        margin: 15px 0px;
    }
</style>