import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reuse styles

const Register = ({ isOpen, onClose, onSwitchToLogin, role = 'patient' }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        domicile: '',
        phone: '',
        address: '',
        specialization: '', // Doctor only
        licenseNumber: '' // Doctor only
    });

    if (!isOpen) return null;

    const displayTitle = role === 'doctor' ? 'Doctor Registration' : 'Create Account';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setError('');
    };

    const toTitleCase = (str) => {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    const handleSpecializationBlur = (e) => {
        const val = e.target.value;
        if (val) {
            setFormData(prev => ({ ...prev, specialization: toTitleCase(val) }));
        }
    };

    const handleNext = (e) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation for Doctor
        if (role === 'doctor') {
            const licenseRegex = /^[a-zA-Z0-9]{10}$/;
            if (!licenseRegex.test(formData.licenseNumber)) {
                setError('License Number must be exactly 10 alphanumeric characters.');
                return;
            }
        }

        const userProfile = {
            username: formData.name,
            email: formData.email,
            password: formData.password,
            role: role, // Send role to backend
            phone: formData.phone,
            address: formData.address,
            // Conditional fields
            ...(role === 'doctor' ? {
                specialization: formData.specialization,
                licenseNumber: formData.licenseNumber
            } : {
                age: formData.age,
                domicile: formData.domicile
            })
        };

        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userProfile),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Account created successfully! Your ID: ${data.id}. Please login.`);
                onClose();
                onSwitchToLogin();
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setError('Server error. Please try again later.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <h2 className="modal-title">{displayTitle}</h2>
                    <p className="modal-subtitle">
                        {step === 1 ? 'Step 1 of 2: Account Details' : 'Step 2 of 2: Profile Information'}
                    </p>
                </div>

                <form className="login-form" onSubmit={step === 1 ? handleNext : handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    {step === 1 ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="name">Full Name {role === 'doctor' && '(inc. Gelar)'}</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder={role === 'doctor' ? "dr. Name, Sp..." : "Your Name"}
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
                            {role === 'doctor' ? (
                                // DOCTOR SPECIFIC FIELDS
                                <>
                                    <div className="form-group">
                                        <label htmlFor="specialization">Specialization</label>
                                        <input
                                            type="text"
                                            id="specialization"
                                            placeholder="e.g. Cardiologist"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                            onBlur={handleSpecializationBlur}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="licenseNumber">License Number (10 Chars)</label>
                                        <input
                                            type="text"
                                            id="licenseNumber"
                                            placeholder="e.g. A1B2C3D4E5"
                                            value={formData.licenseNumber}
                                            onChange={handleChange}
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                // PATIENT SPECIFIC FIELDS
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
                                </>
                            )}

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="e.g. +62 812..."
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    placeholder="Full Address"
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
                                    Create {role === 'doctor' ? 'Doctor' : 'Patient'} Account
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
