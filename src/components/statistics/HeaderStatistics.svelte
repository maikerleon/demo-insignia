<script>
	import { formatAmount } from '$lib/utilities.js';
	import { statutes } from '$lib/data.js';
	import ArticleStatisticsHeader from '$components/statistics/ArticleStatisticsHeader.svelte';
    import TargetIcon from '$icons/TargetIcon.svelte';
    import ArticleNewHeader from '$components/statistics/ArticleNewHeader.svelte';
    
    export let filteredData;
    export let selectedMunicipality;
    export let selectedDependence = null;

    let totalsByStatus = {};
    let totalAmount = 0;
    let municipalityAmount = 0;
    let totalFinanceSource = 0;
    let municipalityFinanceSource = 0;

    const resetData = () => {
        statutes.forEach(status => {
            totalsByStatus[status.value] = 0;
        });
        totalAmount = 0;
        municipalityAmount = 0;
        totalFinanceSource = 0;
        municipalityFinanceSource = 0;
    }

    $: if (selectedMunicipality !== null) {
        resetData();
        for (let projectId in filteredData.projects.details) {
            let project = filteredData.projects.details[projectId];
            let municipalities = project.municipalities;
            if (municipalities && municipalities[`municipality_${selectedMunicipality}`]) {
                let selectedMunicipalityData = municipalities[`municipality_${selectedMunicipality}`];
                municipalityAmount += selectedMunicipalityData.amount || 0;
                municipalityFinanceSource += selectedMunicipalityData.finance_source || 0;
                for (let status in selectedMunicipalityData.totals_status) {
                    totalsByStatus[status] += Number(selectedMunicipalityData.totals_status[status]);
                }
            }
        }
    } else {
        resetData();
        for (let projectId in filteredData.projects.details) {
            let project = filteredData.projects.details[projectId];
            totalAmount += project.amount || 0;
            totalFinanceSource += project.finance_source || 0;
            for (let status in project.totals_status) {
                totalsByStatus[status] += Number(project.totals_status[status]);
            }
        }
    }

</script>

<div class="grid grid-cols-1 gap-1 shadow-md rounded-md bg-white">
    <div class="sm:flex grid grid-cols-2 gap-6 w-full sm:stats pt-4">
        {#each statutes as st }
            <ArticleNewHeader status={st} quantity={!selectedDependence ? totalsByStatus[st.value] : (filteredData.projects.totals_status[st.value] || 0)} total={filteredData.projects.total || 0} />
        {/each}
        <ArticleStatisticsHeader title="Acciones" sex="female" real={filteredData.actions?.real || 0} total={filteredData.actions?.total || 0} color="text-blue-600" icon={TargetIcon} />
    </div>
    <div class="grid grid-cols-2 px-6 py-5 text-xl text-gray-600">
        <span><b>Inversión:</b> ${selectedMunicipality !== null ? formatAmount(Number(municipalityAmount)) : formatAmount(Number(filteredData.projects.amount))}</span>
        <span><b>Recurso aplicado:</b> ${selectedMunicipality !== null ? formatAmount(Number(municipalityFinanceSource)) : formatAmount(Number(filteredData.projects.finance_source))}</span>
    </div>
</div>
