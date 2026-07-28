// frontend/src/components/ReadingForm.jsx

import React, { useState, useEffect } from 'react';

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

export default function ReadingForm({ onAddReading, isSubmitting }) {
  const [locality, setLocality] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [pmValue, setPmValue] = useState('');

  // ✅ CHANGE 1
  const [prevValue, setPrevValue] = useState(0);
  const [difference, setDifference] = useState(0);

  // ✅ CHANGE 2
  const [alarm, setAlarm] = useState(false);
  const [highCount, setHighCount] = useState(0);

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (locality) {
      const match = LOCALITY_DEVICES.find(item => item.name === locality);
      setDeviceId(match ? match.deviceId : '');
    } else {
      setDeviceId('');
    }
  }, [locality]);

  // 🔥 MAIN CHANGE HERE
  const handlePmChange = (value) => {
    const num = Number(value);

    // CHANGE 1 → difference
    setPrevValue(Number(pmValue) || 0);
    setDifference(num - (Number(pmValue) || 0));
    setPmValue(value);

    // CHANGE 2 → spike protection
    if (num > 100) {
      setHighCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setAlarm(true);
        }
        return newCount;
      });
    } else {
      setHighCount(0);
      setAlarm(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

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
      setValidationError('Impossible Value! PM Value must be between 0 and 500.');
      return;
    }

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

        <h5 className="fw-bold mb-3">Log Manual Reading</h5>

        {validationError && (
          <div className="alert alert-danger">{validationError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">

            <div className="col-md-4">
              <select
                className="form-select"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              >
                <option value="">Select Locality</option>
                {LOCALITY_DEVICES.map((item, idx) => (
                  <option key={idx} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <input
                type="text"
                value={deviceId}
                className="form-control"
                readOnly
              />
            </div>

            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="PM value"
                value={pmValue}
                onChange={(e) => handlePmChange(e.target.value)}
              />
            </div>
          </div>

          {/* ✅ CHANGE 1 OUTPUT */}
          <div className="mt-3">
            <p>Previous Value: {prevValue}</p>
            <p>Difference: {difference}</p>
          </div>

          {/* ✅ CHANGE 2 OUTPUT */}
          {alarm && (
            <p style={{ color: 'red', fontWeight: 'bold' }}>
              ⚠ Alarm Triggered (3 continuous high readings)
            </p>
          )}

          <button className="btn btn-primary mt-3" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}