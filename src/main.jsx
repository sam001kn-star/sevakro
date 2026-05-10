import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { loadSavedTheme } from '@/pages/admin/ThemeManager';

// Apply saved theme before render to avoid flash
loadSavedTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)