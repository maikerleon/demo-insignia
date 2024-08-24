<script>
    import { goto } from '$app/navigation';
	import { handleLoading, messageAlert } from '$lib/utilities.js';

    export let code;

    let isPasswordHidden = true;
    let new_password = '';
    let confirm_password = '';
    let error = '';

    const togglePasswordVisibility = () => isPasswordHidden = !isPasswordHidden;

    const handleRestorePassword = async () => {
        if (!new_password || !confirm_password) return error = 'Debes llenar todos los campos';
        if (new_password !== confirm_password) return error = 'Las contraseñas no coinciden';

        error = '';

        handleLoading();
        try {
            const action = '/api/restore-password/'
            const formData = new FormData();
            formData.append('code', code);
            formData.append('new_password', new_password);
            formData.append('confirm_password', confirm_password);
            const response = await fetch(action, {
                method: 'POST',
                body: formData
            });
            const resp = await response.text();
            const {success, message} = JSON.parse(resp);
            
            if (!success) error = message;
            
            messageAlert('success', 'Contraseña restablecida con éxito');
            
            setTimeout( async () => {
                await goto('/', { invalidateAll: true });
            }, 2000);

        } catch (error) {
            messageAlert('error', error.message);
        }
    }

</script>

<div class="flex items-center justify-center h-screen bg-gray-200">
    <div class="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg lg:max-w-4xl">
        <div class="hidden bg-cover lg:block lg:w-1/2 min-h-[440px]" style="background-image: url('/background.webp');"></div>

        <div class="w-full px-6 py-8 sm:px-8 lg:w-1/2">
            <div class="flex justify-center mx-auto">
                <img class="max-w-40" src="/logo.webp" alt="Logo Insignia">
            </div>

            <div class="flex items-center justify-between mt-4">
                <span class="w-1/5 border-b lg:w-1/4"></span>

                <span class="text-xs text-center text-gray-500 uppercase">¡Bienvenid@ otra vez!</span>

                <span class="w-1/5 border-b lg:w-1/4"></span>
            </div>

            <section class="flex flex-1 flex-col justify-center h-4/6">

                <div class="mt-4 relative">
                    <label class="block mb-2 text-sm font-medium text-gray-600" for="new_password">Nueva contraseña</label>                    
                    {#if isPasswordHidden }
                        <input id="new_password" name="new_password"
                            bind:value={new_password}
                            type="password"
                            placeholder="*********"
                            class="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-ins-400 focus:ring-opacity-20 focus:outline-none focus:ring focus:ring-ins-300"
                        />
                    {:else}
                        <input id="new_password" name="new_password"
                            bind:value={new_password}
                            type="text"
                            placeholder="*********"
                            class="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-ins-400 focus:ring-opacity-20 focus:outline-none focus:ring focus:ring-ins-300"
                        />
                    {/if}
                    <button type="button"
                        class="text-gray-400 absolute right-3 inset-y-9 my-auto active:text-gray-600 focus:outline-none focus:text-ins-700"
                        on:click={togglePasswordVisibility}
                    >
                        {#if isPasswordHidden}
                            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        {/if}
                    </button>
                </div>

                <div class="mt-4 relative">
                    <label class="block mb-2 text-sm font-medium text-gray-600" for="confirm_password">Confirmar contraseña</label>      
                    {#if isPasswordHidden }
                        <input id="confirm_password" name="confirm_password"
                            bind:value={confirm_password}
                            type="password"
                            placeholder="*********"
                            class="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-ins-400 focus:ring-opacity-20 focus:outline-none focus:ring focus:ring-ins-300"
                        />
                    {:else}
                        <input id="confirm_password" name="confirm_password"
                            bind:value={confirm_password}
                            type="text"
                            placeholder="*********"
                            class="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-ins-400 focus:ring-opacity-20 focus:outline-none focus:ring focus:ring-ins-300"
                        />
                    {/if}
                    <button type="button"
                        class="text-gray-400 absolute right-3 inset-y-9 my-auto active:text-gray-600 focus:outline-none focus:text-ins-700"
                        on:click={togglePasswordVisibility}
                    >
                        {#if isPasswordHidden}
                            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        {/if}
                    </button>
                </div>

                {#if error }
                    <p class="text-red-700 font-semibold mt-5 text-xs">*{error}</p>
                {/if}

                <div class="mt-6">
                    <button type="button" class="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-ins-600 rounded-lg hover:bg-ins-500 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50" on:click={handleRestorePassword}>
                        Restablecer contraseña
                    </button>
                </div>
            </section>

            <section class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a href="/" class="flex items-center justify-center mt-4 text-gray-600 transition-colors duration-300 transform border rounded-lg hover:bg-gray-50 py-1.5 px-2 col-span-1 w-auto">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-home-share" width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M9 21v-6a2 2 0 0 1 2 -2h2c.247 0 .484 .045 .702 .127" />
                            <path d="M19 12h2l-9 -9l-9 9h2v7a2 2 0 0 0 2 2h5" />
                            <path d="M16 22l5 -5" />
                            <path d="M21 21.5v-4.5h-4.5" />
                          </svg>
                    </div>
    
                    <span class="ml-2 font-semibold text-center text-xs">Volver al inicio</span>
                </a>
                <a href="/" class="flex items-center justify-center mt-4 text-gray-600 transition-colors duration-300 transform border rounded-lg hover:bg-gray-50 py-1.5 px-2 col-span-1 w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-key" width="22" height="22" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z" />
                        <path d="M15 9h.01" />
                    </svg>
                    <span class="ml-2 font-semibold text-center text-xs">Iniciar sesión</span>
                </a>
            </section>
        </div>
    </div>
</div>