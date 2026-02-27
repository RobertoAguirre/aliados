<script>
  import QrCode from '$lib/QrCode.svelte';
  let codigo = $state('');
  let enviando = $state(false);
  let error = $state('');
  let red = $state(null);

  async function buscar() {
    const c = codigo.trim().toUpperCase();
    if (!c) {
      error = 'Ingresa tu código';
      return;
    }
    error = '';
    enviando = true;
    red = null;
    try {
      const resUsuario = await fetch(`/api/usuarios/by-codigo/${c}`);
      if (!resUsuario.ok) {
        error = 'Código no encontrado';
        return;
      }
      const usuario = await resUsuario.json();
      const resRed = await fetch(`/api/usuarios/${usuario.id}/red`);
      if (!resRed.ok) {
        error = 'No se pudo cargar tu red';
        return;
      }
      red = await resRed.json();
    } catch (e) {
      error = 'Error de conexión';
    } finally {
      enviando = false;
    }
  }

  function compartirWhatsAppRed() {
    if (!red?.usuario) return;
    const url = `${window.location.origin}/r/${red.usuario.codigo}`;
    const nombre = `${red.usuario.nombre} ${red.usuario.apellidoPaterno}`.trim();
    const mensaje = `ÚNETE A MI RED\nRed de ${nombre}\n${url}`;
    const href = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(href, '_blank');
  }
</script>

<svelte:head>
  <title>Mi Red — Aliados QR</title>
</svelte:head>

<div class="max-w-lg mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold text-center mb-2">Mi Red</h1>
  <p class="text-center text-sm mb-6">Ingresa tu código para ver el avance de tu red.</p>

  <form onsubmit={(e) => { e.preventDefault(); buscar(); }} class="flex gap-2 mb-6">
    <input
      type="text"
      bind:value={codigo}
      placeholder="Tu código (ej. ABC123)"
      maxlength="6"
      class="flex-1 border-2 border-brand-black rounded px-3 py-2 bg-white uppercase"
    />
    <button
      type="submit"
      disabled={enviando}
      class="px-4 py-2 font-bold bg-brand-black text-brand-yellow rounded border-2 border-brand-black disabled:opacity-50"
    >
      {enviando ? '…' : 'Ver'}
    </button>
  </form>

  {#if error}
    <p class="text-red-800 text-sm mb-4">{error}</p>
  {/if}

  {#if red}
    <div class="bg-white rounded-lg border-2 border-brand-black p-6">
      <p class="font-bold text-lg mb-1">
        {red.usuario.nombre} {red.usuario.apellidoPaterno} {red.usuario.apellidoMaterno}
      </p>
      <p class="text-sm text-gray-600 mb-4">Código: {red.usuario.codigo}</p>
      <div class="mx-auto mb-4 max-w-xs border-2 border-brand-black rounded-lg p-3 bg-white">
        <QrCode path={`/r/${red.usuario.codigo}`} size={220} alt="QR de tu red" />
      </div>
      <p class="text-sm font-medium mb-2">Tu enlace para invitar:</p>
      <a href="/r/{red.usuario.codigo}" class="text-brand-blue underline break-all">/r/{red.usuario.codigo}</a>
      <button
        type="button"
        onclick={compartirWhatsAppRed}
        class="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#25D366] text-white font-semibold border-2 border-brand-black shadow-[3px_3px_0_0_#000] hover:opacity-90"
      >
        COMPARTIR
      </button>
      <h2 class="font-bold mt-6 mb-2">Invitados ({red.invitados.length})</h2>
      {#if red.invitados.length === 0}
        <p class="text-sm text-gray-600">Aún no hay invitados. Comparte tu enlace o QR.</p>
      {:else}
        <ul class="space-y-2">
          {#each red.invitados as inv}
            <li class="text-sm border-b border-gray-200 pb-2">
              {inv.nombre} {inv.apellidoPaterno} — {inv.rol}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}

  <a href="/" class="block mt-6 text-center underline text-sm">Volver al inicio</a>
</div>
