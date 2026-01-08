import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientDashboard from '../components/PatientDashboard';
import HospitalDashboard from '../components/HospitalDashboard';
import './Dashboard.css';

import Login from '../components/Login';

const Dashboard = () => {
    const navigate = useNavigate();
    // Default to 'patient' role
    const [role, setRole] = useState('patient');
    const [isHospitalLoginOpen, setIsHospitalLoginOpen] = useState(false);

    const handleLogout = () => {
        // Clear any auth tokens
        navigate('/', { replace: true });
    };

    const handleSwitchToHospital = () => {
        if (role === 'patient') {
            setIsHospitalLoginOpen(true);
        } else {
            setRole('patient');
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {role === 'patient' ? (
                <PatientDashboard handleLogout={handleLogout} />
            ) : (
                <HospitalDashboard handleLogout={handleLogout} />
            )}

            <Login
                isOpen={isHospitalLoginOpen}
                onClose={() => setIsHospitalLoginOpen(false)}
                title="Hospital Staff Login"
                onLoginSuccess={() => {
                    setRole('hospital');
                    setIsHospitalLoginOpen(false);
                }}
            />

            {/* Temporary Dev Toggle Button */}
            {/* Delete Later */}
            <button
                onClick={handleSwitchToHospital}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999,
                    padding: '10px 20px',
                    backgroundColor: '#1e293b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                }}
            >
                Switch to {role === 'patient' ? 'Hospital' : 'Patient'} View
            </button>
            {/* Delete Later */}
        </div>
    );
};

export default Dashboard;
