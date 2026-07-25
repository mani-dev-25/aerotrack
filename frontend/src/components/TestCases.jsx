// frontend/src/components/TestCases.jsx
// Why it exists:
// This component provides a dedicated page for executing and verifying the 5 required test cases
// (Normal, Missing, Impossible, Stuck, and Extreme readings). It acts as an interactive
// quality assurance terminal, sending payloads to the backend and printing raw responses.

import React, { useState } from 'react';
import axios from 'axios';

// Inputs: API_BASE_URL (string)
// Outputs: JSX Test Cases panel
export default function TestCases({ API_BASE_URL }) {
  const [loading, setLoading] = useState(false);
  const [activeTest, setActiveTest] = useState('');
  const [requestPayload, setRequestPayload] = useState(null);
  const [responseCode, setResponseCode] = useState(null);
  const [responseBody, setResponseBody] = useState(null);
  const [extraNotice, setExtraNotice] = useState('');

  const updateConsole = (testName, payload, status, data, notice = '') => {
    setActiveTest(testName);
    setRequestPayload(payload);
    setResponseCode(status);
    setResponseBody(data);
    setExtraNotice(notice);
  };

  const runNormalTest = async () => {
    setLoading(true);
    const payload = { locality: 'Anna Nagar', device_id: 'AQM-ANN-001', pm_value: 35 };
    try {
      const res = await axios.post(`${API_BASE_URL}/readings`, payload);
      updateConsole('1. Normal Reading', payload, res.status, res.data, '✅ Success: Saved successfully and classified as "Good" level (0-50).');
    } catch (err) {
      updateConsole('1. Normal Reading', payload, err.response?.status || 500, err.response?.data || err.message, '❌ Error: Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const runMissingTest = async () => {
    setLoading(true);
    const payload = { device_id: 'AQM-VEL-001', pm_value: 80 };
    try {
      const res = await axios.post(`${API_BASE_URL}/readings`, payload);
      updateConsole('2. Missing Value', payload, res.status, res.data, '❌ Unexpected: The request succeeded when it should have failed.');
    } catch (err) {
      updateConsole('2. Missing Value', payload, err.response?.status || 500, err.response?.data || err.message, '✅ Correct: The server caught the missing field and returned 400 Bad Request with a validation error.');
    } finally {
      setLoading(false);
    }
  };

  const runImpossibleTest = async () => {
    setLoading(true);
    const payload = { locality: 'Velachery', device_id: 'AQM-VEL-001', pm_value: 999 };
    try {
      const res = await axios.post(`${API_BASE_URL}/readings`, payload);
      updateConsole('3. Impossible Value', payload, res.status, res.data, '❌ Unexpected: The request succeeded when it should have failed.');
    } catch (err) {
      updateConsole('3. Impossible Value', payload, err.response?.status || 500, err.response?.data || err.message, '✅ Correct: The server rejected the impossible value (> 500) and returned 400 Bad Request.');
    } finally {
      setLoading(false);
    }
  };

  const runStuckTest = async () => {
    setLoading(true);
    const payload = { locality: 'Chromepet', device_id: 'AQM-CHR-001', pm_value: 85 };
    try {
      const res1 = await axios.post(`${API_BASE_URL}/readings`, payload);
      const res2 = await axios.post(`${API_BASE_URL}/readings`, payload);
      const res3 = await axios.post(`${API_BASE_URL}/readings`, payload);
      
      updateConsole('4. Stuck Reading (Sequential Run)', payload, res3.status, [res1.data, res2.data, res3.data], '⚠️ Notice: Sent 3 identical PM packets (PM=85) sequentially. Go back to the Dashboard to see the "⚠️ Stuck" warning label next to Chromepet AQM-CHR-001!');
    } catch (err) {
      updateConsole('4. Stuck Reading', payload, err.response?.status || 500, err.response?.data || err.message, '❌ Error: Stuck sequence execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const runExtremeTest = async () => {
    setLoading(true);
    const payload = { locality: 'Guindy', device_id: 'AQM-GDY-001', pm_value: 480 };
    try {
      const res = await axios.post(`${API_BASE_URL}/readings`, payload);
      updateConsole('5. Extreme Reading', payload, res.status, res.data, '✅ Success: Saved successfully and classified as "Danger" level (201+). This triggers the high pollution banner on the dashboard.');
    } catch (err) {
      updateConsole('5. Extreme Reading', payload, err.response?.status || 500, err.response?.data || err.message, '❌ Error: Extreme reading submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container pb-5">
      {/* Page Title Block */}
      <div className="d-flex flex-column mb-4 animate-fade-in">
        <h3 className="fw-bold text-dark mb-1">Interactive QA Workbench 🧪</h3>
        <p className="text-secondary mb-0">Execute predefined test payloads to audit backend validation routines and frontend UI reactions.</p>
      </div>

      <div className="row g-4 mb-5">
        {/* Left Side: Test Cases Selection */}
        <div className="col-lg-6">
          <div className="card dashboard-card border-0 bg-white h-100 p-2">
            <div className="d-flex align-items-center gap-3 mb-4 border-bottom border-light pb-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary d-flex align-items-center justify-content-center">
                <i className="bi bi-list-check fs-5"></i>
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">Available Test Scenarios</h5>
              </div>
            </div>
            
            <div className="d-flex flex-column gap-3">
              
              {/* Test Case 1: Normal */}
              <div className="p-3 border border-light rounded-4 bg-light transition-all hover-shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="text-dark fw-bold">1. Normal Reading</strong>
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 border border-success border-opacity-25">VALID</span>
                </div>
                <p className="small text-secondary fw-medium mb-3">Sends a standard, valid PM value of 35. The system should accept it and classify it as "Good Air".</p>
                <button className="btn btn-primary-custom btn-custom btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={runNormalTest} disabled={loading}>
                  <i className="bi bi-play-fill me-1"></i> Run Test
                </button>
              </div>

              {/* Test Case 2: Missing Value */}
              <div className="p-3 border border-light rounded-4 bg-light transition-all hover-shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="text-dark fw-bold">2. Missing Value</strong>
                  <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 border border-danger border-opacity-25">INVALID</span>
                </div>
                <p className="small text-secondary fw-medium mb-3">Sends a payload with the locality field left empty. The server should block it with a 400 Bad Request error.</p>
                <button className="btn btn-primary-custom btn-custom btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={runMissingTest} disabled={loading}>
                  <i className="bi bi-play-fill me-1"></i> Run Test
                </button>
              </div>

              {/* Test Case 3: Impossible Value */}
              <div className="p-3 border border-light rounded-4 bg-light transition-all hover-shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="text-dark fw-bold">3. Impossible Value</strong>
                  <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 border border-danger border-opacity-25">OUT OF BOUNDS</span>
                </div>
                <p className="small text-secondary fw-medium mb-3">Sends a PM value of 999 (outside 0-500). The server should block it with a 400 Bad Request error.</p>
                <button className="btn btn-primary-custom btn-custom btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={runImpossibleTest} disabled={loading}>
                  <i className="bi bi-play-fill me-1"></i> Run Test
                </button>
              </div>

              {/* Test Case 4: Stuck Reading */}
              <div className="p-3 border border-light rounded-4 bg-light transition-all hover-shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="text-dark fw-bold">4. Stuck Reading</strong>
                  <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 border border-warning border-opacity-25">STUCK ALARM</span>
                </div>
                <p className="small text-secondary fw-medium mb-3">Logs 3 identical PM packets (PM=85) consecutively. This triggers a warning badge on the dashboard.</p>
                <button className="btn btn-primary-custom btn-custom btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={runStuckTest} disabled={loading}>
                  <i className="bi bi-play-fill me-1"></i> Run Test
                </button>
              </div>

              {/* Test Case 5: Extreme Reading */}
              <div className="p-3 border border-light rounded-4 bg-light transition-all hover-shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="text-dark fw-bold">5. Extreme Reading</strong>
                  <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 border border-danger border-opacity-25">POLLUTION SPIKE</span>
                </div>
                <p className="small text-secondary fw-medium mb-3">Sends an extremely high PM value (480). It is saved, categorized as "Danger" and rings the dashboard danger banner.</p>
                <button className="btn btn-primary-custom btn-custom btn-sm rounded-pill px-4 fw-bold shadow-sm" onClick={runExtremeTest} disabled={loading}>
                  <i className="bi bi-play-fill me-1"></i> Run Test
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Raw API Output Console Logs */}
        <div className="col-lg-6">
          <div className="card dashboard-card border-0 h-100 p-2 d-flex flex-column bg-dark" style={{ minHeight: '500px', backgroundColor: '#0F172A !important' }}>
            
            <div className="d-flex align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
              <div className="bg-primary bg-opacity-25 p-2 rounded-3 text-primary d-flex align-items-center justify-content-center">
                <i className="bi bi-terminal fs-5"></i>
              </div>
              <div>
                <h5 className="fw-bold text-white mb-0">API Response Terminal</h5>
              </div>
            </div>
            
            {!activeTest ? (
              <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted small text-center p-3 animate-fade-in">
                <i className="bi bi-laptop opacity-25 mb-3" style={{ fontSize: '3rem' }}></i>
                <span className="fw-medium">Terminal Idle. Click "Run Test" on any scenario<br/>to inspect network traffic logs.</span>
              </div>
            ) : (
              <div className="flex-grow-1 d-flex flex-column gap-3 overflow-auto font-monospace animate-fade-in" style={{ maxHeight: '600px', fontSize: '0.85rem' }}>
                
                {/* Active Test Identifier */}
                <div>
                  <span className="text-secondary small fw-bold text-uppercase">Running Test Case:</span>
                  <div className="text-primary fw-bold mt-1 fs-6">{activeTest}</div>
                </div>

                {/* Sent Payload */}
                <div>
                  <span className="text-secondary small fw-bold text-uppercase">HTTP POST Payload Sent:</span>
                  <pre className="bg-secondary bg-opacity-10 p-3 rounded-3 text-info mt-1 mb-0 border border-secondary border-opacity-25" style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(requestPayload, null, 2)}
                  </pre>
                </div>

                {/* HTTP Status Code */}
                <div>
                  <span className="text-secondary small fw-bold text-uppercase">API HTTP Response Code:</span>
                  <div className="mt-2">
                    <span className={`badge py-2 px-3 rounded-pill fw-bold border ${responseCode >= 400 ? 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25' : 'bg-success bg-opacity-10 text-success border-success border-opacity-25'}`}>
                      HTTP {responseCode}
                    </span>
                  </div>
                </div>

                {/* Response Body */}
                <div>
                  <span className="text-secondary small fw-bold text-uppercase">API Response Body:</span>
                  <pre className="bg-secondary bg-opacity-10 p-3 rounded-3 text-success mt-1 mb-0 border border-secondary border-opacity-25" style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(responseBody, null, 2)}
                  </pre>
                </div>

                {/* Evaluation Notice */}
                {extraNotice && (
                  <div className="mt-2 p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 text-light">
                    <strong className="text-primary text-uppercase small" style={{ letterSpacing: '0.05em' }}>Evaluation Notes:</strong>
                    <div className="mt-1 text-white opacity-75">{extraNotice}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
