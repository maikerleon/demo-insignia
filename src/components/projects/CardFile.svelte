<script>
    import Swal from 'sweetalert2';
    import { messageAlert, closeAlert, handleLoading } from '$lib/utilities.js';
	import DeleteIcon from '$icons/DeleteIcon.svelte';
	import EyeIcon from '$icons/EyeIcon.svelte';
	import FileUnknownIcon from '$icons/FileUnknownIcon.svelte';
	import LoaderIcon from '$icons/LoaderIcon.svelte';
	import WordIcon from '$icons/WordIcon.svelte';
	import ExcelIcon from '$icons/ExcelIcon.svelte';
	import PdfIcon from '$icons/PdfIcon.svelte';

    export let files;
    export let project;
    export let APIDelete = '';
    export let tableDelete = '';
    export let gridColums = "grid-cols-2";
    export let onlyRead = false;

    const deleteArchive = async (e, rsc) => {
        e.preventDefault();
        const result = await Swal.fire({
			title: "¡No podrás revertir esto!",
			text: `¿Estás seguro de eliminar esté archivo?`,
			icon: 'warning',
            focusCancel: true,
			showCancelButton: true,
			confirmButtonColor: '#1fabbb',
			cancelButtonColor: '#d33',
			confirmButtonText: '¡Sí, eliminarlo!',
			cancelButtonText: 'Cancelar'
		});

		if (result.isConfirmed) {

            try {
                handleLoading("Eliminando archivo...");

                const action = `/api/${APIDelete}`;
                const formData = new FormData();

                formData.append('project', project);
                formData.append('file', rsc);
                formData.append('table_delete', tableDelete);

                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                const resp = await response.text();
                const {success} = JSON.parse(resp);

                if( success ) {
                    messageAlert('success', `Archivo eliminado correctamente`);
                    files = files.filter(r => r.file !== rsc);
                    return;
                }

                throw new Error;

            } catch (error) {
                closeAlert();
                messageAlert('error','Ha ocurrido un error inesperado, intente nuevamente.');
            }
        }
    }

</script>

{#if files && files.length > 0 }
    <div class="collapse collapse-plus bg-base-200 mt-5 rounded-md">
        <input type="checkbox" name="{APIDelete}" class="peer" /> 
        <div class="collapse-title bg-gray-700 text-white peer-checked:bg-ins-600 peer-checked:white">
        Archivos subidos
        </div>
        <div class="collapse-content bg-gray-700 text-white peer-checked:bg-ins-600 peer-checked:white"> 
            {#if files && files.length > 0}
                <div class="mt-8 mx-2 grid {gridColums} gap-4 col-span-2">
                    {#each files as file }
                        <div class="bg-base-200 hover:shadow-lg shadow-md transition-shadow duration-700 p-1 rounded-lg flex items-center justify-between relative group overflow-hidden hover:bg-gray-200">
                            {#if ['png', 'jpeg', 'jpg'].includes(file.ext) }
                                <img loading="lazy" src={file.file} class="object-cover h-40 w-full rounded-md" alt="Archivo de check list subido el {file.created_at}">
                            {:else if ['pdf'].includes(file.ext)}
                                <div class="flex items-center justify-center w-full text-gray-800">
                                    <PdfIcon size={80} />
                                </div>
                            {:else if ['xls','xlsx'].includes(file.ext)}
                                <div class="flex items-center justify-center w-full text-gray-800">
                                    <ExcelIcon size={80} />
                                </div>
                            {:else if ['doc','docx'].includes(file.ext)}
                                <div class="flex items-center justify-center w-full text-gray-800">
                                    <WordIcon size={80} />
                                </div>
                            {:else if !file.ext }
                                <div class="flex items-center justify-center w-full text-gray-800 rotate-animation">
                                    <LoaderIcon size={80} />
                                </div>
                            {:else}
                                <div class="flex items-center justify-center w-full text-gray-800">
                                    <FileUnknownIcon size={80} />
                                </div>
                            {/if}
                            <!-- {#if role === 'super-admin' } -->
                                <div class="flex flex-row absolute bottom-2 gap-2 justify-center items-center w-full left-0 group-hover:opacity-100 opacity-0 transition-opacity duration-150">
                                    
                                    <a href={file.file} target="_blank" class="cursor-pointer bg-ins-600 text-gray-50 text-xs font-medium px-2 py-1 rounded-md hover:bg-ins-700">
                                        <EyeIcon size={18} />
                                    </a>
                                    
                                    {#if !onlyRead }
                                        <button type="button" class="cursor-pointer bg-red-600 text-gray-50 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-700" on:click|stopPropagation={(e)=>{deleteArchive(e,file.file)}} >
                                            <DeleteIcon size={18} />
                                        </button> 
                                    {/if}

                                </div>
                            <!-- {/if} -->
                        </div>
                    {/each}
                </div>			
            {/if}
        </div>
    </div>
{/if}