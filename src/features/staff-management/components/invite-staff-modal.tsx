'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { cn } from '@/lib/utils';
import { useInviteStaffModal, type UseInviteStaffModalProps } from '../model/useInviteStaffModal';

export type InviteStaffModalProps = UseInviteStaffModalProps;

export function InviteStaffModal(props: InviteStaffModalProps) {
  const { isOpen } = props;
  const {
    step,
    setStep,
    email,
    setEmail,
    isEmailValid,
    fullName,
    setFullName,
    selectedRoleId,
    handleRoleSelect,
    positionTitle,
    setPositionTitle,
    selectedPoliklinikId,
    setSelectedPoliklinikId,
    selectedUnitId,
    setSelectedUnitId,
    roles,
    polyclinics,
    clinicUnits,
    selectedRole,
    isClinical,
    isLoading,
    isOptionsLoading,
    credentialResult,
    copied,
    copyCredentials,
    handleSubmit,
    handleFinish
  } = useInviteStaffModal(props);

  // GSAP animation refs
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const unitDropdownRef = useRef<HTMLDivElement>(null);

  // Accordion push-down states
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

  // Animate step transitions with GSAP (identical to reservation modal)
  useEffect(() => {
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollTop = 0;
      gsap.fromTo(
        stepContainerRef.current,
        { opacity: 0.45, y: 8 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
      );
    }
    // Auto-close open dropdowns on step switch
    setIsRoleDropdownOpen(false);
    setIsUnitDropdownOpen(false);
  }, [step]);

  // Animate role dropdown open/close with GSAP (in-flow push down)
  useEffect(() => {
    if (roleDropdownRef.current) {
      if (isRoleDropdownOpen) {
        gsap.fromTo(
          roleDropdownRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.24, ease: 'power2.out' }
        );
      } else {
        gsap.to(roleDropdownRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.16,
          ease: 'power2.in'
        });
      }
    }
  }, [isRoleDropdownOpen]);

  // Animate unit dropdown open/close with GSAP (in-flow push down)
  useEffect(() => {
    if (unitDropdownRef.current) {
      if (isUnitDropdownOpen) {
        gsap.fromTo(
          unitDropdownRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.24, ease: 'power2.out' }
        );
      } else {
        gsap.to(unitDropdownRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.16,
          ease: 'power2.in'
        });
      }
    }
  }, [isUnitDropdownOpen]);

  // Auto-select first polyclinic for clinical role if none selected
  useEffect(() => {
    if (isClinical && polyclinics.length > 0 && !selectedPoliklinikId) {
      setSelectedPoliklinikId(polyclinics[0].id);
    }
  }, [isClinical, polyclinics, selectedPoliklinikId, setSelectedPoliklinikId]);

  const selectedPoliklinik = useMemo(() => {
    return polyclinics.find((p) => p.id === selectedPoliklinikId) || null;
  }, [polyclinics, selectedPoliklinikId]);

  const selectedClinicUnit = useMemo(() => {
    return clinicUnits.find((u) => u.id === selectedUnitId) || null;
  }, [clinicUnits, selectedUnitId]);

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
        <div ref={stepContainerRef} className='pr-0.5 h-auto overflow-visible'>
          {/* SLIDE 1: Email Input */}
          {step === 'email' && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Ketik alamat email calon staf
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  Masukkan email aktif calon staf atau praktisi untuk penerbitan akun klinik.
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
                  autoComplete='off'
                  placeholder='contoh: pegawai@amanah.clinic'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (isEmailValid) {
                        setStep('name');
                      }
                    }
                  }}
                  className='h-10 rounded-xl text-xs sm:text-sm bg-background border-border shadow-xs'
                />
              </div>
            </div>
          )}

          {/* SLIDE 2: Full Name Input (Optional) */}
          {step === 'name' && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Ketik nama lengkap calon staf
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  Nama lengkap dan gelar staf atau praktisi klinis (dapat dilengkapi nanti).
                </p>
              </div>

              <div className='space-y-2 pt-1'>
                <label
                  htmlFor='wizardNameInput'
                  className='block text-xs font-semibold text-foreground'
                >
                  Nama Lengkap <span className='text-muted-foreground font-normal'>(Opsional)</span>
                </label>
                <Input
                  id='wizardNameInput'
                  type='text'
                  autoComplete='off'
                  placeholder='contoh: dr. Budi Santoso, Sp.A'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setStep('role');
                    }
                  }}
                  className='h-10 rounded-xl text-xs sm:text-sm bg-background border-border shadow-xs'
                />
              </div>
            </div>
          )}

          {/* SLIDE 3: Role Selection with Push-Down GSAP Accordion */}
          {step === 'role' && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Pilih peran penugasan
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  Tentukan peran calon staf dalam struktur organisasi dan hak akses klinik.
                </p>
              </div>

              <div className='space-y-2 pt-1'>
                <button
                  type='button'
                  onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
                  className='w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:border-primary/50 text-left transition-colors cursor-pointer select-none'
                >
                  <div className='min-w-0 flex-1'>
                    <span className='text-xs text-muted-foreground block font-medium'>
                      Peran Terpilih
                    </span>
                    <span className='text-sm font-bold text-foreground truncate block mt-0.5'>
                      {selectedRole ? (
                        <>
                          {selectedRole.name}{' '}
                          <span className='text-xs font-normal text-muted-foreground'>
                            {selectedRole.isClinical ? '• (Praktisi Klinis)' : '• (Operasional)'}
                          </span>
                        </>
                      ) : (
                        'Pilih Peran...'
                      )}
                    </span>
                  </div>
                  <span className='text-xs font-semibold text-primary ml-2 shrink-0'>
                    {isRoleDropdownOpen ? 'Tutup' : 'Ubah Peran'}
                  </span>
                </button>

                {/* GSAP Animated Dropdown List (Accordion Push-down) */}
                <div
                  ref={roleDropdownRef}
                  className='overflow-hidden rounded-xl border border-border bg-card'
                  style={{
                    height: isRoleDropdownOpen ? 'auto' : 0,
                    opacity: isRoleDropdownOpen ? 1 : 0
                  }}
                >
                  {isOptionsLoading ? (
                    <div className='flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground'>
                      <Icons.spinner className='size-3.5 animate-spin' />
                      <span>Memuat daftar peran...</span>
                    </div>
                  ) : (
                    <div className='max-h-56 overflow-y-auto p-1.5 space-y-1 divide-y divide-border/30'>
                      {roles.map((r) => {
                        const isSelected = r.id === selectedRoleId;
                        return (
                          <button
                            key={r.id}
                            type='button'
                            onClick={() => {
                              handleRoleSelect(r.id);
                              setIsRoleDropdownOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer select-none',
                              isSelected
                                ? 'bg-primary/10 font-bold text-primary'
                                : 'text-foreground hover:bg-muted/50 font-medium'
                            )}
                          >
                            <div className='flex flex-col min-w-0 pr-2'>
                              <span className='truncate font-medium text-foreground'>{r.name}</span>
                              <span className='text-[10px] text-muted-foreground'>
                                {r.isClinical ? 'Praktisi Klinis' : 'Staf Operasional'}
                                {r.tier ? ` • Tingkat ${r.tier}` : ''}
                              </span>
                            </div>
                            {isSelected && (
                              <span className='text-[11px] font-semibold text-primary shrink-0'>
                                Terpilih
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedRole?.description && (
                  <p className='text-[11px] text-muted-foreground px-1 pt-1'>
                    {selectedRole.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 4: Position Title Input */}
          {step === 'position' && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Tentukan profesi & jabatan staf
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  Jabatan fungsional atau spesialisasi tugas staf di klinik. Otomatis terisi sesuai
                  nama peran tetapi dapat disesuaikan.
                </p>
              </div>

              <div className='space-y-2 pt-1'>
                <label
                  htmlFor='wizardPositionInput'
                  className='block text-xs font-semibold text-foreground'
                >
                  Profesi / Jabatan Staf <span className='text-destructive'>*</span>
                </label>
                <Input
                  id='wizardPositionInput'
                  type='text'
                  autoComplete='off'
                  placeholder={selectedRole?.name || 'contoh: Bidan Koordinator KIA'}
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setStep('unit');
                    }
                  }}
                  className='h-10 rounded-xl text-xs sm:text-sm bg-background border-border shadow-xs'
                />
                <p className='text-[11px] text-muted-foreground px-0.5'>
                  Peran sistem:{' '}
                  <span className='font-semibold text-foreground'>{selectedRole?.name}</span> (
                  {isClinical ? 'Praktisi Klinis' : 'Staf Operasional'}).
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 5: Unit Assignment & Confirmation */}
          {step === 'unit' && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Tentukan unit penugasan
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  {isClinical
                    ? 'Pilih unit poliklinik tempat praktisi ini akan membuka sesi praktik jadwal.'
                    : 'Tugaskan staf ke unit/departemen kerja tertentu atau biarkan tanpa unit khusus.'}
                </p>
              </div>

              <div className='space-y-2 pt-1'>
                <button
                  type='button'
                  onClick={() => setIsUnitDropdownOpen((prev) => !prev)}
                  className='w-full flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:border-primary/50 text-left transition-colors cursor-pointer select-none'
                >
                  <div className='min-w-0 flex-1'>
                    <span className='text-xs text-muted-foreground block font-medium'>
                      {isClinical ? 'Unit Poliklinik Penugasan' : 'Unit / Departemen Kerja'}
                    </span>
                    <span className='text-sm font-bold text-foreground truncate block mt-0.5'>
                      {isClinical
                        ? selectedPoliklinik?.name || 'Pilih Poliklinik...'
                        : selectedClinicUnit?.name || 'Tanpa Penempatan Unit Khusus (Umum)'}
                    </span>
                  </div>
                  <span className='text-xs font-semibold text-primary ml-2 shrink-0'>
                    {isUnitDropdownOpen ? 'Tutup' : 'Ubah Unit'}
                  </span>
                </button>

                {/* GSAP Animated Dropdown List (Accordion Push-down) */}
                <div
                  ref={unitDropdownRef}
                  className='overflow-hidden rounded-xl border border-border bg-card'
                  style={{
                    height: isUnitDropdownOpen ? 'auto' : 0,
                    opacity: isUnitDropdownOpen ? 1 : 0
                  }}
                >
                  <div className='max-h-52 overflow-y-auto p-1.5 space-y-1 divide-y divide-border/30'>
                    {!isClinical && (
                      <button
                        type='button'
                        onClick={() => {
                          setSelectedUnitId('');
                          setIsUnitDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer select-none',
                          !selectedUnitId
                            ? 'bg-primary/10 font-bold text-primary'
                            : 'text-foreground hover:bg-muted/50 font-medium'
                        )}
                      >
                        <span className='truncate'>Tanpa Penempatan Unit Khusus (Umum)</span>
                        {!selectedUnitId && (
                          <span className='text-[11px] font-semibold text-primary'>Terpilih</span>
                        )}
                      </button>
                    )}

                    {isClinical
                      ? polyclinics.map((p) => {
                          const isSelected = p.id === selectedPoliklinikId;
                          return (
                            <button
                              key={p.id}
                              type='button'
                              onClick={() => {
                                setSelectedPoliklinikId(p.id);
                                setIsUnitDropdownOpen(false);
                              }}
                              className={cn(
                                'w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer select-none',
                                isSelected
                                  ? 'bg-primary/10 font-bold text-primary'
                                  : 'text-foreground hover:bg-muted/50 font-medium'
                              )}
                            >
                              <span className='truncate'>{p.name}</span>
                              {isSelected && (
                                <span className='text-[11px] font-semibold text-primary'>
                                  Terpilih
                                </span>
                              )}
                            </button>
                          );
                        })
                      : clinicUnits.map((u) => {
                          const isSelected = u.id === selectedUnitId;
                          return (
                            <button
                              key={u.id}
                              type='button'
                              onClick={() => {
                                setSelectedUnitId(u.id);
                                setIsUnitDropdownOpen(false);
                              }}
                              className={cn(
                                'w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer select-none',
                                isSelected
                                  ? 'bg-primary/10 font-bold text-primary'
                                  : 'text-foreground hover:bg-muted/50 font-medium'
                              )}
                            >
                              <span className='truncate'>
                                {u.name} {u.unitType ? `(${u.unitType})` : ''}
                              </span>
                              {isSelected && (
                                <span className='text-[11px] font-semibold text-primary'>
                                  Terpilih
                                </span>
                              )}
                            </button>
                          );
                        })}
                  </div>
                </div>

                {/* Ringkasan Konfirmasi Interaktif (Hover to Jump to Slide) */}
                <div className='rounded-xl border border-border bg-muted/20 p-2.5 space-y-1 font-sans mt-3'>
                  <div className='px-1.5 pb-1 text-[11px] font-semibold text-muted-foreground flex items-center justify-between'>
                    <span>Ringkasan Calon Staf</span>
                    <span className='text-[10px] font-normal text-muted-foreground'>
                      Klik baris untuk edit
                    </span>
                  </div>

                  {/* Email */}
                  <button
                    type='button'
                    onClick={() => setStep('email')}
                    className='w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer text-left select-none'
                  >
                    <span className='text-xs text-muted-foreground group-hover:text-foreground transition-colors'>
                      Email
                    </span>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-xs font-semibold text-foreground truncate max-w-[200px]'>
                        {email}
                      </span>
                      <span className='text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium'>
                        Ubah
                      </span>
                    </div>
                  </button>

                  {/* Nama Lengkap */}
                  {fullName && (
                    <button
                      type='button'
                      onClick={() => setStep('name')}
                      className='w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer text-left select-none'
                    >
                      <span className='text-xs text-muted-foreground group-hover:text-foreground transition-colors'>
                        Nama Lengkap
                      </span>
                      <div className='flex items-center gap-1.5'>
                        <span className='text-xs font-semibold text-foreground truncate max-w-[200px]'>
                          {fullName}
                        </span>
                        <span className='text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium'>
                          Ubah
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Peran Penugasan */}
                  <button
                    type='button'
                    onClick={() => setStep('role')}
                    className='w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer text-left select-none'
                  >
                    <span className='text-xs text-muted-foreground group-hover:text-foreground transition-colors'>
                      Peran Sistem
                    </span>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-xs font-semibold text-foreground'>
                        {selectedRole?.name || '-'}
                      </span>
                      <span className='text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium'>
                        Ubah
                      </span>
                    </div>
                  </button>

                  {/* Profesi / Jabatan */}
                  <button
                    type='button'
                    onClick={() => setStep('position')}
                    className='w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer text-left select-none'
                  >
                    <span className='text-xs text-muted-foreground group-hover:text-foreground transition-colors'>
                      Profesi / Jabatan
                    </span>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-xs font-semibold text-foreground truncate max-w-[200px]'>
                        {positionTitle || selectedRole?.name || '-'}
                      </span>
                      <span className='text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium'>
                        Ubah
                      </span>
                    </div>
                  </button>

                  {/* Unit Penempatan */}
                  <div className='w-full flex items-center justify-between p-2 text-xs'>
                    <span className='text-muted-foreground'>Unit Penempatan</span>
                    <span className='font-semibold text-foreground truncate max-w-[200px]'>
                      {isClinical
                        ? selectedPoliklinik?.name || 'Belum dipilih'
                        : selectedClinicUnit?.name || 'Tanpa Penempatan Khusus (Umum)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: Credential Result (Success State) */}
          {step === 'result' && credentialResult && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
                  Undangan Berhasil Dikirim!
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                  Kredensial login sementara telah dibuat dan dikirimkan ke{' '}
                  <span className='font-semibold text-foreground'>{credentialResult.email}</span>.
                </p>
              </div>

              <div className='rounded-xl border border-border bg-muted/30 p-4 space-y-3 font-sans'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Penerima:</span>
                  <span className='font-medium text-foreground'>{credentialResult.email}</span>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Peran:</span>
                  <span className='font-medium text-foreground'>{credentialResult.roleName}</span>
                </div>
                <div className='flex flex-col gap-1 pt-2 border-t border-border/50'>
                  <span className='text-[11px] font-medium text-muted-foreground'>
                    Password Sementara:
                  </span>
                  <div className='flex items-center justify-between rounded-lg bg-background px-3 py-2 border border-border/80'>
                    <code className='font-mono text-sm font-semibold tracking-wider text-primary select-all'>
                      {credentialResult.temporaryPassword}
                    </code>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={copyCredentials}
                      className='h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground'
                    >
                      {copied ? (
                        <>
                          <Icons.check className='size-3.5 text-emerald-500' />
                          <span className='text-emerald-600 dark:text-emerald-400'>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Icons.copy className='size-3.5' />
                          <span>Salin</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Action Bar (Pill buttons) */}
        <div className='flex items-center justify-between shrink-0 pt-3 border-t border-border/40'>
          <div>
            {step === 'email' ? (
              <Button type='button' variant='ghost' size='md' shape='pill' onClick={handleFinish}>
                Batal
              </Button>
            ) : step === 'name' ? (
              <Button
                type='button'
                variant='ghost'
                size='md'
                shape='pill'
                onClick={() => setStep('email')}
              >
                Kembali
              </Button>
            ) : step === 'role' ? (
              <Button
                type='button'
                variant='ghost'
                size='md'
                shape='pill'
                onClick={() => setStep('name')}
              >
                Kembali
              </Button>
            ) : step === 'position' ? (
              <Button
                type='button'
                variant='ghost'
                size='md'
                shape='pill'
                onClick={() => setStep('role')}
              >
                Kembali
              </Button>
            ) : step === 'unit' ? (
              <Button
                type='button'
                variant='ghost'
                size='md'
                shape='pill'
                onClick={() => setStep('position')}
                disabled={isLoading}
              >
                Kembali
              </Button>
            ) : step === 'result' ? (
              <Button
                type='button'
                variant='outline'
                size='md'
                shape='pill'
                onClick={copyCredentials}
                className='text-xs gap-1.5'
              >
                <Icons.copy className='size-3.5' />
                Salin Kredensial
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
                onClick={() => setStep('name')}
                className='min-w-[120px]'
              >
                Lanjut
              </Button>
            ) : step === 'name' ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                onClick={() => setStep('role')}
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
                disabled={!selectedRoleId}
                onClick={() => setStep('position')}
                className='min-w-[120px]'
              >
                Lanjut
              </Button>
            ) : step === 'position' ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                onClick={() => setStep('unit')}
                className='min-w-[120px]'
              >
                Lanjut
              </Button>
            ) : step === 'unit' ? (
              <Button
                type='button'
                variant='primary'
                size='md'
                shape='pill'
                disabled={isLoading || isOptionsLoading || (isClinical && !selectedPoliklinikId)}
                isLoading={isLoading}
                onClick={() => handleSubmit()}
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
