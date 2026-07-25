// frontend/src/components/ReadingForm.jsx
// Why it exists:
// This component displays a form for manually logging air quality readings.
// It avoids modal popups, rendering as a clean inline card directly at the bottom of the page.
// It maps localities to their static device IDs automatically to simplify the user experience.

import React, { useState, useEffect } from 'react';

// List of Chennai localities and their matched Device IDs
const LOCALITY_DEVICES = [
  { name: 'Anna Nagar', deviceId: 'AQM-ANN-001' },
  { name: 'Adyar', deviceId: 'AQM-ADY-001' },
  { name: 'T Nagar', deviceId: 'AQM-TNG-001' },
  { name: 'Guindy', deviceId: 'AQM-GDY-001' },
  { name: 'Velachery', deviceId: 'AQM-VEL-001' },
  { name: 'Tambaram', deviceId: 'AQM-TBM-001' },

  { name: 'Medavakkam', deviceId: 'AQM-MDV-001' },
  { name: 'Pudhu Nagar', deviceId: 'AQM-PDN-001' },
  { name: 'Perumbakkam', deviceId: 'AQM-PBK-001' },
  { name: 'Pallikaranai', deviceId: 'AQM-PLK-001' },

  { name: 'Ponmar', deviceId: 'AQM-PON-001' },
  { name: 'Mambakkam', deviceId: 'AQM-MBK-001' },
  { name: 'Kelambakkam', deviceId: 'AQM-KEL-001' },
  { name: 'Navalur', deviceId: 'AQM-NAV-001' },
  { name: 'Siruseri', deviceId: 'AQM-SIR-001' },
  { name: 'Chromepet', deviceId: 'AQM-CHR-001' }
];

// Inputs:
// - onAddReading: Parent function to handle API post request
// - isSubmitting: Boolean indicating network load status
// Outputs: JSX Form card
export default function ReadingForm({ onAddReading, isSubmitting }) {
  const [locality, setLocality] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [pmValue, setPmValue] = useState('');
  
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (locality) {
      const match = LOCALITY_DEVICES.find(item => item.name === locality);
      setDeviceId(match ? match.deviceId : '');
    } else {
      setDeviceId('');
    }
  }, [locality]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (!locality) {
      setValidationError('Please select a locality from the dropdown.');
      return;
    }
    if (pmValue === '') {
      setValidationError('Please enter a recorded PM value.');
      return;
    }

    const parsedPm = parseInt(pmValue);
    if (isNaN(parsedPm) || parsedPm < 0 || parsedPm > 500) {
      setValidationError('Impossible Value! PM Value must be a valid integer between 0 and 500.');
      return;
    }

    // Submit
    onAddReading({
      locality,
      device_id: deviceId,
      pm_value: parsedPm
    });

    setPmValue('');
  };

  return (
    <div className="card dashboard-card border-0 bg-white">
      <div className="card-body p-2">
        <div className="d-flex align-items-center gap-3 mb-4 border-bottom border-light pb-3">
          <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary d-flex align-items-center justify-content-center">
            <i className="bi bi-pencil-square fs-5"></i>
          </div>
          <div>
            <h5 className="fw-bold text-dark mb-0">Log Manual Reading</h5>
            <p className="text-secondary small fw-medium mb-0">Submit a new sensor packet to the database</p>
          </div>
        </div>

        {/* Front-end validation error alert banner */}
        {validationError && (
          <div className="alert alert-danger d-flex align-items-center py-2 px-3 rounded-3 mb-4 small animate-fade-in border-0" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }} role="alert">
            <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
            <div className="text-danger fw-medium">{validationError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-4 mb-4">
            {/* Locality Dropdown Field */}
            <div className="col-md-4">
              <label className="form-label small text-secondary fw-semibold">Locality Name</label>
              <div className="input-icon-group">
                <i className="bi bi-geo-alt"></i>
                <select
                  className="form-select form-control-custom bg-light border-0"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">-- Choose Locality --</option>
                  {LOCALITY_DEVICES.map((item, idx) => (
                    <option key={idx} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Device ID (Auto-Mapped and Read-only) */}
            <div className="col-md-4">
              <label className="form-label small text-secondary fw-semibold">Mapped Device ID</label>
              <div className="input-icon-group">
                <i className="bi bi-cpu"></i>
                <input
                  type="text"
                  className="form-control form-control-custom bg-light border-0 text-muted font-monospace"
                  placeholder="Select locality first..."
                  value={deviceId}
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* PM Value Input Field */}
            <div className="col-md-4">
              <label className="form-label small text-secondary fw-semibold">PM Value (0 - 500)</label>
              <div className="input-icon-group">
                <i className="bi bi-speedometer2"></i>
                <input
                  type="number"
                  min="-100"
                  max="2000"
                  className="form-control form-control-custom bg-light border-0"
                  placeholder="e.g. 45"
                  value={pmValue}
                  onChange={(e) => setPmValue(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="d-flex justify-content-end mt-2 pt-3 border-top border-light">
            <button
              type="submit"
              className="btn btn-primary-custom btn-custom px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="fw-semibold">Logging Packet...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-arrow-up-fill fs-5"></i>
                  <span className="fw-semibold">Submit Telemetry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
