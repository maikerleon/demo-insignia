<script>
	import SectionTitle from '$components/SectionTitle.svelte';
	import Progress from '$components/catalogue-projects/Progress.svelte';
    import TableProjects from '$components/catalogue-projects/TableProjects.svelte';
    
    export let data;
    let { projects, role } = data;

    let table = true;

    const handleToggleTable = () => table = !table;

    let dataSee;

</script>

<div class="w-full flex flex-row justify-start items-center">
    <SectionTitle title="Catálogo Proyectos" />
</div>

{#if table }
    <TableProjects {handleToggleTable} {projects} bind:dataSee={dataSee} />
{:else}
    <Progress bind:progress={dataSee.progress_supervisor.data} project={dataSee.id} subactions={0} actions={[]} bucket="progress_supervisor" {role} {handleToggleTable} />
{/if}