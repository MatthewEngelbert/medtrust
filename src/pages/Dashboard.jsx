import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PatientDashboard from '../components/PatientDashboard';
import HospitalDashboard from '../components/HospitalDashboard';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Default to 'patient' role, but prefer role passed from login
    const [role, setRole] = useState(location.state?.role || 'patient');

    useEffect(() => {
        if (location.state?.role) {
            setRole(location.state.role);
        }
    }, [location.state]);

    const handleLogout = () => {
        // Clear any auth tokens
        navigate('/', { replace: true });
    };

    return (
        <div style={{ position: 'relative' }}>
            {role === 'patient' ? (
                <PatientDashboard handleLogout={handleLogout} />
            ) : (
                <HospitalDashboard handleLogout={handleLogout} />
            )}
        </div>
    );
};

export default Dashboard;
