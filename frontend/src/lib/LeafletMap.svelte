<script>
  import { onDestroy, onMount } from 'svelte';

  export let lat;
  export let lng;
  export let direccion = '';
  export let zoom = 13;

  let container;
  let map;
  let marker;
  let L;

  const DEFAULT_LAT = 28.6353;
  const DEFAULT_LNG = -106.0889;
  const NOMINATIM_HEADERS = { 'User-Agent': 'AliadosQR/1.0' };

  function currentCoords() {
    const la = typeof lat === 'number' ? lat : DEFAULT_LAT;
    const ln = typeof lng === 'number' ? lng : DEFAULT_LNG;
    return [la, ln];
  }

  async function reverseGeocode(la, ln) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${ln}&format=json`,
        { headers: NOMINATIM_HEADERS }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.display_name) direccion = data.display_name;
    } catch (_) {}
  }

  function updatePosition(la, ln) {
    lat = la;
    lng = ln;
    if (marker) marker.setLatLng([la, ln]);
    reverseGeocode(la, ln);
  }

  $: if (map && marker && L && typeof lat === 'number' && typeof lng === 'number') {
    const pos = L.latLng(lat, lng);
    marker.setLatLng(pos);
    map.setView([lat, lng], map.getZoom());
  }

  $: if (marker && direccion) {
    marker.setPopupContent(direccion);
    marker.openPopup();
  }

  onMount(async () => {
    const leafletModule = await import('leaflet');
    L = leafletModule.default ?? leafletModule;
    await import('leaflet/dist/leaflet.css');

    const [la, ln] = currentCoords();
    lat = la;
    lng = ln;

    map = L.map(container).setView([la, ln], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const icon = L.divIcon({
      className: 'leaflet-custom-marker',
      html: '<div class="pin"><div class="pin-circle"></div></div>',
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });

    marker = L.marker([la, ln], { draggable: true, icon }).addTo(map);
    marker.bindPopup(direccion || 'Ubicación seleccionada', { closeButton: true, maxWidth: 280 });

    map.on('click', (event) => {
      updatePosition(event.latlng.lat, event.latlng.lng);
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      updatePosition(pos.lat, pos.lng);
    });
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<style>
  :global(.leaflet-custom-marker) {
    background: none !important;
    border: none !important;
  }
  :global(.leaflet-custom-marker .pin) {
    width: 0;
    height: 0;
    border-left: 14px solid transparent;
    border-right: 14px solid transparent;
    border-bottom: 36px solid #2563eb;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    position: relative;
  }
  :global(.leaflet-custom-marker .pin-circle) {
    position: absolute;
    left: -12px;
    top: 22px;
    width: 24px;
    height: 24px;
    background: #2563eb;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  }
</style>

<div bind:this={container} class="w-full h-full"></div>

