"use client"

import "./styles/common.css"

function Home({ setView }) {
  return (
    <div className="home-container">
      {/* Hero Background with Animated Elements */}
      <div className="home-hero-bg">
        <div className="home-floating-shapes">
          <div className="home-shape home-shape-1"></div>
          <div className="home-shape home-shape-2"></div>
          <div className="home-shape home-shape-3"></div>
          <div className="home-shape home-shape-4"></div>
        </div>
        
        {/* Main Content */}
        <div className="home-content">
          {/* Hero Section */}
          <div className="home-hero">
            <h1 className="home-hero-title">
              AI-Enhanced
              <span className="home-hero-title-highlight"> Support Ticket System</span>
            </h1>
            <p className="home-hero-subtitle">
              Experience the future of customer support with intelligent ticket management, real-time tracking, and seamless communication
            </p>
            
            {/* CTA Buttons */}
            <div className="home-cta-section">
              <button onClick={() => setView("login-user")} className="home-cta-primary">
                <span className="home-cta-icon">👤</span>
                <div className="home-cta-text">
                  <span className="home-cta-label">Login as User</span>
                  <span className="home-cta-desc">Access your tickets</span>
                </div>
              </button>
              
              <div className="home-cta-divider">
                <span className="home-cta-divider-text">or</span>
              </div>
              
              <button onClick={() => setView("login-admin")} className="home-cta-secondary">
                <span className="home-cta-icon">👨‍💼</span>
                <div className="home-cta-text">
                  <span className="home-cta-label">Login as Admin</span>
                  <span className="home-cta-desc">Manage support</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Features Grid - Single Line */}
          <div className="home-features-row">
            <div className="home-feature-card">
              <div className="home-feature-icon">⚡</div>
              <h3 className="home-feature-title">Lightning Fast</h3>
              <p className="home-feature-desc">Instant ticket creation and real-time updates</p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">🤖</div>
              <h3 className="home-feature-title">AI Powered</h3>
              <p className="home-feature-desc">Intelligent categorization and smart routing</p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">📊</div>
              <h3 className="home-feature-title">Analytics</h3>
              <p className="home-feature-desc">Comprehensive insights and performance metrics</p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">🔒</div>
              <h3 className="home-feature-title">Secure</h3>
              <p className="home-feature-desc">Enterprise-grade security and data protection</p>
            </div>
          </div>
          
          {/* Signup Section */}
          <div className="home-signup-section">
            <div className="home-signup-content">
              <h2 className="home-signup-title">Ready to get started?</h2>
              <p className="home-signup-subtitle">Join thousands of users who trust our platform</p>
              
              <div className="home-signup-buttons">
                <button onClick={() => setView("signup-user")} className="home-signup-btn home-signup-user">
                  <span className="home-signup-btn-icon">👤</span>
                  <div className="home-signup-btn-content">
                    <span className="home-signup-btn-label">Sign up as User</span>
                    <span className="home-signup-btn-desc">Create support tickets</span>
                  </div>
                </button>
                
                <button onClick={() => setView("signup-admin")} className="home-signup-btn home-signup-admin">
                  <span className="home-signup-btn-icon">👨‍💼</span>
                  <div className="home-signup-btn-content">
                    <span className="home-signup-btn-label">Sign up as Admin</span>
                    <span className="home-signup-btn-desc">Manage support team</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="home-stats-section">
            <div className="home-stat-item">
              <div className="home-stat-number">10K+</div>
              <div className="home-stat-label">Tickets Resolved</div>
            </div>
            <div className="home-stat-item">
              <div className="home-stat-number">99.9%</div>
              <div className="home-stat-label">Uptime</div>
            </div>
            <div className="home-stat-item">
              <div className="home-stat-number">24/7</div>
              <div className="home-stat-label">Support</div>
            </div>
            <div className="home-stat-item">
              <div className="home-stat-number">5⭐</div>
              <div className="home-stat-label">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
