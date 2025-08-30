import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { RouteProvider } from './contexts/RouteContext';
import App from './App';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouteProvider>
        <App />
      </RouteProvider>
    </AuthProvider>
  </React.StrictMode>
);
