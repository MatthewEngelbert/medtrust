import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reuse styles

const Register = ({ isOpen, onClose, onSwitchToLogin }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        domicile: '',
        phone: '',
        address: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Construct the data payload
        const userProfile = {
            username: formData.name, // Mapping from 'name' to 'username' for backend
            email: formData.email,
            password: formData.password,
            age: formData.age,
            domicile: formData.domicile,
            phone: formData.phone,
            address: formData.address,
            title: `Patient ID: #${Math.floor(1000000 + Math.random() * 9000000)}`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=009149&color=fff&size=150`
        };

        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userProfile),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully! Please login.');
                onClose();
                onSwitchToLogin(); // Navigate to Login so user can sign in
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Server error. Please try again later.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <h2 className="modal-title">
                        {step === 1 ? 'Create Account' : 'Complete Profile'}
                    </h2>
                    <p className="modal-subtitle">
                        {step === 1 ? 'Step 1 of 2: Account Details' : 'Step 2 of 2: Personal Information'}
                    </p>
                </div>

                <form className="login-form" onSubmit={step === 1 ? handleNext : handleSubmit}>
                    {step === 1 ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-block">
                                Next Step
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    placeholder="e.g. 34"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="domicile">Domicile</label>
                                <input
                                    type="text"
                                    id="domicile"
                                    placeholder="e.g. Jakarta, Indonesia"
                                    value={formData.domicile}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="e.g. +62 812-3456-7890"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Home Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    placeholder="Full Street Address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-block"
                                    style={{ backgroundColor: '#e2e8f0', color: '#1e293b', marginTop: '1rem' }}
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                                <button type="submit" className="btn btn-primary btn-block">
                                    Complete Setup
                                </button>
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <div className="modal-footer">
                            <p>Already have an account? <a href="#" style={{ color: '#009149', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Login</a></p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Register;
