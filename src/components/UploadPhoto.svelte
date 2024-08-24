<script>
	import { messageAlert } from '$lib/utilities.js';
    import Dropzone from "dropzone";
    import { getContext, onMount } from "svelte";

    const photo = getContext("photo");
    
    export let toggle;

    onMount(() => {
        const dropzone = new Dropzone("#files", {
            url: "/api/upload-photo-profile",
            dictDefaultMessage: "Arrastra tu foto aquí o haz clic para seleccionarla",
            autoProcessQueue: true,
            maxFiles: 1,
            acceptedFiles: 'image/*',
        });

        dropzone.on("success", function (file) {
            messageAlert('success', 'Foto actualizada exitosamente');
            dropzone.removeAllFiles(true);
            toggle();

            $photo = file.dataURL;
        });

        dropzone.on("error", function (file, errorMessage) {
            messageAlert('error', 'Error al subir la imagen, por favor vuelva a intentarlo!');
        });

        return dropzone;
    });

</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/basic.min.css" integrity="sha512-MeagJSJBgWB9n+Sggsr/vKMRFJWs+OUphiDV7TJiYu+TNQD9RtVJaPDYP8hA/PAjwRnkdvU+NsTncYTKlltgiw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/6.0.0-beta.2/dropzone.min.css" integrity="sha512-qkeymXyips4Xo5rbFhX+IDuWMDEmSn7Qo7KpPMmZ1BmuIA95IPVYsVZNn8n4NH/N30EY7PUZS3gTeTPoAGo1mA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<div class="fixed inset-0 w-full h-full">
    <button class="fixed inset-0 w-full h-full bg-black opacity-40" on:click={toggle()}></button>
    <div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl mx-auto px-4">
        <div class="bg-white rounded-md shadow-lg px-4 py-6">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-medium text-gray-800">Actualizar foto de perfil</h2>
                <button on:click={toggle()} class="p-2 text-gray-400 rounded-md hover:bg-gray-100">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 mx-auto"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    >
                    <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    />
                    </svg>
                </button>
            </div>

            <section class="p-5">
                <div id="files" class="dropzone w-full mt-5 font-semibold text-gray-500 bg-white"></div>
                <p class="mt-3 text-sm leading-relaxed text-left text-gray-500">
                    Selecciona una foto, preferiblemente de 500x500
                </p>
            </section>
        </div>
    </div>
</div>

<style>
    .dropzone {
		border: dashed 3px silver;
	}
</style>