<script>
	import { closeAlert } from '$lib/utilities.js';
    import TableActions from '$components/actions/TableActions.svelte';
    import { onMount } from 'svelte';
    
    export let data;
    let { actions, role } = data;

    onMount(() => {
        closeAlert();
    });

</script>

<TableActions {actions} {role} />