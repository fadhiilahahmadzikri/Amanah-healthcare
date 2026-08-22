'use client';

import React, { useState } from 'react';
import { LandingNavbar } from './landing-navbar';
import { LandingHero } from './landing-hero';
import { LandingAbout } from './landing-about';
import { LandingFacilities } from './landing-facilities';
import { LandingServices } from './landing-services';
import { LandingAppointment } from './landing-appointment';
import { LandingTestimonials } from './landing-testimonials';
import { LandingContact } from './landing-contact';
import { LandingFooter } from './landing-footer';
import { AppointmentModal } from './appointment-modal';
import { ChatwootWidget } from '@/components/chatwoot/chatwoot-widget';

export function LandingView() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const handleOpenBooking = (service?: string) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  return (
    <div className='min-h-screen w-full flex flex-col bg-[#ffffff] text-[#13195c] selection:bg-[#dfe2f6] selection:text-[#13195c] font-sans antialiased overflow-x-hidden'>
      {/* 1. Header / Navbar (Figma Section 1) */}
      <LandingNavbar onOpenBooking={() => handleOpenBooking()} />

      {/* Main Sections matching exact Figma order */}
      <main className='flex-1 w-full flex flex-col items-center'>
        {/* 2. Hero Section with Integrated Bento Cards (Figma Section 4 & 6) */}
        <LandingHero onOpenBooking={() => handleOpenBooking()} />

        {/* 3. Tentang Kami / Kenali Klinik Amanah (Figma Section 5) */}
        <LandingAbout />

        {/* 5. Fasilitas untuk Kenyamanan Anda (Figma Section 7) */}
        <LandingFacilities onOpenBooking={() => handleOpenBooking()} />

        {/* 6. Layanan Kesehatan untuk Anda dan Keluarga (Figma Section 8) */}
        <LandingServices onSelectService={(service) => handleOpenBooking(service)} />

        {/* 7. Janji Temu / Jadwalkan Kunjungan Anda (Figma Section 9) */}
        <LandingAppointment onOpenBooking={() => handleOpenBooking()} />

        {/* 8. Kisah Pasien / Testimonials (Figma Section 10) */}
        <LandingTestimonials />

        {/* 9. Mari Terhubung / Contact (Figma Section 11) */}
        <LandingContact />
      </main>

      {/* 10. Footer (Figma Section 12) */}
      <LandingFooter />

      {/* Global Interactive Appointment Modal */}
      <AppointmentModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        defaultService={selectedService}
      />

      {/* Floating Gary AI Assistant Widget */}
      <ChatwootWidget />
    </div>
  );
}
