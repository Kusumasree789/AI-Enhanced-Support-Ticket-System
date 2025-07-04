"use client"

import { useState } from "react"
import "./styles/common.css"

function TicketFeedback({ ticketId, onFeedbackSubmitted }) {
  const [feedback, setFeedback] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`http://localhost:5000/tickets/${ticketId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      })
      const data = await response.json()

      if (response.ok) {
        setMessage("Thank you for your feedback!")
        if (onFeedbackSubmitted) {
          setTimeout(() => {
            onFeedbackSubmitted()
          }, 1500)
        }
      } else {
        setMessage("Error submitting feedback")
      }
    } catch (error) {
      setMessage("Connection error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="feedback-card">
      <div className="mb-3">
        <h4 className="feedback-title">
          <span style={{ fontSize: "20px" }}>⭐</span>
          How was your experience?
        </h4>
        <p className="feedback-description">Please share your feedback about how this issue was resolved</p>
      </div>

      {message && (
        <div className={`alert ${message.includes("Thank you") ? "alert-success" : "alert-error"} mb-3`}>
          <span style={{ fontSize: "20px" }}>{message.includes("Thank you") ? "✅" : "❌"}</span>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Your Feedback</label>
          <textarea
            placeholder="How was your issue resolved? Any suggestions for improvement?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            disabled={loading}
            rows="4"
            className="form-textarea"
            style={{ minHeight: "100px" }}
          />
        </div>

        <button type="submit" disabled={loading || !feedback.trim()} className="btn btn-primary">
          {loading ? (
            <>
              <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
              Submitting...
            </>
          ) : (
            <>
              <span style={{ fontSize: "16px" }}>📝</span>
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default TicketFeedback
