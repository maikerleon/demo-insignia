<script>
	import TableConstructions from '$components/constructions/TableConstructions.svelte';
    
    export let data;
    let { projects, role } = data;

</script>

<TableConstructions {projects} {role} />