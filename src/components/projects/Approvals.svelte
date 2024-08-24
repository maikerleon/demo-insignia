<script>
	import FormApprovals from '$components/projects/FormApprovals.svelte';
    import TableApprovals from "$components/projects/TableApprovals.svelte";
    import { approvalStructure } from "$lib/utilities.js";

    export let project;
    export let progress;
    export let bucket;
    export let role;

    let tableSee = true;
    let dataSee;

    const toggleTable = () => tableSee = !tableSee;

    const createProgress = () => {
        dataSee = approvalStructure();
        toggleTable();
    }

    const edit = ({detail}) => {
        dataSee = detail;        
        toggleTable();
    }

    const addNewProgress = ({detail}) => {
        progress = [detail, ...progress];
        toggleTable();
    }

</script>

{#if tableSee }
    <TableApprovals {progress} {createProgress} on:handleEdit={edit} />
{:else}
    <FormApprovals {project} {toggleTable} on:handleAddNewProgress={addNewProgress} bind:dataSee={dataSee} {bucket} {role} />
{/if}