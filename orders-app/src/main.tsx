import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
