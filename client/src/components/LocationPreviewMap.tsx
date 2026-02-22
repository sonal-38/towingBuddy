import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

(L.Icon.Default as unknown as { mergeOptions: (opts: Record<string, string>) => void }).mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Create custom red marker icon for destination
const redDivIcon = L.divIcon({
  html: `<span style="display:inline-block;width:18px;height:18px;background:#ff3b30;border-radius:50%;box-shadow:0 0 6px rgba(255,59,48,0.6);border:2px solid white;"></span>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

type LocationPreviewMapProps = {
  fromLat?: number;
  fromLon?: number;
  toLat?: number;
  toLon?: number;
  fromLabel?: string;
  toLabel?: string;
};

export default function LocationPreviewMap({
  fromLat,
  fromLon,
  toLat,
  toLon,
  fromLabel = 'Towed From',
  toLabel = 'Towed To',
}: LocationPreviewMapProps) {
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default: India center
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    // Calculate center and zoom based on available coordinates
    if (fromLat && fromLon && toLat && toLon) {
      // Both locations available - center between them
      const centerLat = (fromLat + toLat) / 2;
      const centerLon = (fromLon + toLon) / 2;
      setCenter([centerLat, centerLon]);
      setZoom(12);
    } else if (fromLat && fromLon) {
      setCenter([fromLat, fromLon]);
      setZoom(14);
    } else if (toLat && toLon) {
      setCenter([toLat, toLon]);
      setZoom(14);
    }
  }, [fromLat, fromLon, toLat, toLon]);

  const hasFromLocation = fromLat !== undefined && fromLon !== undefined;
  const hasToLocation = toLat !== undefined && toLon !== undefined;
  const hasBothLocations = hasFromLocation && hasToLocation;

  if (!hasFromLocation && !hasToLocation) {
    return (
      <div className="w-full h-[300px] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
        <div className="text-center">
          <p className="text-muted-foreground">Select locations to see map preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border-2 border-border shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        key={`${center[0]}-${center[1]}-${zoom}`} // Force re-render on center change
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {hasFromLocation && (
          <Marker position={[fromLat!, fromLon!]}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{fromLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {fromLat!.toFixed(6)}, {fromLon!.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {hasToLocation && (
          <Marker position={[toLat!, toLon!]} icon={redDivIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{toLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {toLat!.toFixed(6)}, {toLon!.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {hasBothLocations && (
          <Polyline
            positions={[
              [fromLat!, fromLon!],
              [toLat!, toLon!],
            ]}
            pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.7 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
