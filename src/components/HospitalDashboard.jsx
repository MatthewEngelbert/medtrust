import React, { useState, useEffect } from 'react';
import Block from '../lib/blockchain/Block.js';
import '../pages/Dashboard.css';

const HospitalDashboard = ({ handleLogout }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'https://medtrust.vercel.app';
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showMiningModal, setShowMiningModal] = useState(false);
    const [miningStep, setMiningStep] = useState('idle'); // idle, mining, success
    const [minedBlock, setMinedBlock] = useState(null);

    // Form States
    const [formPatientId, setFormPatientId] = useState('');
    const [formDiagnosis, setFormDiagnosis] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formHospital, setFormHospital] = useState('');

    // Search States (Dashboard)
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedPatient, setSearchedPatient] = useState(null);

    // Blockchain History State
    const [chainHistory, setChainHistory] = useState([]);

    const doctor = JSON.parse(localStorage.getItem('userProfile')) || { name: 'Doctor' };

    // --- ACTIONS ---

    const fetchChain = async () => {
        try {
            const response = await fetch(`${API_URL}/chain`);
            const data = await response.json();
            // Reverse to show latest first
            const chain = data.chain || [];
            setChainHistory([...chain].reverse());
        } catch (err) {
            console.error("Failed to fetch chain", err);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const response = await fetch(`${API_URL}/patients/search?query=${searchQuery}`);
            const data = await response.json();

            if (data.length > 0) {
                const found = data[0];
                setSearchedPatient({
                    name: found.fullName || found.username,
                    id: found.patientId,
                    avatar: `https://ui-avatars.com/api/?name=${(found.fullName || found.username).replace(' ', '+')}&background=009149&color=fff&size=150`,
                    badge: "Registered Patient",
                    details: `Patient, ${found.age ? found.age + 'y' : 'N/A'}`
                });
            } else {
                setSearchedPatient(null);
                alert("Patient not found!");
            }
        } catch (err) {
            console.error("Search failed", err);
            alert("Search Error");
        }
    };

    // File State
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleMineAndUpload = async () => {
        if (!formPatientId || !formDiagnosis || !formHospital) {
            alert("Please fill in all fields (Patient ID, Diagnosis, and Hospital)");
            return;
        }

        // 1. Strict Format Check
        if (!formPatientId.startsWith('#')) {
            alert("⚠️ Format Invalid: Patient ID harus diawali dengan tanda pagar '#'.\nContoh: #595438");
            return;
        }

        // 2. Database Existence Check
        try {
            // We reuse the search endpoint to check existence
            // Note: In a real app, a specific /check-user endpoint would be better/faster
            const checkResponse = await fetch(`${API_URL}/patients/search?query=${encodeURIComponent(formPatientId)}`);
            const checkData = await checkResponse.json();

            // Search utilizes 'regex' loose matching, so we must confirm an EXACT existence
            const patientExists = checkData.some(p => p.patientId === formPatientId);

            if (!patientExists) {
                alert(`❌ Patient Not Found: Tidak ditemukan pasien dengan ID ${formPatientId} di database.\nMohon cek kembali input Anda.`);
                return;
            }
        } catch (checkErr) {
            console.error("Validation Check Error:", checkErr);
            alert("Gagal memverifikasi Patient ID ke server. Coba lagi.");
            return;
        }

        setShowMiningModal(true);
        setMiningStep('mining');

        // Use timeout to allow UI to render modal before heavy calculation
        setTimeout(async () => {
            try {
                // Prepare Document (Base64)
                let documentBase64 = null;
                if (selectedFile) {
                    documentBase64 = await convertToBase64(selectedFile);
                }

                // 1. Fetch Latest Chain State from Server
                const chainResponse = await fetch(`${API_URL}/chain`);
                const chainData = await chainResponse.json();
                const latestBlock = chainData.chain[chainData.chain.length - 1];

                const newIndex = chainData.chain.length;
                const previousHash = latestBlock.hash;

                // 2. Create Block with correct Previous Hash
                const newBlock = new Block(
                    newIndex,
                    new Date().toISOString(),
                    {
                        patientId: formPatientId,
                        diagnosis: formDiagnosis,
                        notes: formNotes,
                        department: "General Practice",
                        doctor: { username: doctor.username, fullName: doctor.fullName },
                        hospital: formHospital,
                        document: documentBase64 // Attach image data here
                    },
                    previousHash
                );

                // 3. Client-Side Mining (PoW)
                console.log("Start mining...", newBlock);
                newBlock.mineBlock(4);

                setMinedBlock(newBlock);
                setMiningStep('success');

                // 4. Sync to Server (Send COMPLETE block)
                const uploadResponse = await fetch(`${API_URL}/mine`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        index: newBlock.index,
                        timestamp: newBlock.timestamp,
                        data: newBlock.data,
                        previousHash: newBlock.previousHash,
                        hash: newBlock.hash,
                        nonce: newBlock.nonce
                    })
                });

                if (!uploadResponse.ok) {
                    const errData = await uploadResponse.json();
                    throw new Error(errData.message || "Server rejected block");
                }

                // Clear form
                setFormPatientId('');
                setFormDiagnosis('');
                setFormNotes('');
                setFormHospital('');
                setSelectedFile(null);

            } catch (error) {
                console.error("Mining/Upload Error:", error);
                alert("Error during mining or upload: " + error.message);
                setShowMiningModal(false);
            }
        }, 500);
    };

    // Auto-fetch chain when entering history tab
    useEffect(() => {
        if (activeTab === 'patients') {
            fetchChain();
        }
    }, [activeTab]);

    const visitations = [
        { id: 1, hospital: "Siloam Hospitals", dept: "General Practice", date: "12 Dec 2025", status: "Completed" },
        { id: 2, hospital: "RS Pondok Indah", dept: "Dental Care", date: "20 Oct 2025", status: "Completed" },
        { id: 3, hospital: "RSCM Kencana", dept: "Immunology", date: "15 Aug 2025", status: "Completed" }
    ];

    return (
        <div className="dashboard-container">
            {/* MINING MODAL */}
            {showMiningModal && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '600px', width: '90%', textAlign: 'center' }}>
                        {miningStep === 'mining' && (
                            <div style={{ padding: '2rem' }}>
                                <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #009149', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Mining Block...</h2>
                                <p style={{ color: '#64748b' }}>Solving Proof-of-Work (SHA-256)</p>
                                <p style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '0.5rem', marginTop: '1rem', borderRadius: '4px' }}>Target: 0000...</p>
                            </div>
                        )}

                        {miningStep === 'success' && minedBlock && (
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '50%', color: '#166534' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>Block Mined Successfully!</h2>
                                        <p style={{ color: '#64748b' }}>Your medical record has been secured on the blockchain.</p>
                                    </div>
                                </div>

                                <div style={{ background: '#1e293b', color: '#a5b4fc', padding: '1.5rem', borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#64748b' }}>Hash Function:</span> <span style={{ color: '#fca5a5' }}>SHA-256</span>
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#64748b' }}>Nonce Found:</span> <span style={{ color: '#fde047' }}>{minedBlock.nonce}</span>
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', wordBreak: 'break-all' }}>
                                        <span style={{ color: '#64748b' }}>Block Hash:</span><br />
                                        <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{minedBlock.hash}</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid #334155', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                        <span style={{ color: '#64748b' }}>Data Payload:</span>
                                        <pre style={{ color: '#e2e8f0', margin: '0.5rem 0 0', whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(minedBlock.data, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                <button
                                    className="save-btn" style={{ width: '100%' }}
                                    onClick={() => { setShowMiningModal(false); setActiveTab('dashboard'); }}
                                >
                                    Close & Return to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <aside className="dashboard-sidebar">
                <a href="/" className="dashboard-logo">Med<span>Trust</span></a>
                <nav className="sidebar-nav">
                    <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                    <button className={`sidebar-link ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>History</button>
                    <button className={`sidebar-link ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>Upload Records</button>
                    <button className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
                </nav>
            </aside>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1 className="dashboard-title">
                        {activeTab === 'dashboard' && 'Dashboard'}
                        {activeTab === 'patients' && 'Blockchain Ledger History'}
                        {activeTab === 'upload' && 'Upload Medical Records'}
                        {activeTab === 'settings' && 'Hospital Settings'}
                    </h1>
                </header>

                <section className="dashboard-view">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="settings-card" style={{ width: '100%' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Search by Patient ID</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter Patient ID"
                                            className="form-input"
                                            style={{ flex: 1 }}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button className="save-btn" style={{ margin: 0, width: 'auto', padding: '0 1.5rem' }} onClick={handleSearch}>Search</button>
                                    </div>
                                </div>
                            </div>

                            {/* SEARCH RESULT */}
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
                                        <p>No new files.</p>
                                    </div>
                                </div>
                            )}

                            {!searchedPatient && (
                                <div style={{ marginTop: '3rem', textAlign: 'center', color: '#64748b', padding: '3rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#334155' }}>
                                        Welcome, {doctor.fullName || doctor.username || 'Doctor'}
                                    </h3>
                                    <p>Enter a patient's ID above to view their records.</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'patients' && (
                        <div className="settings-card" style={{ width: '100%' }}>
                            <div className="form-group" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 className="card-title">Blockchain Ledger</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time verified blocks.</p>
                                </div>
                                <button className="save-btn" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={fetchChain}>Refresh</button>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '1rem' }}>Idx</th>
                                        <th style={{ padding: '1rem' }}>Time</th>
                                        <th style={{ padding: '1rem' }}>Patient</th>
                                        <th style={{ padding: '1rem' }}>Diagnosis</th>
                                        <th style={{ padding: '1rem' }}>Hash</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chainHistory.length === 0 && <tr><td colSpan="5" style={{ padding: '1rem' }}>No blocks found.</td></tr>}
                                    {chainHistory.map(block => (
                                        <tr key={block.hash} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem' }}>#{block.index}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(block.timestamp).toLocaleString()}</td>
                                            <td style={{ padding: '1rem', color: '#0284c7' }}>{block.data.patientId || 'Genesis'}</td>
                                            <td style={{ padding: '1rem' }}>{block.data.diagnosis || 'Init'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px', fontSize: '0.8rem' }}>
                                                    {block.hash.substring(0, 10)}...
                                                </span>
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
                                    <label>Patient ID</label>
                                    <input
                                        type="text" className="form-input"
                                        value={formPatientId} onChange={e => setFormPatientId(e.target.value)}
                                        placeholder="e.g. #595438"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select className="form-input">
                                        <option>General Practice</option>
                                        <option>Cardiology</option>
                                        <option>Dermatology</option>
                                        <option>Immunology</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Hospital / Clinic</label>
                                    <input
                                        type="text" className="form-input"
                                        value={formHospital} onChange={e => setFormHospital(e.target.value)}
                                        placeholder="e.g. RS Medika Jaya Bekasi"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Diagnosis</label>
                                    <input
                                        type="text" className="form-input"
                                        value={formDiagnosis} onChange={e => setFormDiagnosis(e.target.value)}
                                        placeholder="Primary diagnosis..."
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Doctor's Notes</label>
                                    <textarea
                                        className="form-input" rows="5"
                                        value={formNotes} onChange={e => setFormNotes(e.target.value)}
                                        placeholder="Detailed clinical notes..."
                                    ></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label>Related Medical Files</label>
                                    <input
                                        type="file"
                                        className="form-input"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <button type="button" className="save-btn" onClick={handleMineAndUpload}>
                                    Mine & Upload Record
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-container">
                            <div className="settings-card">
                                <h3 className="section-header-title">Hospital Account</h3>
                                <button onClick={handleLogout} className="logout-btn">Log Out</button>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default HospitalDashboard;
