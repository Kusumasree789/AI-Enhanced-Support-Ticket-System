"use client"

import { useState, useEffect } from "react"
import TicketFeedback from "./TicketFeedback"
import UserProfile from "./UserProfile"
import "./styles/UserDashboard.css"

function UserDashboard({ user, onLogout, onRaiseTicket }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshFlag, setRefreshFlag] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:5000/tickets?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTickets(Array.isArray(data.tickets) ? data.tickets : [])
        setLoading(false)
      })
      .catch((err) => {
        setTickets([])
        setLoading(false)
        console.error(err)
      })
  }, [user.id, refreshFlag])

  useEffect(() => {
    if (selectedTicketId) {
      setLoading(true)
      fetch(`http://localhost:5000/tickets/${selectedTicketId}`)
        .then((res) => res.json())
        .then((data) => {
          setSelectedTicket(data.ticket || data)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [selectedTicketId])

  // Separate closed and non-closed tickets
  const closedTickets = tickets.filter((t) => t.status === "closed")
  const nonClosedTickets = tickets.filter((t) => t.status !== "closed")

  const handleCloseTicket = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:5000/tickets/${ticketId}/close`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed", closed_by: user.id }),
      })
      const data = await response.json()

      if (data.message === "Ticket closed") {
        setRefreshFlag(!refreshFlag)
      } else {
        alert(data.message || "Failed to close ticket")
      }
    } catch (err) {
      console.error(err)
      alert("Error closing ticket")
    }
  }

  const onFeedbackSubmitted = () => {
    setRefreshFlag(!refreshFlag)
  }

  const getStatusStyle = (status) => {
    const styles = {
      open: {
        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        color: "#d97706",
        border: "1px solid #fbbf24",
      },
      "in-progress": {
        background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
        color: "#1e40af",
        border: "1px solid #60a5fa",
      },
      resolved: {
        background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
        color: "#059669",
        border: "1px solid #4ade80",
      },
      closed: {
        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        color: "#374151",
        border: "1px solid #d1d5db",
      },
    }
    return styles[status] || styles.open
  }

  const getPriorityStyle = (priority) => {
    const styles = {
      high: {
        background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
        color: "#dc2626",
        border: "1px solid #f87171",
      },
      medium: {
        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        color: "#d97706",
        border: "1px solid #fbbf24",
      },
      low: {
        background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
        color: "#059669",
        border: "1px solid #4ade80",
      },
    }
    return styles[priority] || styles.medium
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A"
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString()
  }

  if (showProfile) {
    return <UserProfile user={user} tickets={tickets} onBack={() => setShowProfile(false)} />
  }

  if (loading && !selectedTicket) {
    return (
      <div className="userdashboard-loading-bg">
        <div className="userdashboard-loading-center">
          <div className="userdashboard-spinner"></div>
          <p className="userdashboard-loading-text">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="userdashboard-bg">
      {/* Header */}
      <div className="userdashboard-header">
        <div className="userdashboard-header-inner">
          <div>
            <h1 className="userdashboard-title">👋 Welcome, {user.name || user.username}</h1>
            <p className="userdashboard-subtitle">Manage your support tickets and track their progress</p>
          </div>
          <button
            onClick={() => setShowProfile(true)}
            className="userdashboard-profile-btn"
          >
            <span className="userdashboard-profile-btn-icon">👤</span>
            View Profile
          </button>
        </div>
      </div>

      <div className="userdashboard-content">
        {/* Stats Cards */}
        <div className="userdashboard-stats">
          <div className="userdashboard-stat-card">
            <div className="userdashboard-stat-icon">🎫</div>
            <h3 className="userdashboard-stat-number">{tickets.length}</h3>
            <p className="userdashboard-stat-label">Total Tickets</p>
          </div>
          <div className="userdashboard-stat-card pink">
            <div className="userdashboard-stat-icon">⚡</div>
            <h3 className="userdashboard-stat-number">{nonClosedTickets.length}</h3>
            <p className="userdashboard-stat-label">Active Tickets</p>
          </div>
          <div className="userdashboard-stat-card green">
            <div className="userdashboard-stat-icon">✅</div>
            <h3 className="userdashboard-stat-number">{closedTickets.length}</h3>
            <p className="userdashboard-stat-label">Closed Tickets</p>
          </div>
        </div>

        {/* Active Tickets Section */}
        <div className="userdashboard-section">
          <div className="userdashboard-section-header">
            <h2 className="userdashboard-section-title">
              <span className="userdashboard-section-title-icon">⚡</span>
              Active Tickets
            </h2>
            <p className="userdashboard-section-desc">Your currently open and in-progress support requests</p>
          </div>

          {nonClosedTickets.length === 0 ? (
            <div className="userdashboard-empty">
              <h3 className="userdashboard-empty-title">No active tickets</h3>
              <p className="userdashboard-empty-desc">Ready to get help? Create your first support ticket and our team will assist you promptly!</p>
              <button
                onClick={onRaiseTicket}
                className="userdashboard-create-btn"
              >
                <span className="userdashboard-create-btn-icon">➕</span>
                Create New Ticket
              </button>
            </div>
          ) : (
            <div className="userdashboard-ticket-list">
              {nonClosedTickets.map((ticket) => (
                <div key={ticket.id} className="userdashboard-ticket-card">
                  <div className="userdashboard-ticket-header">
                    <div className="userdashboard-ticket-header-main">
                      <h3 className="userdashboard-ticket-title">{ticket.title}</h3>
                      <p className="userdashboard-ticket-desc">{ticket.description?.substring(0, 120)}...</p>
                    </div>
                    <div className="userdashboard-ticket-badges">
                      <span className={`userdashboard-status-badge status-${ticket.status}`}>{ticket.status}</span>
                      <span className={`userdashboard-priority-badge priority-${ticket.priority}`}>{ticket.priority || "medium"}</span>
                    </div>
                  </div>
                  <div className="userdashboard-ticket-meta">
                    <div><strong>Category:</strong> {ticket.category || "General"}</div>
                    <div><strong>Created:</strong> {formatDate(ticket.created_at)}</div>
                    <div><strong>Assigned Admin:</strong> {ticket.assigned_to || "Not assigned"}</div>
                    <div><strong>Last Updated:</strong> {formatDate(ticket.updated_at || ticket.created_at)}</div>
                  </div>
                  <div className="userdashboard-ticket-actions">
                    <button
                      onClick={() => handleCloseTicket(ticket.id)}
                      className="userdashboard-close-btn"
                    >
                      <span className="userdashboard-close-btn-icon">🗑️</span>
                      Close Ticket
                    </button>
                    <button
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="userdashboard-view-btn"
                    >
                      <span className="userdashboard-view-btn-icon">👁️</span>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Closed Tickets Section */}
        <div className="userdashboard-section">
          <div className="userdashboard-section-header">
            <h2 className="userdashboard-section-title">
              <span className="userdashboard-section-title-icon">✅</span>
              Closed Tickets
            </h2>
            <p className="userdashboard-section-desc">Your resolved and completed support requests</p>
          </div>

          {closedTickets.length === 0 ? (
            <div className="userdashboard-empty">
              <div className="userdashboard-empty-icon">📭</div>
              <p className="userdashboard-empty-desc">No closed tickets yet</p>
            </div>
          ) : (
            <div className="userdashboard-ticket-list">
              {closedTickets.map((ticket) => (
                <div key={ticket.id} className="userdashboard-ticket-card closed">
                  <div className="userdashboard-ticket-header">
                    <div className="userdashboard-ticket-header-main">
                      <h3 className="userdashboard-ticket-title">{ticket.title}</h3>
                      <p className="userdashboard-ticket-desc">{ticket.description?.substring(0, 120)}...</p>
                    </div>
                    <div className="userdashboard-ticket-badges">
                      <span className={`userdashboard-status-badge status-${ticket.status}`}>{ticket.status}</span>
                      <span className={`userdashboard-priority-badge priority-${ticket.priority}`}>{ticket.priority || "medium"}</span>

                    </div>
                  </div>
                  <div className="userdashboard-ticket-meta">
                    <div><strong>Category:</strong> {ticket.category || "General"}</div>
                    <div><strong>Created:</strong> {formatDate(ticket.created_at)}</div>
                    <div><strong>Assigned Admin:</strong> {ticket.assigned_to || "Not assigned"}</div>
                    <div><strong>Last Updated:</strong> {formatDate(ticket.updated_at || ticket.created_at)}</div>
                  </div>
                  <div className="userdashboard-ticket-actions">
                    <button
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="userdashboard-view-btn"
                    >
                      <span className="userdashboard-view-btn-icon">👁️</span>
                      View Details
                    </button>
                  </div>
                  {/* Feedback Form */}
                  {!ticket.feedback_given && (
                    <div className="userdashboard-feedback-form">
                      <TicketFeedback ticketId={ticket.id} onFeedbackSubmitted={onFeedbackSubmitted} />
                    </div>
                  )}
                  {ticket.feedback_given && (
                    <div className="userdashboard-feedback-thankyou">
                      <span className="userdashboard-feedback-thankyou-icon">✅</span>
                      <span className="userdashboard-feedback-thankyou-text">Thank you for your feedback! We appreciate your input.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="userdashboard-modal-overlay">
          <div className="userdashboard-modal">
            <div className="userdashboard-modal-header">
              <h2 className="userdashboard-modal-title">Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="userdashboard-modal-close"
              >
                ✕
              </button>
            </div>
            <div className="userdashboard-modal-content">
              <h3 className="userdashboard-modal-content-title">{selectedTicket.title}</h3>
              <p className="userdashboard-modal-content-desc">{selectedTicket.description}</p>
              <div className="userdashboard-modal-meta">
                <div>
                  <p><strong>Category:</strong> <span>{selectedTicket.category || "General"}</span></p>
                  <p><strong>Created:</strong> <span>{formatDate(selectedTicket.created_at)}</span></p>
                  <p><strong>Priority:</strong> <span>{selectedTicket.priority || "medium"}</span></p>
                </div>
                <div>
                  <p><strong>Assigned Admin:</strong> <span>{selectedTicket.assigned_to || "Not assigned"}</span></p>
                  <p><strong>Last Updated:</strong> <span>{formatDate(selectedTicket.updated_at || selectedTicket.created_at)}</span></p>
                  <p><strong>Status:</strong> <span className={`userdashboard-status-badge status-${selectedTicket.status}`}>{selectedTicket.status}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard
