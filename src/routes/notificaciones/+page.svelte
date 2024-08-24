<script>
	import ChevronIcon from '$icons/ChevronIcon.svelte';
    import AgendIcon from '$icons/AgendIcon.svelte';
    import { messageAlert, closeAlert, handleLoading } from '$lib/utilities.js';
    import { statutes, actions_types } from '$lib/data.js';
    import moment from 'moment';

    export let data;
    let {dependences, managers} = data;
	let all_dependences = true;
	let all_managers = true;
    let action_type = 'all';
    let status = 'all';
    let search = '';
    let dataSee = [];

    const filteredData = () => {
		dataSee = [...notifications];

		dataSee = dataSee.filter(noti => {
            const searchTarget = `${noti.name} ${noti.start} ${noti.end}`.toLowerCase();
            const searchTerm = search.toLowerCase();

            if (status === 'all') {
                return searchTarget.includes(searchTerm);
            } else {
                return searchTarget.includes(searchTerm) && noti.status === status;
            }
        });
		dataSee = dataSee.filter(noti => {
            const searchTarget = `${noti.name} ${noti.start} ${noti.end}`.toLowerCase();
            const searchTerm = search.toLowerCase();

            if (action_type === 'all') {
                return searchTarget.includes(searchTerm);
            } else {
                return searchTarget.includes(searchTerm) && noti.type === action_type;
            }
        });
		dataSee = dataSee.filter(noti => {
			if (all_dependences) {
				return noti;
			} else {
				return dependences.find(dep => dep.value === noti.dependence.data.value && dep.visible);
			}
		});
        dataSee = dataSee.filter(noti => {
            if (all_managers) {
                return true;
            } else {
                if (noti.manager?.data?.value) {
                return managers.find(dep => dep.value === noti.manager.data.value && dep.visible);
                } else {
                return true;
                }
            }
        });
		if (search) {
			dataSee = dataSee.filter(noti => {
                const searchTarget = `${noti.name} ${noti.start} ${noti.end}`.toLowerCase();
                const searchTerm = search.toLowerCase();

                return searchTarget.includes(searchTerm);
            });

		}
        updateCountdowns();
	}

    const handleVisibleDependences = () => {
		if (all_dependences) {
			dependences = [...dependences].map(dep => ({...dep, visible: true}));
		} else {
			dependences = [...dependences].map(dep => ({...dep, visible: false}));
		}
		filteredData();
	}

	const handleChangeVisibleDependence = () => {
		all_dependences = dependences.every(dep => dep.visible);
		filteredData();
	}

    const handleVisibleManagers = () => {
		if (all_managers) {
			managers = [...managers].map(man => ({...man, visible: true}));
		} else {
			managers = [...managers].map(man => ({...man, visible: false}));
		}
		filteredData();
	}

	const handleChangeVisibleManager = () => {
		all_managers = managers.every(man => man.visible);
		filteredData();
	}

    let notifications = [];
    const dictionaryStatus = statutes.reduce((acc, item) => {
        acc[item.value] = {name: item.label, color: item.color};
        return acc;
    }, {});

    const dictionaryType = actions_types.reduce((typ, item) => {
        typ[item.value] = item.label;
        return typ;
    }, {});

    let selectedTime = 5;
    const times = [
        { time: 5 },
        { time: 10 },
        { time: 15 },
        { time: 30 },
        { time: 60 },
        { time: 90 }
    ];

    const redirectTo = (type, id) => {
        if( type === 'project' ) {
            window.open(`/proyectos/detalle/${id}`, '_blank');
            return;
        }
        window.open(`/proyectos/accion/${id}`, '_blank');
    }

    const calculateTimeLeft = (endDate) => {
        const end = moment(endDate);
        const now = moment();
        const difference = end.diff(now);

        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor(difference / (1000 * 60 * 60) % 24),
                minutes: Math.floor(difference / (1000 * 60) % 60),
                seconds: Math.floor(difference / 1000 % 60)
            };
        }

        return timeLeft;
    }

    const updateNotificationsWithTimeLeft = () => {
        dataSee = dataSee.map(notification => {
            const timeLeft = calculateTimeLeft(notification.end);
            return { ...notification, timeLeft };
        });
    };

    const updateCountdowns = () => {
        dataSee = dataSee.map(notification => {
            const timeLeft = calculateTimeLeft(notification.end);
            return { ...notification, timeLeft };
        });
    };

    updateNotificationsWithTimeLeft();

    const intervalId = setInterval(() => {
        updateCountdowns();
    }, 5000);

    const searchNotifications = async () => {
		try {
			
			handleLoading(`Consultando notificaciones...`);

			const action = '/api/search-notifications/'
			
			const formData = new FormData();
			
			formData.append('time', selectedTime);

			const response = await fetch(action, {
				method: 'POST',
				body: formData
			});

			const resp = await response.text();
			const {success, data} = JSON.parse(resp);

			if( success ) {
				notifications = [...data];
                filteredData();
				closeAlert();
				return;
			}

			throw new Error;

		} catch (error) {
			messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
		}
	}

    searchNotifications();

