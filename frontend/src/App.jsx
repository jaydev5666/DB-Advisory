import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Services from './components/Services';
import Contact from './components/Contact';
import About from './components/About';
import CardDetail from './components/CardDetail';
import AdminPanel from './components/AdminPanel';
import WealthDashboard from './components/WealthDashboard';
import Screener from './components/Screener';
import { api } from './services/api';
import MoltenMetal from './components/MoltenMetal';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  useEffect(() => {
    api.trackVisit().catch(err => console.error("Visit tracking failed", err));
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -10, pointerEvents: 'none', opacity: 0.08 }}>
          <MoltenMetal
            color1="#0052cc"
            color2="#00daff"
            color3="#ffffff"
            speed={0.12}
            scale={4}
            detail={3}
            glow={1.5}
            coreSize={0.12}
            swirl={1.2}
            fold={-0.2}
            blackPoint={0.03}
            brightness={1.2}
            colorMode="frost"
            grain={true}
            grainIntensity={0.03}
            mouseInteraction={true}
            mouseStrength={0.25}
            opacity={1.0}
          />
        </div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/screener" element={<Screener />} />
          <Route path="/detail/:type" element={<CardDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/wealth-portal" element={<WealthDashboard />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
