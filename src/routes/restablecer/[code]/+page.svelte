<script>
    import Restore from '$components/Restore.svelte';
	import { getContext } from 'svelte';

    export let data;
    const {code} = data;

    const login = getContext('login');

</script>

{#if !$login }
    <Restore {code} />
{/if}