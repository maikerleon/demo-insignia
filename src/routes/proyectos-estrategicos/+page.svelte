<script>
	import { closeAlert } from '$lib/utilities.js';
    import Map from "$components/statistics/Map.svelte";
    import { municipalities } from '$lib/data.js';
    import Table from '$components/strategic-projects/Table.svelte';
    import HeaderStatistics from '$components/statistics/HeaderStatistics.svelte';
    import { onMount } from 'svelte';

    export let data;
    const { allData, dependences, projects, dependencesList, role, dependence, axis } = data;

    let filteredData = {...allData};
    let selectedMunicipality = null;
    let clicked = false;

    if(role === 'dependence') {
        principalSection = false;
        selectedDependence = dependence;
    }

    const filterDataByMunicipality = (municipalityId) => {
        const filterAndSum = (details) => {
            return Object.values(details).reduce((acc, curr) => {
                const municipalityKey = `municipality_${municipalityId}`;
                if (curr.municipalities && curr.municipalities[municipalityKey]) {
                    acc.total += curr.municipalities[municipalityKey].total;
                    acc.real += curr.municipalities[municipalityKey].real;
                }
                return acc;
            }, { total: 0, real: 0 });
        };

        const updateGeneralTotals = (category) => {
            const totals = filterAndSum(filteredData[category].details);
            filteredData[category].total = totals.total;
            filteredData[category].real = totals.real;
        };

        updateGeneralTotals('projects');
        updateGeneralTotals('actions');
        updateGeneralTotals('projects_100_days');

        const updateDetailsForMunicipality = (details) => {
            return Object.entries(details).reduce((acc, [dependenceId, detail]) => {
                acc[dependenceId] = { ...detail, total: 0, real: 0, municipalities: { ...detail.municipalities } };
                const municipalityKey = `municipality_${municipalityId}`;
                if (detail.municipalities[municipalityKey]) {
                    acc[dependenceId].total = detail.municipalities[municipalityKey].total;
                    acc[dependenceId].real = detail.municipalities[municipalityKey].real;
                }
                return acc;
            }, {});
        };

        filteredData.projects.details = updateDetailsForMunicipality(filteredData.projects.details);
        filteredData.actions.details = updateDetailsForMunicipality(filteredData.actions.details);
        filteredData.projects_100_days.details = updateDetailsForMunicipality(filteredData.projects_100_days.details);
    };

    const filterData = () => {
        if (selectedMunicipality === null) {
            filteredData = JSON.parse(JSON.stringify(allData));
        } else {
            filterDataByMunicipality(selectedMunicipality);
        }
    }

    $: filterData(selectedMunicipality);

    onMount(() => {
        closeAlert();
    });

</script>

<div class="px-2 sm:px-0">
    <section class="flex justify-center items-center w-full">
        <HeaderStatistics {filteredData} {selectedMunicipality} />
    </section>

    <section class="w-full flex justify-center items-center mt-8">
        <h3 class="text-2xl sm:text-3xl uppercase font-bold">{selectedMunicipality ? municipalities.find( mun => mun.id === Number(selectedMunicipality) ).name : 'Estadísticas Generales'}</h3>
    </section>
    
    <section class="grid grid-cols-1 sm:grid-cols-8 gap-x-20 py-5 items-center">
        <div class="col-span-1 sm:col-span-3">
            <Map bind:clicked={clicked} bind:selectedMunicipality={selectedMunicipality} projects={allData.projects} />
        </div>
        <div class="flex justify-start col-span-1 sm:col-span-5 flex-col sm:mt-0 mt-5">
            <Table {role} projects={projects} dependences={dependencesList} {selectedMunicipality} {clicked} />
        </div>
    </section>

</div>