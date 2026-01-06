import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const user = {
        name: "Alexander Bennett",
        title: "Patient ID: #8824192",
        age: 34,
        domicile: "New York, USA",
        address: "45 Broadway, Apt 12B, NY 10006",
        phone: "+1 (555) 123-4567",
        email: "alex.bennett@example.com",
        avatar: "https://ui-avatars.com/api/?name=Alexander+Bennett&background=009149&color=fff&size=150"
    };

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
                        My Portfolio
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
                        {activeTab === 'profile' && 'Patient Portfolio'}
                        {activeTab === 'records' && 'Medical Records'}
                        {activeTab === 'settings' && 'Account Settings'}
                    </h1>
                </header>

                <section className="dashboard-view">
                    {activeTab === 'profile' && (
                        <div className="portfolio-grid">
                            <div className="portfolio-card main-info">
                                <div className="profile-image-wrapper">
                                    <img src={user.avatar} alt="Profile" className="profile-image" />
                                </div>
                                <h2 className="profile-name">{user.name}</h2>
                                <p className="profile-title">{user.title}</p>
                                <div className="profile-badges">
                                    <span className="badge">Verified Patient</span>
                                    <span className="badge">Premium Plan</span>
                                </div>
                            </div>

                            <div className="portfolio-card details-info">
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
                        </div>
                    )}

                    {activeTab === 'records' && (
                        <div className="dashboard-card">
                            <h3>Recent Medical History</h3>
                            <p style={{ color: '#64748b' }}>No records found on the blockchain.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
