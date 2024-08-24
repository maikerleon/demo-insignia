<script>
	import GoBackIcon from '$icons/GoBackIcon.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
    export let dependenceSelected;
    export let typeProject;
</script>

<section class="space-y-20 w-full">
    <header class="md:space-y-1 md:gap-0 gap-4 flex sm:justify-between w-full md:flex-row flex-col-reverse">
        <div>
            <h1 class="text-2xl sm:text-4xl text-ins-700 font-semibold">Proyectos</h1>
            <h2 class="text-xl sm:text-3xl font-semibold">{dependenceSelected === 'all' ? 'Todos los proyectos' : dependenceSelected.name}</h2>
        </div>
        <div class="flex justify-end">
            <ButtonLight text="Ir Atrás" styles='max-h-10 max-w-fit align-end' action={() => dependenceSelected = ''}>
                <GoBackIcon size={20} styles='mr-1' />
            </ButtonLight>
        </div>
    </header>
    
    <ul class="space-y-4">
        <li>
            <button on:click={()=>typeProject = 'general'}>Catálogo general</button>
            <!-- <button>Catálogo general</button> -->
        </li>
        <li>
            <button on:click={()=>typeProject = 'past'}>¿Qué hemos hecho?</button>
            <!-- <button>¿Qué hemos hecho?</button> -->
        </li>
        <li>
            <button on:click={()=>typeProject = 'missing'}>¿Qué nos falta?</button>
            <!-- <button>¿Qué nos falta?</button> -->
        </li>
        <li>
            <button on:click={()=>typeProject = 'future'}>¿Qué sigue?</button>
            <!-- <button>¿Qué sigue?</button> -->
        </li>
    </ul>
</section>

<style>
    button {
        @apply text-2xl font-semibold text-gray-700;
    }
    button:hover {
        @apply text-ins-700;
    }
</style>