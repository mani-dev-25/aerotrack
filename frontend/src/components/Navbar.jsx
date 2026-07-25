// frontend/src/components/Navbar.jsx
// Why it exists:
// This component provides the top navigation bar for the SaaS application, giving users
// easy access to the main dashboard and the test-cases page. It also shows a live status indicator, clock, and profile.

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

// Inputs: isSimulatorActive (boolean)
// Outputs: JSX Navbar element
export default function Navbar({ isSimulatorActive }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <nav className="navbar navbar-expand-lg bg-white py-3 mb-4 shadow-sm sticky-top border-bottom border-light">
      <div className="container">
        {/* Brand logo / Name */}
        <NavLink className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-flex align-items-center justify-content-center">
            <i className="bi bi-wind fs-4"></i>
          </div>
          <div className="d-flex flex-column justify-content-center">
            <span className="fw-bold fs-5 text-dark" style={{ lineHeight: '1.2' }}>Aero<span className="text-primary">Track</span></span>
            <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: '500', letterSpacing: '0.02em' }}>Air Quality Monitoring Dashboard</span>
          </div>
        </NavLink>
        
        {/* Mobile menu toggle button */}
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarText" 
          aria-controls="navbarText" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible menu items */}
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2 mt-3 mt-lg-0">
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 py-2 rounded-3 fw-medium transition-all ${isActive ? 'bg-primary bg-opacity-10 text-primary fw-semibold' : 'text-secondary'}`}
                to="/"
              >
                <i className="bi bi-grid-1x2-fill me-2"></i> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link px-3 py-2 rounded-3 fw-medium transition-all ${isActive ? 'bg-primary bg-opacity-10 text-primary fw-semibold' : 'text-secondary'}`}
                to="/test-cases"
              >
                <i className="bi bi-terminal-fill me-2"></i> Test Cases
              </NavLink>
            </li>
          </ul>
          
          {/* Status Badge, Clock & Profile */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0 pb-2 pb-lg-0">
            {/* Live Indicator */}
            <div className={`d-flex align-items-center px-3 py-2 rounded-pill border ${isSimulatorActive ? 'bg-success bg-opacity-10 border-success border-opacity-25 text-success' : 'bg-warning bg-opacity-10 border-warning border-opacity-25 text-warning'}`}>
              <span className={`pulse-live me-2 ${isSimulatorActive ? 'bg-success' : 'bg-warning'}`}></span>
              <span className="font-monospace fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                {isSimulatorActive ? 'LIVE STATUS' : 'OFFLINE'}
              </span>
            </div>

            {/* Clock */}
            <div className="d-none d-md-flex flex-column align-items-end border-end pe-3 border-light">
              <span className="text-dark fw-semibold small" style={{ lineHeight: '1.2' }}>{formattedTime}</span>
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>{formattedDate}</span>
            </div>
            
            {/* User Profile */}
            <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '38px', height: '38px', fontSize: '0.85rem' }}>
                MK
              </div>
              <div className="d-none d-lg-flex flex-column justify-content-center">
                <span className="text-dark fw-semibold" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>Manikandan</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Admin</span>
              </div>
              <i className="bi bi-chevron-down text-muted small d-none d-lg-block ms-1"></i>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
