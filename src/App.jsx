import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePortal from './pages/HomePortal';
import LandingPage from './pages/LandingPage';
import MinatBacaLandingPage from './pages/MinatBacaLandingPage';
import SurveyPage from './pages/SurveyPage';
import DashboardPage from './pages/DashboardPage';
import PasswordGate from './components/PasswordGate';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePortal />} />
        
        {/* Protected Routes */}
        <Route element={<PasswordGate />}>
          <Route path="/literasi" element={<LandingPage />} />
          <Route path="/literasi/:lingkupParam" element={<SurveyPage type="literasi" />} />
          <Route path="/minatbaca" element={<MinatBacaLandingPage />} />
          <Route path="/minatbaca/:lingkupParam" element={<SurveyPage type="minatbaca" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
