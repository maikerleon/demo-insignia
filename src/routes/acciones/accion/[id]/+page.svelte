<script>
    import FormActions from '$components/projects/FormActions.svelte';
    
    export let form;
    export let data;

    let { action, role, managers, dependences, dependence, coordination, municipality} = data;

    let dataSee;
    $: dataSee = action;

</script>

<FormActions {form} {dataSee} {role} {managers} {dependences} onlyActions={true} {dependence} {coordination} {municipality} />