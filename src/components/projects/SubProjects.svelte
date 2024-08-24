<script>
	import Swal from 'sweetalert2';
	import { subProjectStructure } from '$lib/utilities.js';
    import FormSubProjects from '$components/projects/FormSubProjects.svelte';
    import TableSubProjects from '$components/projects/TableSubProjects.svelte';
    import {messageAlert, handleLoading} from '$lib/utilities.js';

    export let project;
    export let progress;
    export let bucket;
    export let role;
    export let nameProject;
    export let dependence;

    let tableSee = true;
    let dataSee;

    const toggleTable = () => tableSee = !tableSee;

    const createProgress = () => {
        dataSee = subProjectStructure();
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

    const handleDelete = async ({detail: subproject}) => {

        const result = await Swal.fire({
            title: "¡No podrás revertir esto!",
            text: `¿Estás seguro de eliminar esté sub proyecto?`,
            icon: 'warning',
            focusCancel: true,
            showCancelButton: true,
            confirmButtonColor: '#1fabbb',
            cancelButtonColor: '#d33',
            confirmButtonText: '¡Sí, eliminarlo!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            handleLoading();

            try {

                const action = '/api/delete-sub-project/'
                
                const formData = new FormData();
                
                formData.append('project', project);
                formData.append('sub_project', subproject);

                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                const resp = await response.text();
                const {success} = JSON.parse(resp);

                if( success ) {
                    progress = progress.filter( item => item.id !== subproject );
                    messageAlert('success',`Se ha eliminado el sub proyecto con éxito`);
                    return;
                }

                throw new Error;

            } catch (error) {
                messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
            }
        }
    }

</script>

{#if tableSee }
    <TableSubProjects {progress} {createProgress} on:handleEdit={edit} {nameProject} on:handleDelete={handleDelete} />
{:else}
    <FormSubProjects {project} {toggleTable} on:handleAddNewProgress={addNewProgress} bind:dataSee={dataSee} {bucket} {role} {nameProject} {dependence} />
{/if}