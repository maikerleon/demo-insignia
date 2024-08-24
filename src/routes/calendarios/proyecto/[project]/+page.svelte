<script>
    import { getContext } from 'svelte';
	import { closeAlert, handleLoading, messageAlert } from '$lib/utilities.js';
	import ChevronIcon from '$icons/ChevronIcon.svelte';
	import FullCalendar from 'svelte-fullcalendar';
	import daygridPlugin from '@fullcalendar/daygrid';
	import esLocale from '@fullcalendar/core/locales/es';
	import { priorities, actions_types } from '$lib/data.js';
	import domtoimage from 'dom-to-image';
    const visibleMenu = getContext('visibleMenu');
	
	export let data;
	let {dependences, project, project_name} = data;
	let all_dependences = true;
	let calendarRef;

	const downloadCalendar = () => {

		const calendarApi = calendarRef.getAPI();
		const currentDate = calendarApi.getDate();

		let currentYear = currentDate.getUTCFullYear();
  		let currentMonth = currentDate.getUTCMonth();

		const dictionary = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        const section = document.querySelector('#calendar-section .fc-view-harness.fc-view-harness-active');
        const scale = 3;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                domtoimage.toPng(section, {
                    width: section.offsetWidth * scale,
                    height: section.offsetHeight * scale,
                    style: {
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    },
                })
                .then((dataUrl) => {
                    const content = `
					<section style="padding:20px">
							<div style="display: flex;width: 100%;justify-content: space-between;align-items: center;">
								<img src="/logo.webp" alt="logo" style="max-width: 14rem; height:60px;">
								<h1 style="font-weight: 500; color: rgb(56, 56, 56); font-size: 30px;">Acciones</h1>
							</div>
							<div style="display:flex: align-items:center; flex-direction: column; justify-content:center">
								<h2 style="font-weight: 500; color: rgb(56, 56, 56); font-size: 26px; text-align:center">${dictionary[currentMonth]} ${currentYear}</h2>
								<center>
									<img src="${dataUrl}" alt="Calendario" style="margin-top:10px; width: 90%">
								</center>
							</div>
						</section>
					`;

					const element = document.createElement('div');
					element.innerHTML = content;

					html2pdf().set({
						margin: 18,
						jsPDF: { unit: 'px', format: [1100, 1500], orientation: 'portrait' }
					}).from(element).save(`Calendario de Acciones - ${dictionary[currentMonth]} ${currentYear}.pdf`);
                })
                .catch((error) => {
                    messageAlert('error', 'Error al capturar la imagen')
                });
            });
        });
    };

	const downloadCalendarData = async () => {

		let data = [...actions];

		if ( !data || data.length <= 0 ) {
			messageAlert('info', `No existen acciones para este mes`);
			return;
		}

		handleLoading(`Generando reporte...`);
		let content = generateHTML(data);

		const element = document.createElement('div');
		element.innerHTML = content;

		html2pdf().set({
			margin: 0,
			jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait' }
		}).from(element).save(`Acciones del proyecto ${project_name}.pdf`);

		closeAlert();
		setTimeout(() => {
			messageAlert('success', 'Reporte generado con éxito.')
		}, 100);
		};

	const generateHTML = (item) => {
		let htmlToReturn = `
			<section style="background-color: white;">
					<div style="padding: 2rem;">
						<div style="display: flex;width: 100%;justify-content: space-between;align-items: center; margin-bottom:0.5rem;row-gap:20px">
							<h1 style="text-transform: uppercase;color: black;font-size: 1rem; text-align:left;font-weight: 600;">${project_name}</h1>
							<img src="/logo.webp" alt="logo" style="max-width: 12rem; height:40px;">
						</div>
		`;

		for (const i in item) {	
			const municipalities = getMunicipalitiesList(item[i].municipalities.data);
			
			htmlToReturn += `
				
				<div style="width: 100%;border-width: 2px;border-color: black;margin-top: 0.5rem;display: grid;grid-template-columns: repeat(12, minmax(0, 1fr));">
					
					<div style="border-color: black;grid-column: span 12 / span 12;border-bottom-width: 2px;background-color: #22543d;padding: 0.3rem;justify-content: center;">
						<h2 style="text-transform: uppercase;color: white;font-size: 0.9rem; text-align:center;">${item[i].name}</h2>
					</div>
			
					<div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;grid-column: span 3 / span 3;padding-left: 0.5rem;padding-right: 0.4rem;padding-top: 0.15rem;padding-bottom: 0.15rem;border-right-width: 2px;justify-content: start;">
						<span style="font-weight: 600;text-transform: uppercase;font-size: 0.8rem;text-align: center;">Inicio</span>
					</div>
					<div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;padding-left: 0.5rem;padding-right: 0.4rem;padding-top: 0.15rem;padding-bottom: 0.15rem;grid-column: span 9 / span 9;">
						<span style="font-size: 0.7rem;">${item[i].start}</span>
					</div>

					<div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;grid-column: span 3 / span 3;padding-left: 0.5rem;padding-right: 0.4rem;padding-top: 0.15rem;padding-bottom: 0.15rem;border-right-width: 2px;justify-content: start;">
						<span style="font-weight: 600;text-transform: uppercase;font-size: 0.8rem;text-align: center;">Fin</span>
					</div>
					<div style="display: flex;align-items: center;border-color: black;border-bottom-width: 2px;padding-left: 0.5rem;padding-right: 0.4rem;padding-top: 0.15rem;padding-bottom: 0.15rem;grid-column: span 9 / span 9;">
						<span style="font-size: 0.7rem;">${item[i].end}</span>
					</div>

					<div style="display: flex;align-items: center;border-color: black;grid-column: span 3 / span 3;padding-left: 0.5rem;padding-right: 0.4rem;padding-top: 0.15rem;padding-bottom: 0.15rem;border-right-width: 2px;justify-content: start;">
						<span style="font-weight: 600;text-transform: uppercase;font-size: 0.8rem;text-align: center;">Municipios</span>
					</div>
					<div style="display: flex;align-items: center;padding-left: 0.5rem;padding-right: 0.4rem;padding-top: 0.15rem;padding-bottom: 0.15rem;grid-column: span 9 / span 9;">
						<span style="font-size: 0.7rem;">${municipalities}</span>
					</div>
			
				</div>

			`;
		}

		htmlToReturn += `
				</div>
			</section>
		`;

		return htmlToReturn;
	};

	const getMunicipalitiesList = (municipalitiesList) => {
		let municipalities = 'Sin municipios.';

		if (municipalitiesList && municipalitiesList.length > 0) {
			let mun = municipalitiesList
				.filter(municipio => municipio && municipio.label)
				.map(municipio => municipio.label);
			municipalities = mun.join(", ");
		}

		return municipalities;
	}

	const searchCalendar = async () => {
		try {
			
			const calendarApi = calendarRef.getAPI();
			const currentDate = calendarApi.getDate();

			let currentYear = currentDate.getUTCFullYear();
  			let currentMonth = currentDate.getUTCMonth() + 1;

			handleLoading(`Buscando acciones...`);

			const action = '/api/search-calendar-project/'
			
			const formData = new FormData();
			
			formData.append('project', project);
			formData.append('year', currentYear);
			formData.append('month', currentMonth);

			const response = await fetch(action, {
				method: 'POST',
				body: formData
			});

			const resp = await response.text();
			const {success, data} = JSON.parse(resp);

			if( success ) {

				actions = [...data];

				filteredProjects();
				closeAlert();
				handleResizeCalendar();
				return;
			}

			throw new Error;

		} catch (error) {
			messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
		}
	}

	let projects = [];
	let actions = [];
	let dataSee = [...projects]
	let priority = 'all';
	let action_type = 'all';
	let search = '';

	let options
	$: options = {
		timeZone: 'America/Mexico_City',
		events: dataSee,
		windowResize: true,
		customButtons: {
			download: {
				text: 'Descargar',
				click: function() {
					downloadCalendar();
				}
			},
			downloadData: {
				text: 'Generar informe',
				click: function() {
					downloadCalendarData();
				}
			}
		},
		initialView: 'dayGridMonth',
		plugins: [daygridPlugin],
		headerToolbar: {
			left: 'prev,next',
			center: 'title',
			right: 'today download downloadData dayGridMonth,dayGridWeek,dayGridDay',
		},
		height: 'auto',
		weekends: true,
		eventResizableFromStart: true,
		eventStartEditable: true,
		eventClick: function(info) {
			const urlRedirect = '/proyectos/accion/';
			window.open(`${urlRedirect}${info.event.id}`, '_blank');
		},
		datesSet: function(dateInfo) {
            searchCalendar();
        },
		locale: esLocale,
	};

	const filteredProjects = () => {
		dataSee = [...actions];
		// dataSee = dataSee.filter(project => {
		// 	if (priority === 'all') {
		// 		return project.title.toLowerCase().includes(search.toLowerCase());
		// 	} else {
		// 		return project.title.toLowerCase().includes(search.toLowerCase()) && project.priority === priority;
		// 	}
		// });
		dataSee = dataSee.filter(project => {
			if (action_type === 'all') {
				return project.title.toLowerCase().includes(search.toLowerCase());
			} else {
				return project.title.toLowerCase().includes(search.toLowerCase()) && project.type === action_type;
			}
		});
		dataSee = dataSee.filter(project => {
			if (all_dependences) {
				return project;
			} else {
				return dependences.find(dep => dep.value === project.dependence.data.value && dep.visible);
			}
		});
		if (search) {
			dataSee = dataSee.filter(project => {
				return project.title.toLowerCase().includes(search.toLowerCase());
			});
		}
	}

	const handleVisibleDependences = () => {
		if (all_dependences) {
			dependences = [...dependences].map(dep => ({...dep, visible: true}));
		} else {
			dependences = [...dependences].map(dep => ({...dep, visible: false}));
		}
		filteredProjects();
	}

	const handleChangeVisibleDependence = () => {
		all_dependences = dependences.every(dep => dep.visible);
		filteredProjects();
	}

	const handleResizeCalendar = () => {
		if(calendarRef) {
			const calendarApi = calendarRef.getAPI();
			calendarApi.updateSize();
		}
	}

	$: handleResizeCalendar($visibleMenu);


