<script>
    import Login from '$components/Login.svelte';
	import { getContext } from 'svelte';

    const login = getContext('login');

    export let form;

</script>

{#if !$login }
    <Login {form} />
{/if}