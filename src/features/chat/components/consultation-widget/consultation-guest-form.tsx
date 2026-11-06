'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Plasma3DLogo } from '@/components/ui/plasma-3d-logo';
import { toast } from 'sonner';

interface ConsultationGuestFormProps {
  onStart: (info: { name: string; email: string }) => void;
  isLoading?: boolean;
}

export function ConsultationGuestForm({ onStart, isLoading }: ConsultationGuestFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      toast.error('Mohon isi nama lengkap Anda');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      toast.error('Mohon masukkan alamat email yang valid');
      return;
    }

    onStart({ name: trimmedName, email: trimmedEmail });
  };

  return (
    <div className='flex-1 p-6 flex flex-col justify-center items-center select-none bg-gradient-to-b from-transparent to-background/50'>
      <div className='w-full max-w-sm space-y-5 animate-in fade-in duration-300'>
        <div className='flex flex-col items-center text-center space-y-2'>
          <div className='relative size-16 flex items-center justify-center shrink-0 mb-1'>
            <Plasma3DLogo size={58} />
          </div>
          <h4 className='text-base font-bold text-foreground tracking-tight'>
            Konsultasi Live Chat Klinik
          </h4>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            Selamat datang di Amanah Healthcare. Masukkan nama dan email Anda untuk terhubung
            langsung dengan staf medis kami.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-3.5'>
          <div className='space-y-1.5'>
            <label
              htmlFor='guest-name-input'
              className='text-xs font-semibold text-foreground block'
            >
              Nama Lengkap
            </label>
            <input
              id='guest-name-input'
              type='text'
              required
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Contoh: Siti Rahma'
              className='w-full h-9 px-3 rounded-xl border border-border/80 bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
            />
          </div>

          <div className='space-y-1.5'>
            <label
              htmlFor='guest-email-input'
              className='text-xs font-semibold text-foreground block'
            >
              Alamat Email
            </label>
            <input
              id='guest-email-input'
              type='email'
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='nama@email.com'
              className='w-full h-9 px-3 rounded-xl border border-border/80 bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
            />
          </div>

          <Button
            type='submit'
            disabled={isLoading || !name.trim() || !email.trim()}
            className='w-full h-9 rounded-xl text-xs font-semibold mt-2 shadow-xs'
          >
            {isLoading ? (
              <span className='flex items-center gap-1.5'>
                <Icons.spinner className='size-3.5 animate-spin' />
                <span>Menghubungkan...</span>
              </span>
            ) : (
              <span>Mulai Konsultasi</span>
            )}
          </Button>
        </form>

        <p className='text-[11px] text-muted-foreground/80 text-center'>
          Privasi data Anda terjaga sesuai dengan standar medis Amanah Healthcare.
        </p>
      </div>
    </div>
  );
}