</script>

<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</svelte:head>

<div class="sm:p-0 p-2">
	
	<header class="flex justify-between mb-3 items-center flex-col sm:flex-row w-full">
		<section class="gap-2 sm:gap-0 flex items-center justify-between sm:justify-start w-full sm:w-auto flex-wrap">
			
			<div class="dropdown dropdown-bottom w-[45%] sm:w-44 max-w-full mr-2">
				<span class="text-xs font-semibold text-gray-600 pl-0.5">Areas</span>
				<div tabindex="-1" role="button" class="w-full px-3 py-2.5 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none  flex items-center justify-between">
					Areas
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

			<div class="w-full sm:w-44 max-w-full sm:mr-2">
				<label for="select-types" class="text-xs font-semibold text-gray-600 pl-0.5">Tipo de acción</label>
				<select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" bind:value={action_type} on:change={filteredProjects}>
					<option value="all" selected>Todas</option>
					{#each actions_types as tp }
						<option value={tp.value}>{tp.label}</option>
					{/each}
				</select>
			</div>	

			<!-- <div class="w-[45%] sm:w-44 max-w-full mr-2">
				<label for="select-priority" class="text-xs font-semibold text-gray-600 pl-0.5">Prioridad</label>
				<select class="w-full px-3 pb-2.5 pt-3 text-sm text-gray-600 bg-white border rounded-lg shadow-sm outline-none focus:ring-offset-2 focus:ring-ins-600 focus:ring-2" bind:value={priority} on:change={filteredProjects}>
					<option value="all" selected>Todas</option>
					{#each priorities as priority }
						<option value={priority.value}>{priority.label}</option>
					{/each}
				</select>
			</div> -->
		</section>

		<section class="pr-3 mt-5 sm:mt-0">
			<h2 class="text-lg font-semibold text-ins-700 uppercase">Calendario de acciones</h2>
		</section>
	</header>

	<div>
		<div class="relative {!search ? 'sm:w-72 sm:hover:w-96' : 'sm:w-96' } transition-all duration-300 w-[98%]">
			<svg xmlns="http://www.w3.org/2000/svg" class="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input type="text" bind:value={search} name="searching" on:keyup={filteredProjects} placeholder="Buscador..." class="text-sm w-full py-2.5 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-ins-700"/>
		</div>
	</div>

	<section class="pr-2 flex justify-center items-center mt-5 w-full mb-5">
		<a href='/proyectos/detalle/{project}' class="text-3xl font-semibold text-ins-700 uppercase text-center">{project_name}</a>
	</section>
	<section class="p-5 rounded-lg bg-white h-fit" id="calendar-section">
		<FullCalendar bind:this={calendarRef} {options} />
	</section>
</div>

<style>
	:global(.draggable) {
		color: white;
		background: #3788d8;
		width: fit-content;
		padding: 1rem;
		margin: 1rem;
		cursor: pointer;
	}
	:global(thead .fc-scrollgrid-sync-inner) {
		background-color: #1fabbb !important;
		color: white;
		height: 40px;
		font-size: 18px;
		font-weight: 500;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	:global(.fc-button-primary) {
		background-color: #1fabbb !important;
		border-color : #1fabbb !important;
	}
	:global(.fc-button-primary:focus) {
		box-shadow: none !important;
		background-color: #1d8a9d !important;
	}
	:global(.fc-view-harness.fc-view-harness-active) {
		background-color: #fff !important;
	}
	.dropdown-content {
		top: 50px;
    	left: -4px;
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
			left: -35%;
			max-height: 200px;
		}
		:global(.fc-header-toolbar.fc-toolbar.fc-toolbar-ltr) {
			display: grid;
			gap: 5px 0px;
			grid-template-columns: 100px 1fr;
			justify-content: space-between;
		}
		:global(.fc-header-toolbar.fc-toolbar.fc-toolbar-ltr .fc-toolbar-title) {
			font-size: 1.2rem;
			text-align: right;
		}
		:global(.fc-header-toolbar.fc-toolbar.fc-toolbar-ltr .fc-toolbar-chunk:last-child) {
			grid-column: span 2;
		}
	}
</style>