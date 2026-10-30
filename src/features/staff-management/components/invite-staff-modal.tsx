'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { ROLE_TIER } from '@/core/auth/permissions.constants';
import { useInviteStaffModal, type UseInviteStaffModalProps } from '../model/useInviteStaffModal';

export type InviteStaffModalProps = UseInviteStaffModalProps;

export function InviteStaffModal(props: InviteStaffModalProps) {
  const { isOpen, onClose } = props;
  const {
    email,
    setEmail,
    fullName,
    setFullName,
    selectedRoleId,
    setSelectedRoleId,
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

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={credentialResult ? handleFinish : onClose}
      maxWidth='max-w-[540px]'
      dismissible={!isLoading}
    >
      <div className='flex flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl border border-border/80'>
        {credentialResult ? (
          /* Result View: Temporary Credentials Issued */
          <div className='flex flex-col p-6 sm:p-7 gap-5'>
            <div className='flex items-center gap-3.5'>
              <div className='flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'>
                <Icons.check className='size-6' />
              </div>
              <div className='flex flex-col'>
                <h3 className='text-base font-semibold text-foreground'>
                  Undangan Berhasil Dikirim!
                </h3>
                <p className='text-xs text-muted-foreground'>
                  Kredensial login sementara telah dibuat dan dikirimkan via email.
                </p>
              </div>
            </div>

            <div className='flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/30 p-4'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>Penerima:</span>
                <span className='font-medium text-foreground'>{credentialResult.email}</span>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>Peran:</span>
                <Badge variant='outline' className='font-normal text-[11px]'>
                  {credentialResult.roleName}
                </Badge>
              </div>
              <div className='flex flex-col gap-1 pt-2 border-t border-border/50'>
                <span className='text-[11px] font-medium text-muted-foreground'>
                  Password Sementara:
                </span>
                <div className='flex items-center justify-between rounded-lg bg-background px-3 py-2 border border-border/80'>
                  <code className='font-mono text-sm font-semibold tracking-wider text-primary'>
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

            <div className='flex items-center justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={copyCredentials}
                className='text-xs gap-1.5'
              >
                <Icons.copy className='size-3.5' />
                Salin Kredensial
              </Button>
              <Button type='button' size='sm' onClick={handleFinish} className='text-xs'>
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          /* Form View: Universal Staff Invitation Form */
          <form onSubmit={handleSubmit} className='flex flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-border/60 px-6 py-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <Icons.userPlus className='size-5' />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-foreground'>
                    Undang Staf & Praktisi Baru
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    Kirim undangan onboarding akun staf atau praktisi klinis
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={onClose}
                disabled={isLoading}
                className='rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
              >
                <Icons.close className='size-4' />
              </button>
            </div>

            {/* Body */}
            <div className='flex flex-col gap-4 p-6'>
              {/* Email */}
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='invite-email' className='text-xs font-medium'>
                  Alamat Email Calon Staf <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='invite-email'
                  type='email'
                  placeholder='contoh: pegawai@amanah.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className='h-9 text-xs'
                />
              </div>

              {/* Full Name */}
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='invite-name' className='text-xs font-medium'>
                  Nama Lengkap (Opsional)
                </Label>
                <Input
                  id='invite-name'
                  type='text'
                  placeholder='contoh: dr. Budi Santoso, Sp.A'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className='h-9 text-xs'
                />
              </div>

              {/* Role Selection */}
              <div className='flex flex-col gap-1.5'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='invite-role' className='text-xs font-medium'>
                    Peran Ditugaskan <span className='text-destructive'>*</span>
                  </Label>
                  {selectedRole && (
                    <span className='text-[11px] text-muted-foreground'>
                      {selectedRole.tier === ROLE_TIER.MACRO ? 'Tingkat Makro' : 'Tingkat Mikro'}
                    </span>
                  )}
                </div>

                {isOptionsLoading ? (
                  <div className='flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted/40 text-xs text-muted-foreground'>
                    <Icons.spinner className='size-3.5 animate-spin' />
                    <span>Memuat daftar peran...</span>
                  </div>
                ) : (
                  <select
                    id='invite-role'
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    disabled={isLoading || roles.length === 0}
                    className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {roles.filter((r) => r.tier === 'macro').length > 0 && (
                      <optgroup label='Peran Makro (Struktural / Induk)'>
                        {roles
                          .filter((r) => r.tier === 'macro')
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} {r.isClinical ? '• (Praktisi Klinis)' : '• (Operasional)'}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    {roles.filter((r) => r.tier === 'micro').length > 0 && (
                      <optgroup label='Peran Mikro (Spesifik / Fungsional)'>
                        {roles
                          .filter((r) => r.tier === 'micro')
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} {r.isClinical ? '• (Praktisi Klinis)' : '• (Operasional)'}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    {roles
                      .filter((r) => !['macro', 'micro'].includes(r.tier))
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.isClinical ? '• (Praktisi Klinis)' : '• (Operasional)'}
                        </option>
                      ))}
                  </select>
                )}
                {selectedRole?.description && (
                  <p className='text-[11px] text-muted-foreground'>{selectedRole.description}</p>
                )}
              </div>

              {/* Dynamic Unit Assignment: Clinical vs Operational */}
              {isClinical ? (
                <div className='flex flex-col gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 transition-all'>
                  <div className='flex items-center justify-between'>
                    <Label
                      htmlFor='invite-poli'
                      className='text-xs font-medium text-blue-900 dark:text-blue-300'
                    >
                      Unit Poliklinik Penugasan <span className='text-destructive'>*</span>
                    </Label>
                    <Badge
                      variant='outline'
                      className='text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                    >
                      Praktisi Klinis
                    </Badge>
                  </div>

                  <select
                    id='invite-poli'
                    value={selectedPoliklinikId}
                    onChange={(e) => setSelectedPoliklinikId(e.target.value)}
                    disabled={isLoading || polyclinics.length === 0}
                    required={isClinical}
                    className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <option value=''>-- Pilih Poliklinik --</option>
                    {polyclinics.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                  <p className='text-[11px] text-blue-800/80 dark:text-blue-400/80'>
                    Praktisi klinis akan otomatis didaftarkan ke jadwal operasional poliklinik yang
                    dipilih.
                  </p>
                </div>
              ) : (
                <div className='flex flex-col gap-1.5 rounded-xl border border-border/70 bg-muted/20 p-3.5 transition-all'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='invite-unit' className='text-xs font-medium text-foreground'>
                      Unit / Departemen Kerja{' '}
                      <span className='text-muted-foreground font-normal'>(Opsional)</span>
                    </Label>
                    <Badge variant='outline' className='text-[10px] bg-muted text-muted-foreground'>
                      Staf Operasional
                    </Badge>
                  </div>

                  <select
                    id='invite-unit'
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    disabled={isLoading || clinicUnits.length === 0}
                    className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <option value=''>-- Tanpa Penempatan Unit Khusus (Umum) --</option>
                    {clinicUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.unitType})
                      </option>
                    ))}
                  </select>
                  <p className='text-[11px] text-muted-foreground'>
                    Tugaskan staf operasional ke departemen kerja tertentu atau biarkan kosong untuk
                    staf umum.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-6 py-3.5'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onClose}
                disabled={isLoading}
                className='text-xs'
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={isLoading || isOptionsLoading || roles.length === 0}
                className='text-xs gap-1.5'
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className='size-3.5 animate-spin' />
                    <span>Mengirim Undangan...</span>
                  </>
                ) : (
                  <>
                    <Icons.send className='size-3.5' />
                    <span>Kirim Undangan</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </ModalWrapper>
  );
}
