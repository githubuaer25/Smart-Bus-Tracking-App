// =============================================
// DRIVER DASHBOARD
// =============================================
// Driver selects a route, then clicks "Start Sharing Location".
// Every 5 seconds, device GPS location is sent to Firebase.
// Driver clicks "Stop Sharing Location" to stop.
// =============================================

import { useState, useRef } from "react"
import { ref, set } from "firebase/database"
import { db } from "../firebase"
import routes from "../data/routes"

function DriverDashboard() {
    const [selectedRoute, setSelectedRoute] = useState(routes[0])
    const [isSharing, setIsSharing] = useState(false)
    const [statusMsg, setStatusMsg] = useState("")
    const intervalRef = useRef(null)

    // useRef to hold the current route for use inside setInterval.
    // If we used selectedRoute directly inside sendLocation, the interval
    // would capture a stale (old) value due to JavaScript closures.
    const selectedRouteRef = useRef(selectedRoute)

    // Keep the ref in sync whenever the dropdown changes
    const handleRouteChange = (e) => {
        const r = routes.find((r) => r.id === e.target.value)
        setSelectedRoute(r)
        selectedRouteRef.current = r // update ref too
    }

    const startSharing = () => {
        if (!navigator.geolocation) {
            setStatusMsg("❌ Geolocation is not supported by your browser.")
            return
        }
        setIsSharing(true)
        setStatusMsg("📡 Sharing location...")
        sendLocation()
        intervalRef.current = setInterval(sendLocation, 5000)
    }

    // Reads route from selectedRouteRef (not state) to avoid stale closure
    const sendLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                const route = selectedRouteRef.current // always the latest route

                set(ref(db, `live_locations/${route.id}`), {
                    lat: latitude,
                    lng: longitude,
                    timestamp: Date.now(),
                    routeId: route.id,
                })

                setStatusMsg(`✅ Location sent at ${new Date().toLocaleTimeString()}`)
            },
            (error) => {
                setStatusMsg(`❌ Error getting location: ${error.message}`)
            }
        )
    }

    const stopSharing = () => {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setIsSharing(false)
        setStatusMsg("🛑 Location sharing stopped.")
    }

    return (
        <div className="driver-dashboard">
            <h2>🚌 Driver Dashboard</h2>
            <p className="driver-subtitle">Share your live location with passengers</p>

            {/* Route selector */}
            <div className="driver-section">
                <label className="driver-label">Select Your Route:</label>
                <select
                    className="route-select"
                    value={selectedRoute.id}
                    onChange={handleRouteChange}
                    disabled={isSharing}
                >
                    {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selected route info */}
            <div className="driver-route-info">
                <p>📍 Source: {selectedRoute.source}</p>
                <p>🛑 Stops: {selectedRoute.landmarks.length}</p>
                <ol className="driver-landmarks">
                    {selectedRoute.landmarks.map((lm, i) => (
                        <li key={i}>{lm.name}</li>
                    ))}
                </ol>
            </div>

            {/* Start / Stop buttons */}
            <div className="driver-buttons">
                {!isSharing ? (
                    <button className="start-btn" onClick={startSharing}>
                        📡 Start Sharing Location
                    </button>
                ) : (
                    <button className="stop-btn" onClick={stopSharing}>
                        🛑 Stop Sharing Location
                    </button>
                )}
            </div>

            {/* Status message */}
            {statusMsg && <p className="driver-status">{statusMsg}</p>}
        </div>
    )
}

export default DriverDashboard
