<script>
  import "../app.css";
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { redirect } from '@sveltejs/kit';
  import Sidebar from "$components/Sidebar.svelte";
  import ToggleMenu from "$components/ToggleMenu.svelte";

  export let data;

  const login = writable();
  $: login.set(data.login);
  setContext('login', login);

  const photo = writable();
  $: photo.set(data.photo);
  setContext('photo', photo);

  const pendingApprovals = writable();
  $: pendingApprovals.set(0);
  setContext('pendingApprovals', pendingApprovals);

  if (!data.login && $page.route.id !== '/restablecer/[code]' && $page.route.id !== '/' && !$page.error) {
    throw redirect(307, '/');
  }

  if ((data.login && $page.route.id === '/') || (data.login && $page.route.id === '/restablecer/[code]') ) {
    throw redirect(307, '/inicio');
  }

  let openMenu = true;
  const toggleOpenMenu = () => {
    openMenu = !openMenu;
    $visibleMenu = openMenu;
  }

  const visibleMenu = writable();
  $: visibleMenu.set(openMenu);
  setContext('visibleMenu', visibleMenu);

  let loaded = false;

  let widthScreenReal = 0;

  onMount( () => {
    widthScreenReal = window.innerWidth;
    window.addEventListener('resize', () => {
      widthScreenReal = window.innerWidth; 
    });
    loaded = true;
  })

  $: if(widthScreenReal) {
    if (widthScreenReal > 768) {
      openMenu = true;
    } else { 
      openMenu = false;
    }

  }
    
</script>

{#if data.login && !$page.error }
  <div class="content transition-all grid bg-gray-200 {openMenu ? 'open' : 'closed'}">
    <sidebar class="custom-sidebar {openMenu ? 'open' : 'closed'} {!loaded ? 'loading' : ''}">
      <Sidebar role={data.role} fullname="{data.name} {data.lastname_father}" {widthScreenReal} {toggleOpenMenu}> 
        <ToggleMenu type="sidebar" {toggleOpenMenu} {openMenu} />
      </Sidebar>
    </sidebar>
    <section class="min-h-dvh flex flex-col sm:flex-row">
      {#if openMenu && widthScreenReal > 0 && widthScreenReal <= 768  }
        <div in:fade={{ duration: 200 }} out:fade={{ duration: 500 }} tabindex="-1" role="button" on:click={toggleOpenMenu} on:keypress={toggleOpenMenu} class="inset-0 bg-black bg-opacity-80 w-full h-full absolute z-40"></div>
      {/if}
      <div class="pt-3 pl-2 h-10 flex">
        <ToggleMenu type="content" {toggleOpenMenu} {openMenu} />
      </div>
      <main class="py-6 px-0 sm:py-8 sm:px-8 w-full flex-1 {openMenu ? 'open' : 'closed'} {loaded ? 'loaded' : ''}">
        <slot />
      </main>
    </section>
  </div>
{:else}
    <slot /> 
{/if}

<style>
  .content.open {
    grid-template-columns: 18rem 1fr;
  }
  .content.closed {
    grid-template-columns: 1fr;
  }
  @media (max-width: 768px) {
    .custom-sidebar.open {
      position: absolute;
      z-index: 50;
    }
    .custom-sidebar.loading {
      transform: translateX(-100%);
    }
    main.open.loaded {
      overflow: hidden;
      position: fixed;
    }
    .content.open {
      grid-template-columns: 1fr !important;
    }
  }
  .custom-sidebar.closed {
    transform: translateX(-100%);
  }
</style>