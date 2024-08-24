<script>
	import { formatDate } from '$lib/utilities.js';
	import { statutes } from '$lib/data.js';
    export let data;
    export let advance = 0;

    const getStatusFromProgress = ({data}, status) => {

        const systemStatus = statutes.find(s => s.value === status)?.value || 'without-status'

        // if (!data || data.length === 0) {
            return systemStatus;
        // }
        // const process = data[0];
        // return statutes.find(s => s.value === process.status)?.value || systemStatus;
    }

</script>

<div class="mt-4 shadow-sm border rounded-lg overflow-x-auto custom-max-w">
    <table class="w-full table-auto text-sm text-left">
        <thead class="bg-ins-700 text-gray-100 font-medium border-b">
            <tr>
                <th class="py-3 pl-4 pr-2">Estatus</th>
                <th class="py-3 px-2">Proyecto</th>
                <th class="py-3 px-2">Fecha activación</th>
                <th class="py-3 px-2">% avance</th>
                <th class="py-3 px-2">Descripción avance</th>
                <th class="py-3 px-2">Nota</th>
            </tr>
        </thead>
        <tbody class="text-gray-600 divide-y">
                <tr class="bg-white">
                    <td class="pl-4 pr-2 py-4 whitespace-nowrap">
                        <div class="flex justify-center">
                            <div data-tip={statutes.find(s=> s.value === getStatusFromProgress(data.progress, data.status))?.label || 'Sin estatus'} class="w-5 h-5 tooltip tooltip-right {statutes.find(s=> s.value === getStatusFromProgress(data.progress, data.status))?.color || 'bg-gray-400'} rounded-md"></div>
                        </div>
                    </td>
                    <td class="px-2 py-4 whitespace-nowrap">
                        <div class="w-full max-w-[400px] text-wrap">
                            {data.name}
                        </div>
                    </td>
                    <td class="px-2 py-4 whitespace-nowrap">{formatDate(data.start)}</td>
                    <td class="px-2 py-4 whitespace-nowrap">{advance}%</td>
                    <td class="px-2 py-4 whitespace-pre-wrap">
                        {data.progress_supervisor?.data.length > 0 ? data.progress_supervisor?.data[0].general : data.progress?.data.length > 0 ? data.progress?.data[0].general : 'Sin descripción'}
                    </td>
                    <td class="px-2 py-4 whitespace-nowrap">{data.note_meet || 'Sin notas'}</td>
                </tr>
        </tbody>
    </table>
</div>