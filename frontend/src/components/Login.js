"use client"

import { useState } from "react"
import "./styles/common.css"

function Login({ isAdmin, onLoginSuccess, backToHome, switchToSignup, switchToAdmin, switchToUser }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const endpoint = isAdmin ? "/admin/login" : "/login"
  const verifyEndpoint = isAdmin ? "/admin/verify-otp-login" : "/verify-otp-login"

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (response.ok) {
        setStep(2)
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`http://localhost:5000${verifyEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })
      const data = await response.json()

      if (response.ok) {
        onLoginSuccess({
          id: data.user_id,
          email,
          role: data.role,
          name: data.name,
          username: data.username,
        })
      } else {
        setError(data.message || "Invalid OTP")
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container-gradient">
      <div className="login-card">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="page-icon">{isAdmin ? "👨‍💼" : "👤"}</div>
          <h2 className="login-title">
            {isAdmin ? "Admin Login" : "User Login"}
          </h2>
          <p className="login-subtitle">
            {step === 1 ? "Enter your credentials to continue" : "Enter the OTP sent to your email"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔐</span>
                  {`Login as ${isAdmin ? "Admin" : "User"}`}
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
                maxLength="6"
                className="form-input otp-input"
              />
              <p className="otp-hint">
                📧 Check your email for the verification code
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <span className="btn-icon">✅</span>
                  Verify OTP
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="footer-buttons">
          <div className="footer-buttons-row">
            <button type="button" onClick={backToHome} className="btn btn-secondary w-full">
              ← Back to Home
            </button>
            <button type="button" onClick={switchToSignup} className="btn-signup-user w-full">
              Sign Up
            </button>
          </div>

          <div className="text-center">
            <button type="button" onClick={isAdmin ? switchToUser : switchToAdmin} className="footer-link">
              Login as {isAdmin ? "User" : "Admin"} instead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
