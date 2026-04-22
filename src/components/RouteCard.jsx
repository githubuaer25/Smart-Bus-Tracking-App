// =============================================
// ROUTE CARD COMPONENT
// =============================================
// Displays a single route as a card on the home page.
// onClick is called when user clicks the card.
// =============================================

function RouteCard({ route, onClick }) {
    return (
        <div className="route-card" onClick={() => onClick(route)}>
            {/* Bus icon and route name */}
            <div className="route-card-header">
                <span className="route-bus-icon">🚌</span>
                <h3>{route.name}</h3>
            </div>

            {/* Source info */}
            <p className="route-source">
                <span>📍</span> Source: {route.source}
            </p>

            {/* Number of stops */}
            <p className="route-stops">
                <span>🛑</span> {route.landmarks.length} Stops
            </p>

            {/* Landmarks preview (first 3) */}
            <div className="route-landmarks-preview">
                {route.landmarks.slice(0, 3).map((lm, i) => (
                    <span key={i} className="landmark-chip">{lm.name}</span>
                ))}
                {route.landmarks.length > 3 && (
                    <span className="landmark-chip more">+{route.landmarks.length - 3} more</span>
                )}
            </div>

            <button className="track-btn">Track Live →</button>
        </div>
    )
}

export default RouteCard
