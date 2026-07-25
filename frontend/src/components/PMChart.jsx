// frontend/src/components/PMChart.jsx
// Why it exists:
// This component displays historical Particulate Matter (PM) values over time on a line chart.
// Visual trends are essential for users to see whether air quality is improving or worsening.

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Chart.js requires explicit module registration
ChartJS.register(
  CategoryScale,   
  LinearScale,     
  PointElement,    
  LineElement,     
  Title,           
  Tooltip,         
  Legend,          
  Filler           
);

// Inputs: trendData (Array of readings)
// Outputs: JSX line chart element
export default function PMChart({ trendData }) {
  
  const labels = trendData.map(item => {
    const time = new Date(item.recorded_at);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const values = trendData.map(item => item.pm_value);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'PM Value Index',
        data: values,
        borderColor: '#2563EB',             // Primary SaaS Blue
        backgroundColor: 'rgba(37, 99, 235, 0.05)', // Very soft fill
        fill: true,                         
        tension: 0.4,                       // Smooth curved line
        borderWidth: 3,                   
        pointRadius: 0,                     // Hide points normally for a cleaner look
        pointHoverRadius: 6,                // Show points on hover
        pointBackgroundColor: '#FFFFFF',    
        pointBorderColor: '#2563EB',        
        pointBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        titleFont: { family: 'Poppins', size: 13, weight: '600' },
        bodyFont: { family: 'Poppins', size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const originalRecord = trendData[index];
            const localityText = originalRecord ? originalRecord.locality : 'Unknown Locality';
            return ` PM: ${context.parsed.y} (${localityText})`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#94A3B8',
          maxTicksLimit: 6,
          font: { family: 'Poppins', size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        grid: {
          color: 'rgba(226, 232, 240, 0.6)', // Very light grid lines
          drawBorder: false,
          borderDash: [5, 5],
        },
        ticks: {
          color: '#94A3B8',
          maxTicksLimit: 5,
          font: { family: 'Poppins', size: 11 },
          padding: 10
        }
      }
    }
  };

  return (
    <div className="card dashboard-card border-0 bg-white" style={{ height: '400px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold text-dark mb-1">PM Value Trend</h5>
          <p className="text-secondary small fw-medium mb-0">Moving average index across localities</p>
        </div>
        <div className="bg-light px-3 py-2 rounded-pill text-secondary fw-semibold border border-light" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          LAST 20 READINGS
        </div>
      </div>
      
      <div className="flex-grow-1" style={{ position: 'relative', height: '280px' }}>
        {trendData.length === 0 ? (
          <div className="d-flex flex-column h-100 align-items-center justify-content-center text-muted">
            <i className="bi bi-bar-chart text-secondary opacity-50 mb-2" style={{ fontSize: '2rem' }}></i>
            <span className="small fw-medium">Waiting for simulator data...</span>
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}
