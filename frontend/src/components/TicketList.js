"use client"

import { useState, useEffect } from "react"
import TicketFeedback from "./ticket-feedback"
import "./styles/TicketList.css"

function TicketList({ user }) {
  const [tickets, setTickets] = useState([])
  const [refreshFlag, setRefreshFlag] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:5000/tickets?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => setTickets(Array.isArray(data.tickets) ? data.tickets : []))
      .catch((err) => {
        setTickets([])
        console.error(err)
      })
      .finally(() => setLoading(false))
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

  const handleUpdate = (ticket_id, status, assigned_to) => {
    fetch(`http://localhost:5000/tickets/${ticket_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, assigned_to }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message)
        setRefreshFlag(!refreshFlag)
      })
      .catch((err) => console.error(err))
  }

  const onFeedbackSubmitted = () => {
    setRefreshFlag(!refreshFlag)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A"
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString()
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

  if (loading && !selectedTicket) {
    return (
      <div className="ticketlist-loading-bg">
        <div className="ticketlist-loading-center">
          <div className="ticketlist-spinner"></div>
          <p className="ticketlist-loading-text">Loading your tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ticketlist-bg">
      {/* Header */}
      <div className="ticketlist-header">
        <div className="ticketlist-header-icon">🎫</div>
        <h1 className="ticketlist-title">Your Support Tickets</h1>
        <p className="ticketlist-header-desc">Track and manage all your support requests</p>
      </div>

      <div className="ticketlist-main">
        {tickets.length === 0 ? (
          <div className="ticketlist-empty">
            <div className="ticketlist-empty-icon">📭</div>
            <h3 className="ticketlist-empty-title">No tickets yet</h3>
            <p className="ticketlist-empty-desc">When you create support tickets, they'll appear here for you to track and manage.</p>
          </div>
        ) : (
          <div className="ticketlist-list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticketlist-card">
                <div className="ticketlist-card-header">
                  <div className="ticketlist-card-header-main">
                    <h3 className="ticketlist-card-title">{ticket.title}</h3>
                    <p className="ticketlist-card-desc">{ticket.description?.substring(0, 150)}...</p>
                  </div>
                  <span className={`ticketlist-status-badge status-${ticket.status}`}>{ticket.status}</span>
                </div>
                <div className="ticketlist-card-meta">
                  <div><strong>Category:</strong> {ticket.category || "General"}</div>
                  <div><strong>Created:</strong> {formatDate(ticket.created_at)}</div>
                  <div><strong>Last Updated:</strong> {formatDate(ticket.updated_at)}</div>
                </div>
                <div className="ticketlist-card-actions">
                  {ticket.status !== "closed" && (
                    <button
                      onClick={() => handleUpdate(ticket.id, "resolved", null)}
                      className="ticketlist-resolve-btn"
                    >
                      ✅ Mark as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="ticketlist-view-btn"
                  >
                    👁️ View Details
                  </button>
                </div>
                {/* Feedback Form for Closed Tickets */}
                {ticket.status === "closed" && !ticket.feedback_given && (
                  <div className="ticketlist-feedback-form">
                    <TicketFeedback ticketId={ticket.id} onFeedbackSubmitted={onFeedbackSubmitted} />
                  </div>
                )}
                {ticket.status === "closed" && ticket.feedback_given && (
                  <div className="ticketlist-feedback-thankyou">
                    <span className="ticketlist-feedback-thankyou-icon">✅</span>
                    <span className="ticketlist-feedback-thankyou-text">Thank you for your feedback! We appreciate your input.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="ticketlist-modal-overlay">
          <div className="ticketlist-modal">
            <div className="ticketlist-modal-header">
              <h2 className="ticketlist-modal-title">Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="ticketlist-modal-close"
              >
                ✕
              </button>
            </div>
            <div className="ticketlist-modal-content">
              <h3 className="ticketlist-modal-content-title">{selectedTicket.title}</h3>
              <p className="ticketlist-modal-content-desc">{selectedTicket.description}</p>
              <div className="ticketlist-modal-meta">
                <div>
                  <p><strong>Category:</strong> <span>{selectedTicket.category || "General"}</span></p>
                  <p><strong>Created:</strong> <span>{formatDate(selectedTicket.created_at)}</span></p>
                  <p><strong>Priority:</strong> <span>{selectedTicket.priority || "medium"}</span></p>
                </div>
                <div>
                  <p><strong>Assigned Admin:</strong> <span>{selectedTicket.assigned_to_name || "Not assigned"}</span></p>
                  <p><strong>Last Updated:</strong> <span>{formatDate(selectedTicket.updated_at || selectedTicket.created_at)}</span></p>
                  <p><strong>Status:</strong> <span className={`ticketlist-status-badge status-${selectedTicket.status}`}>{selectedTicket.status}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketList
