// =============================================
// MAP VIEW COMPONENT (Leaflet)
// =============================================
// Shows a Leaflet map with:
// - Landmark markers for all stops on the route
// - A live bus marker that updates from Firebase
// - A polyline connecting all landmarks
// =============================================

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix Leaflet's default icon path issue with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Custom red bus icon for live bus marker
const busIcon = L.divIcon({
  html: "🚌",
  className: "bus-marker-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

function MapView({ landmarks, busLocation }) {
  const mapRef = useRef(null)         // div element ref
  const mapInstance = useRef(null)    // Leaflet map instance
  const busMarkerRef = useRef(null)   // live bus marker

  // Initialize map once on mount
  useEffect(() => {
    if (mapInstance.current) return // already initialized

    // Center map on first landmark
    const center = landmarks[0]
      ? [landmarks[0].lat, landmarks[0].lng]
      : [22.3119, 73.1723]

    // Create Leaflet map
    mapInstance.current = L.map(mapRef.current).setView(center, 13)

    // Add OpenStreetMap tiles (free, no API key needed)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance.current)

    // Add landmark markers
    landmarks.forEach((lm, i) => {
      L.marker([lm.lat, lm.lng])
        .addTo(mapInstance.current)
        .bindPopup(`<b>Stop ${i + 1}</b><br/>${lm.name}`)
    })

    // Draw a polyline connecting all landmarks
    const latlngs = landmarks.map((lm) => [lm.lat, lm.lng])
    L.polyline(latlngs, { color: "#1e3a8a", weight: 3, dashArray: "6,6" })
      .addTo(mapInstance.current)

    // Add initial bus marker (if busLocation exists)
    if (busLocation) {
      busMarkerRef.current = L.marker([busLocation.lat, busLocation.lng], {
        icon: busIcon,
      })
        .addTo(mapInstance.current)
        .bindPopup("🚌 Bus is here!")
    }

    // Cleanup on unmount
    return () => {
      mapInstance.current.remove()
      mapInstance.current = null
    }
  }, []) // run only once

  // Update bus marker whenever busLocation changes (live tracking)
  useEffect(() => {
    if (!mapInstance.current || !busLocation) return

    if (!busMarkerRef.current) {
      // Create marker if it doesn't exist yet
      busMarkerRef.current = L.marker([busLocation.lat, busLocation.lng], {
        icon: busIcon,
      })
        .addTo(mapInstance.current)
        .bindPopup("🚌 Bus is here!")
    } else {
      // Move existing marker to new position
      busMarkerRef.current.setLatLng([busLocation.lat, busLocation.lng])
    }

    // Pan map to follow the bus
    mapInstance.current.panTo([busLocation.lat, busLocation.lng])
  }, [busLocation])

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "400px", borderRadius: "12px" }}
    />
  )
}

export default MapView
