<script>
  import { onDestroy, onMount } from 'svelte';

  export let lat;
  export let lng;
  export let zoom = 13;

  let container;
  let map;
  let marker;
  let L;

  const DEFAULT_LAT = 28.6353; // Chihuahua aprox.
  const DEFAULT_LNG = -106.0889;

  function currentCoords() {
    const la = typeof lat === 'number' ? lat : DEFAULT_LAT;
    const ln = typeof lng === 'number' ? lng : DEFAULT_LNG;
    return [la, ln];
  }

  $: if (map && marker && typeof lat === 'number' && typeof lng === 'number') {
    const pos = L.latLng(lat, lng);
    marker.setLatLng(pos);
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
      lat = event.latlng.lat;
      lng = event.latlng.lng;
      marker.setLatLng([lat, lng]);
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      lat = pos.lat;
      lng = pos.lng;
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

