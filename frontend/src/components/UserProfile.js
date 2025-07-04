"use client"

import { useState, useEffect } from "react"
import "./styles/UserProfile.css"

function UserProfile({ user, onBack, onUserUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [tickets, setTickets] = useState([])
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [displayUser, setDisplayUser] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "",
  })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // Sync displayUser with user prop
  useEffect(() => {
    setDisplayUser({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      role: user?.role || "",
    })
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }, [user])

  useEffect(() => {
    fetch(`http://localhost:5000/users/${user.id}/tickets`)
      .then((res) => res.json())
      .then((data) => setTickets(data.tickets || []))
      .catch(() => setTickets([]))
  }, [user.id])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const updateData = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
    }

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage("New passwords do not match")
        setLoading(false)
        return
      }
      updateData.currentPassword = formData.currentPassword
      updateData.newPassword = formData.newPassword
    }

    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Profile updated successfully!")
        setIsEditing(false)
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setDisplayUser({
          name: data.user.name,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role || user.role || "",
        })
        if (onUserUpdate) {
          onUserUpdate({
            ...user,
            ...data.user,
          })
        }
      } else {
        setMessage(data.message || "Failed to update profile")
      }
    } catch {
      setMessage("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Ticket statistics
  const getTicketStats = () => {
    const total = tickets.length
    const open = tickets.filter((t) => t.status === "open").length
    const inProgress = tickets.filter((t) => t.status === "in-progress").length
    const resolved = tickets.filter((t) => t.status === "resolved").length
    const closed = tickets.filter((t) => t.status === "closed").length
    return { total, open, inProgress, resolved, closed }
  }

  const stats = getTicketStats()

  return (
    <div className="userprofile-bg">
      {/* Header */}
      <div className="userprofile-header">
        <div className="userprofile-header-avatar">👤</div>
        <h1 className="userprofile-header-title">My Profile</h1>
        <p className="userprofile-header-desc">Manage your account information and view your activity</p>
      </div>
      <div className="userprofile-main">
        {/* Back Button */}
        <button onClick={onBack} className="userprofile-back-btn">
          <span className="userprofile-back-btn-icon">←</span>
          Back to Dashboard
        </button>
        <div className="userprofile-grid">
          {/* Personal Information Card */}
          <div className="userprofile-card">
            <div className="userprofile-card-header">
              <div>
                <h2 className="userprofile-card-title">
                  <span className="userprofile-card-title-icon">📝</span>
                  Personal Information
                </h2>
                <p className="userprofile-card-desc">Update your account details and preferences</p>
              </div>
              <button onClick={() => setIsEditing(!isEditing)} className={`userprofile-edit-btn${isEditing ? " editing" : ""}`}>
                {isEditing ? "Cancel" : "✏️ Edit Profile"}
              </button>
            </div>
            {message && (
              <div className={`userprofile-message${message.includes("successfully") ? " success" : " error"}`}>
                <span className="userprofile-message-icon">{message.includes("successfully") ? "✅" : "❌"}</span>
                {message}
              </div>
            )}
            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="userprofile-form-fields">
                  <div>
                    <label className="userprofile-label">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={loading} className="userprofile-input" />
                  </div>
                  <div>
                    <label className="userprofile-label">Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} required disabled={loading} className="userprofile-input" />
                  </div>
                  <div>
                    <label className="userprofile-label">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required disabled={loading} className="userprofile-input" />
                  </div>
                </div>
                {/* Password Change Section */}
                <div className="userprofile-password-section">
                  <h3 className="userprofile-password-title">
                    <span className="userprofile-password-title-icon">🔒</span>
                    Change Password (Optional)
                  </h3>
                  <div className="userprofile-password-fields">
                    <div>
                      <label className="userprofile-label">Current Password</label>
                      <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} disabled={loading} className="userprofile-input small" />
                    </div>
                    <div>
                      <label className="userprofile-label">New Password</label>
                      <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} disabled={loading} className="userprofile-input small" />
                    </div>
                    <div>
                      <label className="userprofile-label">Confirm New Password</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} disabled={loading} className="userprofile-input small" />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={loading} className={`userprofile-submit-btn${loading ? " loading" : ""}`}>
                  {loading ? (
                    <>
                      <div className="userprofile-spinner"></div>
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <span className="userprofile-submit-btn-icon">💾</span>
                      Update Profile
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div>
                {/* Profile Avatar */}
                <div className="userprofile-avatar-card">
                  <div className="userprofile-avatar">
                    {displayUser.name ? displayUser.name[0].toUpperCase() : displayUser.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="userprofile-avatar-name">{displayUser.name || "Not provided"}</h3>
                    <p className="userprofile-avatar-username">@{displayUser.username}</p>
                  </div>
                </div>
                <div className="userprofile-info-fields">
                  <div>
                    <label className="userprofile-info-label">Full Name</label>
                    <p className="userprofile-info-value">{displayUser.name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="userprofile-info-label">Username</label>
                    <p className="userprofile-info-value">{displayUser.username || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="userprofile-info-label">Email Address</label>
                    <p className="userprofile-info-value">{displayUser.email}</p>
                  </div>
                  <div>
                    <label className="userprofile-info-label">Account Type</label>
                    <div className={`userprofile-role-badge${displayUser.role === "admin" ? " admin" : ""}`}>
                      <span className="userprofile-role-badge-icon">{displayUser.role === "admin" ? "👨‍💼" : "👤"}</span>
                      {displayUser.role === "admin" ? "Administrator" : "User"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Ticket Analytics Card */}
          <div className="userprofile-analytics-card">
            <div className="userprofile-analytics-header">
              <h2 className="userprofile-analytics-title">
                <span className="userprofile-analytics-title-icon">📊</span>
                Ticket Analytics
              </h2>
              <p className="userprofile-analytics-desc">Your support activity overview</p>
            </div>
            <div className="userprofile-analytics-list">
              <div className="userprofile-analytics-item total">
                <div className="userprofile-analytics-item-label">
                  <span className="userprofile-analytics-item-icon">🎫</span>
                  <span>Total Tickets</span>
                </div>
                <span className="userprofile-analytics-item-value">{stats.total}</span>
              </div>
              <div className="userprofile-analytics-item open">
                <div className="userprofile-analytics-item-label">
                  <span className="userprofile-analytics-item-icon">🔓</span>
                  <span>Open</span>
                </div>
                <span className="userprofile-analytics-item-value">{stats.open}</span>
              </div>
              <div className="userprofile-analytics-item inprogress">
                <div className="userprofile-analytics-item-label">
                  <span className="userprofile-analytics-item-icon">⚡</span>
                  <span>In Progress</span>
                </div>
                <span className="userprofile-analytics-item-value">{stats.inProgress}</span>
              </div>
              <div className="userprofile-analytics-item resolved">
                <div className="userprofile-analytics-item-label">
                  <span className="userprofile-analytics-item-icon">✅</span>
                  <span>Resolved</span>
                </div>
                <span className="userprofile-analytics-item-value">{stats.resolved}</span>
              </div>
              <div className="userprofile-analytics-item closed">
                <div className="userprofile-analytics-item-label">
                  <span className="userprofile-analytics-item-icon">🗂️</span>
                  <span>Closed</span>
                </div>
                <span className="userprofile-analytics-item-value">{stats.closed}</span>
              </div>
              <hr className="userprofile-analytics-divider" />
              <div className="userprofile-analytics-item rate">
                <div className="userprofile-analytics-item-label">
                  <span className="userprofile-analytics-item-icon">📈</span>
                  <span>Resolution Rate</span>
                </div>
                <span className="userprofile-analytics-item-value">{stats.total > 0 ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile