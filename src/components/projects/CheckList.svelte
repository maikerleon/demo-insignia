<script>
    import { onMount } from 'svelte';
    import Dropzone from 'dropzone';
	import ButtonNormal from '$components/ButtonNormal.svelte';
	import { handleLoading, messageAlert, formStyle, messageForAdminView } from '$lib/utilities.js';
    import CardFile from '$components/projects/CardFile.svelte';

    export let checkList;
    export let project;
    export let role;

    let legal_viability_files_dropzone;
    let new_image_files_dropzone;
    let agreement_files_dropzone;

    onMount(() => {
		legal_viability_files_dropzone = new Dropzone("#legal_viability_files_dropzone", { 
			url: "/api/upload-files-check-list",
			dictDefaultMessage: "Arrastra tus archivos aquí o haz clic para seleccionarlos",
            dictRemoveFile: "Eliminar",
			autoProcessQueue: false,
			maxFiles: 50,
            acceptedFiles: 'image/png,image/jpg,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            addRemoveLinks: true
		});

		legal_viability_files_dropzone.on("queuecomplete", function() {
			legal_viability_files_dropzone.removeAllFiles(true);
		});

		legal_viability_files_dropzone.on("error", function(file, errorMessage) {
			messageAlert('error','Error al subir los archivos, por favor vuelva a intentarlo!');
		});

        new_image_files_dropzone = new Dropzone("#new_image_files_dropzone", { 
			url: "/api/upload-files-check-list",
			dictDefaultMessage: "Arrastra tus archivos aquí o haz clic para seleccionarlos",
            dictRemoveFile: "Eliminar",
			autoProcessQueue: false,
			maxFiles: 50,
            acceptedFiles: 'image/png,image/jpg,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            addRemoveLinks: true
		});

		new_image_files_dropzone.on("queuecomplete", function() {
			new_image_files_dropzone.removeAllFiles(true);
		});

		new_image_files_dropzone.on("error", function(file, errorMessage) {
			messageAlert('error','Error al subir los archivos, por favor vuelva a intentarlo!');
		});

        agreement_files_dropzone = new Dropzone("#agreement_files_dropzone", { 
			url: "/api/upload-files-check-list",
			dictDefaultMessage: "Arrastra tus archivos aquí o haz clic para seleccionarlos",
            dictRemoveFile: "Eliminar",
			autoProcessQueue: false,
			maxFiles: 50,
            acceptedFiles: 'image/png,image/jpg,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            addRemoveLinks: true
		});

		agreement_files_dropzone.on("queuecomplete", function() {
			agreement_files_dropzone.removeAllFiles(true);
		});

		agreement_files_dropzone.on("error", function(file, errorMessage) {
			messageAlert('error','Error al subir los archivos, por favor vuelva a intentarlo!');
		});
	});

    const labelStyle = 'font-semibold text-sm text-gray-600 ml-0.5';

    const saveCheckList = async () => {
        await handleSendImages('legal_viability');
        await handleSendImages('new_image');
        await handleSendImages('agreement');
        handleLoading('Actualizando check list...');
        
        try {

            const action = '/api/update-check-list/'
            
            const formData = new FormData();
            
            formData.append('project', project);
            formData.append('checkList', JSON.stringify(checkList));

            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });

            const resp = await response.text();
            const {success} = JSON.parse(resp);

            if( success ) {
                messageAlert('success',`Se ha actualizado el check list con éxito`);
                return;
            }

            throw new Error;

        } catch (error) {
            messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
        }
	}

    const handleSendImages = async (type) => {
        return new Promise((resolve, reject) => {

            let dropzoneTemp;
            let messageLoading;

            if ( type === 'legal_viability' ) {
                dropzoneTemp = legal_viability_files_dropzone;
                messageLoading = "Subiendo archivos de viabilidad jurídica...";
            } else if ( type === 'new_image' ) {
                dropzoneTemp = new_image_files_dropzone;
                messageLoading = "Subiendo archivos de nueva imagen...";
            } else {
                dropzoneTemp = agreement_files_dropzone;
                messageLoading = "Subiendo archivos de convenio...";
            }
            
            const files = dropzoneTemp.getQueuedFiles();


            if (files.length === 0) {
                resolve();
                return;
            }

            handleLoading(messageLoading);

            let currentFileIndex = 0;

            dropzoneTemp.on("success", (file, {url}) => {
                const newData = {file: url, created_at: new Date().toISOString(), ext: url.split('.').pop()};
                if ( type === 'legal_viability' ) {
                    if (checkList?.legal_viability_files) {
                        checkList.legal_viability_files = [...checkList.legal_viability_files, newData];
                    }else {
                        checkList.legal_viability_files = [newData];
                    }
                } else if ( type === 'new_image' ) {
                    
                    if (checkList?.new_image_files) {
                        checkList.new_image_files = [...checkList.new_image_files, newData];
                    }else {
                        checkList.new_image_files = [newData];
                    }
                } else {
                    if (checkList?.agreement_files) {
                        checkList.agreement_files = [...checkList.agreement_files, newData];
                    }else {
                        checkList.agreement_files = [newData];
                    }
                }

                processNextFile(type);
            });

            dropzoneTemp.on("error", (file, errorMessage) => {
                reject(new Error(`Error al procesar el archivo ${file.name}: ${errorMessage}`));
            });

            const processNextFile = (type) => {
                if (currentFileIndex < files.length) {
                    const file = files[currentFileIndex];
                    const fileFormData = new FormData();
                    fileFormData.append('project', project);
                    fileFormData.append('file', file);
                    fileFormData.append('typeFile', type);

                    dropzoneTemp.options.params = Object.fromEntries(fileFormData.entries());
                    dropzoneTemp.options.uploadMultiple = false;
                    dropzoneTemp.processFile(file);

                    currentFileIndex++;
                } else {
                    resolve();
                }
            };

            processNextFile(type);
        });
    };

