<script>
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let cargando = $state(false);
  let redes = $state(null);
  let logueado = $state(false);
  let role = $state('');

  const TOKEN_KEY = 'aliadosqr_admin_token';
  const ROLE_KEY = 'aliadosqr_admin_role';
  const esSoloLectura = $derived(role === 'lectura');

  async function login() {
    error = '';
    cargando = true;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (!res.ok) {
        error = json.error ?? 'Credenciales inválidas';
        return;
      }
      const r = json.role ?? 'admin';
      localStorage.setItem(TOKEN_KEY, json.token);
      localStorage.setItem(ROLE_KEY, r);
      role = r;
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
        localStorage.removeItem(ROLE_KEY);
        role = '';
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

  function descargarCSV() {
    if (!redes?.length) return;
    const headers = ['Nombre', 'Código', 'Rol', 'Invitante', 'Invitados'];
    const filas = redes.map((r) => [
      r.nombreCompleto,
      r.codigo,
      r.rol,
      r.invitanteNombre ?? '',
      r.totalInvitados
    ]);
    const csv = [headers.join(','), ...filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `redes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  let editando = $state(null);
  let formEdit = $state({});
  let guardando = $state(false);
  let cargandoEditar = $state(false);
  let errorCargaEditar = $state('');
  let eliminandoId = $state(null);
  let busqueda = $state('');

  const redesFiltradas = $derived.by(() => {
    const list = redes ?? [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        (r.nombreCompleto ?? '').toLowerCase().includes(q) ||
        (r.codigo ?? '').toLowerCase().includes(q) ||
        (r.rol ?? '').toLowerCase().includes(q) ||
        (r.invitanteNombre ?? '').toLowerCase().includes(q) ||
        String(r.totalInvitados ?? '').includes(q)
    );
  });

  async function abrirEditar(r) {
    editando = r.id;
    modalAbiertoEn = Date.now();
    formEdit = {};
    errorCargaEditar = '';
    cargandoEditar = true;
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const res = await fetch(`/api/admin/usuarios/${r.id}`, { headers: { 'x-admin-token': token } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        errorCargaEditar = j.error ?? `Error ${res.status}. Revisa la conexión o la sesión.`;
        return;
      }
      const u = await res.json();
      formEdit = {
        nombre: u.nombre ?? '',
        apellidoPaterno: u.apellidoPaterno ?? '',
        apellidoMaterno: u.apellidoMaterno ?? '',
        telefono: u.telefono ?? '',
        fechaNacimiento: u.fechaNacimiento ?? '',
        direccion: u.direccion ?? '',
        rol: u.rol ?? 'impulsa'
      };
    } catch (e) {
      errorCargaEditar = 'No se pudieron cargar los datos. Revisa la conexión.';
    } finally {
      cargandoEditar = false;
    }
  }

  function cerrarEditar() {
    editando = null;
    formEdit = {};
    errorCargaEditar = '';
  }

  let modalAbiertoEn = $state(0);

  function cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    role = '';
    logueado = false;
    redes = null;
    error = '';
  }

  async function guardarEditar() {
    guardando = true;
    error = '';
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/admin/usuarios/${editando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(formEdit)
      });
      if (!res.ok) {
        const j = await res.json();
        error = j.error ?? 'Error al guardar';
        return;
      }
      cerrarEditar();
      await cargarRedes();
    } finally {
      guardando = false;
    }
  }

  async function eliminar(r) {
    if (!confirm(`¿Eliminar a ${r.nombreCompleto}?`)) return;
    eliminandoId = r.id;
    error = '';
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`/api/admin/usuarios/${r.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token }
      });
      if (!res.ok) {
        const j = await res.json();
        error = j.error ?? 'Error al eliminar';
        return;
      }
      await cargarRedes();
    } finally {
      eliminandoId = null;
    }
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      role = localStorage.getItem(ROLE_KEY) ?? 'admin';
      cargarRedes();
    }
  }
</script>

