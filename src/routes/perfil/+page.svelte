<script>
	import UploadPhoto from '$components/UploadPhoto.svelte';
    import { enhance } from '$app/forms';
    import { handleLoading, messageAlert, closeAlert } from '$lib/utilities';
    import { getContext } from 'svelte';
    const photo = getContext('photo');

    export let data;
    export let form;
    let { name, lastname_father, lastname_mother, email, phone } = data;

    let isPasswordHidden = true;
    let openModal = false;

    const toggleModal = () => {
        openModal = !openModal;
    }

    const togglePasswordVisibility = () => {
        isPasswordHidden = !isPasswordHidden;
    }

    $: if ( form ) {
        if ( form?.data ) {
            if (form?.type === 'personal') {
                name = form?.data.name;
                lastname_father = form?.data.lastname_father;
                lastname_mother = form?.data.lastname_mother;
                email = form?.data.email;
                phone = form?.data.phone;
            } else if (form?.type === 'personal') {
                actual_password = form?.data.actual_password;
                new_password = form?.data.new_password;
                confirm_password = form?.data.confirm_password;
            }
            
            delete form.data;
            closeAlert();
        }
        if ( form?.success ) {
            if (form?.type === 'personal') {
                messageAlert('success', 'Su información personal ha sido actualizado con éxito.');
            } else if (form?.type === 'password') {
                messageAlert('success', 'Su contraseña ha sido actualizada con éxito.');
            }
            delete form.success;
        }
    }
</script>

