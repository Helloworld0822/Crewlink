import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function getInitialColorMode() {
  const stored = localStorage.getItem('colorMode')
  if (stored === 'night' || stored === 'day') {
    return stored
  }

  return 'night'
}

function getThemeColors() {
  return getInitialColorMode() === 'night'
    ? { background: '#161a22', color: '#f8fafc', border: '#2a3140' }
    : { background: 'white', color: 'black', border: '#ddd' }
}

// Global error overlay to surface runtime errors in the page
window.addEventListener('error', (ev) => {
  const existing = document.getElementById('global-error-overlay')
  if (existing) existing.remove()
  const colors = getThemeColors()
  const d = document.createElement('div')
  d.id = 'global-error-overlay'
  d.style.position = 'fixed'
  d.style.left = '0'
  d.style.top = '0'
  d.style.right = '0'
  d.style.background = colors.background
  d.style.color = colors.color
  d.style.zIndex = '99999'
  d.style.padding = '16px'
  d.style.borderBottom = `1px solid ${colors.border}`
  d.innerText = `Error: ${ev.message} at ${ev.filename}:${ev.lineno}:${ev.colno}`
  document.body.prepend(d)
})
window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
  const existing = document.getElementById('global-error-overlay')
  if (existing) existing.remove()
  const colors = getThemeColors()
  const d = document.createElement('div')
  d.id = 'global-error-overlay'
  d.style.position = 'fixed'
  d.style.left = '0'
  d.style.top = '0'
  d.style.right = '0'
  d.style.background = colors.background
  d.style.color = colors.color
  d.style.zIndex = '99999'
  d.style.padding = '16px'
  d.style.borderBottom = `1px solid ${colors.border}`
  d.innerText = `Unhandled Rejection: ${ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason)}`
  document.body.prepend(d)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
