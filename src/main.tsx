import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import "./firebase"; // Αυτό αναγκάζει την εφαρμογή να διαβάσει το αρχείο και να ορίσει το window.db

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
