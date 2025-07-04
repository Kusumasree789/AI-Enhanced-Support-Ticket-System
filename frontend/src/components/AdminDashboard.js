"use client"

import { useState, useEffect } from "react"
import AnalyticsDashboard from "./AnalyticsDashboard"
import AdminTicketFeedback from "./AdminTicketFeedback"
import "./styles/AdminDashboard.css"

function AdminDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [similarTickets, setSimilarTickets] = useState([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [ticketToResolve, setTicketToResolve] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Fetch all tickets
  const fetchTickets = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/admin/tickets")
      const data = await response.json()
      setTickets(Array.isArray(data.tickets) ? data.tickets : [])
    } catch (err) {
      setTickets([])
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  // Fetch similar tickets when a ticket is selected
  useEffect(() => {
    if (selectedTicketId) {
      fetch(`http://localhost:5000/tickets/${selectedTicketId}/similar`)
        .then((res) => res.json())
        .then((data) => setSimilarTickets(data.similar_tickets || []))
        .catch((err) => {
          setSimilarTickets([])
          console.error(err)
        })
    } else {
      setSimilarTickets([])
    }
  }, [selectedTicketId])

  // Assign ticket to admin (status: in-progress)
  const handleResolveTicket = (ticketId) => {
    setTicketToResolve(ticketId)
    setShowConfirmation(true)
  }

  const confirmResolve = async () => {
    if (!ticketToResolve) return
    try {
      const response = await fetch(`http://localhost:5000/admin/tickets/${ticketToResolve}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: user.id,
          status: "in-progress",
        }),
      })
      const data = await response.json()
      if (response.ok) {
        alert(`Ticket assigned to you! Status: ${data.ticket.status}`)
        fetchTickets()
      } else {
        alert(data.message || "Failed to assign ticket")
      }
    } catch (err) {
      console.error(err)
      alert("Error assigning ticket")
    }
    setShowConfirmation(false)
    setTicketToResolve(null)
  }

  const cancelResolve = () => {
    setShowConfirmation(false)
    setTicketToResolve(null)
  }

  // Update ticket status (resolved/closed)
  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()
      if (response.ok) {
        alert(`Ticket status updated to ${newStatus}`)
        fetchTickets()
      } else {
        alert(data.message || "Failed to update status")
      }
    } catch (err) {
      console.error(err)
      alert("Error updating ticket status")
    }
  }

  const handleTicketClick = (ticket) => {
    setSelectedTicketId(ticket.id)
    setSelectedTicket(ticket)
  }

  const priorityOrder = { high: 1, medium: 2, low: 3 }
  const openSortedTickets = [...tickets]
    .filter((t) => t.status === "open")
    .sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4))

  const myTickets = tickets.filter((t) => t.assigned_to === user.id)

  const getStatusStyle = (status) => {
    const styles = {
      open: { background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#d97706", border: "1px solid #fbbf24" },
      "in-progress": { background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", color: "#1e40af", border: "1px solid #60a5fa" },
      resolved: { background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", color: "#059669", border: "1px solid #4ade80" },
      closed: { background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", color: "#374151", border: "1px solid #d1d5db" },
    }
    return styles[status] || styles.open
  }

  const getPriorityStyle = (priority) => {
    const styles = {
      high: { background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", color: "#dc2626", border: "1px solid #f87171" },
      medium: { background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#d97706", border: "1px solid #fbbf24" },
      low: { background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", color: "#059669", border: "1px solid #4ade80" },
    }
    return styles[priority] || styles.medium
  }

  if (showAnalytics) {
    return (
      <div className="admin-dashboard-bg">
        <div className="admin-dashboard-header">
          <h1 className="admin-dashboard-title">Analytics Dashboard</h1>
          <button onClick={() => setShowAnalytics(false)} className="admin-dashboard-back-btn">
            ← Back to Tickets
          </button>
        </div>
        <AnalyticsDashboard />
      </div>
    )
  }

  return (
    <div className="admin-dashboard-bg">
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="admin-dashboard-modal-overlay">
          <div className="admin-dashboard-modal-content">
            <div className="admin-dashboard-modal-header">
              <div className="admin-dashboard-modal-icon">🎫</div>
              <h3 className="admin-dashboard-modal-title">Assign Ticket</h3>
              <p className="admin-dashboard-modal-desc">
                Do you want to take on this ticket? It will be assigned to you and marked as in-progress.
              </p>
            </div>
            <div className="admin-dashboard-modal-actions">
              <button onClick={cancelResolve} className="admin-dashboard-modal-cancel">Cancel</button>
              <button onClick={confirmResolve} className="admin-dashboard-modal-assign">Assign to Me</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header-inner">
          <div>
            <h1 className="admin-dashboard-title">👨‍💼 Admin Dashboard</h1>
            <p className="admin-dashboard-subtitle">Manage support tickets and monitor system performance</p>
          </div>
          <button onClick={() => setShowAnalytics(true)} className="admin-dashboard-analytics-btn">
            <span className="admin-dashboard-analytics-icon">📊</span>
            View Analytics
          </button>
        </div>
      </div>

      <div className="admin-dashboard-content">
        {/* Stats Cards */}
        <div className="admin-dashboard-stats">
          <div className="admin-dashboard-stat-card">
            <div className="admin-dashboard-stat-icon">🎫</div>
            <h3 className="admin-dashboard-stat-number">{tickets.length}</h3>
            <p className="admin-dashboard-stat-label">Total Tickets</p>
          </div>
          <div className="admin-dashboard-stat-card pink">
            <div className="admin-dashboard-stat-icon">🔓</div>
            <h3 className="admin-dashboard-stat-number">{openSortedTickets.length}</h3>
            <p className="admin-dashboard-stat-label">Open Tickets</p>
          </div>
          <div className="admin-dashboard-stat-card blue">
            <div className="admin-dashboard-stat-icon">👤</div>
            <h3 className="admin-dashboard-stat-number">{myTickets.length}</h3>
            <p className="admin-dashboard-stat-label">My Tickets</p>
          </div>
          <div className="admin-dashboard-stat-card green">
            <div className="admin-dashboard-stat-icon">✅</div>
            <h3 className="admin-dashboard-stat-number">{tickets.filter((t) => (t.status === "resolved" || t.status === "closed") && t.assigned_to === user.id).length}</h3>
            <p className="admin-dashboard-stat-label">Resolved</p>
          </div>
        </div>

        {loading ? (
          <div className="admin-dashboard-loading">
            <div className="admin-dashboard-spinner"></div>
            <p className="admin-dashboard-loading-text">Loading tickets...</p>
          </div>
        ) : (
          <div className="admin-dashboard-tickets-grid" onClick={() => { setSelectedTicketId(null); setSelectedTicket(null); }}>
            {/* Available Tickets */}
            <div className="admin-dashboard-card" onClick={e => e.stopPropagation()}>
              <div className="admin-dashboard-card-header">
                <h2 className="admin-dashboard-card-title">
                  <span style={{ fontSize: "24px" }}>📋</span>
                  Available Tickets ({openSortedTickets.length})
                </h2>
                <p className="admin-dashboard-card-desc">Sorted by priority - High priority tickets appear first</p>
              </div>
              {openSortedTickets.length === 0 ? (
                <div className="admin-dashboard-empty">
                  <div className="admin-dashboard-empty-icon">✅</div>
                  <h3 className="admin-dashboard-empty-title">All caught up!</h3>
                  <p className="admin-dashboard-empty-text">No open tickets available at the moment</p>
                </div>
              ) : (
                <div className="admin-dashboard-ticket-list">
                  {openSortedTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket)}
                      className={`admin-dashboard-ticket-item${selectedTicketId === ticket.id ? " selected" : ""}`}
                    >
                      <div className="admin-dashboard-ticket-header">
                        <h3 className="admin-dashboard-ticket-title">{ticket.title}</h3>
                        <div className="admin-dashboard-ticket-badges">
                          <span className={`admin-dashboard-badge status-${ticket.status}`}>{ticket.status}</span>
                          <span className={`admin-dashboard-badge priority-${ticket.priority || "medium"}`}>{ticket.priority || "medium"}</span>
                        </div>
                      </div>
                      <p className="admin-dashboard-ticket-desc">{ticket.description?.substring(0, 120)}...</p>
                      <div className="admin-dashboard-ticket-meta">
                        <div><span className="admin-dashboard-ticket-meta-label">User:</span> {ticket.created_by_name || ticket.created_by}</div>
                        <div><span className="admin-dashboard-ticket-meta-label">Category:</span> {ticket.category || "General"}</div>
                      </div>
                      <div className="admin-dashboard-ticket-footer">
                        <span className="admin-dashboard-ticket-date">Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleResolveTicket(ticket.id); }}
                          className="admin-dashboard-take-btn"
                        >
                          Take Ticket
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Similar Tickets Sidebar */}
            <div className="admin-dashboard-similar-card">
              <div className="admin-dashboard-similar-header">
                <h3 className="admin-dashboard-similar-title">
                  <span style={{ fontSize: "20px" }}>🔍</span>
                  Similar Resolved Tickets
                </h3>
                <p className="admin-dashboard-similar-desc">Find solutions from similar cases</p>
              </div>
              {selectedTicket ? (
                <>
                  <div className="admin-dashboard-similar-selected">
                    <h4 className="admin-dashboard-similar-selected-title">Selected: {selectedTicket.title}</h4>
                    <p className="admin-dashboard-similar-selected-desc">{selectedTicket.description?.substring(0, 100)}...</p>
                  </div>
                  {similarTickets.length === 0 ? (
                    <div className="admin-dashboard-similar-empty">
                      <div className="admin-dashboard-similar-empty-icon">🆕</div>
                      <p className="admin-dashboard-similar-empty-text">No similar tickets found. This might be a unique issue requiring fresh investigation.</p>
                    </div>
                  ) : (
                    <div className="admin-dashboard-similar-list">
                      {similarTickets.map((t) => (
                        <div key={t.id} className="admin-dashboard-similar-item">
                          <div className="admin-dashboard-similar-item-header">
                            <span style={{ fontSize: "14px" }}>✅</span>
                            Ticket #{t.id}
                          </div>
                          <div className="admin-dashboard-similar-item-desc">{t.description?.substring(0, 80)}...</div>
                          <div className="admin-dashboard-similar-item-resolution">
                            <strong>Resolution:</strong> {t.resolution_steps || "No resolution steps recorded"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="admin-dashboard-similar-empty">
                  <div className="admin-dashboard-similar-empty-icon">👆</div>
                  <p className="admin-dashboard-similar-empty-text">Select a ticket from the list to view similar resolved cases and their solutions.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Assigned Tickets */}
        {myTickets.length > 0 && (
        <div className="admin-dashboard-my-tickets">
          <div className="admin-dashboard-my-tickets-header">
            <h2 className="admin-dashboard-my-tickets-title">
              <span className="admin-dashboard-my-tickets-icon">👤</span>
              My Assigned Tickets ({myTickets.length})
            </h2>
            <p className="admin-dashboard-my-tickets-desc">Tickets currently assigned to you</p>
          </div>
          <div className="admin-dashboard-my-tickets-list">
            {myTickets.map((ticket) => (
              <div key={ticket.id} className="admin-dashboard-my-ticket-item">
                <div className="admin-dashboard-my-ticket-header">
                  <h3 className="admin-dashboard-my-ticket-title">{ticket.title}</h3>
                  <span className="admin-dashboard-my-ticket-status">{ticket.status}</span>
                </div>
                <p className="admin-dashboard-my-ticket-desc">{ticket.description}</p>
                <div className="admin-dashboard-my-ticket-meta">
                  <div><span className="admin-dashboard-my-ticket-meta-label">User:</span> {ticket.created_by_name || ticket.created_by}</div>
                  <div><span className="admin-dashboard-my-ticket-meta-label">Category:</span> {ticket.category || "General"}</div>
                  <div><span className="admin-dashboard-my-ticket-meta-label">Assigned:</span> {new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()}</div>
                </div>
                {ticket.status !== "closed" ? (
                  <>
                    <div className="admin-dashboard-my-ticket-actions">
                      {ticket.status !== "resolved" && (
                        <button
                          onClick={() => handleStatusUpdate(ticket.id, "resolved")}
                          className="admin-dashboard-status-btn"
                        >
                          Mark as Resolved
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(ticket.id, "closed")}
                        className="admin-dashboard-status-btn"
                      >
                        Close Ticket
                      </button>
                    </div>
                    <AdminTicketFeedback ticketId={ticket.id} onFeedbackSubmitted={fetchTickets} />
                  </>
                ) : (
                  <div className="admin-dashboard-closed-note">
                    This ticket is closed and cannot be modified.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default AdminDashboard
