<script>
	import FormDependences from '$components/dependences/FormDependences.svelte';
	import TableDependences from '$components/dependences/TableDependences.svelte';
    import { dependenceStructure } from '$lib/utilities';
    export let form;
    export let data;
    let { dependences, role } = data;

    let table = true;

    const handleToggleTable = () => table = !table;

    let dependenceSee = dependenceStructure();

    const resetDependenceSee = () => {
        dependenceSee = dependenceStructure();
    }

    const editDependence = ({detail}) => {
        dependenceSee = detail;        
        handleToggleTable();
    }

    const addDependence = ({detail}) => {
        if (detail.create) {
            dependences.push(detail.detail);
            handleToggleTable();
        }else {
            const index = dependences.findIndex(admin => admin.id === detail.detail.id);
            dependences[index] = detail.detail;
        }
    }

</script>

{#if table }
    <TableDependences {handleToggleTable} {resetDependenceSee} {dependences} on:handleEditDependence={editDependence} {role} />
{:else}
    <FormDependences {form} {dependenceSee} {handleToggleTable} on:handleAddDependence={addDependence} {role} />
{/if}