</script>

<section class="w-full">
    <h1 class="text-2xl uppercase font-bold text-ins-700">Notificaciones</h1>
    <div class="grid grid-cols-6 gap-4 mt-10">
        {#each times as {time}}
            <label for="times_{time}" class="block relative">
                <input id="times_{time}" type="radio" bind:group={selectedTime} on:change={searchNotifications} value={time} class="sr-only peer" />
                <div class="w-full px-2 py-3 cursor-pointer rounded-lg border bg-white shadow-sm ring-ins-600 peer-checked:ring-2 duration-200">
                    <div class="pl-7">
                        <div class="leading-none text-gray-700 font-medium text-sm flex items-center justify-between">
                            <span>{time} días</span>
                            <AgendIcon size={18} styles="{selectedTime === time ? 'text-ins-600' : 'text-gray-400'}" />
                        </div>
                    </div>
                </div>
                <span class="block absolute top-3.5 left-3 border {selectedTime === time ? 'peer-checked:border-[5px] peer-checked:border-ins-600' : ''} w-4 h-4 rounded-full">
                </span>
            </label>
        {/each}
    </div>

    <section class="mt-3 flex w-full gap-4">
        
        <div class="dropdown dropdown-bottom w-full min-w-44 sm:w-44 max-w-full">
            <span class="text-xs font-semibold text-gray-600 pl-0.5">Dependencias</span>
            <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
                Dependencias
                <ChevronIcon size={18} styles="text-black" />
            </div>
            <div tabindex="-1" class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-lg w-64 truncate">
                <ul class="dropdown-content-int">
                    <li class="w-full pr-2">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="dep_all">
                            Mostrar todas
                            <input type="checkbox" class="checkbox checkbox-xs" id="dep_all" bind:checked={all_dependences} on:change={handleVisibleDependences} />
                        </label>
                    </li>
                    {#each dependences as dep }
                        <li class="w-full pr-2">
                            <label class="flex flex-row w-full justify-between active:bg-red-500" for="dep_{dep.value}">
                                {dep.label}
                                <input type="checkbox" class="checkbox checkbox-xs" id="dep_{dep.value}" bind:checked={dep.visible} on:change={handleChangeVisibleDependence} />
                            </label>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>

        <div class="dropdown dropdown-bottom w-full min-w-44 sm:w-44 max-w-full">
            <span class="text-xs font-semibold text-gray-600 pl-0.5">Responsables</span>
            <div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
                Responsables
                <ChevronIcon size={18} styles="text-black" />
            </div>
            <div tabindex="-1" class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-lg w-64 truncate">
                <ul class="dropdown-content-int">
                    <li class="w-full pr-2">
                        <label class="flex flex-row w-full justify-between active:bg-red-500" for="manager_all">
                            Mostrar todos
                            <input type="checkbox" class="checkbox checkbox-xs" id="manager_all" bind:checked={all_managers} on:change={handleVisibleManagers} />
                        </label>
                    </li>
                    {#each managers as man }
                        <li class="w-full pr-2">
                            <label class="flex flex-row w-full justify-between active:bg-red-500" for="manager_{man.value}">
                                {man.label}
                                <input type="checkbox" class="checkbox checkbox-xs" id="manager_{man.value}" bind:checked={man.visible} on:change={handleChangeVisibleManager} />
                            </label>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>

        <div class="w-full min-w-44 sm:w-44 max-w-full">
            <label for="select-status" class="text-xs font-semibold text-gray-600 pl-0.5">Estatus</label>
            <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:outline-none " bind:value={status} on:change={filteredData} id="select-status">
                <option value="all" selected>Todas</option>
                {#each statutes as st }
                    <option value={st.value}>{st.label}</option>
                {/each}
            </select>
        </div>

        <div class="w-full min-w-44 sm:w-44 max-w-full">
            <label for="select-types" class="text-xs font-semibold text-gray-600 pl-0.5">Tipo</label>
            <select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:outline-none " bind:value={action_type} on:change={filteredData} id="select-types">
                <option value="all" selected>Todas</option>
                <option value="project" selected>Proyecto</option>
                {#each actions_types as tp }
                    <option value={tp.value}>{tp.label}</option>
                {/each}
            </select>
        </div>	

        <div class="flex items-end w-full">
            <div class="relative sm:w-full transition-all duration-300 w-[98%]">
                <svg xmlns="http://www.w3.org/2000/svg" class="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" bind:value={search} name="searching" on:keyup={filteredData} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
            </div>
        </div>

    </section>

    <div class="w-full min-h-full mt-5">
        <table class="w-full rounded-md overflow-hidden">
            <thead class="bg-ins-800 text-gray-100">
                <tr class="[&>*]:uppercase [&>*]:text-gray-100">
                    <th class="text-left p-2 pl-5">Nombre</th>
                    <th class="text-left p-2">Responsable</th>
                    <th class="text-left p-2">Estatus</th>
                    <th class="text-left p-2">Tipo</th>
                    <th class="text-left p-2">Fechas</th>
                    <th class="text-left p-2">Restante</th>
                </tr>
            </thead>
            <tbody>
                {#each dataSee as {name, status, type, start, end, id, manager, dependence, timeLeft} }
                    <tr class="text-sm bg-white group border-t border-gray-300 hover:bg-ins-700 hover:text-gray-100" role="button" on:click={() => redirectTo(type, id)}>
                        <td class="p-2 pl-5 uppercase max-w-52 truncate font-bold">{name}</td>
                        <td class="p-2 uppercase">
                            <div class="flex flex-col max-w-52 [&>span]:truncate [&>span]:max-w-full">
                                <span>{manager.data?.label ?? 'Sin responsable'}</span>
                                <span>{dependence.data?.label ?? 'Sin dependencia'}</span>
                            </div>
                        </td>
                        <td class="p-2">
                            <span class="{dictionaryStatus[status]?.color ?? 'bg-gray-400'} text-white px-2 py-1 rounded-md">{dictionaryStatus[status]?.name ?? 'Sin estatus'}</span>
                        </td>
                        <td class="p-2">{type === 'project' ? 'Proyecto' : dictionaryType[type] ?? 'Sin tipo'}</td>
                        <td class="p-2">
                            <div class="flex flex-col [&>span]:text-sm">
                                <span class="font-semibold text-green-700 group-hover:text-white">{start}</span>
                                <span class="font-semibold text-red-700 group-hover:text-white">{end}</span>
                            </div>
                        </td>
                        <td class="p-2 w-36">
                            <div class="font-mono text-md [&>span]:text-sm">
                                {#if !timeLeft?.days && !timeLeft?.hours && !timeLeft?.minutes}
                                    <div class="text-red-700 font-semibold group-hover:text-red-100 bounces">Vence hoy</div>
                                {:else}
                                    <span>{timeLeft?.days ?? '00'}</span>d
                                    <span>{timeLeft?.hours ?? '00'}</span>h
                                    <span>{timeLeft?.minutes ?? '00'}</span>m
                                {/if}
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr class="bg-white border-t border-gray-300 hover:bg-ins-700 hover:text-gray-100 group">
                        <td colspan={6} class="text-center p-4">
                            <span class="text-gray-700 group-hover:text-gray-100 font-semibold">Sin resultados...</span>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

</section>

<style>
    @keyframes bounce {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }

    .bounces {
        display: inline-block;
        animation: bounce 1s infinite;
    }
    .dropdown-content {
		top: 70px;
    	left: -2px;
		max-height: 200px;
	}
    .dropdown-content label:active {
        background: #d9d9d9 !important;
        color: initial !important;
    }
	.dropdown-content-int {
		overflow-y: auto;
		overflow-x: hidden;
		flex-direction: row;
	}
	@media (max-width: 768px) {
		.dropdown-content {
			top: 50px;
			left: -120%;
			max-height: 200px;
		}
	}
</style>