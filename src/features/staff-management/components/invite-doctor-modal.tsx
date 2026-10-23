'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { cn } from '@/lib/utils';
import {
  type PolyclinicUnit,
  type PractitionerRoleOption,
  staffManagementApi
} from '../api/staff-management.api';

export type InviteWizardStep = 'email' | 'role' | 'poliklinik' | 'confirmation' | 'result';

export interface InviteDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'practitioner' | 'staff';
}

export function InviteDoctorModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'practitioner'
}: InviteDoctorModalProps) {
  const [step, setStep] = useState<InviteWizardStep>('email');
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [practitionerRoles, setPractitionerRoles] = useState<PractitionerRoleOption[]>([]);
  const [polyclinics, setPolyclinics] = useState<PolyclinicUnit[]>([]);

  // Form states: email, roleCode, and poliklinikId
  const [email, setEmail] = useState('');
  const [roleCode, setRoleCode] = useState(mode === 'staff' ? 'staff_worker' : 'staff_doctor');
  const [poliklinikId, setPoliklinikId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Result dialog state for showing generated temporary password
  const [credentialResult, setCredentialResult] = useState<{
    temporaryPassword: string;
    email: string;
    roleTitle: string;
  } | null>(null);

  // GSAP animation refs
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Animate step transitions with GSAP (identical to reservation modal)
  useEffect(() => {
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollTop = 0;
      gsap.fromTo(
        stepContainerRef.current,
        { opacity: 0.5, y: 8 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
      );
    }
  }, [step]);

  // Animate dropdown open/close with GSAP
  useEffect(() => {
    if (dropdownRef.current) {
      if (isDropdownOpen) {
        gsap.fromTo(
          dropdownRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.22, ease: 'power2.out' }
        );
      } else {
        gsap.to(dropdownRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.16,
          ease: 'power2.in'
        });
      }
    }
  }, [isDropdownOpen]);

  // Fetch invitation options when opened
  useEffect(() => {
    if (!isOpen) {
      setStep('email');
      setEmail('');
      setRoleCode(mode === 'staff' ? 'staff_worker' : 'staff_doctor');
      setPoliklinikId('');
      setIsDropdownOpen(false);
      setCredentialResult(null);
      return;
    }

    if (mode === 'staff') return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setFetchingOptions(true);
    });

    staffManagementApi
      .getInvitationOptions()
      .then((res) => {
        if (cancelled) return;
        const roles = res.practitionerRoles || [];
        const polis = res.polyclinics || [];
        setPractitionerRoles(roles);
        setPolyclinics(polis);

        const initialRole = roles.length > 0 ? roles[0].code : 'staff_doctor';
        setRoleCode((prev) => prev || initialRole);

        if (polis.length > 0) {
          setPoliklinikId((prev) => {
            if (prev) return prev;
            const defaultPoli =
              initialRole === 'staff_midwife'
                ? polis.find((p) => p.code?.toLowerCase().includes('kia')) || polis[0]
                : polis.find((p) => p.code?.toLowerCase().includes('umum')) || polis[0];
            return defaultPoli.id;
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Gagal memuat opsi form praktisi medis dari server.');
        }
      })
      .finally(() => {
        if (!cancelled) setFetchingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, mode]);

  const handleRoleChange = (selectedRole: string) => {
    setRoleCode(selectedRole);
    if (selectedRole === 'staff_midwife') {
      const kiaPoli = polyclinics.find(
        (p) =>
          p.code?.toLowerCase().includes('kia') ||
          p.namaPoli?.toLowerCase().includes('kia') ||
          p.name?.toLowerCase().includes('kia')
      );
      if (kiaPoli) setPoliklinikId(kiaPoli.id);
    } else if (selectedRole === 'staff_doctor') {
      const umumPoli = polyclinics.find(
        (p) =>
          p.code?.toLowerCase().includes('umum') ||
          p.namaPoli?.toLowerCase().includes('umum') ||
          p.name?.toLowerCase().includes('umum')
      );
      if (umumPoli) setPoliklinikId(umumPoli.id);
    }
  };

  const isEmailValid = useMemo(() => {
    const trimmed = email.trim();
    return trimmed.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }, [email]);

  const roleTitle = useMemo(() => {
    if (mode === 'staff') return 'Staf Operasional';
    const found = practitionerRoles.find((r) => r.code === roleCode);
    return found?.name || (roleCode === 'staff_midwife' ? 'Bidan' : 'Dokter');
  }, [mode, practitionerRoles, roleCode]);

  const selectedPoliklinik = useMemo(() => {
    return polyclinics.find((p) => p.id === poliklinikId) || null;
  }, [polyclinics, poliklinikId]);

  const handleSubmit = async () => {
    if (!isEmailValid) {
      toast.error('Harap masukkan alamat email yang valid.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'staff') {
        const res = await staffManagementApi.inviteStaff({
          email: email.trim().toLowerCase(),
          roleCode: 'staff_worker'
        });
        toast.success(`Undangan staf operasional berhasil dikirim ke ${email}!`);
        setCredentialResult({
          email,
          temporaryPassword: res.temporaryPassword,
          roleTitle: 'Staf Operasional'
        });
      } else {
        if (!poliklinikId) {
          toast.error('Harap tentukan poliklinik penugasan.');
          return;
        }
        const res = await staffManagementApi.inviteDoctor({
          email: email.trim().toLowerCase(),
          poliklinikId,
          roleCode
        });
        toast.success(`Undangan ${roleTitle} berhasil dikirim ke ${email}!`);
        setCredentialResult({
          email,
          temporaryPassword: res.temporaryPassword,
          roleTitle
        });
      }
      setStep('result');
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim undangan.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setStep('email');
    setCredentialResult(null);
    setEmail('');
    setIsDropdownOpen(false);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleFinish}
      maxWidth='max-w-[500px]'
      backdropClassName='overflow-hidden'
      className='flex flex-col h-auto max-h-none overflow-visible rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-[500px] my-auto shadow-2xl'
    >
      <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-4 justify-start'>
        {/* Animated Wizard Content Area */}
        <div ref={stepContainerRef} className='pr-1 h-auto overflow-visible'>
          {/* STEP 1: Email Input */}
          {step === 'email' && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  {mode === 'staff'
                    ? 'Ketik alamat email staf operasional'
                    : 'Ketik alamat email praktisi'}
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  {mode === 'staff'
                    ? 'Masukkan email aktif staf operasional untuk penerbitan akun klinik.'
                    : 'Masukkan email aktif dokter atau bidan yang akan diundang ke klinik.'}
                </p>
              </div>

              <div className='space-y-2 pt-1'>
                <label
                  htmlFor='wizardEmailInput'
                  className='block text-xs font-semibold text-foreground'
                >
                  Alamat Email <span className='text-destructive'>*</span>
                </label>
                <Input
                  id='wizardEmailInput'
                  type='email'
                  placeholder={
                    mode === 'staff'
                      ? 'contoh: staf.operasional@amanah.clinic'
                      : 'contoh: dokter.spesialis@amanah.clinic'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isEmailValid) {
                      e.preventDefault();
                      setStep(mode === 'practitioner' ? 'role' : 'confirmation');
                    }
                  }}
                  className='h-10 rounded-xl text-xs sm:text-sm bg-background border-border shadow-xs'
                />
              </div>
            </div>
          )}

          {/* STEP 2: Role Selection (Practitioner only) */}
          {step === 'role' && mode === 'practitioner' && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Pilih peran klinis praktisi
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  Tentukan apakah praktisi bertugas sebagai Dokter Spesialis/Umum atau Bidan.
                </p>
              </div>

              <div className='grid grid-cols-1 gap-2.5 pt-1'>
                <button
                  type='button'
                  aria-label='Pilih peran Dokter'
                  onClick={() => handleRoleChange('staff_doctor')}
                  className={cn(
                    'group relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer select-none',
                    roleCode === 'staff_doctor'
                      ? 'border-2 border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                      : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/10'
                  )}
                >
                  <div className='flex-1 min-w-0 space-y-0.5'>
                    <span className='text-sm font-bold text-foreground group-hover:text-primary transition-colors block'>
                      Dokter
                    </span>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Praktisi medis untuk konsultasi dan pemeriksaan umum atau spesialis
                      poliklinik.
                    </p>
                  </div>
                  <div className='shrink-0 self-center pl-1'>
                    <div
                      className={cn(
                        'size-5 rounded-full border flex items-center justify-center transition-colors',
                        roleCode === 'staff_doctor'
                          ? 'border-primary bg-primary'
                          : 'border-border bg-background'
                      )}
                    >
                      {roleCode === 'staff_doctor' && (
                        <div className='size-2 rounded-full bg-primary-foreground' />
                      )}
                    </div>
                  </div>
                </button>

                <button
                  type='button'
                  aria-label='Pilih peran Bidan'
                  onClick={() => handleRoleChange('staff_midwife')}
                  className={cn(
                    'group relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer select-none',
                    roleCode === 'staff_midwife'
                      ? 'border-2 border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                      : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/10'
                  )}
                >
                  <div className='flex-1 min-w-0 space-y-0.5'>
                    <span className='text-sm font-bold text-foreground group-hover:text-primary transition-colors block'>
                      Bidan
                    </span>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Praktisi kebidanan untuk layanan kesehatan ibu, anak, dan imunisasi klinik.
                    </p>
                  </div>
                  <div className='shrink-0 self-center pl-1'>
                    <div
                      className={cn(
                        'size-5 rounded-full border flex items-center justify-center transition-colors',
                        roleCode === 'staff_midwife'
                          ? 'border-primary bg-primary'
                          : 'border-border bg-background'
                      )}
                    >
                      {roleCode === 'staff_midwife' && (
                        <div className='size-2 rounded-full bg-primary-foreground' />
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Poliklinik Assignment with GSAP Accordion/Dropdown */}
          {step === 'poliklinik' && mode === 'practitioner' && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Tentukan poliklinik penugasan
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  Pilih unit poliklinik tempat praktisi ini akan membuka sesi praktik jadwal.
                </p>
              </div>

              <div className='space-y-2 pt-1'>
                <button
                  type='button'
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className='w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:border-primary/50 text-left transition-colors cursor-pointer select-none'
                >
                  <div className='min-w-0 flex-1'>
                    <span className='text-xs text-muted-foreground block font-medium'>
                      Unit Poliklinik Terpilih
                    </span>
                    <span className='text-sm font-bold text-foreground truncate block mt-0.5'>
                      {selectedPoliklinik?.name ||
                        selectedPoliklinik?.namaPoli ||
                        'Pilih Poliklinik...'}
                    </span>
                  </div>
                  <span className='text-xs font-semibold text-primary ml-2 shrink-0'>
                    {isDropdownOpen ? 'Tutup' : 'Ubah Unit'}
                  </span>
                </button>

                {/* GSAP Animated Dropdown List */}
                <div
                  ref={dropdownRef}
                  className='overflow-hidden rounded-xl border border-border bg-card'
                  style={{ height: isDropdownOpen ? 'auto' : 0, opacity: isDropdownOpen ? 1 : 0 }}
                >
                  <div className='max-h-52 overflow-y-auto p-1.5 space-y-1 divide-y divide-border/30'>
                    {polyclinics.map((p) => {
                      const isSelected = p.id === poliklinikId;
                      return (
                        <button
                          key={p.id}
                          type='button'
                          onClick={() => {
                            setPoliklinikId(p.id);
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer select-none',
                            isSelected
                              ? 'bg-primary/10 font-bold text-primary'
                              : 'text-foreground hover:bg-muted/50 font-medium'
                          )}
                        >
                          <span className='truncate'>{p.name || p.namaPoli}</span>
                          {isSelected && (
                            <span className='text-[11px] font-semibold text-primary'>Terpilih</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation Summary */}
          {step === 'confirmation' && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Periksa ringkasan undangan
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  Pastikan seluruh data penugasan telah sesuai sebelum akun dan kredensial sementara
                  diterbitkan.
                </p>
              </div>

              <div className='rounded-xl border border-border bg-muted/30 p-4 space-y-3 font-sans'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Alamat Email</span>
                  <span className='font-semibold text-foreground truncate max-w-[260px]'>
                    {email}
                  </span>
                </div>
                <div className='flex items-center justify-between text-xs pt-2 border-t border-border/40'>
                  <span className='text-muted-foreground'>Peran Penugasan</span>
                  <span className='font-semibold text-foreground'>{roleTitle}</span>
                </div>
                {mode === 'practitioner' && (
                  <div className='flex items-center justify-between text-xs pt-2 border-t border-border/40'>
                    <span className='text-muted-foreground'>Unit Poliklinik</span>
                    <span className='font-semibold text-foreground truncate max-w-[260px]'>
                      {selectedPoliklinik?.name || selectedPoliklinik?.namaPoli || '-'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Credential Result (Success State) */}
          {step === 'result' && credentialResult && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Undangan {credentialResult.roleTitle} Berhasil Dibuat
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  Email undangan dengan tautan aktivasi login telah dikirimkan ke{' '}
                  <span className='font-semibold text-foreground'>{credentialResult.email}</span>.
                </p>
              </div>

              <div className='rounded-xl border border-border bg-muted/30 p-4 space-y-2.5 font-sans'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Alamat Email</span>
                  <span className='font-semibold text-foreground'>{credentialResult.email}</span>
                </div>
                <div className='flex items-center justify-between text-xs pt-2 border-t border-border/40'>
                  <span className='text-muted-foreground'>Password Sementara</span>
                  <span className='font-mono font-bold text-foreground bg-background px-2.5 py-1 rounded-lg border border-border select-all'>
                    {credentialResult.temporaryPassword}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Action Bar (Pill buttons, matching reservation modal) */}
        <div className='flex items-center justify-between shrink-0 pt-3 border-t border-border/40'>
          <div>
            {step === 'email' ? (
              <Button type='button' variant='ghost' size='md' shape='pill' onClick={handleFinish}>
                Batal
              </Button>
            ) : step === 'role' ? (
              <Button
                type='button'
                variant='ghost'
                size='md'
                shape='pill'
                onClick={() => setStep('email')}
              >
                Kembali
              </Button>
            ) : step === 'poliklinik' ? (
              <Button
                type='button'
                variant='ghost'
                size='md'
                shape='pill'
                onClick={() => setStep('role')}
              >
                Kembali
              </Button>
            ) : step === 'confirmation' ? (
              <Button
                type='button'
                variant='ghost'
                size='md'
                shape='pill'
                onClick={() => setStep(mode === 'practitioner' ? 'poliklinik' : 'email')}
              >
                Kembali
              </Button>
            ) : null}
          </div>

          <div>
            {step === 'email' ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                disabled={!isEmailValid}
                onClick={() => setStep(mode === 'practitioner' ? 'role' : 'confirmation')}
                className='min-w-[120px]'
              >
                Lanjut
              </Button>
            ) : step === 'role' ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                onClick={() => setStep('poliklinik')}
                className='min-w-[120px]'
              >
                Lanjut
              </Button>
            ) : step === 'poliklinik' ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                disabled={!poliklinikId}
                onClick={() => setStep('confirmation')}
                className='min-w-[120px]'
              >
                Lanjut
              </Button>
            ) : step === 'confirmation' ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                disabled={loading || fetchingOptions}
                isLoading={loading}
                onClick={handleSubmit}
                className='min-w-[140px]'
              >
                Kirim Undangan
              </Button>
            ) : step === 'result' ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                onClick={handleFinish}
                className='min-w-[100px]'
              >
                Selesai
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
