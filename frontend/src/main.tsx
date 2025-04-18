import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppWrapper } from './AppWrapper.tsx'
import './index.css'

// Simple check for factor-one in the URL and redirect if needed
if (window.location.pathname.includes('factor-one')) {
  console.log('Detected factor-one path, redirecting to sign-in...')
  window.location.href = '/sign-in'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)
