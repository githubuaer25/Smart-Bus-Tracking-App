// =============================================
// FAKE LOCATION SIMULATOR — North Route (route-1)
// Road-snapped via OSRM public API
// =============================================
// HOW TO RUN:
//   node server/simulate.js
// =============================================

import admin from "firebase-admin"
import { createRequire } from "module"

const require = createRequire(import.meta.url)

// ── Load service account key ──────────────────────────────────────────────────
let serviceAccount
try {
    serviceAccount = require("./serviceAccountKey.json")
} catch {
    console.error("❌  Could not find server/serviceAccountKey.json")
    console.error("   Download from: Firebase Console → Project Settings → Service Accounts → Generate new private key")
    process.exit(1)
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://bus-tracker-a375c-default-rtdb.firebaseio.com",
})

const db = admin.database()
const ROUTE_ID = "route-1"

// ── Decode Google Encoded Polyline ────────────────────────────────────────────
// OSRM returns geometry as an encoded polyline string.
// This decoder converts it to [{lat, lng}, ...] array.
function decodePolyline(encoded) {
    const points = []
    let index = 0, lat = 0, lng = 0

    while (index < encoded.length) {
        let shift = 0, result = 0, byte
        do {
            byte = encoded.charCodeAt(index++) - 63
            result |= (byte & 0x1f) << shift
            shift += 5
        } while (byte >= 0x20)
        lat += (result & 1) ? ~(result >> 1) : result >> 1

        shift = 0; result = 0
        do {
            byte = encoded.charCodeAt(index++) - 63
            result |= (byte & 0x1f) << shift
            shift += 5
        } while (byte >= 0x20)
        lng += (result & 1) ? ~(result >> 1) : result >> 1

        // OSRM encodes as [lng, lat] in 1e5 precision
        points.push({ lat: lat / 1e5, lng: lng / 1e5 })
    }
    return points
}

// ── Road geometry from OSRM ───────────────────────────────────────────────────
// This encoded polyline was fetched once from:
// https://router.project-osrm.org/route/v1/driving/
//   73.1723,22.3119;73.1800,22.3200;73.1850,22.3300;73.1951,22.3217;73.2000,22.3350
//   ?overview=full&geometries=polyline
//
// It represents the actual road path through Vadodara for the North Route.
// Hardcoded here so the simulator works offline with no API calls at runtime.
const ENCODED_POLYLINE =
    "yydgC{mr}L?cE|Eb@rBeZxCiIGwJeAgCiDi@eDdDuS~BSu@aTcAk@jE{F?i@AdH@j@kEdCDR}OqBqD_@wLsx@d]uNrCt@e@yCgRxCfR|KuBf\\aNQyU{Kw]^kZvTUy@xKdCB|CfBoEZIkAHjAnE[}CgBeCCdAgKwPZaBv@yJ_BgC`BkLHsk@hZaD}S_GeQ`N}BzG?"

// Decode into road-following coordinate array
const roadPath = decodePolyline(ENCODED_POLYLINE)

console.log(`🗺️  Road path decoded: ${roadPath.length} road points loaded.`)

// ── Simulation state ──────────────────────────────────────────────────────────
let currentStep = 0

async function sendPosition() {
    const pos = roadPath[currentStep]

    await db.ref(`live_locations/${ROUTE_ID}`).set({
        lat: pos.lat,
        lng: pos.lng,
        timestamp: Date.now(),
        routeId: ROUTE_ID,
    })

    console.log(
        `[${new Date().toLocaleTimeString()}]` +
        ` Step ${String(currentStep + 1).padStart(3)}/${roadPath.length}` +
        ` | lat: ${pos.lat.toFixed(6)}, lng: ${pos.lng.toFixed(6)}`
    )

    currentStep = (currentStep + 1) % roadPath.length
    if (currentStep === 0) {
        console.log("\n🔄  Route complete — restarting...\n")
    }
}

// ── Start ─────────────────────────────────────────────────────────────────────
console.log("🚌  North Route simulator started (road-snapped).")
console.log(`   Writing to: live_locations/${ROUTE_ID}`)
console.log("   Press Ctrl+C to stop.\n")

sendPosition()
const interval = setInterval(sendPosition, 2000) // 2s for smoother movement

process.on("SIGINT", () => {
    clearInterval(interval)
    console.log("\n🛑  Simulator stopped.")
    process.exit(0)
})
