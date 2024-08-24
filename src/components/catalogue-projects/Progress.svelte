<script>
    import TableProgress from "$components/catalogue-projects/TableProgress.svelte";
    import FormProgress from "$components/catalogue-projects/FormProgress.svelte";

    export let project;
    export let progress;
    export let bucket;
    export let role;
    export let handleToggleTable;

    let tableSee = true;
    let dataSee;

    const toggleTable = () => tableSee = !tableSee;

    const edit = ({detail}) => {
        dataSee = detail;        
        toggleTable();
    }

</script>

<section class="my-10">
    {#if tableSee }
        <TableProgress {progress} on:handleEdit={edit} {bucket} {role} {handleToggleTable} />
    {:else}
        <FormProgress {project} {toggleTable} bind:dataSee={dataSee} {bucket} {role} />
    {/if}
</section>