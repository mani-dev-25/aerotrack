// frontend/src/App.jsx
// Why it exists:
// This is the root React component. It manages global state (readings list, dashboard metrics, 
// chart trends, loading, and error states), coordinates automatic 5s polling, and routes 
// between the Dashboard and the QA Test-Cases page.

import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Import custom components
import Navbar from './components/Navbar';
import DashboardCard from './components/DashboardCard';
import PMChart from './components/PMChart';
import ReadingTable from './components/ReadingTable';
import ReadingForm from './components/ReadingForm';
import TestCases from './components/TestCases';

// Backend endpoint base URL (React runs on Port 3000, Express on Port 5000)
const API_BASE_URL = 'http://localhost:5000/api';
const ROOT_URL = 'http://localhost:5000';

export default function App() {
  // ----------------------------------------------------
  // STATE DEFINITIONS
  // ----------------------------------------------------
  const [readings, setReadings] = useState([]);         // List of all loaded readings
  const [stats, setStats] = useState({                  // Level counters for summary cards
    good: 0, moderate: 0, unhealthy: 0, danger: 0, total: 0, averagePm: 0 
  });
  const [trendData, setTrendData] = useState([]);       // Recent chronological points for Chart.js
  const [isSimulatorActive, setIsSimulatorActive] = useState(false); // Live simulator indicator
  
  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  
  // UI UX States
  const [isLoading, setIsLoading] = useState(true);      // Table data loading spinner flag
  const [isSubmitting, setIsSubmitting] = useState(false); // Manual submit button loader flag
  const [serverError, setServerError] = useState('');     // Error alert message string
  const [toast, setToast] = useState({                  // Floating alert toast status
    show: false, message: '', type: 'success' 
  });

  // Dynamic greeting state
  const [greeting, setGreeting] = useState('');

  // ----------------------------------------------------
  // DATA FETCHING & API ACTIONS
  // ----------------------------------------------------

  // Why it exists:
  // Central function to update all sections of the dashboard simultaneously.
  // What it does:
  // Fetches readings list, card counts, and line chart trends in parallel.
  const refreshDashboardData = async (searchVal = searchQuery, levelVal = filterLevel) => {
    try {
      // 1. Fetch readings list with active filters appended
      const readingsRes = await axios.get(`${API_BASE_URL}/readings`, {
        params: { locality: searchVal, level: levelVal }
      });
      setReadings(readingsRes.data);

      // 2. Fetch aggregate stats counts
      const statsRes = await axios.get(`${API_BASE_URL}/readings/stats`);
      setStats(statsRes.data);

      // 3. Fetch recent PM trend lines
      const trendRes = await axios.get(`${API_BASE_URL}/readings/trend`);
      setTrendData(trendRes.data);

      // Reset server error if database queries were successful
      setServerError('');
    } catch (err) {
      console.error('API Error: Could not connect to Express backend.', err.message);
      setServerError('System Error: Unable to communicate with the Air Quality API server. Please make sure the backend is running and the database is configured.');
    } finally {
      setIsLoading(false);
    }
  };

  // Why it exists:
  // Initializes the background simulation on the Express backend.
  // What it does:
  // Fires a request to GET /simulate and updates the frontend indicator state.
  const activateBackendSimulator = async () => {
    try {
      const res = await axios.get(`${ROOT_URL}/simulate`);
      if (res.data.status === 'active') {
        setIsSimulatorActive(true);
      }
    } catch (err) {
      console.warn('Simulator Auto-Start failed. Backend may still be starting...', err.message);
    }
  };

  // Triggers simulator activation, dynamic greeting, and initial fetch on load.
  useEffect(() => {
    // Generate dynamic greeting
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting('Good Morning');
    else if (currentHour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Attempt to start simulator immediately
    activateBackendSimulator();

    // Do initial dashboard fetch
    refreshDashboardData();
  }, []);

  // Set up polling interval to fetch data every 5 seconds with active filters
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshDashboardData(searchQuery, filterLevel);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [searchQuery, filterLevel]);

  // Fetch data immediately when the user changes search or filter values, without waiting for the next 5s poll.
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    refreshDashboardData(val, filterLevel);
  };

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterLevel(val);
    refreshDashboardData(searchQuery, val);
  };

  const handleManualRefresh = () => {
    setIsLoading(true);
    refreshDashboardData();
  };

  // POSTs a manually typed reading from the ReadingForm component.
  const handleAddReading = async (readingData) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/readings`, readingData);
      showToastNotification(`New packet successfully saved for ${res.data.locality}! Level: ${res.data.level}.`, 'success');
      refreshDashboardData();
    } catch (err) {
      console.error('Error manual insert:', err);
      const errMsg = err.response?.data?.error || 'Failed to submit telemetry to database.';
      showToastNotification(errMsg, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToastNotification = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Calculate streak of consecutive unhealthy readings (PM > 150) to prevent false alarms
  let unhealthyStreak = 0;
  for (let i = 0; i < readings.length; i++) {
    if (readings[i].pm_value > 150) {
      unhealthyStreak++;
    } else {
      break; // Reset/Stop counting when a normal reading appears
    }
  }
  const isAlarmActive = unhealthyStreak >= 3;

  return (
    <Router>
      <div className="min-vh-100 d-flex flex-column pb-5">
        {/* Navbar Header */}
        <Navbar isSimulatorActive={isSimulatorActive} />

        <Routes>
          {/* Main Dashboard Router View */}
          <Route path="/" element={
            <div className="container">
              
              {/* Page Title Block */}
              <div className="d-flex flex-column mb-4 animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h3 className="fw-bold text-dark mb-0">{greeting} 👋</h3>
                  <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm border">
                    <i className="bi bi-wind text-primary"></i>
                    <span className="fw-medium text-secondary">Average PM:</span>
                    <span className="fw-bold text-dark">{stats.averagePm}</span>
                  </div>
                </div>
                <p className="text-secondary mb-0">Monitor neighbourhood air quality in real time.</p>
              </div>

              {/* Database connection failure warning banner */}
              {serverError && (
                <div className="alert alert-danger shadow-sm rounded-4 border-0 p-4 mb-4 d-flex align-items-start gap-3 animate-fade-in" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }} role="alert">
                  <div className="bg-danger bg-opacity-10 p-2 rounded-circle">
                    <i className="bi bi-x-circle-fill fs-3 text-danger"></i>
                  </div>
                  <div className="pt-1">
                    <h5 className="alert-heading fw-bold mb-1 text-danger">API Connectivity Lost</h5>
                    <p className="mb-0 text-dark small">{serverError}</p>
                  </div>
                </div>
              )}

              {/* Danger pollution alert banner */}
              {isAlarmActive && !serverError && (
                <div className="alert alert-warning border-0 shadow-sm rounded-4 p-4 mb-4 d-flex align-items-center gap-3 animate-fade-in" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
                  <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger shadow-sm">
                    <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 text-danger">High Pollution Alert (Sustained Danger Detected)</h6>
                    <p className="mb-0 small text-dark opacity-75">Sustained hazardous air quality levels detected ({unhealthyStreak} consecutive readings PM &gt; 150). Wearing masks outdoors is recommended.</p>
                  </div>
                </div>
              )}

              {/* SECTION 1: Summary Cards Grid */}
              <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                  <DashboardCard
                    title="Good Air"
                    count={stats.good}
                    icon="bi-emoji-smile"
                    statusType="good"
                    description="Healthy Environment"
                  />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                  <DashboardCard
                    title="Moderate"
                    count={stats.moderate}
                    icon="bi-emoji-neutral"
                    statusType="moderate"
                    description="Acceptable Quality"
                  />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                  <DashboardCard
                    title="Unhealthy"
                    count={stats.unhealthy}
                    icon="bi-emoji-frown"
                    statusType="unhealthy"
                    description="Reduced Air Quality"
                  />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                  <DashboardCard
                    title="Danger"
                    count={stats.danger}
                    icon="bi-exclamation-octagon"
                    statusType="danger"
                    description="Hazardous Level"
                  />
                </div>
              </div>

              {/* SECTION 2: Trend Graph */}
              <div className="row mb-4">
                <div className="col-12">
                  <PMChart trendData={trendData} />
                </div>
              </div>

              {/* SECTION 3: Filterable Readings Table */}
              <div className="row mb-4">
                <div className="col-12">
                  <ReadingTable
                    readings={readings}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    filterLevel={filterLevel}
                    onSearchChange={handleSearchChange}
                    onFilterChange={handleFilterChange}
                    onManualRefresh={handleManualRefresh}
                    onSimulatorToggle={activateBackendSimulator}
                  />
                </div>
              </div>

              {/* SECTION 4: Inline Add Reading Form */}
              <div className="row mb-5">
                <div className="col-12">
                  <ReadingForm
                    onAddReading={handleAddReading}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </div>

              {/* Simple Footer */}
              <div className="row mt-5 pt-4 border-top">
                <div className="col-12 d-flex justify-content-between align-items-center text-secondary small">
                  <span>Made with React, Express & MySQL</span>
                  <span>Version 1.0</span>
                </div>
              </div>

            </div>
          } />

          {/* QA Test Cases Interactive Router View */}
          <Route path="/test-cases" element={
            <TestCases API_BASE_URL={API_BASE_URL} />
          } />
        </Routes>

        {/* Floating Toast Notification Box */}
        {toast.show && (
          <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
            <div className={`toast show align-items-center text-white bg-${toast.type === 'danger' ? 'danger' : 'success'} border-0 shadow-lg rounded-3 animate-fade-in`} role="alert" aria-live="assertive" aria-atomic="true">
              <div className="d-flex p-1">
                <div className="toast-body small fw-medium d-flex align-items-center">
                  <i className={`bi ${toast.type === 'danger' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'} me-2 fs-5`}></i>
                  {toast.message}
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white me-2 m-auto" 
                  onClick={() => setToast(prev => ({ ...prev, show: false }))}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}
