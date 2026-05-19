import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/index.css'
import './styles/blocknote-overrides.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#FFFFFF',
          color: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid rgba(0, 0, 0, 0.10)',
          fontFamily: 'NotionInter, Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          padding: '10px 14px',
          borderRadius: '12px',
          boxShadow: 'none',
        },
        success: {
          iconTheme: { primary: '#1AAE39', secondary: '#FFFFFF' },
        },
        error: {
          iconTheme: { primary: '#DD5B00', secondary: '#FFFFFF' },
        },
      }}
    />
  </React.StrictMode>,
)
