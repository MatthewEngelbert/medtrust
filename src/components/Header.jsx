import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ onLoginClick, onSignUpClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ['home', 'features', 'about'];
      const scrollPosition = window.scrollY + 100; // Offset for header height

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
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
          <a
            href="#home"
            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => setActiveSection('home')}
          >
            Home
          </a>
          <a
            href="#features"
            className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
            onClick={() => setActiveSection('features')}
          >
            Features
          </a>
          <a
            href="#about"
            className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
            onClick={() => setActiveSection('about')}
          >
            About Us
          </a>
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
