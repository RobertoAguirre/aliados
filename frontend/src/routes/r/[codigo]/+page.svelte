<script>
  import { goto } from '$app/navigation';
  let { data } = $props();
  const referente = $derived(data?.referente);
  const codigo = $derived(data?.codigo ?? '');

  function elegir(rol) {
    goto(`/r/${codigo}/registro?rol=${rol}`);
  }
</script>

<svelte:head>
  <title>Elige tu opción — Aliados QR</title>
</svelte:head>

{#if !referente}
  <div class="max-w-lg mx-auto px-4 py-12 text-center">
    <p class="text-red-800">Enlace o referente no encontrado.</p>
    <a href="/" class="mt-4 inline-block underline">Volver al inicio</a>
  </div>
{:else}
  <div class="min-h-[80vh] flex flex-col">
    <div class="flex-1 grid grid-cols-2 min-h-[320px]">
      <div
        class="bg-brand-orange flex flex-col items-center justify-center p-4 border-r-2 border-brand-black"
      >
        <button
          type="button"
          onclick={() => elegir('impulsa')}
          class="px-8 py-4 font-bold bg-white border-2 border-brand-black rounded shadow-[4px_4px_0_0_#000] hover:bg-gray-100"
        >
          IMPULSA
        </button>
        <p class="mt-4 text-center text-sm font-medium">
          CONSTRUYE TU PROPIA RED EN APOYO A:
        </p>
        <p class="mt-1 text-center font-bold">{referente.nombreCompleto}</p>
      </div>
      <div class="bg-white flex flex-col items-center justify-center p-4 border-l border-brand-black">
        <button
          type="button"
          onclick={() => elegir('unete')}
          class="px-8 py-4 font-bold bg-brand-orange border-2 border-brand-black rounded shadow-[4px_4px_0_0_#000] hover:opacity-90"
        >
          ÚNETE
        </button>
        <p class="mt-4 text-center text-sm font-medium">A LA RED DE:</p>
        <p class="mt-1 text-center font-bold">{referente.nombreCompleto}</p>
      </div>
    </div>
  </div>
{/if}
