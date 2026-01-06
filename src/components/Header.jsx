import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ onLoginClick, onSignUpClick }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <a href="#" className="logo">
          Med<span>Trust</span>
        </a>

        <nav className="nav-menu">
          <a href="#home" className="nav-link">Home</a>
          <a href="#features" className="nav-link">Features</a>

          <a href="#about" className="nav-link">About Us</a>
        </nav>

        <div className="header-actions">
          <button className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem' }} onClick={onLoginClick}>Login</button>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }} onClick={onSignUpClick}>Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
