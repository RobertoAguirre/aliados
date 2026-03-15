<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import LeafletMap from '$lib/LeafletMap.svelte';
  import QrCode from '$lib/QrCode.svelte';

  const TOKEN_KEY = 'aliadosqr_admin_token';
  const ROLE_KEY = 'aliadosqr_admin_role';
  onMount(() => {
    if (!localStorage.getItem(TOKEN_KEY) || localStorage.getItem(ROLE_KEY) === 'lectura') goto('/admin');
  });

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

  const fechaNacimiento = $derived(
    `${String(form.anio)}-${String(form.mes).padStart(2, '0')}-${String(form.dia).padStart(2, '0')}`
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
          rol: 'impulsa'
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
    if (!exito) return;
    const url = `${window.location.origin}/r/${exito.codigo}`;
    const mensaje = `ÚNETE A MI RED\nRed de ${exito.nombreCompleto}\n${url}`;
    const href = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(href, '_blank');
  }

  async function ubicarEnMapa() {
    const q = form.direccion?.trim();
    if (!q) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'AliadosQR/1.0' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data[0]) {
        form.lat = parseFloat(data[0].lat);
        form.lng = parseFloat(data[0].lon);
      }
    } catch (_) {}
  }
</script>

<svelte:head>
  <title>Crear mi red — RedMadre</title>
</svelte:head>

<div class="max-w-lg mx-auto px-4 py-6">
  <div class="bg-white rounded-lg border-2 border-brand-blue p-6 shadow-lg">
    <h2 class="text-lg font-bold flex items-center gap-2 mb-6">
      <span class="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">👤</span>
      Crear mi red (primer impulsor)
    </h2>
    <p class="text-sm text-gray-700 mb-4">Registro para iniciar tu propia red. Luego podrás compartir tu enlace o QR.</p>

    {#if exito}
      <div class="text-center">
        <p class="font-bold text-lg mb-2">Red creada</p>
        <p class="text-sm mb-4">{exito.nombreCompleto}</p>
        <div class="mx-auto mb-4 max-w-xs border-2 border-brand-black rounded-lg p-3 bg-white">
          <QrCode path={`/r/${exito.codigo}`} size={220} alt="QR de tu red" />
        </div>
        <p class="text-sm mb-4">Comparte tu QR o enlace para que otros IMPULSEN o se ÚNAN a tu red:</p>
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
        <a href="/" class="block mt-6 underline">Inicio</a>
      </div>
    {:else}
      <form onsubmit={(e) => { e.preventDefault(); submit(); }} class="space-y-4">
        <label class="block">
          <span class="block text-sm font-medium mb-1">NOMBRE</span>
          <input type="text" bind:value={form.nombre} required class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">APELLIDO PATERNO</span>
          <input type="text" bind:value={form.apellidoPaterno} required class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">APELLIDO MATERNO</span>
          <input type="text" bind:value={form.apellidoMaterno} required class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">TELÉFONO</span>
          <input type="tel" bind:value={form.telefono} required class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white" />
        </label>
        <div>
          <span class="block text-sm font-medium mb-1">FECHA DE NACIMIENTO</span>
          <div class="flex gap-2">
            <select bind:value={form.mes} class="flex-1 border-2 border-brand-black rounded px-2 py-2 bg-white">
              {#each ['01','02','03','04','05','06','07','08','09','10','11','12'] as m}
                <option value={m}>{['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][parseInt(m)-1]}</option>
              {/each}
            </select>
            <input type="number" bind:value={form.dia} min="1" max="31" class="w-16 border-2 border-brand-black rounded px-2 py-2 bg-white text-center" />
            <input type="number" bind:value={form.anio} min="1920" max="2026" class="w-20 border-2 border-brand-black rounded px-2 py-2 bg-white text-center" />
          </div>
        </div>
        <label class="block">
          <span class="block text-sm font-medium mb-1">DIRECCIÓN</span>
          <div class="flex gap-2">
            <input type="text" bind:value={form.direccion} required class="flex-1 border-2 border-brand-black rounded px-3 py-2 bg-white" placeholder="ESCRIBE AQUÍ TU DIRECCIÓN" />
            <button type="button" onclick={ubicarEnMapa} class="px-3 py-2 text-sm font-medium border-2 border-brand-black rounded bg-white hover:bg-gray-100 whitespace-nowrap">Ubicar en mapa</button>
          </div>
        </label>
        <div class="rounded overflow-hidden border border-brand-black/30 h-32">
          <LeafletMap bind:lat={form.lat} bind:lng={form.lng} bind:direccion={form.direccion} />
        </div>
        {#if error}<p class="text-red-800 text-sm">{error}</p>{/if}
        <button type="submit" disabled={enviando} class="w-full py-3 font-bold bg-brand-blue text-white rounded border-2 border-brand-black hover:opacity-90 disabled:opacity-50">
          {enviando ? 'Creando…' : 'CREAR USUARIO'}
        </button>
      </form>
    {/if}
  </div>
</div>
