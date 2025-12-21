'use client';

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Sponsors from '@/components/landing/Sponsors';
import Schedule from '@/components/landing/Schedule';
import FeaturesRewards from '@/components/landing/FeaturesRewards';
import PricingCalculator from '@/components/landing/PricingCalculator';
import WhatToBring from '@/components/landing/WhatToBring';
import HackathonSchedule from '@/components/landing/HackathonSchedule';
import ProblemStatements from '@/components/landing/ProblemStatements';
import WorkshopSyllabus from '@/components/landing/WorkshopSyllabus';
import Footer from '@/components/landing/Footer';
import RegistrationModal from '@/components/modals/RegistrationModal';
import LoginModal from '@/components/modals/LoginModal';
import { useData } from '@/lib/context/DataContext';
import { User } from '@/types';
import { Settings as SettingsIcon, AlertCircle } from 'lucide-react';

export default function Home() {
  const { currentUser, setCurrentUser, settings } = useData();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
  };

  const isStaff = currentUser && ['admin', 'coordinator', 'faculty'].includes(currentUser.role);

  if (settings?.maintenanceMode && !isStaff) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 w-full h-full bg-brand-dark">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-secondary/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 space-y-8 max-w-2xl">
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <SettingsIcon className="w-12 h-12 text-brand-primary" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">System Under Maintenance</h1>
            <p className="text-xl text-gray-400 font-light">
              We&apos;re currently fine-tuning the vibe for you. <br />
              Come back shortly to experience the future of coding.
            </p>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
              <AlertCircle className="w-4 h-4" />
              <span>Back online soon</span>
            </div>
          </div>

          <div className="pt-12">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-widest"
            >
              Staff Portal
            </button>
          </div>
        </div>

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }
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
        <PricingCalculator />
        <WhatToBring />
        <WorkshopSyllabus />
        <HackathonSchedule />
        <ProblemStatements />
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
