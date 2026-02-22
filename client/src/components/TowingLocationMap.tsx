import { Button } from './ui/button'
import { MapPin, Navigation } from 'lucide-react'

interface TowingLocationMapProps {
  towedFromAddress?: string
  towedToAddress: string
  towedFromCoords?: { lat: number; lon: number }
  towedToCoords?: { lat: number; lon: number }
  vehicleNumber?: string
  createdAt?: string
}

export default function TowingLocationMap({
  towedToAddress,
  towedToCoords,
  vehicleNumber,
}: TowingLocationMapProps) {
  // Open Google Maps with directions
  const openDirections = () => {
    if (!towedToCoords) {
      alert('Location coordinates not available')
      return
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${towedToCoords.lat},${towedToCoords.lon}&travelmode=driving`
    window.open(mapsUrl, '_blank')
  }

  // Open location on Google Maps
  const openLocationOnGoogleMaps = () => {
    if (!towedToCoords) {
      alert('Location coordinates not available')
      return
    }

    const mapsUrl = `https://www.google.com/maps/search/${towedToCoords.lat},${towedToCoords.lon}`
    window.open(mapsUrl, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Towed To Location Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Depot Location (Towed To)</h3>
            <p className="text-sm text-blue-800 mt-2">{towedToAddress}</p>
            {towedToCoords && (
              <p className="text-xs text-blue-700 mt-1">
                📍 {towedToCoords.lat.toFixed(4)}, {towedToCoords.lon.toFixed(4)}
              </p>
            )}
            {vehicleNumber && (
              <p className="text-xs text-blue-700 mt-1">
                🚗 Vehicle: <strong>{vehicleNumber}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: '400px' }}>
        {towedToCoords ? (
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Fallback map view - Google Maps Static Map */}
            <iframe
              title="Depot Location Map"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyC5ZN0jRJ9HzYwGPqDsPw_fzPXVL2g_eEY&q=${towedToCoords.lat},${towedToCoords.lon}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">📍 Location coordinates not available</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={openDirections}
          disabled={!towedToCoords}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Navigation className="w-4 h-4" />
          Get Directions in Google Maps
        </Button>
        <Button
          variant="outline"
          onClick={openLocationOnGoogleMaps}
          disabled={!towedToCoords}
        >
          📍 View on Google Maps
        </Button>
      </div>

      {/* Info Message */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm text-amber-800">
          ℹ️ Click the buttons above to view the depot location on Google Maps and get turn-by-turn directions.
        </p>
      </div>
    </div>
  )
}
