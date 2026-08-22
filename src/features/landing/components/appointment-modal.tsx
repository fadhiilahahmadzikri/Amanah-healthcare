'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { initialDoctorSchedules } from '@/constants/mock-api-doctor-schedules';

export interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultService?: string;
  defaultDoctor?: string;
}

const SERVICES_LIST = [
  'Poli Umum & Konsultasi USG',
  'Poli Gigi & Perawatan Mulut',
  'Persalinan 24 Jam & Rawat Inap',
  'Khitan Modern Tanpa Jarum Suntik',
  'Laboratorium & Cek Darah Lengkap',
  'Farmasi & Apotek 24 Jam',
  'Konsultasi Kesehatan Keluarga'
];

export function AppointmentModal({
  open,
  onOpenChange,
  defaultService,
  defaultDoctor
}: AppointmentModalProps) {
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [layanan, setLayanan] = useState(defaultService || SERVICES_LIST[0]);
  const [dokterId, setDokterId] = useState(defaultDoctor || initialDoctorSchedules[0]?.id || '');
  const [tanggal, setTanggal] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [sesi, setSesi] = useState('Pagi (08:00 - 12:00)');
  const [keluhan, setKeluhan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedDoctor = initialDoctorSchedules.find((d) => d.id === dokterId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !telepon.trim()) {
      toast.error('Mohon lengkapi nama lengkap dan nomor WhatsApp aktif');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_) {}

      toast.success('Pendaftaran Janji Temu Berhasil Terkirim!');
    }, 900);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setNama('');
    setTelepon('');
    setKeluhan('');
    onOpenChange(false);
  };

  const handleSendToWhatsApp = () => {
    const text = encodeURIComponent(
      `*Pendaftaran Janji Temu - Klinik Amanah Healthcare*\n\n` +
        `• *Nama Pasien:* ${nama}\n` +
        `• *No. WhatsApp:* ${telepon}\n` +
        `• *Layanan:* ${layanan}\n` +
        `• *Dokter:* ${selectedDoctor?.nama_dokter || 'Dokter Umum Jaga'}\n` +
        `• *Tanggal:* ${tanggal}\n` +
        `• *Sesi/Waktu:* ${sesi}\n` +
        `• *Keluhan/Catatan:* ${keluhan || '-'}\n\n` +
        `_Mohon konfirmasi ketersediaan antrean. Terima kasih._`
    );
    window.open(`https://wa.me/6281392456664?text=${text}`, '_blank');
    handleResetAndClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[540px] max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-border/70 shadow-2xl bg-card/98 backdrop-blur-xl'>
        {/* Header Modal */}
        <div className='bg-gradient-to-r from-primary/15 via-sky-500/10 to-primary/5 p-6 border-b border-border/50 relative'>
          <Badge
            variant='secondary'
            className='bg-primary/20 text-primary border-primary/30 font-semibold mb-2 text-xs px-2.5 py-0.5'
          >
            Reservasi Cepat 24 Jam
          </Badge>
          <DialogHeader className='text-left space-y-1'>
            <DialogTitle className='text-xl sm:text-2xl font-bold text-foreground tracking-tight'>
              Buat Janji Temu Pasien
            </DialogTitle>
            <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
              Pilih jadwal dokter dan layanan kesehatan Klinik Amanah Healthcare dengan konfirmasi
              instan.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className='p-6 sm:p-8 flex flex-col items-center text-center space-y-4'>
            <div className='size-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-8 ring-emerald-500/10'>
              <Icons.check className='size-8' />
            </div>
            <div className='space-y-1.5'>
              <h3 className='text-xl font-bold text-foreground tracking-tight'>
                Janji Temu Berhasil Dibuat!
              </h3>
              <p className='text-xs sm:text-sm text-muted-foreground max-w-sm'>
                Terima kasih <strong className='text-foreground'>{nama}</strong>. Data reservasi
                Anda telah tercatat pada SIMRS Klinik Amanah.
              </p>
            </div>

            <div className='w-full p-4 rounded-2xl bg-muted/50 border border-border/60 text-left space-y-2 text-xs'>
              <div className='flex justify-between py-1 border-b border-border/40'>
                <span className='text-muted-foreground'>Layanan:</span>
                <span className='font-semibold text-foreground'>{layanan}</span>
              </div>
              <div className='flex justify-between py-1 border-b border-border/40'>
                <span className='text-muted-foreground'>Dokter:</span>
                <span className='font-semibold text-foreground'>
                  {selectedDoctor?.nama_dokter || 'Dokter Spesialis'}
                </span>
              </div>
              <div className='flex justify-between py-1 border-b border-border/40'>
                <span className='text-muted-foreground'>Waktu Kunjungan:</span>
                <span className='font-semibold text-foreground'>
                  {tanggal} ({sesi})
                </span>
              </div>
              <div className='flex justify-between py-1'>
                <span className='text-muted-foreground'>WhatsApp:</span>
                <span className='font-semibold text-foreground'>{telepon}</span>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-2.5 w-full pt-2'>
              <Button
                type='button'
                onClick={handleSendToWhatsApp}
                className='flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-xs sm:text-sm shadow-md gap-2'
              >
                <Icons.phone className='size-4' />
                Kirim Konfirmasi ke WhatsApp
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={handleResetAndClose}
                className='rounded-xl border-border/70 h-11 text-xs sm:text-sm font-semibold'
              >
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='p-6 space-y-4'>
            {/* Nama & WhatsApp */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Nama Lengkap Pasien <span className='text-destructive'>*</span>
                </label>
                <input
                  type='text'
                  required
                  placeholder='contoh: Ahmad Zikri'
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className='w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Nomor WhatsApp Aktif <span className='text-destructive'>*</span>
                </label>
                <input
                  type='tel'
                  required
                  placeholder='contoh: 08123456789'
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className='w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40'
                />
              </div>
            </div>

            {/* Pilihan Layanan Medis */}
            <div className='space-y-1.5'>
              <label className='text-xs font-bold text-foreground'>Pilihan Layanan Medis</label>
              <select
                value={layanan}
                onChange={(e) => setLayanan(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40'
              >
                {SERVICES_LIST.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>

            {/* Pilihan Dokter */}
            <div className='space-y-1.5'>
              <label className='text-xs font-bold text-foreground'>Dokter Spesialis / Umum</label>
              <select
                value={dokterId}
                onChange={(e) => setDokterId(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40'
              >
                {initialDoctorSchedules.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.nama_dokter} — {doc.spesialisasi} ({doc.ruang_praktik})
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal & Sesi Waktu */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>Tanggal Kunjungan</label>
                <input
                  type='date'
                  required
                  value={tanggal}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTanggal(e.target.value)}
                  className='w-full px-3.5 py-2 rounded-xl border border-border/70 bg-background text-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>Sesi Waktu Praktik</label>
                <select
                  value={sesi}
                  onChange={(e) => setSesi(e.target.value)}
                  className='w-full px-3.5 py-2 rounded-xl border border-border/70 bg-background text-foreground text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40'
                >
                  <option value='Pagi (08:00 - 12:00)'>Sesi Pagi (08:00 - 12:00 WIB)</option>
                  <option value='Siang (13:00 - 16:00)'>Sesi Siang (13:00 - 16:00 WIB)</option>
                  <option value='Sore/Malam (17:00 - 21:00)'>
                    Sesi Sore / Malam (17:00 - 21:00 WIB)
                  </option>
                  <option value='Layanan 24 Jam (UGD / Bersalin)'>
                    Layanan 24 Jam (UGD / Bersalin)
                  </option>
                </select>
              </div>
            </div>

            {/* Keluhan Singkat */}
            <div className='space-y-1.5'>
              <label className='text-xs font-bold text-foreground'>
                Keluhan / Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder='Tuliskan keluhan atau kebutuhan pemeriksaan khusus...'
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                className='w-full px-3.5 py-2 rounded-xl border border-border/70 bg-background text-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40 resize-none'
              />
            </div>

            {/* Action Buttons */}
            <div className='pt-3 flex items-center justify-end gap-2.5 border-t border-border/50'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => onOpenChange(false)}
                className='rounded-xl text-xs sm:text-sm font-semibold'
              >
                Batal
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 text-xs sm:text-sm h-10 shadow-md flex items-center gap-2'
              >
                {isSubmitting ? (
                  <>
                    <Icons.spinner className='size-4 animate-spin' />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Icons.calendar className='size-4' />
                    Konfirmasi Janji Temu
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
