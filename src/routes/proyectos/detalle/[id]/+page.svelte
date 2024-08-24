<script>
    import FormProjects from '$components/projects/FormProjects.svelte';
    export let form;
    export let data;
    let { project, role, managers, axies, dependences } = data;

    let dataSee = project;

</script>

<FormProjects {form} {dataSee} {role} goBack={false} {managers} {axies} {dependences} handleToggleTable={()=>{}} />