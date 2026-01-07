import React from 'react';
import './Hero.css';

const Hero = ({ onStartNowClick }) => {
    return (
        <section className="hero" id="home">
            <div className="container">
                <div className="hero-content">


                    <h1 className="hero-title">
                        Control your <span className="text-gradient">own</span> health
                    </h1>

                    <p className="hero-subtitle">
                        Secure, decentralized, and immutable medical records.
                        Medtrust gives you complete ownership of your health data,
                        accessible anywhere, anytime.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="btn btn-primary"
                            style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}
                            onClick={onStartNowClick}
                        >
                            Start Now
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
                            How it works
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
