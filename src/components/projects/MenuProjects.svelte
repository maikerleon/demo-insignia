<script>
    import { createEventDispatcher } from 'svelte';
  
    export let selectedTab;
    export let tabItems;
    
    const dispatch = createEventDispatcher();
    
    const changeTab = (tab) => {
        selectedTab = tab;
        dispatch('change', selectedTab);
    }

</script>
  
<div class="w-full mb-7">
    <div class="w-full border-b flex flex-col sm:flex-row  items-center gap-x-1 overflow-x-auto text-sm" aria-label="Menu proyectos">
      {#each tabItems as {icon, name}}
        <button
          class:active="{selectedTab === name}"
          class="[&.active]:text-ins-600 [&.active]:border-ins-600 outline-none py-1.5 border-b-2 border-transparent text-gray-500 hover:border-ins-600 hover:text-ins-600 sm:w-fit w-full"
          on:click={() => changeTab(name)}
        >
          <div class="flex items-center gap-x-1 py-1.5 px-3 rounded-lg duration-150 hover:text-ins-600 font-medium">
            <svelte:component this={icon} />
            {name}
          </div>
        </button>
      {/each}
    </div>
</div>