<section class="px-4 pb-8 sm:px-6">
    <div>
        <header class="sm:-mt-24">
            <section class="pb-2 w-full rounded-lg bg-gradient-to-r from-ins-900 to-ins-950 h-36 sm:h-64 flex justify-center items-center flex-col">
                <h2 class="text-white text-2xl sm:text-4xl text-center">
                    {name} {lastname_father} {lastname_mother ?? ''}
                </h2>
                <span class="text-gray-300">
                    {email}
                </span>
            </section>
            <aside class="sm:-mt-20 -mt-8 relative">
                <section class="flex flex-col items-center">
                    <figure class="relative group">
                        {#if $photo }
                            <img
                                class="skeleton object-cover w-24 h-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32 transition-transform transform group-hover:scale-110"
                                src={$photo}
                                alt="Foto de perfil"
                            />
                        {:else}
                            <div class="w-24 h-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32 transition-transform transform group-hover:scale-110 bg-gray-200 flex justify-center items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 text-gray-400 -ml-0.5" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor" />
                                    <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" stroke-width="0" fill="currentColor" />
                                </svg>
                            </div>
                        {/if}
                
                        <button on:click={toggleModal} class="absolute bottom-0 right-0 bg-ins-800 rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 hover:outline-none hover:bg-ins-700 text-white">
                            <svg class="w-6 h-6 text-inherit" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </button>
                    </figure>
                </section>
            </aside>
        </header>

        <div class="grid grid-cols-1 gap-8 mt-8 xl:grid-cols-2">
            <div class="p-4 bg-white rounded-lg xl:p-6">
                <h1 class="text-lg font-medium text-gray-700 capitalize sm:text-xl">Actualizar contraseña</h1>

                <form class="mt-6 space-y-5" on:submit={handleLoading} autocomplete="off" method="post" action="?/password" use:enhance>
                    <div>
                        <label class="text-gray-600" for="actual_password">
                            Contraseña actual
                        </label>
                        <div class="relative mt-2">
                            <button 
                                class="text-gray-400 absolute right-3 inset-y-0 my-auto active:text-gray-600"
                                on:click={togglePasswordVisibility}
                                type="button"
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
                            <input
                                type={isPasswordHidden ? "password" : "text"}
                                placeholder="*********" id="actual_password" name="actual_password"
                                class="w-full pr-12 pl-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-ins-600 shadow-sm rounded-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="text-gray-600" for="new_password">
                            Nueva contraseña
                        </label>
                        <div class="relative mt-2">
                            <button 
                                class="text-gray-400 absolute right-3 inset-y-0 my-auto active:text-gray-600"
                                on:click={togglePasswordVisibility}
                                type="button"
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
                            <input
                                type={isPasswordHidden ? "password" : "text"}
                                placeholder="*********" id="new_password" name="new_password"
                                class="w-full pr-12 pl-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-ins-600 shadow-sm rounded-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="text-gray-600" for="confirm_password">
                            Repite la contraseña
                        </label>
                        <div class="relative mt-2">
                            <button 
                                class="text-gray-400 absolute right-3 inset-y-0 my-auto active:text-gray-600"
                                on:click={togglePasswordVisibility}
                                type="button"
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
                            <input
                                type={isPasswordHidden ? "password" : "text"}
                                placeholder="*********" id="confirm_password" name="confirm_password"
                                class="w-full pr-12 pl-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-ins-600 shadow-sm rounded-lg"
                            />
                        </div>
                    </div>

                    <section class="mt-4">
                        {#if form?.error && form?.type === 'password' }
                            <p class="ml-1 text-sm text-red-700 text-pretty">*{form?.message}</p>
                        {/if}
                    </section>
            
                    <div class="flex justify-end">
                        <button
                            class="flex items-center px-2 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-ins-500 rounded-md hover:bg-ins-700 focus:outline-none focus:ring focus:ring-ins-300 focus:ring-opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <span class="mx-1">Actualizar</span>
                        </button>
                    </div>
                </form>
            </div>

            <div class="p-4 bg-white rounded-lg xl:p-6">
                <h1 class="text-lg font-medium text-gray-700 capitalize sm:text-xl">Información personal</h1>
            
                <form class="mt-6 space-y-5" on:submit={handleLoading} autocomplete="off" method="post" action="?/personal" use:enhance>
                    <div>
                        <label for="name" class="block text-sm text-gray-700">Nombre(s)</label>
                        <input
                            bind:value={name}
                            id="name" name="name"
                            type="text"
                            class="block w-full px-3 py-2 mt-3 text-gray-600 bg-white border border-gray-200 rounded-md focus:border-ins-400 focus:outline-none focus:ring focus:ring-ins-300 focus:ring-opacity-20"
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label for="lastname_father" class="block text-sm text-gray-700 capitalize">Apellido paterno</label>
                            <input
                                bind:value={lastname_father}
                                id="lastname_father" name="lastname_father"
                                type="text"
                                class="block w-full px-3 py-2 mt-3 text-gray-600 bg-white border border-gray-200 rounded-md focus:border-ins-400 focus:outline-none focus:ring focus:ring-ins-300 focus:ring-opacity-20"
                            />
                        </div>
    
                        <div>
                            <label for="lastname_mother" class="block text-sm text-gray-700 capitalize">Apellido Materno</label>
                            <input
                                bind:value={lastname_mother}
                                id="lastname_mother" name="lastname_mother"
                                type="text"
                                class="block w-full px-3 py-2 mt-3 text-gray-600 bg-white border border-gray-200 rounded-md focus:border-ins-400 focus:outline-none focus:ring focus:ring-ins-300 focus:ring-opacity-20"
                            />
                        </div>
                    </div>
            
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label for="phone" class="block text-sm text-gray-700 capitalize">Teléfono</label>
                            <input
                                bind:value={phone}
                                id="phone" name="phone"
                                type="tel"
                                class="block w-full px-3 py-2 mt-3 text-gray-600 bg-white border border-gray-200 rounded-md focus:border-ins-400 focus:outline-none focus:ring focus:ring-ins-300 focus:ring-opacity-20"
                            />
                        </div>
                
                        <div>
                            <label for="email" class="block text-sm text-gray-700 capitalize">Correo electrónico</label>
                            <input
                                bind:value={email}
                                id="email" name="email"
                                type="email"
                                class="block w-full px-3 py-2 mt-3 text-gray-600 bg-white border border-gray-200 rounded-md focus:border-ins-400 focus:outline-none focus:ring focus:ring-ins-300 focus:ring-opacity-20"
                            />
                        </div>
                    </div>

                    <section class="mt-4">
                        {#if form?.error && form?.type === 'personal' }
                            <p class="ml-1 text-sm text-red-700 text-pretty">*{form?.message}</p>
                        {/if}
                    </section>
            
                    <div class="flex justify-end">
                        <button
                            class="flex items-center px-2 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-ins-500 rounded-md hover:bg-ins-700 focus:outline-none focus:ring focus:ring-ins-300 focus:ring-opacity-50" type="submit"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <span class="mx-1">Actualizar</span>
                        </button>
                    </div>
                </form>
            </div>            
        </div>
    </div>
</section>

{#if openModal }
    <UploadPhoto toggle={toggleModal} />
{/if}