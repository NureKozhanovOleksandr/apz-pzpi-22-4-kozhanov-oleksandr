import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './configs/locale';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </CookiesProvider>
  </React.StrictMode>
);
