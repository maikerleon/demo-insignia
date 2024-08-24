<script>
	import { closeAlert } from '$lib/utilities.js';
    import ArticleStatisticsDependence from '$components/statistics/ArticleStatisticsDependence.svelte';
    import Map from "$components/statistics/Map.svelte";
    import { municipalities } from '$lib/data.js';
    import StatisticsDependence from '$components/statistics/StatisticsDependence.svelte';
    import TableProjectsStatistics from '$components/statistics/TableProjectsStatistics.svelte';
    import HeaderStatistics from '$components/statistics/HeaderStatistics.svelte';
    import { onMount } from 'svelte';

    export let data;
    const { allData, dependences, projects, dependencesList, role, dependence, axis } = data;

    let filteredData = {...allData};
    let selectedMunicipality = null;
    let principalSection = true;
    let selectedDependence = null;
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
    {#if principalSection }
        <section class="flex justify-center items-center w-full">
            <!-- <div class="grid grid-cols-1 sm:grid-cols-2 w-full sm:w-[80%] gap-4 sm:stats shadow-md rounded-md bg-white/60">
                <ArticleStatisticsHeader title="Proyectos" sex="male" real={filteredData.projects.real} total={filteredData.projects.total} color="text-green-600" icon={BlackhoeIcon} />
                <ArticleStatisticsHeader title="Acciones" sex="female" real={filteredData.actions.real} total={filteredData.actions.total} color="text-blue-600" icon={TargetIcon} />
                <ArticleStatisticsHeader title="Proyectos 100 días" sex="male" real={filteredData.projects_100_days.real} total={filteredData.projects_100_days.total} color="text-orange-600" icon={CalendarClockIcon} />
            </div> -->

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
                <h2 class="uppercase text-2xl mb-5 text-center font-semibold text-ins-700">Avance por dependencia</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {#each dependences as dependence }
                        <ArticleStatisticsDependence bind:selectedDependence={selectedDependence} bind:principalSection={principalSection} dependence={dependence} dataSee={{total: filteredData.projects.details[dependence.id]?.total ?? 0, real: filteredData.projects.details[dependence.id]?.real ?? 0}} />
                    {/each}
                </div>
            </div>
        </section>

        <TableProjectsStatistics {role} projects={projects} dependences={dependencesList} {selectedMunicipality} {clicked} typeTable='project' {axis} />

    {:else}
        <StatisticsDependence {role} bind:selectedDependence={selectedDependence} bind:principalSection={principalSection} projects={allData.projects.details[selectedDependence]} dataProjects={projects} projects_100_days={allData.projects_100_days.details[selectedDependence]} actions={allData.actions.details[selectedDependence]} dependence={dependences.find(dep => dep.id === selectedDependence)} {axis} />
    {/if}
</div>