'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface LandingNavbarProps {
  onOpenBooking: () => void;
}

const NAV_LINKS = [
  { label: 'Beranda', href: '/', sectionId: 'beranda' },
  { label: 'Tentang Kami', href: '/#tentang-kami', sectionId: 'tentang-kami' },
  { label: 'Fasilitas', href: '/#fasilitas', sectionId: 'fasilitas' },
  { label: 'Dokter', href: '/dokter', sectionId: 'dokter' },
  { label: 'Kontak', href: '/#kontak', sectionId: 'kontak' },
  { label: 'Layanan', href: '/#layanan', sectionId: 'layanan' }
];

export function LandingNavbar({ onOpenBooking }: LandingNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('beranda');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isDokterPage = pathname === '/dokter';

  useEffect(() => {
    if (isDokterPage) {
      setActiveSection('dokter');
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sectionIds = ['beranda', 'tentang-kami', 'fasilitas', 'dokter', 'kontak', 'layanan'];
      const scrollPos = window.scrollY + 180;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDokterPage]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: (typeof NAV_LINKS)[0]) => {
    setMobileMenuOpen(false);

    if (link.href === '/dokter') {
      return; // Let Next.js Link navigate normally to /dokter
    }

    if (pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(link.sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header
      className={cn(
        'w-full z-50 transition-all duration-300',
        isScrolled
          ? 'sticky top-0 bg-[#ffffff]/95 backdrop-blur-md shadow-xs border-b border-[#e2e8f0]'
          : 'bg-[#ffffff] border-b border-[#f3f4f6]'
      )}
    >
      <div className='max-w-[1300px] mx-auto px-4 sm:px-6 h-[95px] flex items-center justify-between'>
        {/* Brand Logo & Name */}
        <Link href='/' className='flex items-center gap-3 cursor-pointer group'>
          <div className='relative size-[45px] rounded-xl overflow-hidden shrink-0'>
            <Image
              src='/assets/landing/brand-logo.png'
              alt='Amanah Healthcare'
              width={45}
              height={45}
              className='object-contain group-hover:scale-105 transition-transform'
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/icon.svg';
              }}
            />
          </div>
          <span className='font-sans font-medium text-[29px] text-[#13195c] tracking-tight'>
            Amanah
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className='hidden lg:flex items-center gap-1.5'>
          {NAV_LINKS.map((link) => {
            const isActive =
              (isDokterPage && link.sectionId === 'dokter') ||
              (!isDokterPage && activeSection === link.sectionId);
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-[16px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#dfe2f6] text-[#13195c] font-semibold'
                    : 'text-[#13195c]/80 hover:text-[#13195c] hover:bg-[#f3f4f6]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className='hidden md:flex items-center gap-3'>
          <Link href='/dashboard'>
            <button
              type='button'
              className='h-[50px] px-6 rounded-full bg-[#13195c] text-[#ffffff] font-medium text-[16px] hover:bg-[#13195c]/90 transition-all flex items-center gap-3 group cursor-pointer shadow-sm hover:shadow-md'
            >
              <span>Masuk</span>
              <div className='size-[32px] rounded-full bg-[#ffffff] text-[#13195c] flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform'>
                <Icons.arrowUpRight className='size-4 text-[#13195c]' />
              </div>
            </button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className='flex items-center gap-2 lg:hidden'>
          <button
            type='button'
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className='p-2 rounded-xl text-[#13195c] hover:bg-[#f3f4f6]'
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <Icons.close className='size-6' />
            ) : (
              <Icons.menu className='size-6' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className='lg:hidden bg-[#ffffff] border-b border-[#e2e8f0] px-6 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2'>
          <nav className='flex flex-col space-y-1'>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className='px-3 py-2.5 rounded-xl text-[16px] font-medium text-[#13195c] hover:bg-[#dfe2f6]'
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className='pt-2 flex flex-col gap-2'>
            <button
              type='button'
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className='w-full h-[48px] rounded-full bg-[#13195c] text-white font-medium text-[16px] flex items-center justify-center gap-2'
            >
              <span>Buat Janji Temu</span>
              <Icons.calendar className='size-4' />
            </button>
            <Link href='/dashboard' onClick={() => setMobileMenuOpen(false)}>
              <button
                type='button'
                className='w-full h-[44px] rounded-full border border-[#13195c] text-[#13195c] font-medium text-[15px]'
              >
                Masuk ke Dashboard
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
