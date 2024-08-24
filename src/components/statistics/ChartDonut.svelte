<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import ChartDataLabels from 'chartjs-plugin-datalabels';
  import { statutes } from '$lib/data.js';

  Chart.register(ChartDataLabels);

  export let type;
  export let data;
  export let totalProjects;

  const statutesLabel = statutes.map(statute => statute.label);
  const statutesColors = statutes.map(statute => statute.color_hex);

  let chart;

  onMount(() => {
    const ctx = document.getElementById(`chart_${type}`).getContext('2d');
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: statutesLabel,
        datasets: [
          {
            label: `${type === 'projects' ? 'Proyectos' : 'Acciones'}`,
            data: statutes.map(statute => data?.[statute.value] ?? 0),
            backgroundColor: statutesColors,
            borderColor: statutesColors,
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          datalabels: {
            color: '#fff',
            anchor: 'end',
            align: 'start',
            offset: -10,
            borderWidth: 2,
            borderColor: '#fff',
            borderRadius: 25,
            backgroundColor: (context) => {
              return context.dataset.backgroundColor;
            },
            font: {
              weight: 'bold'
            },
            formatter: (value, context) => {
              const total = totalProjects;
              const percentage = total > 0 ? (value / total * 100).toFixed(2) : 0;
              return `${value} (${percentage}%)`;
            }
          }
        }
      }
    });
  });

  const handleUpdateChart = (data) => {
    if (!chart || !data) return;
    chart.data.datasets[0].data = statutes.map(statute => data?.[statute.value] ?? 0);
    chart.update();
  }

  $: handleUpdateChart(data);
</script>

<section class="bg-gray-100/70 rounded-md p-5">
  <header class="mb-2">
      <h5 class="text-2xl font-semibold text-ins-600">{type === 'projects' ? 'Proyectos' : 'Acciones'} totales</h5>
  </header>
  <canvas id="chart_{type}" class="max-h-60"></canvas>
</section>
