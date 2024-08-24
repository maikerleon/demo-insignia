<script>
	import FormSocialization from '$components/projects/FormSocialization.svelte';
    import TableSocialization from "$components/projects/TableSocialization.svelte";
    import { socializationStructure } from "$lib/utilities.js";

    export let project;
    export let socialization;
    export let role;

    let tableSee = true;
    let dataSee;

    const toggleTable = () => tableSee = !tableSee;

    const createStrategy = () => {
        dataSee = socializationStructure();
        toggleTable();
    }

    const edit = ({detail}) => {
        dataSee = detail;        
        toggleTable();
    }

    const addNewStrategy = ({detail}) => {
        socialization = [detail, ...socialization];
        toggleTable();
    }

</script>

{#if tableSee }
    <TableSocialization {socialization} {createStrategy} on:handleEdit={edit} />
{:else}
    <FormSocialization {project} {toggleTable} on:handleAddNewStrategy={addNewStrategy} bind:dataSee={dataSee} {role} />
{/if}