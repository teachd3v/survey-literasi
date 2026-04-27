import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePortal from './pages/HomePortal';
import LandingPage from './pages/LandingPage';
import MinatBacaLandingPage from './pages/MinatBacaLandingPage';
import SurveyPage from './pages/SurveyPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePortal />} />
        <Route path="/literasi" element={<LandingPage />} />
        <Route path="/literasi/:lingkupParam" element={<SurveyPage type="literasi" />} />
        <Route path="/minatbaca" element={<MinatBacaLandingPage />} />
        <Route path="/minatbaca/:lingkupParam" element={<SurveyPage type="minatbaca" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
