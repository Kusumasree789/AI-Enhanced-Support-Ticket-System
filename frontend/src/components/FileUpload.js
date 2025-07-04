"use client"

import { useState } from "react"
import "./styles/FileUpload.css"

function FileUpload({ user }) {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      // 10MB limit
      setMessage("File size must be less than 10MB")
      return
    }
    setFile(selectedFile)
    setMessage("")
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setMessage("Please select a file to upload")
      return
    }

    setLoading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", user.id)

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (response.ok) {
        setMessage("File uploaded successfully!")
        setFile(null)
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ""
      } else {
        setMessage(data.message || "Error uploading file")
      }
    } catch (error) {
      setMessage("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="file-upload-bg">
      {/* Header */}
      <div className="file-upload-header">
        <div className="file-upload-header-icon">📁</div>
        <h1 className="file-upload-title">File Upload Center</h1>
        <p className="file-upload-header-desc">Upload files related to your support tickets securely</p>
      </div>

      <div className="file-upload-main">
        {/* Upload Card */}
        <div className="file-upload-card">
          {message && (
            <div className={`file-upload-message ${message.includes("successfully") ? "success" : "error"}`}>
              <span className="file-upload-message-icon">{message.includes("successfully") ? "✅" : "❌"}</span>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className="file-upload-dropzone-wrapper"
            >
              <div
                onClick={() => document.getElementById("fileInput").click()}
                className={`file-upload-dropzone${dragActive ? " active" : ""}`}
              >
                <div className="file-upload-dropzone-icon">{dragActive ? "📂" : "📁"}</div>
                <h3 className="file-upload-dropzone-title">
                  {dragActive ? "Drop your file here!" : "Click to upload or drag and drop"}
                </h3>
                <p className="file-upload-dropzone-desc">
                  Supports: Images, Documents, Archives (Max 10MB)
                </p>
                <div className="file-upload-dropzone-types">
                  {["📷 JPG", "📄 PDF", "📝 DOC", "📦 ZIP"].map((type, index) => (
                    <span key={index} className="file-upload-dropzone-type">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <input
                id="fileInput"
                type="file"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="file-upload-input"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                disabled={loading}
              />
            </div>

            {/* Selected File Info */}
            {file && (
              <div className="file-upload-selected-file">
                <div className="file-upload-selected-file-row">
                  <div className="file-upload-selected-file-info">
                    <div className="file-upload-selected-file-icon">📎</div>
                    <div>
                      <div className="file-upload-selected-file-name">{file.name}</div>
                      <div className="file-upload-selected-file-size">Size: {Math.round(file.size / 1024)}KB</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="file-upload-selected-file-remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="file-upload-actions">
              <button
                type="submit"
                disabled={loading || !file}
                className="file-upload-submit"
              >
                {loading ? (
                  <>
                    <div className="file-upload-spinner"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="file-upload-submit-icon">📤</span>
                    Upload File
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  setMessage("")
                  const fileInput = document.getElementById("fileInput")
                  if (fileInput) fileInput.value = ""
                }}
                disabled={loading}
                className="file-upload-clear"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Guidelines Card */}
        <div className="file-upload-guidelines">
          <div className="file-upload-guidelines-header">
            <h3 className="file-upload-guidelines-title">
              <span className="file-upload-guidelines-title-icon">📋</span>
              Upload Guidelines
            </h3>
            <p className="file-upload-guidelines-desc">Please review these guidelines before uploading</p>
          </div>
          <div className="file-upload-guidelines-list">
            {[
              { icon: "📏", text: "Maximum file size: 10MB" },
              { icon: "📁", text: "Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP, RAR" },
              { icon: "🔒", text: "Files are automatically scanned for security" },
              { icon: "👤", text: "Uploaded files are linked to your account" },
              { icon: "🎫", text: "Files can be referenced in your support tickets" },
            ].map((item, index) => (
              <div key={index} className="file-upload-guideline-item">
                <span className="file-upload-guideline-icon">{item.icon}</span>
                <span className="file-upload-guideline-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUpload
