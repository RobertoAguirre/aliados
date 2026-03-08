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

    marker = L.marker([la, ln], { draggable: true }).addTo(map);

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

<div bind:this={container} class="w-full h-full"></div>

