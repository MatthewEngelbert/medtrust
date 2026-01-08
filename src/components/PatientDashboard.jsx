import React, { useState } from 'react';
import '../pages/Dashboard.css';

const PatientDashboard = ({ handleLogout }) => {
    const [activeTab, setActiveTab] = useState('profile');

    // Load user from localStorage or use default
    const [user, setUser] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem('userProfile'));
        const defaultUser = {
            name: "Alexander Bennett",
            title: "Patient ID: #8824192",
            age: 34,
            domicile: "Jakarta, Indonesia",
            address: "Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190",
            phone: "+62 812-3456-7890",
            email: "alex.bennett@gmail.com",
            avatar: "https://ui-avatars.com/api/?name=Alexander+Bennett&background=009149&color=fff&size=150"
        };
        return storedUser ? { ...defaultUser, ...storedUser } : defaultUser;
    });

    const [formData, setFormData] = useState(user);
    const [saveStatus, setSaveStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();

        // Create updated user object with new avatar based on the name
        const updatedUser = {
            ...formData,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=009149&color=fff&size=150`
        };

        setUser(updatedUser);
        localStorage.setItem('userProfile', JSON.stringify(updatedUser)); // Save updated user with new avatar
        setSaveStatus('Profile updated successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const medicalRecords = [
        {
            id: 1,
            date: "12 Dec 2025",
            hospital: "Siloam Hospitals Semanggi",
            doctor: "Dr. Budi Santoso",
            dept: "General Practice",
            diagnosis: "Routine Checkup",
            notes: "Patient in good health. BP normal (120/80). Recommended to maintain daily exercise and reduced sodium intake.",
            status: "Completed"
        },
        {
            id: 2,
            date: "20 Oct 2025",
            hospital: "RS Pondok Indah",
            doctor: "Dr. Sarah Wijaya",
            dept: "Dental Care",
            diagnosis: "Regular Cleaning",
            notes: "Routine cleaning completed. No cavities found. Gums look healthy. Scheduled next visit in 6 months.",
            status: "Completed"
        },
        {
            id: 3,
            date: "15 Aug 2025",
            hospital: "RSCM Kencana",
            doctor: "Dr. Andi Pratama",
            dept: "Immunology",
            diagnosis: "Vaccination",
            notes: "COVID-19 Booster (Pfizer) administered. Patient advised to monitor for slight fever or arm soreness for 24 hours.",
            status: "Completed"
        }
    ];

    const visitations = [
        {
            id: 1,
            hospital: "Siloam Hospitals Semanggi",
            dept: "General Practice",
            date: "12 Dec 2025",
            status: "Completed"
        },
        {
            id: 2,
            hospital: "RS Pondok Indah",
            dept: "Dental Care",
            date: "20 Oct 2025",
            status: "Completed"
        },
        {
            id: 3,
            hospital: "RSCM Kencana",
            dept: "Immunology",
            date: "15 Aug 2025",
            status: "Completed"
        }
    ];

    return (
        <div className="dashboard-container">
            <aside className="dashboard-sidebar">
                <a href="/" className="dashboard-logo">
                    Med<span>Trust</span>
                </a>

                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`sidebar-link ${activeTab === 'records' ? 'active' : ''}`}
                        onClick={() => setActiveTab('records')}
                    >
                        Medical Records
                    </button>
                    <button
                        className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                </nav>
            </aside>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1 className="dashboard-title">
                        {activeTab === 'profile' && 'Profile'}
                        {activeTab === 'records' && 'Medical Records'}
                        {activeTab === 'settings' && 'Settings'}
                    </h1>
                </header>

                <section className="dashboard-view">
                    {activeTab === 'profile' && (
                        <div className="profile-grid">
                            <div className="profile-card main-info">
                                <div className="profile-image-wrapper">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=009149&color=fff&size=150`}
                                        alt="Profile"
                                        className="profile-image"
                                    />
                                </div>
                                <h2 className="profile-name">{user.name}</h2>
                                <p className="profile-title">{user.title}</p>
                                <div className="profile-badges">
                                    <span className="badge">Verified Patient</span>
                                </div>
                            </div>

                            <div className="profile-card details-info">
                                <h3 className="card-title">Personal Details</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Age</label>
                                        <p>{user.age} Years Old</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Domicile</label>
                                        <p>{user.domicile}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone Number</label>
                                        <p>{user.phone}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email Address</label>
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="detail-item full-width">
                                        <label>Home Address</label>
                                        <p>{user.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-card visitations-info full-width-card">
                                <h3 className="card-title">Recent Visitations</h3>
                                <div className="visitation-list">
                                    {visitations.map(visit => (
                                        <div key={visit.id} className="visitation-item">
                                            <div className="visitation-main">
                                                <h4>{visit.hospital}</h4>
                                                <span className="visitation-dept">{visit.dept}</span>
                                            </div>
                                            <div className="visitation-meta">
                                                <span className="visitation-date">{visit.date}</span>
                                                <span className="status-badge">{visit.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'records' && (
                        <div className="records-grid">
                            {medicalRecords.map(record => (
                                <div key={record.id} className="record-card">
                                    <div className="record-header">
                                        <div className="record-hospital">
                                            <h3>{record.hospital}</h3>
                                            <span className="record-dept">{record.dept}</span>
                                        </div>
                                        <span className="record-date">{record.date}</span>
                                    </div>

                                    <div className="record-body">
                                        <div className="record-info-row">
                                            <span className="info-label">Doctor:</span>
                                            <span className="info-value">{record.doctor}</span>
                                        </div>
                                        <div className="record-info-row">
                                            <span className="info-label">Diagnosis:</span>
                                            <span className="info-value">{record.diagnosis}</span>
                                        </div>
                                        <div className="record-notes">
                                            <span className="notes-label">Doctor's Notes:</span>
                                            <p className="userid-notes">{record.notes}</p>
                                        </div>
                                    </div>

                                    <div className="record-footer">
                                        <button className="view-details-btn">View Full Report</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-container">
                            <div className="settings-card">
                                <h3 className="section-header-title">Edit Profile</h3>
                                <p className="section-header-desc">Update your personal information.</p>

                                <form onSubmit={handleSaveProfile} className="settings-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Droid/Location</label>
                                        <input
                                            type="text"
                                            name="domicile"
                                            value={formData.domicile}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            disabled
                                            style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Home Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    {saveStatus && <div className="save-status">{saveStatus}</div>}

                                    <button type="submit" className="save-btn">
                                        Save Changes
                                    </button>
                                </form>

                                <div className="settings-divider"></div>

                                <div className="account-actions">
                                    <button onClick={handleLogout} className="logout-btn">
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div >
    );
};

export default PatientDashboard;
