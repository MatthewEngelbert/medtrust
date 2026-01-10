import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ isOpen, onClose, onSwitchToRegister, title, onLoginSuccess }) => {
    const navigate = useNavigate();
    const [isDoctorLogin, setIsDoctorLogin] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        // ... existing login logic ...
        e.preventDefault();
        setError('');
        const email = e.target.email.value;
        const password = e.target.password.value;
        // ...
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Check for Role Mismatch
                if (isDoctorLogin && data.user.role !== 'doctor') {
                    setError('Akun anda tidak ada dalam daftar dokter');
                    return;
                }
                if (!isDoctorLogin && data.user.role === 'doctor') {
                    setError('Akun anda tidak ada dalam daftar patient');
                    return;
                }

                // ... existing success logic ...
                const userProfile = {
                    ...data.user,
                    name: data.user.username
                };

                localStorage.setItem('userProfile', JSON.stringify(userProfile));

                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    onClose();
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
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                )}
                            </button>
                        </div>
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
