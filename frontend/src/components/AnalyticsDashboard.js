"use client"

import { useState, useEffect } from "react"
import "./styles/AnalyticsDashboard.css"

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    highPriorityTickets: 0,
    mediumPriorityTickets: 0,
    lowPriorityTickets: 0,
    avgResolutionTime: 0,
    ticketsByCategory: [],
    recentActivity: [],
    topAdmins: [],
    frequentIssues: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch analytics data
    Promise.all([
      fetch("http://localhost:5000/analytics/tickets"),
      fetch("http://localhost:5000/admin/tickets"),
      fetch("http://localhost:5000/analytics/frequent-issues"),
    ])
      .then(async ([analyticsRes, ticketsRes, issuesRes]) => {
        const analyticsData = await analyticsRes.json()
        const ticketsData = await ticketsRes.json()
        const issuesData = await issuesRes.json()

        const tickets = ticketsData.tickets || []

        // Calculate analytics
        const totalTickets = tickets.length
        const openTickets = tickets.filter((t) => t.status === "open").length
        const inProgressTickets = tickets.filter((t) => t.status === "in-progress").length
        const resolvedTickets = tickets.filter((t) => t.status === "resolved").length
        const closedTickets = tickets.filter((t) => t.status === "closed").length

        const highPriorityTickets = tickets.filter((t) => t.priority === "high").length
        const mediumPriorityTickets = tickets.filter((t) => t.priority === "medium").length
        const lowPriorityTickets = tickets.filter((t) => t.priority === "low").length

        // Group tickets by category
        const categoryGroups = tickets.reduce((acc, ticket) => {
          const category = ticket.category || "General"
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {})

        const ticketsByCategory = Object.entries(categoryGroups).map(([category, count]) => ({
          category,
          count,
        }))

        // Calculate average resolution time (mock calculation)
        const resolvedTicketsWithTime = tickets.filter((t) => t.status === "resolved" || t.status === "closed")
        const avgResolutionTime = resolvedTicketsWithTime.length > 0 ? Math.round(Math.random() * 48 + 12) : 0 // Mock: 12-60 hours

        setAnalytics({
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          highPriorityTickets,
          mediumPriorityTickets,
          lowPriorityTickets,
          avgResolutionTime,
          ticketsByCategory,
          recentActivity: tickets.slice(0, 5),
          topAdmins: [
            { name: "Admin 1", resolved: Math.floor(Math.random() * 20) + 5 },
            { name: "Admin 2", resolved: Math.floor(Math.random() * 15) + 3 },
            { name: "Admin 3", resolved: Math.floor(Math.random() * 10) + 2 },
          ],
          frequentIssues: issuesData.issues || [
            { issue: "Login Problems", count: 15 },
            { issue: "Password Reset", count: 12 },
            { issue: "Account Access", count: 8 },
            { issue: "Feature Request", count: 6 },
          ],
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="analytics-spinner"></div>
        <p className="analytics-loading-text">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="analytics-bg">
      {/* Header */}
      <div className="analytics-header">
        <h1 className="analytics-title">📊 Analytics Dashboard</h1>
        <p className="analytics-header-desc">Comprehensive insights into your support system</p>
      </div>

      {/* Overview Stats */}
      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">🎫</div>
          <h3 className="analytics-stat-number">{analytics.totalTickets}</h3>
          <p className="analytics-stat-label">Total Tickets</p>
        </div>
        <div className="analytics-stat-card pink">
          <div className="analytics-stat-icon">🔓</div>
          <h3 className="analytics-stat-number">{analytics.openTickets}</h3>
          <p className="analytics-stat-label">Open Tickets</p>
        </div>
        <div className="analytics-stat-card blue">
          <div className="analytics-stat-icon">⚡</div>
          <h3 className="analytics-stat-number">{analytics.inProgressTickets}</h3>
          <p className="analytics-stat-label">In Progress</p>
        </div>
        <div className="analytics-stat-card green">
          <div className="analytics-stat-icon">✅</div>
          <h3 className="analytics-stat-number">{analytics.resolvedTickets + analytics.closedTickets}</h3>
          <p className="analytics-stat-label">Resolved</p>
        </div>
      </div>

      <div className="analytics-row">
        {/* Priority Distribution */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">🎯 Priority Distribution</h3>
            <p className="analytics-card-desc">Breakdown of ticket priorities</p>
          </div>
          <div className="analytics-priority-list">
            <div className="analytics-priority-item high">
              <div className="analytics-priority-label">
                <div className="analytics-priority-dot high"></div>
                <span>High Priority</span>
              </div>
              <span className="analytics-priority-count high">{analytics.highPriorityTickets}</span>
            </div>
            <div className="analytics-priority-item medium">
              <div className="analytics-priority-label">
                <div className="analytics-priority-dot medium"></div>
                <span>Medium Priority</span>
              </div>
              <span className="analytics-priority-count medium">{analytics.mediumPriorityTickets}</span>
            </div>
            <div className="analytics-priority-item low">
              <div className="analytics-priority-label">
                <div className="analytics-priority-dot low"></div>
                <span>Low Priority</span>
              </div>
              <span className="analytics-priority-count low">{analytics.lowPriorityTickets}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">📈 Performance Metrics</h3>
            <p className="analytics-card-desc">Key performance indicators</p>
          </div>
          <div className="analytics-metrics-list">
            <div className="analytics-metric-item avg-time">
              <span className="analytics-metric-label">⏱️ Avg Resolution Time</span>
              <span className="analytics-metric-value avg-time">{analytics.avgResolutionTime}h</span>
            </div>
            <div className="analytics-metric-item resolution-rate">
              <span className="analytics-metric-label">✅ Resolution Rate</span>
              <span className="analytics-metric-value resolution-rate">
                {analytics.totalTickets > 0
                  ? Math.round(((analytics.resolvedTickets + analytics.closedTickets) / analytics.totalTickets) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="analytics-metric-item active-tickets">
              <span className="analytics-metric-label">🔄 Active Tickets</span>
              <span className="analytics-metric-value active-tickets">{analytics.openTickets + analytics.inProgressTickets}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-row">
        {/* Tickets by Category */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">📊 Tickets by Category</h3>
            <p className="analytics-card-desc">Distribution across categories</p>
          </div>
          {analytics.ticketsByCategory.length === 0 ? (
            <div className="analytics-empty">
              <div className="analytics-empty-icon">📭</div>
              <p>No data available</p>
            </div>
          ) : (
            <div className="analytics-category-list">
              {analytics.ticketsByCategory.map((item, index) => (
                <div key={index} className={`analytics-category-item color${index % 4}`}>
                  <span className="analytics-category-label">{item.category}</span>
                  <span className="analytics-category-count">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Frequent Issues */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">🔥 Frequent Issues</h3>
            <p className="analytics-card-desc">Most common problems reported</p>
          </div>
          <div className="analytics-issues-list">
            {analytics.frequentIssues.map((issue, index) => (
              <div key={index} className={`analytics-issue-item color${index}`}> 
                <div className="analytics-issue-label">
                  <span className="analytics-issue-rank">{index + 1}</span>
                  <span>{issue.issue}</span>
                </div>
                <span className="analytics-issue-count">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
