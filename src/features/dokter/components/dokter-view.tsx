'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { LandingNavbar } from '@/features/landing/components/landing-navbar';
import { LandingFooter } from '@/features/landing/components/landing-footer';
import { AppointmentModal } from '@/features/landing/components/appointment-modal';
import { ChatwootWidget } from '@/components/chatwoot/chatwoot-widget';

interface DoctorMember {
  id: number;
  name: string;
  role: string;
  image: string;
  specialty: string;
}

const DOCTOR_MEMBERS: DoctorMember[] = [
  {
    id: 1,
    name: 'Bhagaskara\nYudha',
    role: 'Founder & Lead Doctor',
    image: '/assets/landing/doctor/doc-bhagaskara.png',
    specialty: 'Dokter Umum & Kepala Medis'
  },
  {
    id: 2,
    name: 'Martha\nSuwanti',
    role: 'Co-Founder & Surgeon',
    image: '/assets/landing/doctor/doc-martha.png',
    specialty: 'Spesialis Bedah Minor'
  },
  {
    id: 3,
    name: 'Srikandi\nWulandari',
    role: 'VP of Tech & Research',
    image: '/assets/landing/doctor/doc-srikandi.png',
    specialty: 'Riset Medis & USG Diagnostik'
  },
  {
    id: 4,
    name: 'Tri\nMulyanto',
    role: 'VP of Patient Care',
    image: '/assets/landing/doctor/doc-tri.png',
    specialty: 'Pelayanan Pasien & Konsultasi'
  },
  {
    id: 5,
    name: 'Dr. Aris\nSetiawan',
    role: 'Head of Cardiology',
    image: '/assets/landing/doctor/doc-aris.png',
    specialty: 'Konsultan Kesehatan Jantung'
  },
  {
    id: 6,
    name: 'Dr. Maya\nPutri',
    role: 'Pediatric Director',
    image: '/assets/landing/doctor/doc-maya.png',
    specialty: 'Spesialis Anak & Tumbuh Kembang'
  },
  {
    id: 7,
    name: 'Dr. Hendra\nWijaya',
    role: 'Neurology Specialist',
    image: '/assets/landing/doctor/doc-hendra.png',
    specialty: 'Spesialis Saraf & Terapi Saraf'
  },
  {
    id: 8,
    name: 'Dr. Nina\nAmelia',
    role: 'Emergency Medicine Lead',
    image: '/assets/landing/doctor/doc-nina.png',
    specialty: 'Dokter UGD & Siaga 24 Jam'
  }
];

const MIDWIFE_MEMBERS: DoctorMember[] = [
  {
    id: 1,
    name: 'Bidan Sarah\nAmalia',
    role: 'Head of Maternity',
    image: '/assets/landing/doctor/midwife-sarah.png',
    specialty: 'Kepala Pelayanan Persalinan'
  },
  {
    id: 2,
    name: 'Bidan Siti\nRahmawati',
    role: 'Clinical Midwife Lead',
    image: '/assets/landing/doctor/midwife-siti.png',
    specialty: 'Bidan Klinis & Perawatan Ibu'
  },
  {
    id: 3,
    name: 'Bidan Dewi\nLestari',
    role: 'Perinatal Care Lead',
    image: '/assets/landing/doctor/midwife-dewi.png',
    specialty: 'Perawatan Perinatal & Laktasi'
  },
  {
    id: 4,
    name: 'Bidan Anita\nWijaya',
    role: 'Neonatal Specialist',
    image: '/assets/landing/doctor/midwife-anita.png',
    specialty: 'Spesialis Perawatan Bayi Baru Lahir'
  },
  {
    id: 5,
    name: 'Bidan Nurul\nHidayah',
    role: 'Postpartum Recovery',
    image: '/assets/landing/doctor/midwife-nurul.png',
    specialty: 'Pemulihan Pascapersalinan'
  },
  {
    id: 6,
    name: 'Bidan Rina\nAstuti',
    role: 'Family Planning Lead',
    image: '/assets/landing/doctor/midwife-rina.png',
    specialty: 'Konsultasi KB & Kesehatan Reproduksi'
  },
  {
    id: 7,
    name: 'Bidan Kartika\nSari',
    role: 'Gentle Birth Consultant',
    image: '/assets/landing/doctor/midwife-kartika.png',
    specialty: 'Konsultan Gentle Birth & Hypnobirthing'
  },
  {
    id: 8,
    name: 'Bidan Dian\nPermata',
    role: 'Community Care Director',
    image: '/assets/landing/doctor/midwife-dian.png',
    specialty: 'Pelayanan Kebidanan Komunitas'
  }
];

