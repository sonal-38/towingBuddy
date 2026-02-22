import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from './ui/button'
import { MapPin, Navigation, LocateFixed } from 'lucide-react'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

(L.Icon.Default as unknown as { mergeOptions: (opts: Record<string, string>) => void }).mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

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
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userLocationError, setUserLocationError] = useState<string | null>(null)

  const isValidCoords = (coords?: { lat: number; lon: number }) => {
    if (!coords) return false
    return (
      Number.isFinite(coords.lat) &&
      Number.isFinite(coords.lon) &&
      coords.lat >= -90 &&
      coords.lat <= 90 &&
      coords.lon >= -180 &&
      coords.lon <= 180
    )
  }

  useEffect(() => {
    let isActive = true

    const resolveTowedToLocation = async () => {
      setLocationError(null)

      if (isValidCoords(towedToCoords)) {
        setResolvedCoords(towedToCoords!)
        return
      }

      if (!towedToAddress || !towedToAddress.trim()) {
        setResolvedCoords(null)
        setLocationError('Towed-to location is not available.')
        return
      }

      try {
        setIsResolving(true)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(towedToAddress)}`
        const response = await fetch(url)
        const data = await response.json()

        if (!isActive) return

        const first = Array.isArray(data) && data.length > 0 ? data[0] : null
        const lat = first ? parseFloat(first.lat) : NaN
        const lon = first ? parseFloat(first.lon) : NaN

        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          setResolvedCoords({ lat, lon })
        } else {
          setResolvedCoords(null)
          setLocationError('Location not found for this towing record.')
        }
      } catch {
        if (!isActive) return
        setResolvedCoords(null)
        setLocationError('Unable to load location map right now.')
      } finally {
        if (isActive) {
          setIsResolving(false)
        }
      }
    }

    resolveTowedToLocation()

    return () => {
      isActive = false
    }
  }, [towedToAddress, towedToCoords])

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocationError('Live location is not supported on this device/browser.')
      return
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setUserLocationError(null)
      },
      () => {
        setUserLocationError('Unable to access your live location.')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 10000,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watcher)
    }
  }, [])

  const mapCenter = useMemo<[number, number] | null>(() => {
    if (resolvedCoords) return [resolvedCoords.lat, resolvedCoords.lon]
    if (userLocation) return [userLocation.lat, userLocation.lon]
    return null
  }, [resolvedCoords, userLocation])

  const openInGoogleDirections = () => {
    if (!resolvedCoords) return
    const destination = `${resolvedCoords.lat},${resolvedCoords.lon}`
    const origin = userLocation ? `${userLocation.lat},${userLocation.lon}` : ''
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`
    window.open(url, '_blank')
  }

  const openInOpenStreetMap = () => {
    if (!resolvedCoords) return
    const url = `https://www.openstreetmap.org/?mlat=${resolvedCoords.lat}&mlon=${resolvedCoords.lon}#map=16/${resolvedCoords.lat}/${resolvedCoords.lon}`
    window.open(url, '_blank')
  }

  const googleEmbedUrl = useMemo(() => {
    if (!resolvedCoords) return null
    return `https://maps.google.com/maps?q=${resolvedCoords.lat},${resolvedCoords.lon}&z=15&output=embed`
  }, [resolvedCoords])

  return (
    <div className="space-y-4">
      {/* Towed To Location Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Depot Location (Towed To)</h3>
            <p className="text-sm text-blue-800 mt-2">{towedToAddress}</p>
            {resolvedCoords && (
              <p className="text-xs text-blue-700 mt-1">
                📍 {resolvedCoords.lat.toFixed(4)}, {resolvedCoords.lon.toFixed(4)}
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

      {userLocationError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">{userLocationError}</p>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: '320px' }}>
        {googleEmbedUrl ? (
          <iframe
            title="Google Map - Towed To Location"
            src={googleEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">📍 {locationError || 'Google map unavailable: location not found.'}</span>
          </div>
        )}
      </div>

      {/* Map Visualization */}
      <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: '400px' }}>
        {isResolving ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">Loading location map...</span>
          </div>
        ) : mapCenter ? (
          <div className="w-full h-full">
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              key={`${mapCenter[0]}-${mapCenter[1]}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={mapCenter}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">Towed To</p>
                    <p className="text-xs text-muted-foreground">{towedToAddress}</p>
                  </div>
                </Popup>
              </Marker>
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lon]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Your Live Location</p>
                      <p className="text-xs text-muted-foreground">Updated from device GPS</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">📍 {locationError || 'Location not found.'}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={openInGoogleDirections}
          disabled={!resolvedCoords}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <LocateFixed className="w-4 h-4" />
          Get Directions (Google Maps)
        </Button>
        <Button
          onClick={openInOpenStreetMap}
          disabled={!resolvedCoords}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Navigation className="w-4 h-4" />
          Open in OpenStreetMap
        </Button>
      </div>

      {/* Info Message */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm text-amber-800">
          ℹ️ Google and OpenStreetMap views are shown. If location cannot be resolved, a clear message is displayed.
        </p>
      </div>
    </div>
  )
}
