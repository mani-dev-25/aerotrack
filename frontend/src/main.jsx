// frontend/src/main.jsx
// Why it exists:
// This is the bootstrap loader for the React application. It imports standard libraries,
// registers the CSS frameworks (Bootstrap 5 and Bootstrap Icons), and mounts the root App.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import CSS frameworks
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import our custom CSS variables and utility classes
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
