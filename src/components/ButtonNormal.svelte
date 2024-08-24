<script>
    export let text = '';
    export let action;
    export let styles = '';
    export let typeButton = '';
</script>

{#if typeButton === '' }
    <button class="{styles} focus-visible:outline-none px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-ins-700 rounded-md hover:bg-ins-600 focus:outline-none focus:bg-ins-600" on:click={action}>{text}</button>
{:else if typeButton === 'button' }
    <button type="button" class="{styles} focus-visible:outline-none px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-ins-700 rounded-md hover:bg-ins-600 focus:outline-none focus:bg-ins-600" on:click={action}>{text}</button>
{/if}