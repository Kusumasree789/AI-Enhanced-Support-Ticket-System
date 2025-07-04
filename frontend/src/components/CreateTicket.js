"use client"

import { useState } from "react"
import "./styles/CreateTicket.css"

function CreateTicket({ user, onTicketCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    category: "",
    description: "",
  })
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const categories = [
  "Technical Issue",
  "IT Support",
  "Network Issue",
  "Account Issue",
  "Password Reset",
  "Access Request",
  "Feature Request",
  "Bug Report",
  "Billing & Payments",
  "General Inquiry",
  "Other",
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e) => {
    setFiles(e.target.files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const submitData = new FormData()
    submitData.append("title", formData.title)
    submitData.append("subject", formData.subject)
    submitData.append("category", formData.category)
    submitData.append("description", formData.description)
    submitData.append("created_by", user.id)

    for (let i = 0; i < files.length; i++) {
      submitData.append("files", files[i])
    }

    try {
      const response = await fetch("http://localhost:5000/tickets", {
        method: "POST",
        body: submitData,
      })
      const data = await response.json()

      if (response.ok) {
        setMessage("Ticket created successfully! Our team will review it shortly.")
        setFormData({
          title: "",
          subject: "",
          category: "",
          description: "",
        })
        setFiles([])
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ""

        if (onTicketCreated) {
          setTimeout(() => {
            onTicketCreated()
          }, 2000)
        }
      } else {
        setMessage(data.message || "Error creating ticket")
      }
    } catch (error) {
      setMessage("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-ticket-bg">
      {/* Header */}
      <div className="create-ticket-header">
        <h1 className="create-ticket-title">
          Create New Support Ticket
        </h1>
        <p className="create-ticket-header-desc">
          Describe your issue in detail to help us assist you better
        </p>
      </div>

      <div className="create-ticket-main">
        {/* Main Form Card */}
        <div className="create-ticket-card">
          {message && (
            <div className={`create-ticket-message ${message.includes("successfully") ? "success" : "error"}`}>
              <span style={{ fontSize: '24px' }}>
                {message.includes("successfully") ? '✅' : '❌'}
              </span>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title and Category Row */}
            <div className="create-ticket-form-row">
              <div>
                <label className="create-ticket-label">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Brief summary of your issue"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="create-ticket-input"
                />
              </div>

              <div>
                <label className="create-ticket-label">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="create-ticket-select"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '24px' }}>
              <label className="create-ticket-label">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                placeholder="What is this ticket about?"
                value={formData.subject}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="create-ticket-input"
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <label className="create-ticket-label">
                Description *
              </label>
              <textarea
                name="description"
                placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={loading}
                rows="6"
                className="create-ticket-textarea"
              />
              <p className="create-ticket-desc-tip">
                💡 The more details you provide, the faster we can help you resolve the issue.
              </p>
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: '32px' }}>
              <label className="create-ticket-label">
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={loading}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
                className="create-ticket-file-input"
              />
              <p className="create-ticket-file-tip">
                📎 You can attach screenshots, documents, or other relevant files (max 10MB each)
              </p>
            </div>

            {/* Selected Files Display */}
            {files.length > 0 && (
              <div className="create-ticket-files">
                <p className="create-ticket-files-title">
                  <span style={{ fontSize: '20px' }}>📎</span>
                  Selected files:
                </p>
                <div className="create-ticket-file-list">
                  {Array.from(files).map((file, index) => (
                    <div key={index} className="create-ticket-file-item">
                      <span className="create-ticket-file-name">
                        {file.name}
                      </span>
                      <span className="create-ticket-file-size">
                        ({Math.round(file.size / 1024)}KB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="create-ticket-actions">
              <button 
                type="submit" 
                disabled={loading}
                className="create-ticket-submit"
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Creating Ticket...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '20px' }}></span>
                    Create Ticket
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: "",
                    subject: "",
                    category: "",
                    description: "",
                  })
                  setFiles([])
                  const fileInput = document.querySelector('input[type="file"]')
                  if (fileInput) fileInput.value = ""
                }}
                disabled={loading}
                className="create-ticket-clear"
              >
                <span style={{ fontSize: '16px' }}>🗑️</span>
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="create-ticket-help">
          <div style={{ marginBottom: '24px' }}>
            <h3 className="create-ticket-help-title">
              <span style={{ fontSize: '24px' }}>💡</span>
              Tips for Better Support
            </h3>
            <p className="create-ticket-help-desc">Follow these guidelines to get faster, more effective help</p>
          </div>
          <div className="create-ticket-help-list">
            {[
              { icon: '🎯', text: 'Be specific about the problem you\'re experiencing' },
              { icon: '🔄', text: 'Include steps to reproduce the issue if possible' },
              { icon: '⚡', text: 'Mention what you expected to happen vs. what actually happened' },
              { icon: '📷', text: 'Include relevant screenshots or error messages' },
              { icon: '💻', text: 'Specify your browser, device, or operating system if relevant' }
            ].map((item, index) => (
              <div key={index} className="create-ticket-help-item">
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ color: '#374151', fontWeight: '500', lineHeight: '1.5' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTicket
