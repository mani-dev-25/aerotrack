// frontend/vite.config.js
// Why it exists:
// This file configures the Vite bundler for building the React application.
// What it does:
// Imports the React plugin to compile JSX files and sets default server parameters.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Configure Vite to use the official React plugin
  plugins: [react()],
  
  // Dev server settings
  server: {
    port: 3000, // Run the React server on port 3000
    host: true  // Allow listening on local network IP addresses
  }
});
