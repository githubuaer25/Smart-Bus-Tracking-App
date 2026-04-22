// =============================================
// NAVBAR COMPONENT
// =============================================
// Shows app title and a logout button.
// onLogout is called when user clicks logout.
// =============================================

import { signOut } from "firebase/auth"
import { auth } from "../firebase"

function NavBar({ onLogout }) {
  const handleLogout = async () => {
    await signOut(auth)
    onLogout()
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-icon">🚌</span>
        <span className="navbar-title">Bus Tracker</span>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  )
}

export default NavBar
