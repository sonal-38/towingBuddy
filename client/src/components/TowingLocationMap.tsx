import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface TowingLocationMapProps {
  towedTo: string;
  towedFrom?: string;
  vehicleNumber?: string;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom red marker for towing location
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map center when coordinates change
const MapUpdater: React.FC<{ coordinates: [number, number] }> = ({ coordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(coordinates, 15);
  }, [coordinates, map]);
  
  return null;
};

const TowingLocationMap: React.FC<TowingLocationMapProps> = ({ 
  towedTo, 
  towedFrom, 
  vehicleNumber 
}) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default coordinates (Mumbai, India)
  const defaultCoords: [number, number] = [19.0760, 72.8777];

  useEffect(() => {
    geocodeLocation(towedTo);
  }, [towedTo]);

  const geocodeLocation = async (address: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use Nominatim (OpenStreetMap's free geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const coords: [number, number] = [lat, lng];
        
        setCoordinates(coords);
      } else {
        // Fallback to default coordinates if geocoding fails
        setCoordinates(defaultCoords);
        setError('Exact location not found, showing approximate area');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setCoordinates(defaultCoords);
      setError('Unable to locate the address, showing approximate area');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (coordinates) {
      const [lat, lng] = coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  const openInOpenStreetMap = () => {
    if (coordinates) {
      const [lat, lng] = coordinates;
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Vehicle Location Map
        </CardTitle>
        <CardDescription>
          {towedFrom && `Towed from: ${towedFrom}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">⚠️ {error}</p>
          </div>
        )}

        {!loading && coordinates && (
          <>
            <div className="w-full h-64 rounded-lg border overflow-hidden">
              <MapContainer
                center={coordinates}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coordinates} icon={redIcon}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-sm">Vehicle Location</h3>
                      <p className="text-xs text-gray-600">{vehicleNumber || 'Vehicle'}</p>
                      <p className="text-xs mt-1">{towedTo}</p>
                    </div>
                  </Popup>
                </Marker>
                <MapUpdater coordinates={coordinates} />
              </MapContainer>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={openInMaps}
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
              <Button 
                onClick={openInOpenStreetMap}
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in OSM
              </Button>
            </div>
          </>
        )}

        <div className="text-xs text-muted-foreground">
          <p>📍 <strong>Current Location:</strong> {towedTo}</p>
          {coordinates && (
            <p>🗺️ <strong>Coordinates:</strong> {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TowingLocationMap;
