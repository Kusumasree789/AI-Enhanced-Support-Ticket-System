"use client"

import { useState } from "react"
import "./styles/AdminTicketFeedback.css"

export default function AdminTicketFeedback({ ticketId, onFeedbackSubmitted }) {
  const [feedback, setFeedback] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!feedback.trim()) return
    
    setSubmitting(true)
    setMessage("")
    setMessageType("")
    
    try {
      const response = await fetch(`http://localhost:5000/admin/tickets/${ticketId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback.trim() }),
      })
      const data = await response.json()
      
      if (response.ok) {
        setMessage("✅ Feedback submitted successfully!")
        setMessageType("success")
        setFeedback("")
        if (onFeedbackSubmitted) onFeedbackSubmitted()
      } else {
        setMessage(`❌ ${data.message || "Error submitting feedback"}`)
        setMessageType("error")
      }
    } catch (err) {
      setMessage("❌ Network error. Please try again.")
      setMessageType("error")
    }
    setSubmitting(false)
  }

  const handleTextareaChange = (e) => {
    setFeedback(e.target.value)
    // Clear any existing messages when user starts typing
    if (message) {
      setMessage("")
      setMessageType("")
    }
  }

  return (
    <div className="admin-feedback-container">
      <div className="admin-feedback-header">
        <span className="admin-feedback-icon">💬</span>
        <h4 className="admin-feedback-title">Admin Feedback</h4>
      </div>
      
      <form onSubmit={handleSubmit} className="admin-feedback-form">
        <textarea
          className="admin-feedback-textarea"
          value={feedback}
          onChange={handleTextareaChange}
          placeholder="Add your feedback, notes, or resolution steps for this ticket..."
          rows={4}
          disabled={submitting}
          maxLength={1000}
        />
        
        <div className="admin-feedback-char-counter">
          <span className="admin-feedback-char-count">
            {feedback.length} characters
          </span>
          <span className="admin-feedback-char-limit">
            / 1000
          </span>
        </div>
        
        <button 
          type="submit" 
          className="admin-feedback-submit-btn"
          disabled={submitting || !feedback.trim()}
        >
          {submitting ? (
            <div className="admin-feedback-loading">
              <div className="admin-feedback-spinner"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            <>
              <span className="admin-feedback-submit-icon">📝</span>
              Submit Feedback
            </>
          )}
        </button>
        
        {message && (
          <div className={`admin-feedback-message ${messageType}`}>
            <span className="admin-feedback-message-icon">
              {messageType === "success" ? "✅" : "❌"}
            </span>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}
