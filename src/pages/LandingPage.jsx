import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const LandingPage = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const openLogin = () => {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
    };
    const closeLogin = () => setIsLoginOpen(false);

    const openRegister = () => {
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
    };
    const closeRegister = () => setIsRegisterOpen(false);

    return (
        <>
            <Header onLoginClick={openLogin} onSignUpClick={openRegister} />
            <main>
                <Hero onStartNowClick={openLogin} />
                <Features />
            </main>
            <Footer />
            <LoginModal
                isOpen={isLoginOpen}
                onClose={closeLogin}
                onSwitchToRegister={openRegister}
            />
            <RegisterModal
                isOpen={isRegisterOpen}
                onClose={closeRegister}
                onSwitchToLogin={openLogin}
            />
        </>
    );
};

export default LandingPage;
