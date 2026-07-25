// frontend/src/components/ReadingTable.jsx
// Why it exists:
// This component displays a list of air quality logs in a structured tabular format.
// It integrates search and filtering inputs, loader spinners, empty-state illustrations,
// and supports expanding a row to inspect reading details without modal popups.

import React, { useState } from 'react';

// Inputs:
// - readings: Array of reading rows fetched from backend
// - isLoading: Boolean flag to show loading spinner
// - onSearchChange: Function triggered on search keystrokes
// - onFilterChange: Function triggered on status level select dropdown
// - onManualRefresh: Function to manually trigger data fetch
// - onSimulatorToggle: Function to activate backend simulator loop
// - searchQuery: Current search input text
// - filterLevel: Current filtered status value
// Outputs: JSX Reading Table element
export default function ReadingTable({ 
  readings, 
  isLoading, 
  onSearchChange, 
  onFilterChange, 
  onManualRefresh,
  onSimulatorToggle,
  searchQuery, 
  filterLevel 
}) {
  const [expandedId, setExpandedId] = useState(null);

  const handleToggleExpand = (readingId) => {
    if (expandedId === readingId) {
      setExpandedId(null);
    } else {
      setExpandedId(readingId);
    }
  };

  const checkIsStuck = (deviceId) => {
    const deviceLogs = readings.filter(r => r.device_id === deviceId);
    if (deviceLogs.length < 3) return false;
    
    const val1 = deviceLogs[0].pm_value;
    const val2 = deviceLogs[1].pm_value;
    const val3 = deviceLogs[2].pm_value;
    return val1 === val2 && val2 === val3;
  };

  const getRecommendation = (level) => {
    switch (level) {
      case 'Good':
        return '🌿 Excellent air quality. Perfect day for outdoor activities, sports, and ventilation.';
      case 'Moderate':
        return '🟡 Air quality is acceptable. Extremely sensitive people should consider reducing prolonged heavy outdoor exertion.';
      case 'Unhealthy':
        return '🟠 Reduced air quality. Sensitive groups may experience health effects. Wear protective masks near heavy traffic.';
      case 'Danger':
        return '🔴 Hazardous air quality alert! Avoid outdoor activities. Close windows and run indoor air purifiers.';
      default:
        return 'No advice available.';
    }
  };

  return (
    <div className="card dashboard-card p-0 border-0 overflow-hidden bg-white mb-4">
      
      {/* Table Header containing Search and Filter Controls Toolbar */}
      <div className="card-header border-bottom border-light bg-white p-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
          
          <div>
            <h5 className="fw-bold text-dark mb-1">Telemetry Logs</h5>
            <p className="text-secondary small fw-medium mb-0">Search and filter active locality recordings</p>
          </div>
          
          {/* Horizontal Toolbar */}
          <div className="d-flex flex-wrap align-items-center gap-3">
            
            {/* Search Input with Icon */}
            <div className="input-icon-group" style={{ width: '220px' }}>
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="form-control form-control-custom bg-light border-0"
                placeholder="Search Locality..."
                value={searchQuery}
                onChange={onSearchChange}
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="input-icon-group" style={{ width: '160px' }}>
              <i className="bi bi-funnel"></i>
              <select
                className="form-select form-control-custom bg-light border-0"
                value={filterLevel}
                onChange={onFilterChange}
              >
                <option value="">All Levels</option>
                <option value="Good">Good</option>
                <option value="Moderate">Moderate</option>
                <option value="Unhealthy">Unhealthy</option>
                <option value="Danger">Danger</option>
              </select>
            </div>

            {/* Vertical Divider */}
            <div className="d-none d-sm-block border-start mx-1" style={{ height: '24px' }}></div>
            
            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <button 
                className="btn btn-light btn-custom d-flex align-items-center justify-content-center text-secondary border border-light" 
                onClick={onManualRefresh}
                title="Refresh Data"
                style={{ width: '42px', height: '42px', padding: '0' }}
              >
                <i className={`bi bi-arrow-clockwise fs-5 ${isLoading ? 'spin-anim' : ''}`}></i>
              </button>
              
              <button 
                className="btn btn-primary-custom btn-custom d-flex align-items-center gap-2"
                onClick={onSimulatorToggle}
              >
                <i className="bi bi-play-circle-fill"></i>
                <span className="fw-semibold">Simulator</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Table Body */}
      <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {isLoading && readings.length === 0 ? (
          // Skeleton Loader State
          <div className="p-4 d-flex flex-column gap-3">
             <div className="skeleton-box" style={{ height: '40px' }}></div>
             <div className="skeleton-box" style={{ height: '40px' }}></div>
             <div className="skeleton-box" style={{ height: '40px' }}></div>
             <div className="skeleton-box" style={{ height: '40px' }}></div>
          </div>
        ) : readings.length === 0 ? (
          // Empty State illustration 
          <div className="text-center py-5 px-4 animate-fade-in" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style={{ width: '80px', height: '80px', color: '#CBD5E1' }}>
              <i className="bi bi-inbox fs-1"></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">No Readings Found</h5>
            <p className="text-secondary small fw-medium mb-4">Start by adding your first air quality reading or running the simulator.</p>
            {(searchQuery || filterLevel) && (
              <button 
                className="btn btn-light btn-custom text-primary border-primary border-opacity-25 bg-primary bg-opacity-10"
                onClick={() => {
                  onSearchChange({ target: { value: '' } });
                  onFilterChange({ target: { value: '' } });
                }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <table className="table table-custom table-hover position-relative">
            <thead className="sticky-top bg-light shadow-sm" style={{ zIndex: '2' }}>
              <tr>
                <th style={{ width: '15%' }}>Device ID</th>
                <th style={{ width: '25%' }}>Locality</th>
                <th style={{ width: '15%' }}>PM Value</th>
                <th style={{ width: '15%' }}>Status Level</th>
                <th style={{ width: '20%' }}>Recorded Time</th>
                <th style={{ width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((item) => {
                const isStuck = checkIsStuck(item.device_id);
                const isExpanded = expandedId === item.reading_id;
                
                // Assign level badges dynamically
                let badgeClass = 'badge-status-good';
                if (item.level === 'Moderate') badgeClass = 'badge-status-moderate';
                if (item.level === 'Unhealthy') badgeClass = 'badge-status-unhealthy';
                if (item.level === 'Danger') badgeClass = 'badge-status-danger';

                return (
                  <React.Fragment key={item.reading_id}>
                    {/* Primary Row */}
                    <tr 
                      className={`cursor-pointer ${isExpanded ? 'bg-primary bg-opacity-10' : ''}`} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleExpand(item.reading_id)}
                    >
                      <td>
                        <span className="badge bg-light text-dark border border-secondary border-opacity-25 px-2 py-1 rounded-3 font-monospace fw-semibold shadow-sm">
                          {item.device_id}
                        </span>
                        {isStuck && (
                          <span 
                            className="badge bg-warning text-dark ms-2 rounded-3 shadow-sm" 
                            title="Sensor values stuck! Same PM generated 3+ times in a row."
                            style={{ fontSize: '0.65rem' }}
                          >
                            ⚠️ Stuck
                          </span>
                        )}
                      </td>
                      <td className="fw-semibold text-dark">{item.locality}</td>
                      <td>
                        <span className="fw-bold fs-6 text-dark">{item.pm_value}</span>
                        <span className="text-muted ms-1 small fw-medium">PM</span>
                      </td>
                      <td>
                        <span className={`badge-status ${badgeClass}`}>
                          {item.level}
                        </span>
                      </td>
                      <td className="text-secondary small fw-medium">
                        {new Date(item.recorded_at).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-light rounded-circle text-primary border border-light shadow-sm d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleToggleExpand(item.reading_id);
                          }}
                        >
                          <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>
                      </td>
                    </tr>
                    
                    {/* Details Row (Conditionally expanded) */}
                    {isExpanded && (
                      <tr className="bg-light">
                        <td colSpan="6" className="p-4 border-bottom border-light">
                          <div className="card card-details border-0 shadow-sm p-4 bg-white animate-fade-in">
                            <h6 className="fw-bold border-bottom border-light pb-3 mb-3 text-dark">
                              <i className="bi bi-file-earmark-bar-graph-fill text-primary me-2"></i>
                              Locality Analysis Report: <span className="text-primary">{item.locality}</span>
                            </h6>
                            
                            <div className="row g-4 mb-4">
                              <div className="col-sm-6 col-md-3">
                                <span className="text-muted d-block small fw-medium mb-1">Device Sensor</span>
                                <span className="font-monospace fw-semibold text-dark px-2 py-1 bg-light rounded-3 border">{item.device_id}</span>
                              </div>
                              <div className="col-sm-6 col-md-3">
                                <span className="text-muted d-block small fw-medium mb-1">Particulate Index</span>
                                <span className="fw-bold text-dark fs-5">{item.pm_value} <span className="fs-6 text-muted">PM</span></span>
                              </div>
                              <div className="col-sm-6 col-md-3">
                                <span className="text-muted d-block small fw-medium mb-1">Assigned Level</span>
                                <span className={`badge-status ${badgeClass}`}>
                                  {item.level}
                                </span>
                              </div>
                              <div className="col-sm-6 col-md-3">
                                <span className="text-muted d-block small fw-medium mb-1">Recorded On</span>
                                <span className="text-dark fw-medium small">
                                  {new Date(item.recorded_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-primary bg-opacity-10 p-3 rounded-3 border border-primary border-opacity-25">
                              <span className="text-primary d-block small fw-bold mb-1 text-uppercase" style={{ letterSpacing: '0.05em' }}>Health Recommendation</span>
                              <span className="text-dark fw-medium small">{getRecommendation(item.level)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {/* CSS animation for the manual refresh spinner */}
      <style>{`
        .spin-anim {
          animation: rotation 1s infinite linear;
        }
        @keyframes rotation {
          from { transform: rotate(0deg); }
          to { transform: rotate(359deg); }
        }
      `}</style>
    </div>
  );
}
