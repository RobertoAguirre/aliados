<script>
  import { onMount } from 'svelte';

  export let path = '';
  export let text = '';
  export let size = 240;
  export let alt = 'Código QR';

  let src = '';

  onMount(async () => {
    const { toDataURL } = await import('qrcode');
    const value = text || (typeof window !== 'undefined' ? `${window.location.origin}${path}` : path);
    src = await toDataURL(value || ' ', { margin: 1, width: size });
  });
</script>

{#if src}
  <img src={src} alt={alt} class="w-full h-auto" />
{:else}
  <div class="w-full h-full flex items-center justify-center text-xs text-gray-500">
    Generando QR…
  </div>
{/if}