</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/basic.min.css" integrity="sha512-MeagJSJBgWB9n+Sggsr/vKMRFJWs+OUphiDV7TJiYu+TNQD9RtVJaPDYP8hA/PAjwRnkdvU+NsTncYTKlltgiw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/dropzone.min.css" integrity="sha512-qkeymXyips4Xo5rbFhX+IDuWMDEmSn7Qo7KpPMmZ1BmuIA95IPVYsVZNn8n4NH/N30EY7PUZS3gTeTPoAGo1mA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<section class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">

    <!-- Left -->
    <div class="grid grid-cols-1 gap-4">

        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
            <label for="financial_viability" class="{labelStyle}">Viabilidad financiera</label>
            <div class="flex flex-row sm:gap-4 gap-1 mt-2">
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Si</span> 
                      <input type="radio" value="yes" name="financial_viability" class="ml-2 radio checked:bg-green-500" bind:group={checkList.financial_viability} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No</span> 
                      <input type="radio" value="no" name="financial_viability" class="ml-2 radio checked:bg-red-500" bind:group={checkList.financial_viability} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No aplica</span> 
                      <input type="radio" value="no-apply" name="financial_viability" class="ml-2 radio checked:bg-blue-500" bind:group={checkList.financial_viability} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Por evaluar</span> 
                      <input type="radio" value="to-evaluate" name="financial_viability" class="ml-2 radio checked:bg-orange-500" bind:group={checkList.financial_viability} />
                    </label>
                </div>
            </div>
        </div>
        
        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
            <label for="legal_viability" class="{labelStyle}">Viabilidad jurídica</label>
            <div class="flex flex-row sm:gap-4 gap-1 mt-2">
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Si</span> 
                      <input type="radio" value="yes" name="legal_viability" class="ml-2 radio checked:bg-green-500" bind:group={checkList.legal_viability} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No</span> 
                      <input type="radio" value="no" name="legal_viability" class="ml-2 radio checked:bg-red-500" bind:group={checkList.legal_viability} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No aplica</span> 
                      <input type="radio" value="no-apply" name="legal_viability" class="ml-2 radio checked:bg-blue-500" bind:group={checkList.legal_viability} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Por evaluar</span> 
                      <input type="radio" value="to-evaluate" name="legal_viability" class="ml-2 radio checked:bg-orange-500" bind:group={checkList.legal_viability} />
                    </label>
                </div>
            </div>
            <div class="{checkList.legal_viability === 'yes' ? 'block' : 'hidden'}">
                <div class="grid grid-cols-1 gap-2 mt-2">
                    <div>
                        <label for="legal_viability_conclusion" class="{labelStyle}">Conclusión de la viabilidad jurídica</label>
                        <input type="text" class="{formStyle} mt-1" name="legal_viability_conclusion" bind:value={checkList.legal_viability_conclusion} placeholder="Conclusión de la viabilidad jurídica">
                    </div>
    
                    <div class="mt-1">
                        <label for="legal_viability_compliance" class="{labelStyle}">Cumplimiento de la legislación aplicable</label>
                        <input type="text" class="{formStyle} mt-1" name="legal_viability_compliance" bind:value={checkList.legal_viability_compliance} placeholder="Cumplimiento de la legislación aplicable">
                    </div>
                </div>
            </div>

            <div>
                <CardFile bind:files={checkList.legal_viability_files} {project} gridColums="grid-cols-2" APIDelete="delete-file-check-list" tableDelete="legal_viability" />
            </div>

            <div id="legal_viability_files_dropzone" name="legal_viability_files_dropzone" class="dropzone w-full mt-2 font-semibold text-gray-500 bg-white "></div>
        </div>

        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
            <label for="vinculation_with_government_plan" class="{labelStyle}">Vinculación con plan de gobierno</label>
            <div class="flex flex-row sm:gap-4 gap-1 mt-2">
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Si</span> 
                      <input type="radio" value="yes" name="vinculation_with_government_plan" class="ml-2 radio checked:bg-green-500" bind:group={checkList.vinculation_with_government_plan} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No</span> 
                      <input type="radio" value="no" name="vinculation_with_government_plan" class="ml-2 radio checked:bg-red-500" bind:group={checkList.vinculation_with_government_plan} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No aplica</span> 
                      <input type="radio" value="no-apply" name="vinculation_with_government_plan" class="ml-2 radio checked:bg-blue-500" bind:group={checkList.vinculation_with_government_plan} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Por evaluar</span> 
                      <input type="radio" value="to-evaluate" name="vinculation_with_government_plan" class="ml-2 radio checked:bg-orange-500" bind:group={checkList.vinculation_with_government_plan} />
                    </label>
                </div>
            </div>
            <div class="{checkList.vinculation_with_government_plan === 'yes' ? 'block' : 'hidden'}">
                <div class="grid grid-cols-1 gap-2 mt-2">
                    <div>
                        <label for="vinculation_with_government_plan_section" class="{labelStyle}">Sección de plan de gobierno</label>
                        <input type="text" class="{formStyle} mt-1" name="vinculation_with_government_plan_section" bind:value={checkList.vinculation_with_government_plan_section} placeholder="Sección de plan de gobierno">
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
            <label for="administrative_viability" class="{labelStyle}">Viabilidad administrativa</label>
            <div class="flex flex-row sm:gap-4 gap-1 mt-2">
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Si</span> 
                      <input type="radio" value="yes" name="administrative_viability" class="ml-2 radio checked:bg-green-500" bind:group={checkList.administrative_viability} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No</span> 
                      <input type="radio" value="no" name="administrative_viability" class="ml-2 radio checked:bg-red-500" bind:group={checkList.administrative_viability} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No aplica</span> 
                      <input type="radio" value="no-apply" name="administrative_viability" class="ml-2 radio checked:bg-blue-500" bind:group={checkList.administrative_viability} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Por evaluar</span> 
                      <input type="radio" value="to-evaluate" name="administrative_viability" class="ml-2 radio checked:bg-orange-500" bind:group={checkList.administrative_viability} />
                    </label>
                </div>
            </div>
        </div>

    </div>

    <!-- Right -->
    <div class="grid grid-cols-1 gap-4">

        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
            <label for="new_image" class="{labelStyle}">Nueva imagen</label>
            <div class="flex flex-row sm:gap-4 gap-1 mt-2">
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Si</span> 
                      <input type="radio" value="yes" name="new_image" class="ml-2 radio checked:bg-green-500" bind:group={checkList.new_image} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No</span> 
                      <input type="radio" value="no" name="new_image" class="ml-2 radio checked:bg-red-500" bind:group={checkList.new_image} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No aplica</span> 
                      <input type="radio" value="no-apply" name="new_image" class="ml-2 radio checked:bg-blue-500" bind:group={checkList.new_image} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Por evaluar</span> 
                      <input type="radio" value="to-evaluate" name="new_image" class="ml-2 radio checked:bg-orange-500" bind:group={checkList.new_image} />
                    </label>
                </div>
            </div>
            <div class="{checkList.new_image === 'yes' ? 'block' : 'hidden'}">
                <div class="grid grid-cols-1 gap-2 mt-2">
                    <div>
                        <label for="new_image_scope" class="{labelStyle}">Alcance de nueva imagen</label>
                        <input type="text" class="{formStyle} mt-1" name="new_image_scope" bind:value={checkList.new_image_scope} placeholder="Alcance de nueva imagen">
                    </div>

                    <div>
                        <CardFile bind:files={checkList.new_image_files} {project} gridColums="grid-cols-2" APIDelete="delete-file-check-list" tableDelete="new_image" />                    
                    </div>

                    <div id="new_image_files_dropzone" name="new_image_files_dropzone" class="dropzone w-full mt-2 font-semibold text-gray-500 bg-white "></div>
    
                    <div class="mt-1">
                        <div class="form-control">
                            <label class="cursor-pointer label">
                              <span class="{labelStyle}">¿Aprobación de líder?</span>
                              <input type="checkbox" bind:checked={checkList.new_image_approval} class="checkbox checkbox-success" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
            <label for="agreement" class="{labelStyle}">Convenio</label>
            <div class="flex flex-row sm:gap-4 gap-1 mt-2">
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Si</span> 
                      <input type="radio" value="yes" name="agreement" class="ml-2 radio checked:bg-green-500" bind:group={checkList.agreement} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No</span> 
                      <input type="radio" value="no" name="agreement" class="ml-2 radio checked:bg-red-500" bind:group={checkList.agreement} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No aplica</span> 
                      <input type="radio" value="no-apply" name="agreement" class="ml-2 radio checked:bg-blue-500" bind:group={checkList.agreement} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Por evaluar</span> 
                      <input type="radio" value="to-evaluate" name="agreement" class="ml-2 radio checked:bg-orange-500" bind:group={checkList.agreement} />
                    </label>
                </div>
            </div>
            <div class="{checkList.agreement === 'yes' ? 'block' : 'hidden'}">
                <div class="grid grid-cols-1 gap-2 mt-2">
                    <div>
                        <label for="agreement_type" class="{labelStyle}">Tipo de convenio</label>
                        <input type="text" class="{formStyle} mt-1" name="agreement_type" bind:value={checkList.agreement_type} placeholder="Tipo de convenio">
                    </div>

                    <div>
                        <CardFile bind:files={checkList.agreement_files} {project} gridColums="grid-cols-2" APIDelete="delete-file-check-list" tableDelete="agreement" />
                    </div>

                    <div id="agreement_files_dropzone" name="agreement_files_dropzone" class="dropzone w-full mt-2 font-semibold text-gray-500 bg-white "></div>
                </div>
            </div>
        </div>

        <div class="bg-gray-100/70 p-2 sm:p-4 pt-4 rounded-md h-fit">
            <label for="desdoubles" class="{labelStyle}">Desdobles</label>
            <div class="flex flex-row sm:gap-4 gap-1 mt-2">
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Si</span> 
                      <input type="radio" value="yes" name="desdoubles" class="ml-2 radio checked:bg-green-500" bind:group={checkList.desdoubles} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No</span> 
                      <input type="radio" value="no" name="desdoubles" class="ml-2 radio checked:bg-red-500" bind:group={checkList.desdoubles} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">No aplica</span> 
                      <input type="radio" value="no-apply" name="desdoubles" class="ml-2 radio checked:bg-blue-500" bind:group={checkList.desdoubles} />
                    </label>
                </div>
                <div class="form-control flex flex-row">
                    <label class="label cursor-pointer">
                      <span class="label-text">Por evaluar</span> 
                      <input type="radio" value="to-evaluate" name="desdoubles" class="ml-2 radio checked:bg-orange-500" bind:group={checkList.desdoubles} />
                    </label>
                </div>
            </div>
            <div class="{checkList.desdoubles === 'yes' ? 'block' : 'hidden'}">
                <div class="grid grid-cols-1 gap-2 mt-2">
                    <div>
                        <label for="desdoubles_strategy" class="{labelStyle}">Estrategia de desdoble</label>
                        <input type="text" class="{formStyle} mt-1" name="desdoubles_strategy" bind:value={checkList.desdoubles_strategy} placeholder="Estrategia de desdoble">
                    </div>
                </div>
            </div>
        </div>

    </div>

    <div class="grid col-span-1 sm:col-span-2 justify-end">
        {#if role === 'super-view' }            
            <ButtonNormal action={messageForAdminView} text="Actualizar check list" ></ButtonNormal>
        {:else}
            <ButtonNormal action={saveCheckList} text="Actualizar check list" ></ButtonNormal>
        {/if}
    </div>

</section>

<style>
    .dropzone {
		border: dashed 2px silver;
	}
</style>