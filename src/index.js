import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('ServiceWorker registered: ', reg);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
