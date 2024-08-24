<script>
	import FormRoles from '$components/roles/FormRoles.svelte';
    import TableRoles from '$components/roles/TableRoles.svelte';
    import { adminStructure } from '$lib/utilities';
    export let form;
    export let data;
    let {dependence, role, admins, dependences, coordination, municipality} = data;

    let table = true;

    const handleToggleTable = () => table = !table;

    let adminSee = adminStructure();

    const resetAdminSee = () => {
        adminSee = adminStructure();
    }

    const editAdmin = ({detail}) => {
        adminSee = detail;        
        handleToggleTable();
    }

    const addAdmin = ({detail}) => {
        if (detail.create) {
            admins.push(detail.detail);
            handleToggleTable();
        }else {
            const index = admins.findIndex(admin => admin.id === detail.detail.id);
            admins[index] = detail.detail;
        }
    }

</script>

{#if table }
    <TableRoles {admins} {handleToggleTable} {resetAdminSee} {dependences} on:handleEditAdmin={editAdmin} {role} />
{:else}
    <FormRoles {form} {role} {handleToggleTable} {adminSee} {dependence} on:handleAddAdmin={addAdmin} {dependences} {municipality} {coordination} />
{/if}