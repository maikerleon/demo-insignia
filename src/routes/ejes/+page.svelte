<script>
    import TableAxis from '$components/axies/TableAxies.svelte';
    import FormAxis from '$components/axies/FormAxies.svelte';
    import { axisStructure } from '$lib/utilities';
    export let form;
    export let data;
    let { axies, role } = data;

    let table = true;

    const handleToggleTable = () => table = !table;

    let axisSee = axisStructure();

    const reset = () => {
        axisSee = axisStructure();
    }

    const edit = ({detail}) => {
        axisSee = detail;        
        handleToggleTable();
    }

    const addAxis = ({detail}) => {
        if (detail.create) {
            axies.push(detail.detail);
            handleToggleTable();
        }else {
            const index = axies.findIndex(admin => admin.id === detail.detail.id);
            axies[index] = detail.detail;
        }
    }

</script>

{#if table }
    <TableAxis {handleToggleTable} {reset} {axies} on:handleEdit={edit} {role} />
{:else}
    <FormAxis {form} axisSee={axisSee} {handleToggleTable} on:handleAdd={addAxis} {role} />
{/if}