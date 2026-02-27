<script>
  import LeafletMap from '$lib/LeafletMap.svelte';
  import QrCode from '$lib/QrCode.svelte';
  let { data } = $props();
  let form = $state({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    mes: '01',
    dia: '1',
    anio: '1990',
    direccion: '',
    lat: null,
    lng: null
  });
  let enviando = $state(false);
  let error = $state('');
  let exito = $state(null);

  const referente = $derived(data?.referente);
  const codigo = $derived(data?.codigo ?? '');
  const rol = $derived(data?.rol ?? 'unete');
  const esImpulsa = $derived(rol === 'impulsa');
  const accentBorder = $derived(esImpulsa ? 'border-brand-orange' : 'border-[var(--color-brand-yellow)]');
  const accentBg = $derived(esImpulsa ? 'bg-brand-orange' : 'bg-brand-yellow');

  const fechaNacimiento = $derived(
    `${form.anio}-${form.mes.padStart(2, '0')}-${form.dia.padStart(2, '0')}`
  );

  async function submit() {
    error = '';
    enviando = true;
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          apellidoPaterno: form.apellidoPaterno,
          apellidoMaterno: form.apellidoMaterno,
          telefono: form.telefono,
          fechaNacimiento,
          direccion: form.direccion,
          lat: form.lat,
          lng: form.lng,
          invitanteCodigo: codigo,
          rol
        })
      });
      const json = await res.json();
      if (!res.ok) {
        error = json.error ?? 'Error al crear usuario';
        return;
      }
      exito = json;
    } catch (e) {
      error = e.message ?? 'Error de conexión';
    } finally {
      enviando = false;
    }
  }

  function compartirWhatsApp() {
    if (!exito || !esImpulsa) return;
    const url = `${window.location.origin}/r/${exito.codigo}`;
    const mensaje = `ÚNETE A MI RED\nRed de ${exito.nombreCompleto}\n${url}`;
    const href = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(href, '_blank');
  }
</script>

<svelte:head>
  <title>Datos de registro — Aliados QR</title>
</svelte:head>

<div class="max-w-lg mx-auto px-4 py-6">
  {#if !referente}
    <p class="text-center">Referente no encontrado.</p>
    <a href="/" class="block text-center mt-4 underline">Inicio</a>
  {:else if exito}
    <div class="bg-white rounded-lg border-2 border-brand-black p-6 text-center">
      <p class="font-bold text-lg mb-2">Usuario creado</p>
      <p class="text-sm mb-4">{exito.nombreCompleto}</p>
      {#if esImpulsa}
        <div class="mx-auto mb-4 max-w-xs border-2 border-brand-black rounded-lg p-3 bg-white">
          <QrCode path={`/r/${exito.codigo}`} size={220} alt="QR de tu red" />
        </div>
        <p class="text-sm mb-4">Comparte tu QR o enlace para hacer crecer tu red:</p>
        <a
          href="/r/{exito.codigo}"
          class="inline-block py-2 px-4 bg-brand-blue text-white rounded font-medium"
        >
          /r/{exito.codigo}
        </a>
        <button
          type="button"
          onclick={compartirWhatsApp}
          class="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#25D366] text-white font-semibold border-2 border-brand-black shadow-[3px_3px_0_0_#000] hover:opacity-90"
        >
          COMPARTIR
        </button>
      {:else}
        <p class="text-sm">Te has unido a la red.</p>
      {/if}
      <a href="/" class="block mt-6 underline">Volver al inicio</a>
    </div>
  {:else}
    <div class="bg-white rounded-lg border-2 {accentBorder} p-6 shadow-lg">
      <h2 class="text-lg font-bold flex items-center gap-2 mb-6">
        <span class="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">👤</span>
        Datos de registro
      </h2>
      <p class="text-sm text-gray-700 mb-4">
        Completa los datos obligatorios. Te registras {esImpulsa ? 'como impulsor' : 'en la red'} de {referente.nombreCompleto}.
      </p>

      <form onsubmit={(e) => { e.preventDefault(); submit(); }} class="space-y-4">
        <label class="block">
          <span class="block text-sm font-medium mb-1">NOMBRE</span>
          <input
            type="text"
            bind:value={form.nombre}
            required
            class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"
            placeholder="Nombre"
          />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">APELLIDO PATERNO</span>
          <input
            type="text"
            bind:value={form.apellidoPaterno}
            required
            class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"
          />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">APELLIDO MATERNO</span>
          <input
            type="text"
            bind:value={form.apellidoMaterno}
            required
            class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"
          />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">TELÉFONO</span>
          <input
            type="tel"
            bind:value={form.telefono}
            required
            class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"
          />
        </label>
        <div>
          <span class="block text-sm font-medium mb-1">FECHA DE NACIMIENTO</span>
          <div class="flex gap-2">
            <select
              bind:value={form.mes}
              class="flex-1 border-2 border-brand-black rounded px-2 py-2 bg-white"
            >
              {#each ['01','02','03','04','05','06','07','08','09','10','11','12'] as m}
                <option value={m}>{['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][parseInt(m)-1]}</option>
              {/each}
            </select>
            <input
              type="number"
              bind:value={form.dia}
              min="1"
              max="31"
              class="w-16 border-2 border-brand-black rounded px-2 py-2 bg-white text-center"
            />
            <input
              type="number"
              bind:value={form.anio}
              min="1920"
              max="2026"
              class="w-20 border-2 border-brand-black rounded px-2 py-2 bg-white text-center"
            />
          </div>
        </div>
        <label class="block">
          <span class="block text-sm font-medium mb-1">DIRECCIÓN</span>
          <input
            type="text"
            bind:value={form.direccion}
            required
            class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"
            placeholder="ESCRIBE AQUÍ TU DIRECCIÓN"
          />
        </label>
        <div class="rounded overflow-hidden border border-brand-black/30 h-48">
          <LeafletMap bind:lat={form.lat} bind:lng={form.lng} />
        </div>

        {#if error}
          <p class="text-red-800 text-sm">{error}</p>
        {/if}
        <button
          type="submit"
          disabled={enviando}
          class="w-full py-3 font-bold bg-brand-black text-brand-yellow rounded border-2 border-brand-black hover:opacity-90 disabled:opacity-50"
        >
          {enviando ? 'Creando…' : 'CREAR USUARIO'}
        </button>
      </form>
    </div>
  {/if}
</div>
