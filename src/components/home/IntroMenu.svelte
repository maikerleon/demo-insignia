<script>
    export let intro;
</script>

<header class="flex justify-center items-start sm:gap-6 gap-3">
    <img src="/star.webp" alt="start" width="45">
    <header class="flex justify-center flex-col items-center">
        <h1 class="text-center uppercase tracking-wider text-gray-700 font-semibold sm:text-4xl text-xl">Sistema de inteligencia</h1>
        <h2 class="text-center uppercase tracking-wider text-gray-700 font-semibold sm:text-3xl text-lg">del gobernador</h2>
    </header>
    <img src="/star.webp" alt="start" width="45">
</header>

<div class="flex gap-4 items-center sm:flex-row flex-col">
    <img src="/map.webp" class="img-shadow" alt="Mapa Insignia">
    <div class="flex flex-col sm:gap-6 gap-3">
        <button on:click={()=>intro = false} class="shadow-md transition-all hover:bg-ins-800 custom-arrow bg-ins-700 px-14 h-16 uppercase flex justify-center items-center min-w-fit text-white font-semibold">Proyectos Estratégicos</button>
        
        <a href="https://estrategiasfm.net/rpmjs/mapaEventos.php" rel="noopener noreferrer" target="_blank" class="shadow-md transition-all hover:bg-ins-800 custom-arrow bg-ins-700 px-14 h-16 uppercase flex justify-center items-center min-w-fit text-white font-semibold">Agenda</a>
    </div>
</div>

<style>
    .custom-arrow {
        clip-path: polygon(90% 0%, 100% 50%, 90% 100%, 0% 100%, 8% 50%, 0% 0%);
    }
    .img-shadow {
        filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.411));
    }
</style>