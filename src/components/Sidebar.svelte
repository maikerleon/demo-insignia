<script>
	import { handleLoading } from '$lib/utilities.js';
    import CraneIcon from '$icons/CraneIcon.svelte';
	import RssIcon from '$icons/RssIcon.svelte';
	import CoinsIcon from '$icons/CoinsIcon.svelte';
	import CheckVerityLightIcon from '$icons/CheckVerityLightIcon.svelte';
	import NotificationIcon from '$icons/NotificationIcon.svelte';
    import AgendIcon from "$icons/AgendIcon.svelte";
    import BlackhoeIcon from "$icons/BlackhoeIcon.svelte";
    import ChartIcon from "$icons/ChartIcon.svelte";
    import DependenceIcon from "$icons/DependenceIcon.svelte";
    import HomeIcon from "$icons/HomeIcon.svelte";
    import LawIcon from "$icons/LawIcon.svelte";
    import RoleIcon from "$icons/RoleIcon.svelte";
    import ActionIcon from "$icons/ActionIcon.svelte";
    import { page } from "$app/stores";
    import { getContext } from 'svelte';
    const photo = getContext('photo');
    const pendingApprovals = getContext('pendingApprovals');

    export let role;
    export let fullname;
    export let widthScreenReal;
    export let toggleOpenMenu;

    const toggleMenu = (link = null) => {
        if (['/proyectos','/estadisticas','/acciones', '/finanzas'].includes(link)) {
            handleLoading('Cargando...');
        }
        setTimeout(() => {
            if (widthScreenReal > 0 && widthScreenReal < 720 ) toggleOpenMenu();
        }, 300);
    }

    const searchApprovals = async (page) => {
		try {
			
			const response = await fetch('/api/get-approvals/');
			const resp = await response.text();
			const {success, data} = JSON.parse(resp);

			if( success ) {
                $pendingApprovals = data;
				return;
			}

			throw new Error;

		} catch (error) {
			$pendingApprovals = 0;
		}
	}

    let menu = [];

    if( ['governor', 'chief'].includes(role) ) {
        menu = [
            {
                title: 'Inicio',
                link: '/inicio',
                who: ['super-admin', 'super-view', 'governor', 'chief', 'supervisor', 'dependence', 'coordination', 'municipality', 'register'],
                icon: HomeIcon
            },
            {
                title: 'Catálogo Proyectos',
                link: '/catalogo-proyectos',
                who: ['super-admin', 'super-view', 'governor', 'chief', 'supervisor', 'dependence'],
                icon: BlackhoeIcon
            },
            {
                title: 'Estadísticas',
                link: '/estadisticas',
                who: ['super-admin', 'super-view', 'governor', 'chief'],
                icon: ChartIcon
            },
            {
                title: 'Feed',
                link: '/feed',
                who: ['super-admin', 'super-view', 'governor', 'chief'],
                icon: RssIcon
            },
            {
                title: 'Calendarios',
                link: '/calendarios',
                who: ['super-admin', 'super-view', 'governor', 'chief', 'supervisor', 'dependence'],
                icon: AgendIcon
            },
            {
                title: 'Finanzas',
                link: '/finanzas',
                who: ['super-admin', 'super-view', 'governor', 'chief'],
                icon: CoinsIcon
            },
            {
                title: 'Aprobaciones',
                link: '/aprobaciones',
                who: ['super-admin', 'super-view', 'chief'],
                icon: CheckVerityLightIcon
            }
        ];
    } else {
        menu = [
            {
                title: 'Inicio',
                link: '/inicio',
                who: ['super-admin', 'super-view', 'supervisor', 'dependence', 'coordination', 'municipality', 'register'],
                icon: HomeIcon
            },
            {
                title: 'Estadísticas',
                link: '/estadisticas',
                who: ['super-admin', 'super-view', 'dependence'],
                icon: ChartIcon
            },
            {
                title: 'Feed',
                link: '/feed',
                who: ['super-admin', 'super-view'],
                icon: RssIcon
            },
            {
                title: 'Proyectos',
                link: '/proyectos',
                who: ['super-admin', 'super-view', 'supervisor', 'dependence'],
                icon: BlackhoeIcon
            },
            {
                title: 'Acciones',
                link: '/acciones',
                who: ['super-admin', 'super-view', 'supervisor', 'dependence', 'coordination', 'municipality', 'register'],
                icon: ActionIcon
            },
            {
                title: 'Calendarios',
                link: '/calendarios',
                who: ['super-admin', 'super-view', 'supervisor', 'dependence'],
                icon: AgendIcon
            },
            {
                title: 'Aprobaciones',
                link: '/aprobaciones',
                who: ['super-admin', 'super-view'],
                icon: CheckVerityLightIcon
            },
            {
                title: 'Notificaciones',
                link: '/notificaciones',
                who: ['super-admin', 'super-view'],
                icon: NotificationIcon
            },
            {
                title: 'Dependencias',
                link: '/dependencias',
                who: ['super-admin', 'super-view'],
                icon: DependenceIcon
            },
            {
                title: 'Ejes de impacto',
                link: '/ejes',
                who: ['super-admin', 'super-view'],
                icon: LawIcon
            },
            {
                title: 'Obras',
                link: '/obras',
                who: ['super-admin', 'super-view', 'supervisor'],
                icon: CraneIcon
            },
            {
                title: 'Finanzas',
                link: '/finanzas',
                who: ['super-admin', 'super-view', 'governor', 'chief'],
                icon: CoinsIcon
            },
            {
                title: 'Roles de sistema',
                link: '/roles',
                who: ['super-admin', 'super-view', 'dependence', 'coordination', 'municipality'],
                icon: RoleIcon
            }
        ];
    }

    $: searchApprovals($page.route.id);