const PIN_MARKERS = [
  {
    id: 1,
    top: '55%',
    left: '12%',
    color: 'bg-[#0ea5e9]',
    name: 'dr. Bhagaskara Yudha',
    role: 'Founder & Lead Doctor'
  },
  {
    id: 2,
    top: '39%',
    left: '33%',
    color: 'bg-[#0ea5e9]',
    name: 'dr. Martha Suwanti',
    role: 'Co-Founder & Surgeon'
  },
  {
    id: 3,
    top: '61%',
    left: '38%',
    color: 'bg-[#14b8a6]',
    name: 'dr. Srikandi Wulandari',
    role: 'VP of Tech & Research'
  },
  {
    id: 4,
    top: '50%',
    left: '44%',
    color: 'bg-[#10b981]',
    name: 'dr. Tri Mulyanto',
    role: 'VP of Patient Care'
  },
  {
    id: 5,
    top: '60%',
    left: '45%',
    color: 'bg-[#14b8a6]',
    name: 'dr. Maya Putri',
    role: 'Pediatric Director'
  },
  {
    id: 6,
    top: '48%',
    left: '59%',
    color: 'bg-[#10b981]',
    name: 'dr. Aris Setiawan',
    role: 'Head of Cardiology'
  },
  {
    id: 7,
    top: '48%',
    left: '69%',
    color: 'bg-[#84cc16]',
    name: 'dr. Hendra Wijaya',
    role: 'Neurology Specialist'
  },
  {
    id: 8,
    top: '58%',
    left: '77%',
    color: 'bg-[#84cc16]',
    name: 'dr. Nina Amelia',
    role: 'Emergency Medicine Lead'
  },
  {
    id: 9,
    top: '52%',
    left: '86%',
    color: 'bg-[#84cc16]',
    name: 'Bidan Sarah Amalia',
    role: 'Head of Maternity'
  }
];

