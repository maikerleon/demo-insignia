<script>
    import TableProgress from "$components/projects/TableProgress.svelte";
    import FormProgress from "$components/projects/FormProgress.svelte";
    import { progressStructure } from "$lib/utilities.js";

    export let project;
    export let progress;
    export let subactions;
    export let actions;
    export let bucket;
    export let role;

    let tableSee = true;
    let dataSee;

    const calculateProgressActions = () => {
        if ( !actions || actions.length === 0) return 0;
        let total = actions.length;
        let finished = actions.filter(action => action.status === "finished").length;
        return Math.round((finished / total) * 100);
    }

    const toggleTable = () => tableSee = !tableSee;

    const createProgress = () => {
        dataSee = progressStructure();
        dataSee.sub_actions = subactions;
        dataSee.system_progress = calculateProgressActions();
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
    <TableProgress {progress} {createProgress} on:handleEdit={edit} {bucket} {role} />
{:else}
    <FormProgress {project} {toggleTable} on:handleAddNewProgress={addNewProgress} bind:dataSee={dataSee} {bucket} {role} />
{/if}