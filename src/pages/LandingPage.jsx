import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Register from '../components/Register';

const LandingPage = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [registerRole, setRegisterRole] = useState('patient'); // 'patient' | 'doctor'

    const openLogin = () => {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
    };
    const closeLogin = () => setIsLoginOpen(false);

    const openRegister = (role = 'patient') => {
        setRegisterRole(role);
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
    };
    const closeRegister = () => setIsRegisterOpen(false);

    return (
        <>
            <Header onLoginClick={openLogin} onSignUpClick={() => openRegister('patient')} />
            <main>
                <Hero onStartNowClick={openLogin} />
                <Features />
            </main>
            <Footer />
            <Login
                isOpen={isLoginOpen}
                onClose={closeLogin}
                onSwitchToRegister={openRegister}
            />
            <Register
                isOpen={isRegisterOpen}
                onClose={closeRegister}
                onSwitchToLogin={openLogin}
                role={registerRole}
            />
        </>
    );
};

export default LandingPage;
