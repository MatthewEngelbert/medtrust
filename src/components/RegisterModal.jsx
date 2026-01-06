import React from 'react';
import './LoginModal.css'; // Reuse styles

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <h2 className="modal-title">Create Account</h2>
                </div>

                <form className="login-form" onSubmit={e => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" placeholder="Your Name" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" placeholder="Your Email" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="••••••••" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" placeholder="••••••••" />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Sign Up
                    </button>

                    <div className="modal-footer">
                        <p>Already have an account? <a href="#" style={{ color: '#009149', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;
