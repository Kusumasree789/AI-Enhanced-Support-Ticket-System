"use client"

import { useState, useEffect } from "react"
import Home from "./components/Home"
import Login from "./components/Login"
import Signup from "./components/Signup"
import AdminDashboard from "./components/AdminDashboard"
import UserDashboard from "./components/UserDashboard"
import UserProfile from "./components/UserProfile"
import CreateTicket from "./components/CreateTicket"
import "./App.css"

function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState("home")
  const [loading, setLoading] = useState(true)

  console.log("user prop in App:", user)

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
    setView(userData.role === "admin" ? "admin-dashboard" : "user-dashboard")
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    setView("home")
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setView(parsedUser.role === "admin" ? "admin-dashboard" : "user-dashboard")
      } catch (error) {
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {user ? (
        <div className="dashboard-container">
          <nav className="top-nav">
            <div className="nav-brand">
              <h2>Support Desk</h2>
            </div>
            <div className="nav-user">
              <span>Welcome, {user.name || user.email}!</span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>

          <div className="nav-tabs">
            <button
              className={`tab ${view === (user.role === "admin" ? "admin-dashboard" : "user-dashboard") ? "active" : ""}`}
              onClick={() => setView(user.role === "admin" ? "admin-dashboard" : "user-dashboard")}
            >
              Dashboard
            </button>
            {user.role !== "admin" && (
              <button
                className={`tab ${view === "create-ticket" ? "active" : ""}`}
                onClick={() => setView("create-ticket")}
              >
                Create Ticket
              </button>
            )}
            <button
              className={`tab ${view === "profile" ? "active" : ""}`}
              onClick={() => setView("profile")}
            >
              Profile
            </button>
          </div>

          <main className="main-content">
            {view === "user-dashboard" && <UserDashboard user={user} onLogout={handleLogout} />}
            {view === "admin-dashboard" && <AdminDashboard user={user} onLogout={handleLogout} />}
            {view === "create-ticket" && user.role !== "admin" && <CreateTicket user={user} onTicketCreated={() => setView("user-dashboard")} />}
            {view === "profile" && (
            <UserProfile
              user={user}
              onBack={() => setView(user.role === "admin" ? "admin-dashboard" : "user-dashboard")}
              onUserUpdate={async (updatedUser) => {
                try {
                  const res = await fetch(`http://localhost:5000/users/${updatedUser.id}`);
                  const freshUser = await res.json();
                  setUser(freshUser);
                  localStorage.setItem("user", JSON.stringify(freshUser));
                } catch (error) {
                  console.error("Failed to re-fetch user:", error);
                }
              }}
            />
            )}
          </main>
        </div>
      ) : (
        <div className="auth-container">
          {view === "home" && <Home setView={setView} />}
          {view === "login-user" && (
            <Login
              isAdmin={false}
              onLoginSuccess={handleLoginSuccess}
              backToHome={() => setView("home")}
              switchToSignup={() => setView("signup-user")}
              switchToAdmin={() => setView("login-admin")}
            />
          )}
          {view === "login-admin" && (
            <Login
              isAdmin={true}
              onLoginSuccess={handleLoginSuccess}
              backToHome={() => setView("home")}
              switchToSignup={() => setView("signup-admin")}
              switchToUser={() => setView("login-user")}
            />
          )}
          {view === "signup-user" && (
            <Signup
              isAdmin={false}
              onSignupSuccess={handleLoginSuccess}
              backToHome={() => setView("home")}
              switchToLogin={() => setView("login-user")}
              switchToAdmin={() => setView("signup-admin")}
            />
          )}
          {view === "signup-admin" && (
            <Signup
              isAdmin={true}
              onSignupSuccess={handleLoginSuccess}
              backToHome={() => setView("home")}
              switchToLogin={() => setView("login-admin")}
              switchToUser={() => setView("signup-user")}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default App
