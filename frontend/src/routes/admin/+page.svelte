<script>
  let password = $state('');
  let error = $state('');
  let cargando = $state(false);
  let redes = $state(null);
  let logueado = $state(false);

  const TOKEN_KEY = 'aliadosqr_admin_token';

  async function login() {
    error = '';
    cargando = true;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: password })
      });
      const json = await res.json();
      if (!res.ok) {
        error = json.error ?? 'Credenciales inválidas';
        return;
      }
      localStorage.setItem(TOKEN_KEY, json.token);
      logueado = true;
      await cargarRedes();
    } catch (e) {
      error = 'Error de conexión';
    } finally {
      cargando = false;
    }
  }

  async function cargarRedes() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      logueado = false;
      redes = null;
      return;
    }
    cargando = true;
    error = '';
    try {
      const res = await fetch('/api/admin/redes', {
        headers: { 'x-admin-token': token }
      });
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        logueado = false;
        redes = null;
        error = 'Sesión expirada. Vuelve a iniciar sesión.';
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        error = json.error ?? 'No se pudo cargar la información';
        return;
      }
      redes = json;
      logueado = true;
    } catch (e) {
      error = 'Error de conexión';
    } finally {
      cargando = false;
    }
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      logueado = true;
      cargarRedes();
    }
  }
</script>

<svelte:head>
  <title>Admin — Aliados QR</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-4">Admin — Redes</h1>

  {#if !logueado}
    <div class="max-w-sm bg-white border-2 border-brand-black rounded-lg p-6">
      <h2 class="font-semibold mb-3">Iniciar sesión</h2>
      <form
        onsubmit={(e) => {
          e.preventDefault();
          login();
        }}
        class="space-y-3"
      >
        <input
          type="password"
          bind:value={password}
          placeholder="Clave de administrador"
          class="w-full border-2 border-brand-black rounded px-3 py-2 bg-white"
        />
        {#if error}
          <p class="text-red-800 text-sm">{error}</p>
        {/if}
        <button
          type="submit"
          disabled={cargando}
          class="w-full py-2 font-bold bg-brand-black text-brand-yellow rounded border-2 border-brand-black disabled:opacity-50"
        >
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  {:else}
    <div class="bg-white border-2 border-brand-black rounded-lg p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold">Resumen de redes</h2>
        <button
          type="button"
          onclick={cargarRedes}
          class="px-3 py-1 text-sm border border-brand-black rounded bg-brand-yellow hover:opacity-90"
        >
          Actualizar
        </button>
      </div>
      {#if error}
        <p class="text-red-800 text-sm mb-2">{error}</p>
      {/if}
      {#if !redes}
        <p class="text-sm text-gray-600">{cargando ? 'Cargando…' : 'Sin datos aún.'}</p>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-brand-yellow">
                <th class="border border-brand-black px-2 py-1 text-left">Nombre</th>
                <th class="border border-brand-black px-2 py-1 text-left">Código</th>
                <th class="border border-brand-black px-2 py-1 text-left">Rol</th>
                <th class="border border-brand-black px-2 py-1 text-left">Invitante</th>
                <th class="border border-brand-black px-2 py-1 text-right">Invitados</th>
              </tr>
            </thead>
            <tbody>
              {#each redes as r}
                <tr>
                  <td class="border border-brand-black px-2 py-1">{r.nombreCompleto}</td>
                  <td class="border border-brand-black px-2 py-1">{r.codigo}</td>
                  <td class="border border-brand-black px-2 py-1 capitalize">{r.rol}</td>
                  <td class="border border-brand-black px-2 py-1">{r.invitanteNombre ?? '—'}</td>
                  <td class="border border-brand-black px-2 py-1 text-right">{r.totalInvitados}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>

