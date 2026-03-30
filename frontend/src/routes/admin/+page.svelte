<script>
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let cargando = $state(false);
  let redes = $state(null);
  let totalRegistros = $state(0);
  let pagina = $state(1);
  let porPagina = $state(25);
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

  async function cargarRedes(paginaActual = pagina, limite = porPagina, textoBusqueda = busqueda) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      logueado = false;
      redes = null;
      return;
    }
    cargando = true;
    error = '';
    const params = new URLSearchParams({ page: String(paginaActual), limit: String(limite) });
    if (textoBusqueda?.trim()) params.set('busqueda', textoBusqueda.trim());
    try {
      const res = await fetch(`/api/admin/redes?${params}`, {
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
      redes = json.datos ?? json;
      totalRegistros = json.total ?? redes.length;
      logueado = true;
    } catch (e) {
      error = 'Error de conexión';
    } finally {
      cargando = false;
    }
  }

  let generandoCSV = $state(false);

  async function descargarCSV() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    generandoCSV = true;
    try {
      const params = new URLSearchParams({ page: '1', limit: '500000' });
      const res = await fetch(`/api/admin/redes?${params}`, { headers: { 'x-admin-token': token } });
      if (!res.ok) return;
      const json = await res.json();
      const list = json.datos ?? json;
      if (!list?.length) return;
      const headers = ['Nombre', 'Código', 'Rol', 'Invitante', 'Invitados'];
      const filas = list.map((r) => [
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
    } catch (_) {}
    finally {
      generandoCSV = false;
    }
  }

  let editando = $state(null);
  let formEdit = $state({});
  let guardando = $state(false);
  let cargandoEditar = $state(false);
  let errorCargaEditar = $state('');
  let eliminandoId = $state(null);
  let busqueda = $state('');
  let inputBusquedaRef = $state(null);

  function ejecutarBusqueda() {
    const q = (inputBusquedaRef?.value ?? busqueda ?? '').trim();
    busqueda = q;
    pagina = 1;
    cargarRedes(1, porPagina, q);
  }

  const totalPaginas = $derived(porPagina > 0 ? Math.max(1, Math.ceil(totalRegistros / porPagina)) : 1);
  const desde = $derived(totalRegistros === 0 ? 0 : (pagina - 1) * porPagina + 1);
  const hasta = $derived(Math.min(pagina * porPagina, totalRegistros));

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
  {#if !logueado}
    <h1 class="text-xl font-bold text-center text-gray-800 mb-2 pt-4">RedMadre.org</h1>
    <div class="max-w-sm mx-auto mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
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
    <h1 class="text-xl font-bold text-gray-800 mb-4">RedMadre.org</h1>
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
          {/if}
          <button
            type="button"
            onclick={descargarCSV}
            disabled={!redes?.length}
            class="px-3 py-1 text-sm border border-brand-black rounded bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Descargar CSV
          </button>
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
        <div class="flex flex-wrap items-center gap-4 mb-3">
          <div class="flex items-center gap-2">
            <input
              type="search"
              bind:this={inputBusquedaRef}
              bind:value={busqueda}
              placeholder="Buscar en todos los registros…"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  ejecutarBusqueda();
                }
              }}
              class="w-64 border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              onclick={ejecutarBusqueda}
              class="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50"
            >
              Buscar
            </button>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <label class="flex items-center gap-1.5">
              <span>Registros por página</span>
              <select
                value={porPagina}
                onchange={(e) => {
                  porPagina = parseInt(e.currentTarget.value, 10);
                  pagina = 1;
                  cargarRedes(1, porPagina, busqueda);
                }}
                class="border border-gray-300 rounded px-2 py-1 bg-white text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </label>
            <span class="text-gray-500">Mostrando {desde}–{hasta} de {totalRegistros}</span>
            <span class="text-gray-700 font-medium">Total de registros: {totalRegistros}</span>
          </div>
        </div>
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
              {#if (redes?.length ?? 0) === 0}
                <tr>
                  <td colspan={esSoloLectura ? 5 : 6} class="border border-brand-black px-2 py-3 text-center text-gray-600">
                    {totalRegistros === 0 && busqueda.trim() ? 'Ningún registro coincide con la búsqueda.' : 'Sin registros.'}
                  </td>
                </tr>
              {:else}
                {#each redes as r}
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
        {#if totalRegistros > 0}
          <div class="flex items-center justify-between mt-3 text-sm">
            <button
              type="button"
              disabled={pagina <= 1 || cargando}
              onclick={() => {
                if (pagina <= 1) return;
                pagina--;
                cargarRedes(pagina, porPagina, busqueda);
              }}
              class="px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              Anterior
            </button>
            <span class="text-gray-600">Página {pagina} de {totalPaginas}</span>
            <button
              type="button"
              disabled={pagina >= totalPaginas || cargando}
              onclick={() => {
                if (pagina >= totalPaginas) return;
                pagina++;
                cargarRedes(pagina, porPagina, busqueda);
              }}
              class="px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              Siguiente
            </button>
          </div>
        {/if}
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

    {#if generandoCSV}
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" aria-live="polite" aria-busy="true">
        <div class="bg-white rounded-lg shadow-lg px-8 py-6 text-center">
          <p class="text-gray-800 font-medium">Generando CSV, espere un momento…</p>
        </div>
      </div>
    {/if}
  {/if}
</div>

