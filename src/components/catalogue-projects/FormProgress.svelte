<script>
	import { formStyle, formatDateTime } from '$lib/utilities.js';
	import CardFile from '$components/projects/CardFile.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
	import GoBackIcon from '$icons/GoBackIcon.svelte';
	import AlertHexaIcon from '$icons/AlertHexaIcon.svelte';
    import CheckedVerifyIcon from '$icons/CheckedVerifyIcon.svelte';
    import XCubeIcon from '$icons/XCubeIcon.svelte';

    export let toggleTable;
    export let dataSee;
    export let project;
    export let bucket;

    if ( bucket === 'progress_supervisor' && dataSee.id === '' ) {
        dataSee.governor_attend = false;
    }

    const labelStyle = "font-semibold text-sm text-gray-600 ml-0.5";

</script>

<section>
    <div class="flex justify-end">
        <ButtonLight typeButton="button" styles="mb-4" action={toggleTable} text="Ir atrás">
            <GoBackIcon styles="pr-1" />
        </ButtonLight>
    </div>

    <div class="bg-white rounded-md p-5">
        <div class="flex flex-col gap-2">
            <label for="general" class="{labelStyle}">Avance general</label>
           
            <div class="{formStyle} min-h-32 py-3" placeholder="Ingrese el detalle del avance">
                {dataSee.general}
            </div>
            
        </div>
    
        <div class="md:stats flex flex-col md:flex-row justify-center items-center mt-4 mb-4">
      
            <div class="stat w-full md:w-1/4">
              <div class="stat-figure text-ins-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div class="stat-title">% de avance</div>
              <div class="stat-value">
                {dataSee.percent}
                %
              </div>
              <div class="stat-desc">Valor manual</div>
            </div>
            
            <div class="stat w-full md:w-1/4">
              <div class="stat-figure text-ins-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              </div>
              <div class="stat-title">% de avance del sistema</div>
              <div class="stat-value">{dataSee.system_progress ?? 0}%</div>
              <div class="stat-desc">Tomado del sistema</div>
            </div>
            
            <div class="stat w-full md:w-1/4">
              <div class="stat-figure text-ins-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
              </div>
              <div class="stat-title">Proyecto con desdoble</div>
              <div class="stat-value">{dataSee.sub_actions ? 'Si' : 'No'}</div>
              <div class="stat-desc">Tomado del sistema</div>
            </div>
            
        </div>
    
        <div class="mt-5">
            <CardFile bind:files={dataSee.files} {project} gridColums="md:grid-cols-6 grid-cols-2" onlyRead={true} />                    
        </div>
    
        {#if bucket === 'progress_supervisor' }
            <div class="mt-8 items-center flex-row flex">
                <div><span class="{labelStyle}">¿Asiste Manolo?</span></div>
                {#if dataSee.id === "" }
                    <input type="checkbox" bind:checked={dataSee.governor_attend} class="checkbox checkbox-success ml-3" />
                {:else}
                    <input type="checkbox" checked={dataSee.governor_attend} class="checkbox checkbox-success ml-3 disabled:opacity-100 disabled:border-none" disabled />
                {/if}
            </div>
        {/if}
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 justify-between items-center mt-8">
            <div class="form-control max-w-fit">
                <label class="cursor-pointer label">
                    <span class="{labelStyle}">¿Requiere aprobación?</span>
                    <input type="checkbox" checked={dataSee.need_approve} class="checkbox checkbox-success ml-3 disabled:opacity-100 disabled:border-none" disabled />
                </label>
            </div>
    
            {#if dataSee.need_approve }
                <div class="flex justify-center md:justify-end items-center md:mr-20">
                    {#if dataSee.approved === 'rejected' }
                        <div class="flex flex-col gap-1">
                            <span class="flex flex-row justify-center items-center tooltip" data-tip="Fue rechazado">
                                <strong>Rechazado</strong>
                                <XCubeIcon styles="ml-2 text-red-600" size={30} />
                            </span>     
                            <span class="text-xs font-normal mt-3">
                                <strong>Nota:</strong>
                                {dataSee.response === '' ? 'Sin nota' : dataSee.response}
                            </span>
                            <span class="text-xs font-normal">
                                <strong>Rechazado por:</strong>
                                {dataSee.approved_by === '' ? 'Desconocido' : dataSee.approved_by}
                            </span>
                            <span class="text-xs font-normal">
                                <strong>Rechazado el:</strong>
                                {dataSee.approved_at === '' ? 'Desconocida' : formatDateTime(dataSee.approved_at)}
                            </span>
                            {#if dataSee.audio }
                                <audio class="h-9 mt-2" controls> 
                                    <source src="{dataSee.audio}" type="audio/mp3"> No soportado.
                                </audio>
                            {/if}
                        </div>               
                    {:else if dataSee.approved === 'approved'}  
                        <div class="flex flex-col gap-1">
                            <span class="flex flex-row justify-center items-center tooltip" data-tip="Fue aprobado">
                                <strong>Aprobado</strong>
                                <CheckedVerifyIcon styles="ml-2 text-green-600" size={30} />
                            </span>     
                            <span class="text-xs font-normal mt-3">
                                <strong>Nota:</strong>
                                {dataSee.response === '' ? 'Sin nota' : dataSee.response}
                            </span>
                            <span class="text-xs font-normal">
                                <strong>Aprobado por:</strong>
                                {dataSee.approved_by === '' ? 'Desconocido' : dataSee.approved_by}
                            </span>
                            <span class="text-xs font-normal">
                                <strong>Aprobado el:</strong>
                                {dataSee.approved_at === '' ? 'Desconocida' : formatDateTime(dataSee.approved_at)}
                            </span>
                            {#if dataSee.audio }
                                <audio class="h-9 mt-2" controls> 
                                    <source src="{dataSee.audio}" type="audio/mp3"> No soportado.
                                </audio>
                            {/if}
                        </div>               
                    {:else}
                        <span class="{labelStyle}">¿Ya fue aprobado?</span>
                        <span class="tooltip" data-tip="Pendiente de aprobación">
                            <AlertHexaIcon styles="ml-2 text-orange-600" size={30} />
                        </span>                    
                    {/if}
                </div>
            {/if}
        </div>
    
        <div class="mt-5 flex-col gap-2 {dataSee.need_approve ? 'flex' : 'hidden' }">
    
            <div>
                <label for="approval_details" class="{labelStyle}">Describe la aprobación</label>
                <input type="text" name="approval_details" id="approval_details" value={dataSee.approval_details} class="mt-2 {formStyle}" placeholder="Describe la aprobación" readonly>
            </div>
    
            <div>
                <CardFile bind:files={dataSee.files_approved} {project} gridColums="md:grid-cols-6 grid-cols-2" onlyRead={true} />                    
            </div>
    
        </div>
    </div>

</section>