<script>
	import { closeAlert } from '$lib/utilities.js';
    import TableFinance from '$components/finance/TableFinance.svelte';
    import { onMount } from 'svelte';
    
    export let data;
    let { projects, role } = data;

    onMount(() => {
        closeAlert();
    });

</script>

<TableFinance {projects} {role} />