<svelte:head>
  <title>Admin — RedMadre</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-4">Admin — Redes</h1>

  {#if !logueado}
    <div class="max-w-sm mx-auto mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-1">Iniciar sesión</h2>
      <p class="text-sm text-gray-500 mb-6">Admin o auditor</p>
      <form
        onsubmit={(e) => {
          e.preventDefault();
          login();
        }}
        class="space-y-4"
      >
        <label class="block">
          <span class="sr-only">Email</span>
          <input
            type="email"
            bind:value={email}
            placeholder="Email"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-shadow"
          />
        </label>
        <label class="block">
          <span class="sr-only">Contraseña</span>
          <input
            type="password"
            bind:value={password}
            placeholder="Contraseña"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-shadow"
          />
        </label>
        {#if error}
          <p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        {/if}
        <button
          type="submit"
          disabled={cargando}
          class="w-full py-3 font-semibold bg-brand-blue text-white rounded-lg shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-50 transition-opacity"
        >
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  {:else}
    <div class="bg-white border-2 border-brand-black rounded-lg p-4">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 class="font-semibold">Resumen de redes</h2>
        <div class="flex gap-2 flex-wrap">
          {#if !esSoloLectura}
            <a
              href="/crear-red"
              class="px-3 py-1 text-sm border border-brand-black rounded bg-brand-blue text-white hover:opacity-90"
            >
              Crear mi red
            </a>
            <button
              type="button"
              onclick={descargarCSV}
              disabled={!redes?.length}
              class="px-3 py-1 text-sm border border-brand-black rounded bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Descargar CSV
            </button>
          {/if}
          <button
            type="button"
            onclick={cargarRedes}
            class="px-3 py-1 text-sm border border-brand-black rounded bg-brand-blue text-white hover:opacity-90"
          >
            Actualizar
          </button>
          <button
            type="button"
            onclick={cerrarSesion}
            class="px-3 py-1 text-sm border border-brand-black rounded bg-white hover:bg-gray-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      {#if error}
        <p class="text-red-800 text-sm mb-2">{error}</p>
      {/if}
      {#if !redes}
        <p class="text-sm text-gray-600">{cargando ? 'Cargando…' : 'Sin datos aún.'}</p>
      {:else}
        <input
          type="search"
          bind:value={busqueda}
          placeholder="Buscar en toda la tabla…"
          class="w-full max-w-sm mb-3 border-2 border-brand-black rounded px-3 py-1.5 text-sm"
        />
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-brand-blue text-white">
                <th class="border border-brand-black px-2 py-1 text-left">Nombre</th>
                <th class="border border-brand-black px-2 py-1 text-left">Código</th>
                <th class="border border-brand-black px-2 py-1 text-left">Rol</th>
                <th class="border border-brand-black px-2 py-1 text-left">Invitante</th>
                <th class="border border-brand-black px-2 py-1 text-right">Invitados</th>
                {#if !esSoloLectura}
                  <th class="border border-brand-black px-2 py-1 text-center w-40 min-w-[10rem]">Acciones</th>
                {/if}
              </tr>
            </thead>
            <tbody>
              {#if busqueda.trim() && redesFiltradas.length === 0}
                <tr>
                  <td colspan={esSoloLectura ? 5 : 6} class="border border-brand-black px-2 py-3 text-center text-gray-600">Ningún registro coincide con la búsqueda.</td>
                </tr>
              {:else}
                {#each redesFiltradas as r}
                <tr>
                  <td class="border border-brand-black px-2 py-1">{r.nombreCompleto}</td>
                  <td class="border border-brand-black px-2 py-1">{r.codigo}</td>
                  <td class="border border-brand-black px-2 py-1 capitalize">{r.rol}</td>
                  <td class="border border-brand-black px-2 py-1">{r.invitanteNombre ?? '—'}</td>
                  <td class="border border-brand-black px-2 py-1 text-right">{r.totalInvitados}</td>
                  {#if !esSoloLectura}
                    <td class="border border-brand-black px-2 py-1.5 text-center w-40 min-w-[10rem]">
                      <div class="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onclick={() => abrirEditar(r)}
                          class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                          title="Editar"
                        >
                          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          type="button"
                          onclick={() => eliminar(r)}
                          disabled={eliminandoId === r.id}
                          class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-red-300 bg-red-50 text-red-800 hover:bg-red-100 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                          title="Eliminar"
                        >
                          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {eliminandoId === r.id ? '…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  {/if}
                </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

    {#if editando}
      <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onclick={(e) => {
          if (e.target !== e.currentTarget) return;
          if (Date.now() - modalAbiertoEn < 300) return;
          cerrarEditar();
        }}
      >
        <div class="bg-white border-2 border-brand-black rounded-lg p-4 max-w-md w-full shadow-lg" onclick={(e) => e.stopPropagation()}>
          <h3 id="modal-titulo" class="font-semibold mb-3">Editar persona</h3>
          {#if cargandoEditar}
            <p class="text-sm text-gray-600">Cargando datos…</p>
          {:else if errorCargaEditar}
            <p class="text-sm text-red-800 mb-3">{errorCargaEditar}</p>
            <button type="button" onclick={cerrarEditar} class="px-3 py-1 border border-brand-black rounded bg-white">Cerrar</button>
          {:else}
            <form onsubmit={(e) => { e.preventDefault(); guardarEditar(); }} class="space-y-2">
              <input type="text" bind:value={formEdit.nombre} placeholder="Nombre" class="w-full border border-brand-black rounded px-2 py-1" />
              <input type="text" bind:value={formEdit.apellidoPaterno} placeholder="Apellido paterno" class="w-full border border-brand-black rounded px-2 py-1" />
              <input type="text" bind:value={formEdit.apellidoMaterno} placeholder="Apellido materno" class="w-full border border-brand-black rounded px-2 py-1" />
              <input type="text" bind:value={formEdit.telefono} placeholder="Teléfono" class="w-full border border-brand-black rounded px-2 py-1" />
              <input type="text" bind:value={formEdit.fechaNacimiento} placeholder="Fecha nacimiento" class="w-full border border-brand-black rounded px-2 py-1" />
              <input type="text" bind:value={formEdit.direccion} placeholder="Dirección" class="w-full border border-brand-black rounded px-2 py-1" />
              <select bind:value={formEdit.rol} class="w-full border border-brand-black rounded px-2 py-1">
                <option value="impulsa">Impulsa</option>
                <option value="unete">Unete</option>
              </select>
              <div class="flex gap-2 mt-3">
                <button type="button" onclick={cerrarEditar} class="px-3 py-1 border border-brand-black rounded bg-white">Cancelar</button>
                <button type="submit" disabled={guardando} class="px-3 py-1 bg-brand-blue text-white rounded border border-brand-black disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>

