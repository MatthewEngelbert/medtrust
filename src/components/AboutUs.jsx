import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <section id="about" className="about-section">
            <div className="container">
                <div className="about-content">
                    <h2 className="section-title">About <span className="highlight">MedTrust</span></h2>
                    <p className="section-subtitle">
                        Revolutionizing healthcare data management through blockchain technology.
                    </p>

                    <div className="about-grid">
                        <div className="about-card">
                            <h3>Our Mission</h3>
                            <p>To provide a secure, transparent, and efficient platform for managing medical records, ensuring patients have control over their health data.</p>
                        </div>
                        <div className="about-card">
                            <h3>Our Vision</h3>
                            <p>A world where healthcare data is universally accessible yet completely secure, fostering better diagnosis and treatment outcomes globally.</p>
                        </div>
                        <div className="about-card">
                            <h3>Why Us?</h3>
                            <p>We leverage cutting-edge blockchain technology to eliminate data silos, reduce administrative overhead, and put patients in control of their health data.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
