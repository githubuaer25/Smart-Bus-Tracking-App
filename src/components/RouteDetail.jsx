// =============================================
// ROUTE DETAIL PAGE
// =============================================
// Shows full route info + live map for a selected route.
// Listens to Firebase Realtime DB for live bus location.
// busLocation updates automatically when driver shares location.
// =============================================

import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "../firebase"
import MapView from "./MapView"

function RouteDetail({ route, onBack }) {
    // Live bus location from Firebase
    const [busLocation, setBusLocation] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)

    useEffect(() => {
        // Listen to live_locations/{routeId} in Firebase Realtime DB
        const locationRef = ref(db, `live_locations/${route.id}`)

        // onValue fires every time the data changes (real-time)
        const unsubscribe = onValue(locationRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                setBusLocation({ lat: data.lat, lng: data.lng })
                setLastUpdated(new Date(data.timestamp).toLocaleTimeString())
            }
        })

        // Cleanup listener when component unmounts
        return () => unsubscribe()
    }, [route.id])

    return (
        <div className="route-detail">
            {/* Back button */}
            <button className="back-btn" onClick={onBack}>
                ← Back to Routes
            </button>

            {/* Route header */}
            <div className="route-detail-header">
                <h2>{route.name}</h2>
                <p className="route-detail-source">📍 Source: {route.source}</p>
            </div>

            {/* Live status badge */}
            <div className="live-status">
                {busLocation ? (
                    <span className="live-badge">🟢 Bus is Live</span>
                ) : (
                    <span className="offline-badge">🔴 Bus not sharing location</span>
                )}
                {lastUpdated && (
                    <span className="last-updated">Last updated: {lastUpdated}</span>
                )}
            </div>

            {/* Landmarks list in order */}
            <div className="landmarks-section">
                <h3>Route Stops</h3>
                <ol className="landmarks-list">
                    {route.landmarks.map((lm, i) => (
                        <li key={i} className="landmark-item">
                            <span className="landmark-dot">{i + 1}</span>
                            <span className="landmark-name">{lm.name}</span>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Live map */}
            <div className="map-section">
                <h3>Live Map</h3>
                <MapView landmarks={route.landmarks} busLocation={busLocation} />
            </div>
        </div>
    )
}

export default RouteDetail
