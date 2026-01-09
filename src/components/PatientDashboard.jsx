import React, { useState } from 'react';
import '../pages/Dashboard.css';

const PatientDashboard = ({ handleLogout }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [realMedicalRecords, setRealMedicalRecords] = useState([]);
    const [realVisitations, setRealVisitations] = useState([]);

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

        if (storedUser) {
            return {
                ...defaultUser,
                ...storedUser,
                name: storedUser.fullName || storedUser.username || defaultUser.name,
                title: storedUser.id ? `Patient ID: ${storedUser.id}` : defaultUser.title,
                phone: storedUser.phoneNumber || storedUser.phone || defaultUser.phone
            };
        }

        return defaultUser;
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

    const handleFetchRecords = async () => {
        if (!user.id) return;

        try {
            const response = await fetch('http://localhost:5000/chain');
            const data = await response.json();
            const chain = data.chain || [];

            // Filter blocks for this patient
            // Assuming block.data.patientId matches user.id (which is the patientId)
            // Filter blocks for this patient - Normalized comparison
            const patientRecords = chain.filter(block => {
                const blockPid = block.data && block.data.patientId ? String(block.data.patientId).replace(/#/g, '').trim().toLowerCase() : '';
                const userPid = user.id ? String(user.id).replace(/#/g, '').trim().toLowerCase() : '';
                return blockPid === userPid;
            }).map(block => ({
                id: block.index,
                date: new Date(block.timestamp).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric"
                }),
                hospital: block.data.hospital || "Unknown Hospital",
                doctor: block.data.doctor?.fullName || block.data.doctor?.username || "Unknown Doctor",
                dept: block.data.department || "General Practice",
                diagnosis: block.data.diagnosis || "No Diagnosis",
                notes: block.data.notes || "-",
                status: "Completed" // Blockchain record implies completion
            })).reverse(); // Newest first

            setRealMedicalRecords(patientRecords);

            // For visitations, we can use the same data but simplified
            const patientVisitations = patientRecords.map(record => ({
                id: record.id,
                hospital: record.hospital,
                dept: record.dept,
                date: record.date,
                status: record.status
            }));

            setRealVisitations(patientVisitations);

        } catch (error) {
            console.error("Failed to fetch records:", error);
        }
    };

    // Initial fetch
    React.useEffect(() => {
        handleFetchRecords();
    }, [user.id]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaveStatus('Saving...');

        try {
            const response = await fetch('http://localhost:5000/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email, // Identifier
                    name: formData.name,
                    age: formData.age,
                    domicile: formData.domicile,
                    phone: formData.phone,
                    address: formData.address
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local state with returned user data to stay in sync
                const updatedUser = {
                    ...data.user,
                    name: data.user.username, // Remap backend username to frontend name
                    phone: data.user.phoneNumber, // Remap backend phoneNumber
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.username)}&background=009149&color=fff&size=150`
                };

                setUser(updatedUser);
                setFormData(updatedUser); // Update form data to match confirmed backend data
                localStorage.setItem('userProfile', JSON.stringify(updatedUser));

                setSaveStatus('Profile updated successfully!');
            } else {
                setSaveStatus(data.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Update Error:', error);
            setSaveStatus('Server error. Please try again.');
        }

        setTimeout(() => setSaveStatus(''), 3000);
    };

    const medicalRecords = [
        /*
            const medicalRecords = [
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
            ];
        */
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
                                    {realVisitations.length === 0 ? (
                                        <p style={{ color: '#64748b', padding: '1rem' }}>No visitations found.</p>
                                    ) : (
                                        realVisitations.map(visit => (
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
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'records' && (
                        <div className="records-grid">
                            {realMedicalRecords.length === 0 ? (
                                <div style={{ textAlign: 'center', width: '100%', padding: '3rem', color: '#64748b' }}>
                                    <h3>No Medical Records Found.</h3>
                                    <p>Your history will appear here once a doctor adds a record.</p>
                                </div>
                            ) : (
                                realMedicalRecords.map(record => (
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
                                ))
                            )}
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
