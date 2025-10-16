import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for bundlers (Vite)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

(L.Icon.Default as any).mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type LatLng = { lat: number; lon: number };

async function geocodeAddress(address: string): Promise<LatLng | null> {
  if (!address) return null;
  try {
    const cacheKey = 'geocodeCache_v1';
    const raw = sessionStorage.getItem(cacheKey);
    const cache = raw ? JSON.parse(raw) as Record<string, LatLng> : {};
    if (cache[address]) return cache[address];

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    const entry = { lat: parseFloat(first.lat), lon: parseFloat(first.lon) };
    cache[address] = entry;
    // keep cache small
    const keys = Object.keys(cache);
    if (keys.length > 200) {
      // drop oldest (not tracking order) - simple strategy: keep most recent 180
      const sliced = keys.slice(-180);
      const newCache: Record<string, LatLng> = {};
      for (const k of sliced) newCache[k] = cache[k];
      sessionStorage.setItem(cacheKey, JSON.stringify(newCache));
    } else {
      sessionStorage.setItem(cacheKey, JSON.stringify(cache));
    }
    return entry;
  } catch (err) {
    console.error('Geocode error', err);
    return null;
  }
}

export default function TowingLocationMap({ from, to, height = '360px' }: { from: string; to: string; height?: string }) {
  const [fromCoord, setFromCoord] = useState<LatLng | null>(null);
  const [toCoord, setToCoord] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [f, t] = await Promise.all([geocodeAddress(from), geocodeAddress(to)]);
        if (!mounted) return;
        setFromCoord(f);
        setToCoord(t);
        if (!f && !t) setError('Could not geocode addresses');
      } catch (err) {
        console.error(err);
        if (mounted) setError('Failed to load map data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [from, to]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-sm text-muted-foreground">Loading map…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-muted-foreground">{error}. Showing textual addresses instead.</div>
    );
  }

  // Determine bounds and center
  const markers: Array<{ pos: [number, number]; label: string }> = [];
  if (fromCoord) markers.push({ pos: [fromCoord.lat, fromCoord.lon], label: 'Towed From' });
  if (toCoord) markers.push({ pos: [toCoord.lat, toCoord.lon], label: 'Towed To' });

  if (markers.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No location coordinates available.</div>;
  }

  const bounds = markers.map(m => m.pos as [number, number]) as [number, number][];

  // Center on first marker if only one
  const center: [number, number] = markers.length === 1 ? markers[0].pos : [(markers[0].pos[0] + markers[1].pos[0]) / 2, (markers[0].pos[1] + markers[1].pos[1]) / 2];

  return (
    <div style={{ height }} className="w-full rounded-md overflow-hidden">
      <MapContainer center={center} bounds={bounds} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker key={i} position={m.pos}>
            <Popup>{m.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
