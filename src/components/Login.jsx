// =============================================
// LOGIN PAGE
// =============================================
// Simple login with email/password using Firebase Auth.
// Role is selected by the user (driver or user).
// onLogin(role) is called after successful login.
// =============================================

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user") // "user" or "driver"
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password)
      // Pass the selected role to App
      onLogin(role)
    } catch (err) {
      // Show a friendly error message
      setError("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* App title */}
        <div className="login-header">
          <span className="login-icon">🚌</span>
          <h2>Bus Tracker</h2>
          <p>Real-Time Bus Tracking System</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />

          {/* Password input with show/hide toggle */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* Role selector */}
          <div className="role-selector">
            <label>Login as:</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${role === "user" ? "active" : ""}`}
                onClick={() => setRole("user")}
              >
                👤 Student / Parent
              </button>
              <button
                type="button"
                className={`role-btn ${role === "driver" ? "active" : ""}`}
                onClick={() => setRole("driver")}
              >
                🚌 Driver
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && <p className="login-error">{error}</p>}

          {/* Submit button */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
