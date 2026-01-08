import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ isOpen, onClose, onSwitchToRegister, title, onLoginSuccess }) => {
    const navigate = useNavigate();
    const [isDoctorLogin, setIsDoctorLogin] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        // Use hardcoded email/password for testing if inputs are empty? No, let's use real inputs.
        // Wait, the form inputs are uncontrolled in the original code (no value binding or useState).
        // I need to get the values from the form.
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const response = await fetch('http://localhost:5000/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Map backend user to frontend expectations
                const userProfile = {
                    ...data.user,
                    name: data.user.username // Frontend uses 'name', backend uses 'username'
                };

                localStorage.setItem('userProfile', JSON.stringify(userProfile));

                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    onClose();
                    // Navigate based on detailed backend role
                    const targetRole = data.user.role === 'doctor' ? 'hospital' : 'patient';
                    navigate('/dashboard', {
                        replace: true,
                        state: { role: targetRole }
                    });
                }
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login Error:', error);
            setError('Server error. Please try again later.');
        }
    };

    const displayTitle = title || (isDoctorLogin ? "Doctor Login" : "Welcome Back");

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <h2 className="modal-title">{displayTitle}</h2>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" placeholder="Your Email" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="••••••••" />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Login
                    </button>

                    <div className="modal-footer">
                        <a href="#" className="forgot-password">Forgot Password?</a>
                        {!isDoctorLogin ? (
                            <>
                                <p>Don't have an account? <a href="#" style={{ color: '#009149', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); onSwitchToRegister('patient'); }}>Sign up</a></p>
                                <p><a href="#" style={{ color: '#009149', fontWeight: '500' }} onClick={(e) => { e.preventDefault(); setIsDoctorLogin(true); }}>Login as a doctor?</a></p>
                            </>
                        ) : (
                            <>
                                <p>Don't have an account? <a href="#" style={{ color: '#009149', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); onSwitchToRegister('doctor'); }}>Sign up</a></p>
                                <p><a href="#" style={{ color: '#009149', fontWeight: '500' }} onClick={(e) => { e.preventDefault(); setIsDoctorLogin(false); }}>Login as a patient?</a></p>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
