import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon paths for bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// We'll include a red marker variant by tinting a copy at runtime via CSS filter fallback.
(L.Icon.Default as unknown as { mergeOptions: (opts: Record<string, string>) => void }).mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Create a visible red DivIcon for the 'Towed To' marker (simple red circle)
const redDivIcon = L.divIcon({
  html: `<span style="display:inline-block;width:18px;height:18px;background:#ff3b30;border-radius:50%;box-shadow:0 0 6px rgba(255,59,48,0.6);border:2px solid white;"></span>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

type LatLng = { lat: number; lon: number };

async function geocode(address: string): Promise<LatLng | null> {
  if (!address) return null;
  try {
    const key = 'geocode_v1';
    const raw = sessionStorage.getItem(key);
    const cache = raw ? JSON.parse(raw) as Record<string, LatLng> : {};
    if (cache[address]) return cache[address];
    // Build Nominatim URL; include optional email from Vite env (helps identify your app to the service)
    const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
    const email = env?.VITE_NOMINATIM_EMAIL || env?.VITE_API_EMAIL || '';
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    if (email) url += `&email=${encodeURIComponent(email)}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      console.error('Nominatim non-OK response', resp.status, resp.statusText, txt, { url });
      return null;
    }
    let data: unknown;
    try {
      data = await resp.json();
    } catch (e) {
      const txt = await resp.text().catch(() => '');
      console.error('Failed to parse Nominatim response as JSON', e, txt, { url });
      return null;
    }
    if (!Array.isArray(data) || data.length === 0) {
      console.debug('Nominatim returned empty array for address', address, { url, data });
      return null;
    }
  type NomItem = { lat: string; lon: string };
  const first: NomItem = (data as NomItem[])[0];
  const lat = parseFloat(first.lat);
  const lon = parseFloat(first.lon);
    cache[address] = { lat, lon };
    // keep cache small
    const keys = Object.keys(cache);
    if (keys.length > 200) {
      const keep = keys.slice(-180);
      const newC: Record<string, LatLng> = {};
      for (const k of keep) newC[k] = cache[k];
      sessionStorage.setItem(key, JSON.stringify(newC));
    } else {
      sessionStorage.setItem(key, JSON.stringify(cache));
    }
    return { lat, lon };
  } catch (err) {
    console.error('geocode error', err);
    return null;
  }
}

function useFitBounds(coords: Array<[number, number]>) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (!coords || coords.length === 0) return;
    try {
      const latlngs = coords.map(c => L.latLng(c[0], c[1]));
      if (latlngs.length === 1) {
        map.setView(latlngs[0], 14);
      } else {
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (e) {
      console.error(e);
    }
  }, [map, coords]);
  return null;
}

// Function to request user's current location
async function requestUserLocation(): Promise<[number, number] | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Got user location:', latitude, longitude);
        resolve([latitude, longitude]);
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0, // Don't use cached position
      }
    );
  });
}

