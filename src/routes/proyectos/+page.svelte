<script>
	import { closeAlert } from '$lib/utilities.js';
    import TableProjects from '$components/projects/TableProjects.svelte';
    import FormProjects from '$components/projects/FormProjects.svelte';
    import { projectStructure } from '$lib/utilities';
    import DiagramGantt from '$components/DiagramGantt.svelte';
  import { onMount } from 'svelte';
    
    export let form;
    export let data;
    let { projects, role, managers, dependences, axies } = data;

    let table = true;
    let diagram = false;
    let dataDiagram;
    let search = '';

    const handleToggleTable = () => table = !table;
    const handleToggleDiagram = () => diagram = !diagram;

    let dataSee = projectStructure();

    const reset = () => {
        dataSee = projectStructure();
    }

    const seeDiagram = ({detail}) => {
        dataDiagram = detail;
        handleToggleDiagram();
    }

    const edit = ({detail}) => {
        dataSee = detail;
        dataSee.duplicate = false;
        handleToggleTable();
    }

    const duplicate = ({detail}) => {
        dataSee = {...detail};
        dataSee.duplicate = true;
        dataSee.actions.list.map(action => action.id = '');
        handleToggleTable();
    }

    const addProject = ({detail}) => {
        if (detail.create) {
            projects.unshift(detail.detail);
            handleToggleTable();
        }else {
            const index = projects.findIndex(admin => admin.id === detail.detail.id);
            projects[index] = detail.detail;
        }
    }

    onMount(() => {
        closeAlert();
    });

</script>

{#if table }
    {#if !diagram }
        <TableProjects {handleToggleTable} {reset} {projects} on:handleEdit={edit} on:handleDuplicate={duplicate} on:handleSeeDiagram={seeDiagram} {role} bind:search={search} />
    {:else}
        <DiagramGantt {dataDiagram} {handleToggleDiagram} />
    {/if}
{:else}
    <FormProjects {form} {dataSee} {handleToggleTable} on:handleAdd={addProject} {role} {managers} {axies} {dependences} />
{/if}