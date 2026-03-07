<script>
</script>

<svelte:head>
  <title>Aliados QR</title>
</svelte:head>

<div class="max-w-lg mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold text-center mb-8">Aliados QR</h1>
  <p class="text-center text-sm mb-8 text-gray-700">
    <strong>Crear mi red</strong> — Registra tu red y obtén tu enlace y QR para invitar.  
    <strong>Mi Red</strong> — Consulta tu red e invitados con tu código.  
    <strong>Admin</strong> — Panel de administración.
  </p>
  <p class="text-center text-xs mb-6 text-gray-500">
    Si alguien te compartió un enlace o QR, ábrelo en el navegador (no uses los botones de abajo).
  </p>
  <div class="flex flex-col gap-3">
    <a
      href="/crear-red"
      class="block w-full py-3 text-center font-bold border-2 border-brand-black bg-brand-blue text-white rounded shadow-[4px_4px_0_0_#000] hover:opacity-90"
    >
      Crear mi red
    </a>
    <a
      href="/mi-red"
      class="block w-full py-3 text-center font-bold border-2 border-brand-black bg-white rounded shadow-[4px_4px_0_0_#000] hover:bg-gray-100"
    >
      Mi Red
    </a>
    <a
      href="/admin"
      class="block w-full py-2 text-center text-xs font-semibold border border-brand-black bg-black text-white hover:opacity-90"
    >
      Admin
    </a>
  </div>
</div>
