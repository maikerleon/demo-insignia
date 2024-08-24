<script>
    import { createEventDispatcher } from 'svelte';
	import { formStyle, handleLoading, messageAlert, messageForAdminView } from '$lib/utilities.js';
	import ButtonNormal from '$components/ButtonNormal.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
	import GoBackIcon from '$icons/GoBackIcon.svelte';
    import Select from 'svelte-select/Select.svelte';
    import { municipalities as municipalities_temp, statutes, regions } from '$lib/data.js';

    let municipalities = municipalities_temp.map(mun => ({label: mun.name, value: mun.id}));

    export let toggleTable;
    export let dataSee;
    export let project;
    export let bucket;
    export let role;
    export let nameProject;
    export let dependence;

    const dispatch = createEventDispatcher();

    const labelStyle = "font-semibold text-sm text-gray-600 ml-0.5";

    const updateData = () => {
        dispatch('handleAddNewProgress', dataSee);
    }

    const createProgress = async () => {

        const type = dataSee.id === '' ? 'creado' : 'actualizado';

        handleLoading('Creando sub proyecto...');
        
        try {

            const action = '/api/create-sub-project/'
            
            const formData = new FormData();
            
            formData.append('project', project);
            formData.append('bucket', bucket);
            formData.append('sub_project', JSON.stringify(dataSee));

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success, newId} = JSON.parse(resp);

            if (type === 'creado') {
                dataSee.id = newId;
                updateData();
            }

            if( success ) {
                messageAlert('success',`Se ha ${type} el sub proyecto con éxito`);
                return;
            }

            throw new Error;

        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
        }
	}
    
    const selectAllMunicipalities = () => {
        dataSee.municipalities = municipalities.map(mun => ({label: mun.label, value: mun.value}))
    }

    const selectAllRegions = () => {
        dataSee.regions = regions.map(mun => ({label: mun.label, value: mun.value}))
    }

</script>

<section>
    <div class="flex justify-between">
        <h1 class="md:max-w-[700px] hidden md:block text-pretty">{nameProject}</h1>
        <ButtonLight typeButton="button" styles="mb-4" action={toggleTable} text="Ir atrás">
            <GoBackIcon styles="pr-1" />
        </ButtonLight>
    </div>

    <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div class="col-span-1 md:col-span-2">
            <label for="name" class="{labelStyle}">Nombre</label>
            <input type="text" name="name" id="name" bind:value={dataSee.name} class="mt-2 {formStyle} h-12" placeholder="Nombre del sub proyecto">
        </div>

        <div>
            <label for="start" class="{labelStyle}">Fecha de activación</label>
            <input type="date" name="start" id="start" bind:value={dataSee.start} class="mt-2 {formStyle} h-12">
        </div>

        <div class="gap-2 grid grid-cols-1">
            <label class="{labelStyle}" for="municipalities">Municipios <button type="button" on:click={selectAllMunicipalities} class="text-xs text-ins-500">(seleccionar todos)</button></label>
            <Select items={municipalities} bind:value={dataSee.municipalities} multiple showChevron placeholder="seleccione los municipios" name="municipalities" id="municipalities">
                <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
            </Select>
        </div>

        <div>
            <label for="status" class="{labelStyle}">Estatus</label>
            <select name="status" id="status" class="{formStyle} h-12 mt-2" bind:value={dataSee.status}>
                <option value={null} disabled>Seleccione un estatus</option>
                {#each statutes as st }
                    <option value={st.value}>{st.label}</option>
                {/each}
            </select>
        </div>

        <div>
            <label for="percent" class="{labelStyle}">% de Avance</label>
            <input type="number" name="percent" id="percent" bind:value={dataSee.percent} class="mt-2 {formStyle} h-12" placeholder="%">
        </div>

        <div class="col-span-1 md:col-span-2">
            <label for="description" class="{labelStyle}">Descripción</label>
            <textarea type="text" name="description" id="description" bind:value={dataSee.description} class="mt-2 {formStyle} h-12 min-h-24" placeholder="Descripción"></textarea>
        </div>

        <hr class="col-span-1 md:col-span-2 mt-5 mb-2" class:hidden={dependence?.data?.abbr !== 'SE' && dependence?.data?.abbr !== 'SS'}>

        {#if dependence?.data?.abbr === 'SE' }
            <div>
                <label for="invertion" class="{labelStyle}">Inversión en MDP</label>
                <input type="number" name="invertion" id="invertion" bind:value={dataSee.invertion} class="mt-2 {formStyle} h-12" placeholder="$">
            </div>
            
            <div>
                <label for="turn" class="{labelStyle}">Giro</label>
                <input type="text" name="turn" id="turn" bind:value={dataSee.turn} class="mt-2 {formStyle} h-12" placeholder='Giro'>
            </div>

            <div>
                <label for="employments" class="{labelStyle}">Empleos generados</label>
                <input type="number" name="employments" id="employments" bind:value={dataSee.employments} class="mt-2 {formStyle} h-12" placeholder={0}>
            </div>

            <div>
                <label for="origin" class="{labelStyle}">Origen</label>
                <input type="text" name="origin" id="origin" bind:value={dataSee.origin} class="mt-2 {formStyle} h-12" placeholder="Origen">
            </div>

            <div class="gap-2 grid grid-cols-1">
                <label class="{labelStyle}" for="regions">Región <button type="button" on:click={selectAllRegions} class="text-xs text-ins-500">(seleccionar todas)</button></label>
                <Select items={regions} bind:value={dataSee.regions} multiple showChevron placeholder="seleccione las regiones" name="regions" id="regions">
                    <div class="text-center p-3 text-gray-400" slot="empty">No se encontraron resultados</div>
                </Select>
            </div>
        {/if}
        

        {#if dependence?.data?.abbr === 'SS' }
            <div>
                <label for="climate" class="{labelStyle}">Climatización %</label>
                <input type="number" name="climate" id="climate" bind:value={dataSee.climate} class="mt-2 {formStyle} h-12" placeholder="%">
            </div>

            <div>
                <label for="rehabilitation" class="{labelStyle}">Rehabilitación %</label>
                <input type="number" name="rehabilitation" id="rehabilitation" bind:value={dataSee.rehabilitation} class="mt-2 {formStyle} h-12" placeholder="%">
            </div>

            <div>
                <label for="equipment" class="{labelStyle}">Equipamiento %</label>
                <input type="number" name="equipment" id="equipment" bind:value={dataSee.equipment} class="mt-2 {formStyle} h-12" placeholder="%">
            </div>
        {/if}

    </div>

    <div class="flex justify-end mt-8">
        
        {#if role === 'super-view' }            
            <ButtonNormal typeButton="button" action={messageForAdminView} text="Crear sub proyecto" />
        {:else}
            <ButtonNormal typeButton="button" action={createProgress} text="Crear sub proyecto" />
        {/if}
    </div>
    
</section>