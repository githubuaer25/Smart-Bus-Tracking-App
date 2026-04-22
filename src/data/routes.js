// =============================================
// STATIC ROUTE DATA
// =============================================
// This is dummy data for demo purposes.
// In a real app, this would come from Firestore.
// Each route has: id, name, source, landmarks (in order)
// Each landmark has a name and lat/lng coordinates
// =============================================

const routes = [
    {
        id: "route-1",
        name: "Route 1 - North Campus",
        source: "College Main Gate",
        totalStops: 4,
        // Road-snapped coordinates (verified via OSRM routing API)
        landmarks: [
            { name: "College Main Gate (Start)", lat: 22.312131, lng: 73.1723 },
            { name: "Location A - Alkapuri", lat: 22.32, lng: 73.179992 },
            { name: "Location B - Fatehgunj", lat: 22.33071, lng: 73.184481 },
            { name: "Location C - Sayajigunj", lat: 22.32162, lng: 73.195111 },
            { name: "Location D - Final Stop", lat: 22.335084, lng: 73.199413 },
        ]
    },
    {
        id: "route-2",
        name: "Route 2 - South Campus",
        source: "College Main Gate",
        totalStops: 4,
        landmarks: [
            { name: "College Main Gate (Start)", lat: 22.3119, lng: 73.1723 },
            { name: "Location A - Manjalpur", lat: 22.2725, lng: 73.1958 },
            { name: "Location B - Vasna", lat: 22.2900, lng: 73.1600 },
            { name: "Location C - Gotri", lat: 22.2998, lng: 73.1279 },
            { name: "Location D - Final Stop", lat: 22.2600, lng: 73.1400 },
        ]
    },
    {
        id: "route-3",
        name: "Route 3 - East Campus",
        source: "College Main Gate",
        totalStops: 4,
        landmarks: [
            { name: "College Main Gate (Start)", lat: 22.3119, lng: 73.1723 },
            { name: "Location A - Waghodia Road", lat: 22.3050, lng: 73.2100 },
            { name: "Location B - Harni", lat: 22.3150, lng: 73.2300 },
            { name: "Location C - Sama", lat: 22.3250, lng: 73.2200 },
            { name: "Location D - Final Stop", lat: 22.3300, lng: 73.2400 },
        ]
    }
]

export default routes
