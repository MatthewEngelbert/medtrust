import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ isOpen, onClose, onSwitchToRegister }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = (e) => {
        e.preventDefault();
        // Simulate login
        onClose();
        navigate('/dashboard', { replace: true });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <h2 className="modal-title">Welcome Back</h2>
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
                        <p>Don't have an account? <a href="#" style={{ color: '#009149', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}>Sign up</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