export function DokterView() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [activePin, setActivePin] = useState<number | null>(null);

  const handleOpenBookingWithDoctor = (docName?: string) => {
    setSelectedDoctor(docName?.replace('\n', ' '));
    setIsBookingModalOpen(true);
  };

  return (
    <div className='min-h-screen w-full flex flex-col bg-[#ffffff] text-[#13195c] selection:bg-[#dfe2f6] selection:text-[#13195c] font-sans antialiased overflow-x-hidden'>
      {/* 1. Header Navbar matching Figma */}
      <LandingNavbar onOpenBooking={() => handleOpenBookingWithDoctor()} />

      <main className='flex-1 w-full flex flex-col items-center space-y-16 sm:space-y-20 py-6'>
        {/* Section 1: Kenali Klinik Amanah - Doctor Team Lineup (Figma Node 2061:9612) */}
        <section className='w-full max-w-[1501px] px-4 sm:px-6 flex justify-center'>
          <div className='w-full rounded-[28px] sm:rounded-[40px] bg-[#ffffff] border border-[#e2e8f0]/80 shadow-xs p-6 sm:p-12 lg:p-14 space-y-8 sm:space-y-10 text-center'>
            {/* Header Text */}
            <div className='max-w-[672px] mx-auto space-y-2 text-center'>
              <span className='font-sans font-medium text-[20px] sm:text-[24px] text-[#13195c] tracking-tight block'>
                KLINIK AMANAH HEALTHCARE
              </span>
              <h1 className='font-sans font-medium text-3xl sm:text-5xl lg:text-[48px] text-[#13195c] tracking-tight leading-tight'>
                Kenali Klinik Amanah
              </h1>
              <p className='font-sans font-normal text-[14px] sm:text-[16px] text-[#13195c]/85 leading-relaxed max-w-[580px] mx-auto pt-1'>
                Memberikan pelayanan kesehatan yang profesional, nyaman, dan terpercaya untuk Anda
                dan keluarga.
              </p>
            </div>

            {/* Doctor Team Lineup Banner with Interactive Plus Pins (1302x562) */}
            <div className='relative w-full max-w-[1302px] h-[360px] sm:h-[480px] lg:h-[560px] mx-auto rounded-[24px] sm:rounded-[36px] overflow-hidden shadow-lg border border-[#e2e8f0]/80 group bg-gradient-to-b from-[#f8fafc] to-[#dfe2f6]/40'>
              <Image
                src='/assets/landing/doctor/hero-banner.png'
                alt='Tim Dokter dan Tenaga Medis Klinik Amanah Healthcare'
                fill
                priority
                className='object-cover object-center transition-transform duration-700 group-hover:scale-101'
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/landing/doctor/fill-107bc445.png';
                }}
              />

              {/* Interactive Plus Pin Markers */}
              {PIN_MARKERS.map((pin) => (
                <div
                  key={pin.id}
                  style={{ top: pin.top, left: pin.left }}
                  className='absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer'
                  onClick={() => setActivePin(activePin === pin.id ? null : pin.id)}
                >
                  <div
                    className={`relative flex items-center justify-center size-6 sm:size-7 rounded-full ${pin.color} text-white shadow-lg hover:scale-125 transition-transform ring-2 ring-white/90`}
                  >
                    <Icons.add className='size-3.5 text-white font-bold stroke-[3]' />
                  </div>

                  <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-[190px] sm:w-[210px] p-3 rounded-[16px] bg-white/95 backdrop-blur-md shadow-2xl border border-[#e2e8f0] text-left opacity-0 group-hover/pin:opacity-100 pointer-events-none transition-all duration-200 z-30'>
                    <span className='font-bold text-[13px] text-[#13195c] block leading-snug'>
                      {pin.name}
                    </span>
                    <span className='font-caveat text-[15px] text-[#30465c] block leading-tight'>
                      {pin.role}
                    </span>
                    <span className='text-[10px] text-emerald-600 font-semibold mt-1 block'>
                      Tersedia untuk Janji Temu
                    </span>
                  </div>
                </div>
              ))}

              <div className='absolute bottom-5 left-5 z-10'>
                <div className='px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#e2e8f0] shadow-sm'>
                  <span className='text-[11px] sm:text-[12px] font-semibold text-[#13195c]'>
                    Click on any pin marker to view team doctor details
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Kenali Dokter Kami matching uploaded screenshot 1:1 (Figma Node 2061:10809) */}
        <section
          id='dokter-kami'
          className='w-full max-w-[1501px] px-4 sm:px-6 flex justify-center'
        >
          <div className='w-full max-w-[1400px] space-y-10 sm:space-y-12'>
            {/* Header Text */}
            <div className='max-w-[672px] mx-auto text-center space-y-1.5'>
              <span className='font-caveat font-normal text-[32px] sm:text-[38px] text-[#13195c] block leading-tight select-none'>
                Kenali Dokter Kami
              </span>
              <h2 className='font-sans font-medium text-3xl sm:text-4xl lg:text-[48px] text-[#13195c] tracking-tight leading-tight'>
                Profesional. Peduli. Terpercaya.
              </h2>
              <p className='text-[14px] sm:text-[15px] text-[#30465c] leading-relaxed pt-1 max-w-[580px] mx-auto font-normal'>
                Didukung oleh dokter dan tenaga kesehatan yang berdedikasi, Klinik Amanah Healthcare
                berkomitmen memberikan pelayanan kesehatan yang berkualitas, nyaman, dan terpercaya
                bagi Anda dan keluarga.
              </p>
            </div>

            {/* 8 Doctor Cards Grid (4 Columns x 2 Rows, Card bg #dfe2f6, size 332x420 matching screenshot 1:1) */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch'>
              {DOCTOR_MEMBERS.map((doc) => (
                <div
                  key={doc.id}
                  className='rounded-[32px] sm:rounded-[36px] bg-[#dfe2f6] p-6 pb-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 text-left group'
                >
                  {/* Doctor Info */}
                  <div className='space-y-1 min-h-[75px]'>
                    <h3 className='font-sans font-extrabold text-[21px] sm:text-[23px] text-[#13195c] tracking-tight leading-[1.15] whitespace-pre-line'>
                      {doc.name}
                    </h3>
                    <p className='font-caveat text-[18px] sm:text-[20px] text-[#30465c] leading-none pt-0.5'>
                      {doc.role}
                    </p>
                  </div>

                  {/* Doctor Photo Container (Pure White cutout box with 2 dark navy buttons) */}
                  <div className='relative w-full h-[270px] sm:h-[280px] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white shadow-sm group/photo'>
                    <Image
                      src={doc.image}
                      alt={doc.name.replace('\n', ' ')}
                      fill
                      className='object-cover object-top transition-transform duration-500 group-hover:scale-104'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/landing/hero-exact-bg.png';
                      }}
                    />

                    {/* Bottom Right 2 Dark Navy Action Buttons matching screenshot */}
                    <div className='absolute bottom-3 right-3 flex items-center gap-1.5 z-10'>
                      {/* Button 1: LinkedIn / Schedule button */}
                      <button
                        type='button'
                        onClick={() => handleOpenBookingWithDoctor(doc.name)}
                        className='size-8 rounded-[10px] bg-[#13195c] hover:bg-[#13195c]/90 text-white transition-all flex items-center justify-center shadow-md cursor-pointer'
                        title={`Buat Janji dengan ${doc.name.replace('\n', ' ')}`}
                      >
                        <Icons.brandLinkedin className='size-3.5 text-white' />
                      </button>

                      {/* Button 2: Twitter / X button */}
                      <a
                        href='https://twitter.com'
                        target='_blank'
                        rel='noreferrer'
                        className='size-8 rounded-[10px] bg-[#13195c] hover:bg-[#13195c]/90 text-white transition-all flex items-center justify-center shadow-md text-[11px] font-bold'
                        title='Twitter / X'
                      >
                        𝕏
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Kenali Bidan Kami matching screenshot 1:1 (Figma Node 2061:11077) */}
        <section id='bidan-kami' className='w-full max-w-[1501px] px-4 sm:px-6 flex justify-center'>
          <div className='w-full max-w-[1400px] space-y-10 sm:space-y-12'>
            {/* Header Text */}
            <div className='max-w-[672px] mx-auto text-center space-y-2'>
              <span className='font-caveat font-normal text-[32px] sm:text-[36px] text-[#13195c] block leading-tight'>
                Kenali Bidan Kami
              </span>
              <h2 className='font-sans font-medium text-3xl sm:text-4xl lg:text-[48px] text-[#13195c] tracking-tight leading-tight'>
                Hangat Mendampingi, Sepenuh Hati.
              </h2>
              <p className='text-[14px] sm:text-[15px] text-[#30465c] leading-relaxed pt-1 max-w-[580px] mx-auto font-normal'>
                Bidan Klinik Amanah Healthcare berkomitmen memberikan pendampingan yang nyaman dan
                terpercaya bagi ibu dan keluarga, mulai dari kehamilan, persalinan, hingga masa
                pascamelahirkan.
              </p>
            </div>

            {/* 8 Midwife Cards Grid (4 Columns x 2 Rows, Card bg #dfe2f6, size 332x420) */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch'>
              {MIDWIFE_MEMBERS.map((midwife) => (
                <div
                  key={midwife.id}
                  className='rounded-[32px] sm:rounded-[36px] bg-[#dfe2f6] p-6 pb-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 text-left group'
                >
                  {/* Midwife Info */}
                  <div className='space-y-1 min-h-[75px]'>
                    <h3 className='font-sans font-extrabold text-[21px] sm:text-[23px] text-[#13195c] tracking-tight leading-[1.15] whitespace-pre-line'>
                      {midwife.name}
                    </h3>
                    <p className='font-caveat text-[18px] sm:text-[20px] text-[#30465c] leading-none pt-0.5'>
                      {midwife.role}
                    </p>
                  </div>

                  {/* Midwife Photo Container */}
                  <div className='relative w-full h-[270px] sm:h-[280px] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white shadow-sm group/photo'>
                    <Image
                      src={midwife.image}
                      alt={midwife.name.replace('\n', ' ')}
                      fill
                      className='object-cover object-top transition-transform duration-500 group-hover:scale-104'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/landing/hero-exact-bg.png';
                      }}
                    />

                    {/* Bottom Right 2 Dark Navy Action Buttons */}
                    <div className='absolute bottom-3 right-3 flex items-center gap-1.5 z-10'>
                      <button
                        type='button'
                        onClick={() => handleOpenBookingWithDoctor(midwife.name)}
                        className='size-8 rounded-[10px] bg-[#13195c] hover:bg-[#13195c]/90 text-white transition-all flex items-center justify-center shadow-md cursor-pointer'
                        title={`Buat Janji dengan ${midwife.name.replace('\n', ' ')}`}
                      >
                        <Icons.brandLinkedin className='size-3.5 text-white' />
                      </button>
                      <a
                        href='https://twitter.com'
                        target='_blank'
                        rel='noreferrer'
                        className='size-8 rounded-[10px] bg-[#13195c] hover:bg-[#13195c]/90 text-white transition-all flex items-center justify-center shadow-md text-[11px] font-bold'
                        title='Twitter / X'
                      >
                        𝕏
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 4. Footer matching Figma Node 2061:9837 */}
      <LandingFooter />

      {/* Global Interactive Appointment Modal */}
      <AppointmentModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        defaultDoctor={selectedDoctor}
      />

      {/* Floating Gary AI Assistant Widget */}
      <ChatwootWidget />
    </div>
  );
}
