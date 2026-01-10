import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reuse styles

const Register = ({ isOpen, onClose, onSwitchToLogin }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState(null); // 'patient' or 'doctor'
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        licenseNumber: '', // Doctor only
        hospital: '' // Doctor only
    });

    if (!isOpen) return null;

    // Title based on step
    let displayTitle = 'Create Account';
    let displaySubtitle = '';

    if (step === 1) {
        displayTitle = 'Choose Account Type';
        displaySubtitle = 'Step 1 of 3: Select your role';
    } else if (step === 2) {
        displayTitle = 'Account Details';
        displaySubtitle = 'Step 2 of 3: Basic Information';
    } else if (step === 3) {
        displayTitle = 'Complete Profile';
        displaySubtitle = 'Step 3 of 3: Personal Information';
    }

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

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStep(2);
        setError('');
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
        setStep(3);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation for Doctor
        if (selectedRole === 'doctor') {
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
            role: selectedRole,
            phone: formData.phone,
            address: formData.address,
            // Conditional fields
            ...(selectedRole === 'doctor' ? {
                specialization: formData.specialization,
                licenseNumber: formData.licenseNumber,
                hospital: formData.hospital
            } : {
                age: formData.age,
                domicile: formData.domicile
            })
        };

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'https://medtrust.vercel.app/api';
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userProfile),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Account created successfully! Your ID: ${data.id}. Please login.`);
                onClose();
                onSwitchToLogin();
                // Reset state
                setStep(1);
                setSelectedRole(null);
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    age: '',
                    domicile: '',
                    phone: '',
                    address: '',
                    specialization: '',
                    licenseNumber: '',
                    hospital: ''
                });
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
                    <p className="modal-subtitle">{displaySubtitle}</p>
                </div>

                <form className="login-form" onSubmit={step === 2 ? handleNext : (step === 3 ? handleSubmit : (e) => e.preventDefault())}>
                    {error && <div className="error-message">{error}</div>}

                    {/* STEP 1: ROLE SELECTION */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                className="btn"
                                style={{
                                    padding: '1.5rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                onClick={() => handleRoleSelect('patient')}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#009149'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: '#e6f4ea',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#009149'
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>I am a Patient</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Store and manage my own medical records</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                className="btn"
                                style={{
                                    padding: '1.5rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                onClick={() => handleRoleSelect('doctor')}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#009149'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                            >
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: '#e0f2fe',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#0284c7'
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>I am a Doctor</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Access patient records and provide care</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* STEP 2: ACCOUNT DETAILS (Former Step 1) */}
                    {step === 2 && (
                        <>
                            <div className="form-group">
                                <label htmlFor="name">Full Name {selectedRole === 'doctor' && '(inc. Gelar)'}</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder={selectedRole === 'doctor' ? "dr. Name, Sp..." : "Your Name"}
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
                                <div className="password-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
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

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="password-container">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-icon"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                        )}
                                    </button>
                                </div>
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
                                    Next Step
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 3: PROFILE DETAILS (Former Step 2) */}
                    {step === 3 && (
                        <>
                            {selectedRole === 'doctor' ? (
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
                                    <div className="form-group">
                                        <label htmlFor="hospital">Hospital / Practice Place</label>
                                        <input
                                            type="text"
                                            id="hospital"
                                            placeholder="e.g. RS Medika Jakarta"
                                            value={formData.hospital}
                                            onChange={handleChange}
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
                                    onClick={() => setStep(2)}
                                >
                                    Back
                                </button>
                                <button type="submit" className="btn btn-primary btn-block">
                                    Create {selectedRole === 'doctor' ? 'Doctor' : 'Patient'} Account
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
