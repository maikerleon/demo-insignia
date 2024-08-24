<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    
    export let type;
    export let data;

    let chart;
  
    onMount(() => {
      const ctx = document.getElementById(`chart_${type}`).getContext('2d');
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [`${type === 'projects' ? 'Proyectos' : 'Acciones'}`],
          datasets: [
            {
              label: 'Activo',
              data: [data?.active ?? 0],
              backgroundColor: 'rgba(255, 99, 132)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            },
            {
              label: 'Inactivo',
              data: [data?.inactive ?? 0],
              backgroundColor: 'rgba(54, 162, 235)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'En proceso',
              data: [data?.process ?? 0],
              backgroundColor: 'rgba(255, 206, 86)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            },
            {
              label: 'Finalizado',
              data: [data?.finished ?? 0],
              backgroundColor: 'rgba(75, 192, 192)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            }
          }
        }
      });
    });

    const handleUpdateChart = (data) => {
      if (!chart || !data) return;
      chart.data.datasets[0].data = [data.active];
      chart.data.datasets[1].data = [data.inactive];
      chart.data.datasets[2].data = [data.process];
      chart.data.datasets[3].data = [data.finished];
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