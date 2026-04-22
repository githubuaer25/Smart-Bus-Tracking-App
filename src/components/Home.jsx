// =============================================
// HOME PAGE (User/Student/Parent view)
// =============================================
// Shows all route cards.
// Clicking a card opens the RouteDetail page.
// =============================================

import { useState } from "react"
import routes from "../data/routes"
import RouteCard from "./RouteCard"
import RouteDetail from "./RouteDetail"

function Home() {
    // selectedRoute is null = show home, otherwise show route detail
    const [selectedRoute, setSelectedRoute] = useState(null)

    // If a route is selected, show its detail page
    if (selectedRoute) {
        return (
            <RouteDetail
                route={selectedRoute}
                onBack={() => setSelectedRoute(null)} // back button
            />
        )
    }

    // Otherwise show the home page with route cards
    return (
        <div className="home-page">
            <div className="home-header">
                <h2>Available Routes</h2>
                <p>Select a route to track the bus live</p>
            </div>

            {/* Grid of route cards */}
            <div className="routes-grid">
                {routes.map((route) => (
                    <RouteCard
                        key={route.id}
                        route={route}
                        onClick={setSelectedRoute}
                    />
                ))}
            </div>
        </div>
    )
}

export default Home
