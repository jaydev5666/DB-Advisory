import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Services from './components/Services';
import Contact from './components/Contact';
import About from './components/About';
import CardDetail from './components/CardDetail';
import AdminPanel from './components/AdminPanel';
import { api } from './services/api';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  useEffect(() => {
    api.trackVisit().catch(err => console.error("Visit tracking failed", err));
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/detail/:type" element={<CardDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
