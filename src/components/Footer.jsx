import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <a href="#" className="logo" style={{ color: 'white' }}>
                            Med<span>trust</span>
                        </a>
                        <p className="footer-desc">
                            Empowering individuals with secure, blockchain-based access to their own medical history.
                        </p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Platform</h4>
                            <a href="#">Features</a>
                            <a href="#">Security</a>
                            <a href="#">Roadmap</a>
                        </div>
                        <div className="footer-col">
                            <h4>Company</h4>
                            <a href="#">About</a>
                            <a href="#">Careers</a>
                            <a href="#">Contact</a>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Medtrust Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
