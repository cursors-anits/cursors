'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Sponsors from '@/components/landing/Sponsors';
import Schedule from '@/components/landing/Schedule';
import FeaturesRewards from '@/components/landing/FeaturesRewards';
import Footer from '@/components/landing/Footer';
import RegistrationModal from '@/components/modals/RegistrationModal';
import LoginModal from '@/components/modals/LoginModal';
import { useData } from '@/lib/context/DataContext';
import { User } from '@/types';
export default function Home() {
  const { currentUser, setCurrentUser, logout } = useData();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  // Render Landing Page
  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-primary selection:text-white">
      <Navbar
        onRegisterClick={() => setIsRegisterOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      <main>
        <Hero onRegisterClick={() => setIsRegisterOpen(true)} />
        <Sponsors />
        <Schedule />
        <FeaturesRewards />
      </main>

      <Footer />

      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
