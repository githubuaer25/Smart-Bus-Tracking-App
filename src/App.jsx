// =============================================
// MAIN APP COMPONENT
// =============================================
// Controls which page is shown based on login state and role.
// Flow:
//   Not logged in → Login page
//   Logged in as driver → Driver Dashboard
//   Logged in as user → Home (route cards)
// =============================================

import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import Login from "./components/Login"
import NavBar from "./components/NavBar"
import Home from "./components/Home"
import DriverDashboard from "./components/DriverDashboard"

function App() {
  // null = still checking auth, { role } = logged in, "guest" = not logged in
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // onAuthStateChanged fires once on load with the persisted session (if any),
    // then again whenever the user logs in or out.
    // This is what keeps the user logged in after a page refresh.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is still logged in — restore role from localStorage
        const savedRole = localStorage.getItem("userRole") || "user"
        setUser({ role: savedRole })
      } else {
        // No session found — show login
        setUser(null)
      }
      // Auth check is done, safe to render now
      setAuthChecked(true)
    })

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [])

  // Called by Login component after successful Firebase auth
  const handleLogin = (role) => {
    // Save role to localStorage so it survives page refresh
    localStorage.setItem("userRole", role)
    setUser({ role })
  }

  // Called by NavBar logout button
  const handleLogout = () => {
    localStorage.removeItem("userRole")
    setUser(null)
  }

  // Don't render anything until Firebase has checked the session.
  // Prevents a flash of the login page on refresh.
  if (!authChecked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: "18px", color: "#1e3a8a" }}>
        Loading...
      </div>
    )
  }

  // Not logged in → show login page
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // Logged in → show navbar + correct dashboard
  return (
    <div className="app-container">
      <NavBar onLogout={handleLogout} />

      <div className="page-content">
        {user.role === "driver" ? (
          // Driver sees the driver dashboard
          <DriverDashboard />
        ) : (
          // Student/Parent/Staff sees route cards
          <Home />
        )}
      </div>
    </div>
  )
}

export default App