export default function TowingLocationMap({ from, to, height = '360px', fromCoords, toCoords }: { from: string; to: string; height?: string; fromCoords?: LatLng | null; toCoords?: LatLng | null }) {
  const [fromCoord, setFromCoord] = useState<LatLng | null>(fromCoords || null);
  const [toCoord, setToCoord] = useState<LatLng | null>(toCoords || null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<Array<[number, number]>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<{ distance: number; duration: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      // Prefer coordinates provided from server/admin. If not present, geocode.
      const promises: Array<Promise<LatLng | null>> = [];
      if (fromCoords) {
        promises.push(Promise.resolve(fromCoords));
      } else {
        promises.push(geocode(from));
      }
      if (toCoords) {
        promises.push(Promise.resolve(toCoords));
      } else {
        promises.push(geocode(to));
      }

      const [f, t] = await Promise.all(promises);
      if (!mounted) return;
      setFromCoord(f);
      setToCoord(t);
      if (!f && !t) setError('Could not geocode addresses');
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [from, to, fromCoords, toCoords]);

  // Request user location on component mount (ask for permission)
  useEffect(() => {
    let mounted = true;
    let watcher: number | null = null;

    const setupGeolocation = async () => {
      if (!('geolocation' in navigator)) {
        if (mounted) setLocationError('Geolocation not supported in your browser');
        return;
      }

      try {
        // Try to get current position first
        const pos = await requestUserLocation();
        if (mounted && pos) {
          setUserPos(pos);
          setLocationError(null);
        }
      } catch (err) {
        console.error('Error getting location:', err);
      }

      // Then setup watcher for real-time updates
      watcher = navigator.geolocation.watchPosition(
        (p) => {
          if (mounted) {
            setUserPos([p.coords.latitude, p.coords.longitude]);
            setLocationError(null);
          }
        },
        (e) => {
          if (mounted) {
            console.warn('Geolocation watch error:', e);
            if (e.code === 1) {
              setLocationError('Location permission denied. Enable in browser settings.');
            } else if (e.code === 2) {
              setLocationError('Unable to get your location. Try again.');
            } else {
              setLocationError('Geolocation error. Check browser permissions.');
            }
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    };

    setupGeolocation();

    return () => {
      mounted = false;
      if (watcher !== null) navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  // fetch route from OSRM using coordinates (driving)
  useEffect(() => {
    // compute initial towing route (from -> to)
    let cancelled = false;
    async function fetchTowingRoute() {
      if (!fromCoord || !toCoord) return;
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${fromCoord.lon},${fromCoord.lat};${toCoord.lon},${toCoord.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const raw = data?.routes?.[0]?.geometry?.coordinates;
        if (raw) {
          const coords: Array<[number, number]> = raw.map((c: unknown) => {
            const arr = c as [number, number];
            return [arr[1], arr[0]];
          });
          setRoute(coords);
        }
      } catch (err) {
        console.error('route error', err);
      }
    }
    fetchTowingRoute();
    return () => { cancelled = true; };
  }, [fromCoord, toCoord]);

  // helper to fetch OSRM route between two lon/lat pairs
  async function fetchRouteBetween(lon1: number, lat1: number, lon2: number, lat2: number) {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const raw = data?.routes?.[0]?.geometry?.coordinates;
      if (!raw) return null;
      const coords: Array<[number, number]> = raw.map((c: unknown) => {
        const arr = c as [number, number];
        return [arr[1], arr[0]];
      });
      return coords;
    } catch (err) {
      console.error('fetchRouteBetween error', err);
      return null;
    }
  }

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading map...</div>;
  if (error) return <div className="p-4 text-sm text-muted-foreground">{error}</div>;
  const markers: Array<{ pos: [number, number]; label: string; color?: string }> = [];
  if (fromCoord) markers.push({ pos: [fromCoord.lat, fromCoord.lon], label: 'Towed From' });
  if (toCoord) markers.push({ pos: [toCoord.lat, toCoord.lon], label: 'Towed To', color: 'red' });
  if (userPos) markers.push({ pos: userPos, label: 'You', color: 'blue' });

  const bounds = markers.map(m => m.pos) as [number, number][];
  const center: [number, number] = markers.length > 0 ? markers[0].pos as [number, number] : [0, 0];

  const routeColor = '#ff3b30';

  return (
    <div className="w-full rounded-md overflow-hidden">
      <div style={{ height }} className="w-full">
        <MapContainer center={center} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          {markers.map((m, i) => (
            <Marker key={i} position={m.pos} icon={m.label === 'Towed To' ? redDivIcon : undefined}>
              <Popup>
                <div className="space-y-2">
                  <div className="font-medium">{m.label}</div>
                  <div>
                    <button
                      className="px-2 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
                      disabled={!userPos || !toCoord || isRouting}
                      onClick={async () => {
                        // reuse the same handler logic as the control below
                        if (!userPos || !toCoord) return;
                        setRouteError(null);
                        setRouteSummary(null);
                        setIsRouting(true);
                        try {
                          const [ulat, ulon] = userPos;
                          const coords = await fetchRouteBetween(ulon, ulat, toCoord.lon, toCoord.lat);
                          if (!coords) {
                            setRouteError('No route returned');
                          } else {
                            setRoute(coords);
                            // fetch summary via OSRM (distance/duration) - reuse fetchRouteBetween doesn't return summary
                            const url = `https://router.project-osrm.org/route/v1/driving/${ulon},${ulat};${toCoord.lon},${toCoord.lat}?overview=false&geometries=geojson`;
                            const res = await fetch(url);
                            if (res.ok) {
                              const data = await res.json().catch(() => null);
                              const raw = data?.routes?.[0];
                              if (raw) setRouteSummary({ distance: raw.distance, duration: raw.duration });
                            }
                          }
                        } catch (err) {
                          console.error(err);
                          setRouteError('Routing failed (see console)');
                        } finally {
                          setIsRouting(false);
                        }
                      }}
                    >
                      {isRouting ? 'Routing…' : 'Get directions from me'}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          {route.length > 0 && (
            <Polyline positions={route} pathOptions={{ color: routeColor, weight: 5 }} />
          )}
          <FitBounds coords={bounds} />
        </MapContainer>
      </div>

      {/* Controls and summary below the map */}
      <div className="p-3 space-y-3">
        {/* Location Status */}
        {locationError && (
          <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">{locationError}</p>
          </div>
        )}

        {userPos && (
          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Your Location:</strong> {userPos[0].toFixed(4)}°, {userPos[1].toFixed(4)}°
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            title="Get your current location"
            className="px-3 py-2 rounded bg-green-600 text-white shadow hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm"
            disabled={isGettingLocation}
            onClick={async () => {
              setIsGettingLocation(true);
              setLocationError(null);
              try {
                const pos = await requestUserLocation();
                if (pos) {
                  setUserPos(pos);
                  setLocationError(null);
                } else {
                  setLocationError('Could not get your location. Check permissions.');
                }
              } catch (err) {
                console.error('Error:', err);
                setLocationError('Failed to get location. Try again.');
              } finally {
                setIsGettingLocation(false);
              }
            }}
          >
            {isGettingLocation ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>📍</span>
            )}
            <span>{isGettingLocation ? 'Getting Location...' : 'My Location'}</span>
          </button>

          <button
            title="Get directions from my live location"
            className="px-3 py-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm"
            disabled={!userPos || !toCoord || isRouting}
            onClick={async () => {
              setRouteError(null);
              setRouteSummary(null);
              if (!userPos) return;
              const destLon = toCoord?.lon;
              const destLat = toCoord?.lat;
              if (!destLon || !destLat) {
                setRouteError('No towing destination available.');
                return;
              }
              setIsRouting(true);
              try {
                const [ulat, ulon] = userPos;
                const url = `https://router.project-osrm.org/route/v1/driving/${ulon},${ulat};${destLon},${destLat}?overview=full&geometries=geojson&steps=true`;
                const res = await fetch(url);
                if (!res.ok) {
                  const text = await res.text().catch(() => '');
                  setRouteError(`Routing request failed: ${res.status} ${res.statusText} ${text}`);
                  return;
                }
                const data = await res.json().catch((e) => {
                  setRouteError('Failed to parse routing response');
                  return null;
                });
                if (!data) return;
                const raw = data?.routes?.[0];
                if (!raw) {
                  setRouteError('No route returned from routing service');
                  return;
                }
                const coordsArr = raw.geometry?.coordinates;
                if (!coordsArr || !Array.isArray(coordsArr) || coordsArr.length === 0) {
                  setRouteError('Routing service returned empty geometry');
                  return;
                }
                const coords: Array<[number, number]> = coordsArr.map((c: unknown) => {
                  const arr = c as [number, number];
                  return [arr[1], arr[0]];
                });
                setRoute(coords);
                setRouteSummary({ distance: raw.distance, duration: raw.duration });
              } catch (err) {
                console.error('Routing error', err);
                setRouteError('Routing request failed (see console)');
              } finally {
                setIsRouting(false);
              }
            }}
          >
            {isRouting ? <span className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            <span>🛣️ Directions</span>
          </button>
        </div>

  <div className="flex-1">
          <div className="text-sm">
            <div className="font-medium">Towed To</div>
            <div className="text-muted-foreground">
              <button
                className="text-left text-sm text-blue-600 hover:underline"
                disabled={!userPos || !toCoord || isRouting}
                onClick={async () => {
                  setRouteError(null);
                  setRouteSummary(null);
                  if (!userPos || !toCoord) return;
                  setIsRouting(true);
                  try {
                    const [ulat, ulon] = userPos;
                    const coords = await fetchRouteBetween(ulon, ulat, toCoord.lon, toCoord.lat);
                    if (!coords) {
                      setRouteError('No route returned');
                    } else {
                      setRoute(coords);
                      const url = `https://router.project-osrm.org/route/v1/driving/${ulon},${ulat};${toCoord.lon},${toCoord.lat}?overview=false&geometries=geojson`;
                      const res = await fetch(url);
                      if (res.ok) {
                        const data = await res.json().catch(() => null);
                        const raw = data?.routes?.[0];
                        if (raw) setRouteSummary({ distance: raw.distance, duration: raw.duration });
                      }
                    }
                  } catch (err) {
                    console.error(err);
                    setRouteError('Routing failed (see console)');
                  } finally {
                    setIsRouting(false);
                  }
                }}
              >
                {toCoord ? 'Get directions to towing location' : 'Towing location not available'}
              </button>
            </div>
          </div>

          {routeSummary ? (
            <div className="text-sm text-muted-foreground mt-2">
              <div><strong>Distance:</strong> {(routeSummary.distance / 1000).toFixed(2)} km</div>
              <div><strong>ETA:</strong> {(routeSummary.duration / 60).toFixed(0)} min</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mt-2">Click the link above to get driving directions to the towing location.</div>
          )}
          {routeError ? (
            <div className="text-sm text-red-600 mt-2">{routeError}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (!coords || coords.length === 0) return;
    try {
      const latlngs = coords.map(c => L.latLng(c[0], c[1]));
      if (latlngs.length === 1) {
        map.setView(latlngs[0], 14);
      } else {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
      }
    } catch (e) {
      console.error(e);
    }
  }, [map, coords]);
  return null;
}
