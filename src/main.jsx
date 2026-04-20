import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#FFFFFF',
          color: '#1F1E1C',
          border: '1px solid #E3DFD3',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          padding: '10px 14px',
          borderRadius: '10px',
          boxShadow: 'none',
        },
        success: {
          iconTheme: { primary: '#2F7D5B', secondary: '#FFFFFF' },
        },
        error: {
          iconTheme: { primary: '#B54232', secondary: '#FFFFFF' },
        },
      }}
    />
  </React.StrictMode>,
)
