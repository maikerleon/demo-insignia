<script>
    export let text = '';
    export let action;
    export let styles = '';
    export let typeButton = '';
</script>

{#if typeButton === '' }
    <button on:click={action} class="border border-ins-700 hover:outline-none bg-gray-100/70 hover:bg-ins-700 text-ins-700 px-6 py-2 rounded-md text-sm flex items-center hover:text-white font-semibold focus-visible:outline-none {styles}">
        <slot /> {text}
    </button>
{:else if typeButton === 'button' }
    <button type="button" on:click={action} class="border border-ins-700 hover:outline-none bg-gray-100/70 hover:bg-ins-700 text-ins-700 px-6 py-2 rounded-md text-sm flex items-center hover:text-white font-semibold focus-visible:outline-none {styles}">
        <slot /> {text}
    </button>
{/if}

