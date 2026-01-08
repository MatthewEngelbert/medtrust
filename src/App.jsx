import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import BlockchainDashboard from './components/Blockchain/BlockchainDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/blockchain" element={<BlockchainDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
