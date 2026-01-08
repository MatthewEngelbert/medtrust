import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ isOpen, onClose, onSwitchToRegister, title, onLoginSuccess }) => {
    const navigate = useNavigate();
    const [isDoctorLogin, setIsDoctorLogin] = useState(false);

    if (!isOpen) return null;

    const handleLogin = (e) => {
        e.preventDefault();
        // Simulate login
        if (onLoginSuccess) {
            onLoginSuccess();
        } else {
            onClose();
            navigate('/dashboard', {
                replace: true,
                state: { role: isDoctorLogin ? 'hospital' : 'patient' }
            });
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
                                <p>Don't have an account? <a href="#" style={{ color: '#009149', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}>Sign up</a></p>
                                <p><a href="#" style={{ color: '#0f172a', fontWeight: '500' }} onClick={(e) => { e.preventDefault(); setIsDoctorLogin(true); }}>Login as a doctor?</a></p>
                            </>
                        ) : (
                            <p><a href="#" style={{ color: '#0f172a', fontWeight: '500' }} onClick={(e) => { e.preventDefault(); setIsDoctorLogin(false); }}>Login as a patient?</a></p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