</script>
 
 <aside class="bg-gray-50 w-72 h-dvh px-5 py-6 overflow-y-auto fixed top-0 left-0 z-40 flex flex-col">
    <div class="relative">
        <a href="/inicio">
            <img class="w-36" src="/logo.webp" alt="Logo de insignia">
        </a>
        <div class="absolute -top-4 -right-3">
            <slot />
        </div>
    </div>

    <div class="flex flex-col justify-between flex-1 mt-6">
        
        <nav class="-mx-3 space-y-2.5">
            <hr class="border-b-2">
            {#each menu as mn }
                {#if mn.who.includes(role) }
                    <a data-sveltekit-preload-data class="{$page.route.id.includes(mn.link) ? 'bg-ins-700 text-gray-100' : 'text-gray-600'} flex items-center px-3 py-2 transition-colors duration-300 transform rounded-lg hover:bg-ins-800/70 hover:text-gray-100" href={mn.link} on:click={()=>toggleMenu(mn.link)}>
                        <svelte:component this={mn.icon} />
                        <span class="mx-2 text-sm font-medium">{mn.title}</span>
                        {#if mn.link === '/aprobaciones' && $pendingApprovals > 0 }
                            <span class="badge badge-md bg-red-600 border-none text-white text-xs font-semibold">{$pendingApprovals}</span>
                        {/if}
                    </a>
                {/if}
            {/each}
        </nav>

        <div class="mt-auto">
            <div class="flex items-center justify-between mt-6">
                <a href="/perfil" class="flex items-center gap-x-2" on:click={()=>toggleMenu('perfil')}>
                    {#if $photo  }
                        <img class="skeleton object-cover rounded-full h-8 w-8" src={$photo} alt="Foto de perfil" on:error={() => $photo = false} />
                    {:else}
                        <div class="object-cover rounded-full h-8 w-8 bg-gray-200 flex justify-center items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor" />
                                <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" stroke-width="0" fill="currentColor" />
                            </svg>
                        </div>
                    {/if}
                    <span class="text-sm font-medium text-gray-700">{fullname}</span>
                </a>
                
                <a href="/salir" data-sveltekit-reload data-sveltekit-preload-data="false" data-sveltekit-replacestate class="text-gray-500 transition-colors duration-200 rotate-180 hover:text-ins-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                </a>
            </div>
        </div>
    </div>
 </aside>