"use client"

import { useState } from "react"
import "./styles/common.css"

function Signup({ isAdmin, onSignupSuccess, backToHome, switchToLogin, switchToAdmin, switchToUser }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  })
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const endpoint = isAdmin ? "/admin/signup" : "/signup"

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (response.ok) {
        setStep(2)
      } else {
        setError(data.message || "Signup failed")
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
      const verifyEndpoint = isAdmin ? "/admin/verify-otp" : "/verify-otp"
      const response = await fetch(`http://localhost:5000${verifyEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
          name: formData.name,
          username: formData.username,
          password: formData.password,
        }),
      })
      const data = await response.json()

      if (response.ok) {
        onSignupSuccess({
          id: data.user_id,
          email: formData.email,
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
        <div className="text-center mb-4">
          <div className="page-icon">{isAdmin ? "👨‍💼" : "👤"}</div>
          <h2 className="login-title">
            Create {isAdmin ? "Admin" : "User"} Account
          </h2>
          <p className="login-subtitle">
            {step === 1 ? "Fill in your details to get started" : "Enter the OTP sent to your email"}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <span className="btn-icon">✨</span>
                  {`Create ${isAdmin ? "Admin" : "User"} Account`}
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
                  <span className="btn-icon">🎉</span>
                  Verify & Create Account
                </>
              )}
            </button>
          </form>
        )}

        <div className="footer-buttons">
          <div className="footer-buttons-row">
            <button type="button" onClick={backToHome} className="btn btn-secondary w-full">
              ← Back to Home
            </button>
            <button type="button" onClick={switchToLogin} className="btn-signup-user w-full">
              Login
            </button>
          </div>

          <div className="text-center">
            <button type="button" onClick={isAdmin ? switchToUser : switchToAdmin} className="footer-link">
              Signup as {isAdmin ? "User" : "Admin"} instead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
