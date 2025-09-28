// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
// We will NOT import index.css for this test.
import './index.css'; 
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// HIDE THE PRE-LOADER ONCE REACT IS READY
const preloader = document.getElementById('pre-react-loader');
if (preloader) {
  preloader.style.display = 'none';
}