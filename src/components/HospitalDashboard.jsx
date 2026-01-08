import React, { useState } from 'react';
import '../pages/Dashboard.css';

const HospitalDashboard = ({ handleLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const patients = [
        { id: 8824192, name: "Alexander Bennett", age: 34, conditions: "Hypertension", lastVisit: "12 Dec 2025" },
        { id: 8892103, name: "Sarah Johnson", age: 29, conditions: "Asthma", lastVisit: "10 Jan 2026" },
        { id: 8812394, name: "Michael Chen", age: 45, conditions: "Diabetes Type 2", lastVisit: "05 Jan 2026" },
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

    const [searchQuery, setSearchQuery] = useState('');
    const [searchedPatient, setSearchedPatient] = useState(null);

    const handleSearch = () => {
        // Simulate search
        if (searchQuery) {
            setSearchedPatient({
                name: "Alexander Bennett",
                id: "#8824192",
                avatar: "https://ui-avatars.com/api/?name=Alexander+Bennett&background=009149&color=fff&size=150",
                badge: "Verified Patient",
                details: "Male, 34y"
            });
        }
    };

    const [doctor] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem('userProfile'));
        return storedUser || {};
    });

    return (
        <div className="dashboard-container">
            <aside className="dashboard-sidebar">
                <a href="/" className="dashboard-logo">
                    Med<span>Trust</span>
                </a>

                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`sidebar-link ${activeTab === 'patients' ? 'active' : ''}`}
                        onClick={() => setActiveTab('patients')}
                    >
                        History
                    </button>
                    <button
                        className={`sidebar-link ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        Upload Records
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
                        {activeTab === 'dashboard' && 'Dashboard'}
                        {activeTab === 'patients' && 'History'}
                        {activeTab === 'upload' && 'Upload Medical Records'}
                        {activeTab === 'settings' && 'Hospital Settings'}
                    </h1>
                </header>

                <section className="dashboard-view">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="settings-card" style={{ width: '100%' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Search by Wallet Address</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter patient wallet address (0x...)"
                                            className="form-input"
                                            style={{ flex: 1 }}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button
                                            className="save-btn"
                                            style={{ margin: 0, width: 'auto', padding: '0 1.5rem' }}
                                            onClick={handleSearch}
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {!searchedPatient && (
                                <div style={{
                                    marginTop: '3rem',
                                    textAlign: 'center',
                                    color: '#64748b',
                                    padding: '3rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '2px dashed #e2e8f0'
                                }}>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#334155' }}>
                                        Welcome, {doctor.fullName || doctor.name || 'Doctor'}
                                    </h3>
                                    <p>Enter a patient's wallet address above to view their medical records and history.</p>
                                </div>
                            )}

                            {searchedPatient && (
                                <div className="profile-grid" style={{ marginTop: '2rem' }}>
                                    <div className="profile-card main-info">
                                        <div className="profile-image-wrapper">
                                            <img src={searchedPatient.avatar} alt="Profile" className="profile-image" />
                                        </div>
                                        <h2 className="profile-name">{searchedPatient.name}</h2>
                                        <p className="profile-title">Patient ID: {searchedPatient.id}</p>
                                        <div className="profile-badges">
                                            <span className="badge">{searchedPatient.badge}</span>
                                            <span className="badge" style={{ background: '#e0f2fe', color: '#0284c7' }}>{searchedPatient.details}</span>
                                        </div>
                                    </div>

                                    <div className="profile-card details-info" style={{ width: '100%' }}>
                                        <h3 className="card-title">Attached Medical Files</h3>
                                        <div className="visitation-list">
                                            <div className="visitation-item" style={{ alignItems: 'center' }}>
                                                <div className="visitation-main">
                                                    <h4 style={{ marginBottom: '0.2rem' }}>Blood_Test_Results.pdf</h4>
                                                    <span className="visitation-dept">Uploaded: 12 Dec 2025</span>
                                                </div>
                                                <div className="visitation-meta">
                                                    <button className="view-details-btn" style={{ padding: '0.5rem 1rem' }}>View</button>
                                                </div>
                                            </div>
                                            <div className="visitation-item" style={{ alignItems: 'center' }}>
                                                <div className="visitation-main">
                                                    <h4 style={{ marginBottom: '0.2rem' }}>X-Ray_Chest.jpg</h4>
                                                    <span className="visitation-dept">Uploaded: 10 Nov 2025</span>
                                                </div>
                                                <div className="visitation-meta">
                                                    <button className="view-details-btn" style={{ padding: '0.5rem 1rem' }}>View</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="profile-card visitations-info full-width-card" style={{ gridColumn: 'span 2' }}>
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
                        </>
                    )}

                    {activeTab === 'patients' && (
                        <div className="settings-card" style={{ width: '100%' }}>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Filter by Name/ID</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" placeholder="Search patients by name or ID..." className="form-input" style={{ flex: 1 }} />
                                    <button className="save-btn" style={{ margin: 0, width: 'auto', padding: '0 1.5rem' }}>Search</button>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '1rem' }}>Patient Name</th>
                                        <th style={{ padding: '1rem' }}>ID</th>
                                        <th style={{ padding: '1rem' }}>Age</th>
                                        <th style={{ padding: '1rem' }}>Conditions</th>
                                        <th style={{ padding: '1rem' }}>Last Visit</th>
                                        <th style={{ padding: '1rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', fontWeight: '600', color: '#0f172a' }}>{p.name}</td>
                                            <td style={{ padding: '1rem', color: '#64748b' }}>#{p.id}</td>
                                            <td style={{ padding: '1rem', color: '#64748b' }}>{p.age}</td>
                                            <td style={{ padding: '1rem', color: '#64748b' }}>{p.conditions}</td>
                                            <td style={{ padding: '1rem', color: '#64748b' }}>{p.lastVisit}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <button className="view-details-btn" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>View Profile</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="settings-card" style={{ width: '100%' }}>
                            <h3 className="card-title">New Patient Record</h3>
                            <form className="settings-form">
                                <div className="form-group">
                                    <label>Wallet Address</label>
                                    <input type="text" className="form-input" placeholder="0x..." />
                                </div>
                                <div className="form-group">
                                    <label>Patient ID</label>
                                    <input type="text" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select className="form-input">
                                        <option>General Practice</option>
                                        <option>Cardiology</option>
                                        <option>Dermatology</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Diagnosis</label>
                                    <input type="text" className="form-input" placeholder="Primary diagnosis..." />
                                </div>
                                <div className="form-group full-width">
                                    <label>Doctor's Notes</label>
                                    <textarea className="form-input" rows="5" placeholder="Detailed clinical notes..."></textarea>
                                </div>

                                <div className="form-group full-width">
                                    <label>Related Medical Files</label>
                                    <input type="file" className="form-input" multiple />
                                </div>
                                <button type="button" className="save-btn">Upload Record</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-container">
                            <div className="settings-card">
                                <h3 className="section-header-title">Hospital Account</h3>
                                <p className="section-header-desc">Manage hospital profile and access settings.</p>
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

export default HospitalDashboard;
