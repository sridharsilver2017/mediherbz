import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Auto-hiding scrollbar trigger: shows scrollbar during active scrolling, fades out when idle
let scrollTimeout: ReturnType<typeof setTimeout> | undefined;
window.addEventListener(
  'scroll',
  () => {
    document.body.classList.add('is-scrolling');
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 700);
  },
  { passive: true, capture: true }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
