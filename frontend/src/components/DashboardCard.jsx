// frontend/src/components/DashboardCard.jsx
// Why it exists:
// This component displays a single metric statistic card on the dashboard.
// It is reusable and receives title, count, status-level style type, and icon arguments.

import React from 'react';

// Inputs:
// - title: "Good" | "Moderate" | "Unhealthy" | "Danger"
// - count: Number of logged readings in this category
// - icon: Bootstrap Icon class string (e.g., "bi-emoji-smile")
// - statusType: Used to assign corresponding CSS variables ('good', 'moderate', 'unhealthy', 'danger')
// - description: Range description (e.g., "Healthy Environment")
// Outputs: JSX dashboard card element
export default function DashboardCard({ title, count, icon, statusType, description }) {
  return (
    <div className="card dashboard-card h-100 position-relative border-0 bg-white">
      <div className="card-body p-4 d-flex flex-column justify-content-between h-100">
        <div>
          <div className="d-flex justify-content-between align-items-start mb-3">
            {/* Status Title */}
            <h6 className="card-subtitle text-muted fw-semibold text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.8rem' }}>
              {title}
            </h6>
            
            {/* Colored Icon Circle */}
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
              style={{ 
                width: '46px', 
                height: '46px', 
                backgroundColor: `var(--status-${statusType}-bg)`,
                color: `var(--status-${statusType}-text)`,
                border: `1px solid var(--status-${statusType}-border)`
              }}
            >
              <i className={`bi ${icon} fs-4`}></i>
            </div>
          </div>
          
          {/* Count Value */}
          <h3 className="card-title fw-bold text-dark mb-1" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
            {count}
          </h3>
          <p className="text-secondary small fw-medium mb-0">Readings</p>
        </div>
        
        {/* PM index range guidance / Description */}
        <div className="mt-4 pt-3 border-top border-light d-flex align-items-center gap-2">
          <i className="bi bi-info-circle text-muted" style={{ fontSize: '0.85rem' }}></i>
          <span className="text-secondary fw-medium" style={{ fontSize: '0.8rem' }}>{description}</span>
        </div>
      </div>
    </div>
  );
}
