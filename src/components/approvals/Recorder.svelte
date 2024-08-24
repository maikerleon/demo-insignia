<script>
	import DeleteIcon from '$icons/DeleteIcon.svelte';
    import MicrophoneIcon from '$icons/MicrophoneIcon.svelte';

    export let audioURL;
    export let recording;

    let media = [];
    let mediaRecorder = null;
    let audioBlob = null;

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => media.push(e.data);
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(media, { type: 'audio/mp3; codecs=opus' });
            media = [];
            audioURL = window.URL.createObjectURL(audioBlob);
        };
        recording = true;
        mediaRecorder.start();
        audioURL = '';
    };

    const stopRecording = () => {
        recording = false;
        mediaRecorder.stop();
    };
</script>

<div class="mt-10 flex justify-center flex-col w-full">
    <div class="justify-center flex mb-10 items-center min-h-14">
        {#if audioURL}
            <audio src={audioURL} controls />
            <button class="hover:text-red-700 text-gray-400 ml-3" on:click={() => audioURL = ''}>
                <DeleteIcon size={30} />
            </button>
        {/if}
    </div>

    <div class="flex justify-center">
        {#if !recording}
            <button on:click={startRecording} class="flex justify-center max-w-fit">
                <div class="loader bg-gray-100 rounded-full p-3 min-h-[50px] max-h-[50px] h-[50px] text-ins-600 hover:text-white hover:bg-ins-600 transition-all duration-300 border border-ins-600 flex justify-center">
                    <MicrophoneIcon size={30} />
                </div>
            </button>
        {:else}
            <button on:click={stopRecording} class="flex justify-center max-w-fit group">
                <div class="flex w-full justify-evenly items-center gap-0.5 bg-gray-100 rounded-full p-3 min-h-[50px] max-h-[50px] h-[50px] group-hover:bg-red-700 border border-ins-600 group-hover:border-red-600">
                    <div class="line bg-ins-600 group-hover:bg-white rounded-3xl w-1 h-3"></div>
                    <div class="line bg-ins-600 group-hover:bg-white rounded-3xl w-1 h-3"></div>
                    <div class="line bg-ins-600 group-hover:bg-white rounded-3xl w-1 h-3"></div>
                    <div class="line bg-ins-600 group-hover:bg-white rounded-3xl w-1 h-3"></div>
                    <div class="line bg-ins-600 group-hover:bg-white rounded-3xl w-1 h-3"></div>
                </div>
            </button>
        {/if}
    </div>
   
</div>

<style>
    .line:nth-child(1) {
        animation: animateLoader 0.7s 0.6s infinite;
    }

    .line:nth-child(2) {
        animation: animateLoader 0.7s 0.3s infinite;
    }

    .line:nth-child(3) {
        animation: animateLoader 0.7s infinite;
    }

    .line:nth-child(4) {
        animation: animateLoader 0.7s 0.3s infinite;
    }

    .line:nth-child(5) {
        animation: animateLoader 0.7s 0.6s infinite;
    }

    @keyframes animateLoader {
        0% {
            height: 12px;
        }

        50% {
            height: 25px;
        }

        100% {
            height: 12px;
        }
    }

</style>