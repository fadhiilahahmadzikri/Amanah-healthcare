'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { roleManagementApi } from '@/features/role-management/api/role-management.api';
import { AUDIENCE } from '@/core/auth/permissions.constants';
import { cn } from '@/lib/utils';
import { useWorkPoliciesCurrentQuery } from '../api/queries';
import { useUpdateCompensationRatesMutation } from '../api/mutations';

export interface PayrollRatesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoleRateForm {
  hourlyRate: number;
  overtimeHourlyRate: number;
}

export function PayrollRatesConfigModal({ isOpen, onClose }: PayrollRatesConfigModalProps) {
  const { data: workPolicies, isLoading: isLoadingPolicies } = useWorkPoliciesCurrentQuery();
  const updateRatesMutation = useUpdateCompensationRatesMutation();

  const { data: allRoles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: roleManagementApi.getAllRoles,
    enabled: isOpen
  });

  const internalRoles = useMemo(
    () => allRoles.filter((r) => r.audience === AUDIENCE.INTERNAL),
    [allRoles]
  );

  const [configuredRoleIds, setConfiguredRoleIds] = useState<string[]>([]);
  const [formRates, setFormRates] = useState<Record<string, RoleRateForm>>({});

  // Populate from fetched rates based on active roleId (Clean Canvas / Zero Presets)
  useEffect(() => {
    if (workPolicies?.rates && Array.isArray(workPolicies.rates)) {
      const activeRates = workPolicies.rates.filter((r) => r.roleId && r.isActive !== false);
      const activeIds = activeRates.map((r) => r.roleId);
      setConfiguredRoleIds(activeIds);

      setFormRates((prev) => {
        const next = { ...prev };
        for (const item of activeRates) {
          next[item.roleId] = {
            hourlyRate: Number(item.hourlyRate) || 0,
            overtimeHourlyRate: Number(item.overtimeHourlyRate) || 0
          };
        }
        return next;
      });
    }
  }, [workPolicies]);

  // Roles available to be added (internal roles that don't have an active rate card in the modal yet)
  const availableRolesToAdd = useMemo(() => {
    const configuredSet = new Set(configuredRoleIds);
    return internalRoles.filter((r) => !configuredSet.has(r.id));
  }, [internalRoles, configuredRoleIds]);

  // Configured role objects resolved from internalRoles
  const configuredRoles = useMemo(() => {
    const roleMap = new Map(internalRoles.map((r) => [r.id, r]));
    return configuredRoleIds
      .map((id) => roleMap.get(id))
      .filter((r): r is (typeof internalRoles)[0] => Boolean(r));
  }, [configuredRoleIds, internalRoles]);

  const handleAddRole = (roleId: string) => {
    setConfiguredRoleIds((prev) => (prev.includes(roleId) ? prev : [...prev, roleId]));
    setFormRates((prev) => ({
      ...prev,
      [roleId]: prev[roleId] || { hourlyRate: 0, overtimeHourlyRate: 0 }
    }));
  };

  const handleRemoveRole = (roleId: string) => {
    setConfiguredRoleIds((prev) => prev.filter((id) => id !== roleId));
  };

  const handleRateChange = (roleId: string, field: keyof RoleRateForm, rawValue: string) => {
    const parsed = parseInt(rawValue.replace(/\D/g, ''), 10) || 0;
    setFormRates((prev) => ({
      ...prev,
      [roleId]: {
        hourlyRate: prev[roleId]?.hourlyRate || 0,
        overtimeHourlyRate: prev[roleId]?.overtimeHourlyRate || 0,
        [field]: parsed
      }
    }));
  };

  const isSaving = updateRatesMutation.isPending;
  const isLoading = isLoadingPolicies || isLoadingRoles;

  const handleSave = async () => {
    const payloadRates = configuredRoleIds.map((roleId) => {
      const values = formRates[roleId] || { hourlyRate: 0, overtimeHourlyRate: 0 };
      return {
        roleId,
        hourlyRate: values.hourlyRate,
        overtimeHourlyRate: values.overtimeHourlyRate,
        notes: `Dikonfigurasi via Web Dashboard pada ${new Date().toLocaleDateString('id-ID')}`
      };
    });

    try {
      await updateRatesMutation.mutateAsync({ rates: payloadRates });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-3xl lg:max-w-4xl'
      className='max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden'
      showCloseButton={false}
      dismissible={!isSaving}
    >
      <div className='flex flex-col h-full min-h-0 flex-1 font-sans select-none'>
        {/* Pinned Header */}
        <div className='shrink-0 pb-3.5 border-b border-border/50 flex items-start justify-between gap-3'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2'>
              <span>Standar Tarif Kompensasi</span>
              {isLoading && (
                <Icons.spinner className='size-3.5 animate-spin text-primary shrink-0' />
              )}
            </h3>
            <p className='text-xs text-muted-foreground font-medium'>
              Kelola tarif dasar pokok dan insentif pengganti dinas per jam kerja berdasarkan peran
              staf.
            </p>
          </div>

          {/* Tombol Tambah Tarif Peran di Header */}
          {availableRolesToAdd.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type='button'
                  size='sm'
                  disabled={isLoading || isSaving}
                  className='h-8 px-3 text-xs gap-1.5 cursor-pointer shrink-0'
                >
                  <Icons.plus className='size-3.5' />
                  <span>Tambah Tarif Peran</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-64 sm:w-72 max-h-60 overflow-y-auto'>
                <DropdownMenuLabel className='text-xs font-semibold'>
                  Pilih Peran Internal
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableRolesToAdd.map((role) => (
                  <DropdownMenuItem
                    key={role.id}
                    onClick={() => handleAddRole(role.id)}
                    className='flex items-center justify-between text-xs cursor-pointer py-2'
                  >
                    <div className='flex flex-col min-w-0 pr-2'>
                      <span className='font-medium truncate text-foreground'>{role.name}</span>
                      <span className='text-[10px] text-muted-foreground font-mono uppercase'>
                        {role.code}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0',
                        role.isClinical
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                          : 'bg-muted text-muted-foreground border-border/50'
                      )}
                    >
                      {role.isClinical ? 'Klinis' : 'Operasional'}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Scrollable Body */}
        <div className='flex-1 min-h-0 overflow-y-auto py-4 space-y-4 pr-1'>
          {/* Accounting Governance Banner */}
          <div className='p-3.5 bg-muted/30 border border-border/50 rounded-xl space-y-1.5 text-xs'>
            <div className='font-semibold text-foreground'>
              <span>Prinsip Tata Kelola Tutup Buku (Accounting Governance)</span>
            </div>
            <p className='text-muted-foreground leading-relaxed text-[11px]'>
              Perubahan tarif akan berlaku untuk kalkulasi <strong>periode baru</strong> atau
              periode berstatus <strong>terkalkulasi</strong> saat dihitung ulang. Periode yang
              telah <strong>ditutup buku (final)</strong> bersifat permanen dan tidak akan mengalami
              perubahan nilai historis.
            </p>
          </div>

          {/* Dynamic Stacked Cards per Configured Role */}
          {isLoading ? (
            <div className='flex flex-col gap-3 py-6 items-center justify-center text-center'>
              <Icons.spinner className='size-6 animate-spin text-primary' />
              <p className='text-xs text-muted-foreground'>
                Memuat daftar peran internal dan standar tarif...
              </p>
            </div>
          ) : internalRoles.length === 0 ? (
            <div className='p-8 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-2'>
              <Icons.users className='size-8 text-muted-foreground/60' />
              <p className='text-sm font-semibold text-foreground'>Belum ada peran staf internal</p>
              <p className='text-xs text-muted-foreground max-w-sm leading-relaxed'>
                Daftarkan peran staf internal terlebih dahulu di menu Manajemen Peran untuk
                mengonfigurasi standar tarif per jam kerja.
              </p>
            </div>
          ) : configuredRoles.length === 0 ? (
            /* Clean Canvas Empty State */
            <div className='p-8 rounded-xl border border-dashed border-border/80 flex flex-col items-center justify-center text-center space-y-3 bg-muted/10 my-2'>
              <div className='size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                <Icons.receipt className='size-5' />
              </div>
              <div className='space-y-1 max-w-sm'>
                <p className='text-sm font-semibold text-foreground'>
                  Belum ada standar tarif aktif
                </p>
                <p className='text-xs text-muted-foreground leading-relaxed text-[11px]'>
                  Sistem kompensasi saat ini bersih tanpa preset. Klik tombol di bawah untuk memilih
                  peran staf internal dari Role Management dan menentukan tarif dasar per jamnya.
                </p>
              </div>
              {availableRolesToAdd.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type='button'
                      size='sm'
                      className='text-xs gap-1.5 h-8.5 px-3.5 cursor-pointer'
                    >
                      <Icons.plus className='size-3.5' />
                      <span>Tambah Tarif Peran</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='center' className='w-64 max-h-60 overflow-y-auto'>
                    <DropdownMenuLabel className='text-xs font-semibold'>
                      Pilih Peran Internal
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableRolesToAdd.map((role) => (
                      <DropdownMenuItem
                        key={role.id}
                        onClick={() => handleAddRole(role.id)}
                        className='flex items-center justify-between text-xs cursor-pointer py-2'
                      >
                        <div className='flex flex-col min-w-0 pr-2'>
                          <span className='font-medium text-foreground'>{role.name}</span>
                          <span className='text-[10px] text-muted-foreground font-mono uppercase'>
                            {role.code}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0',
                            role.isClinical
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                              : 'bg-muted text-muted-foreground border-border/50'
                          )}
                        >
                          {role.isClinical ? 'Klinis' : 'Operasional'}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <div className='flex flex-col gap-3.5'>
              {configuredRoles.map((role) => {
                const values = formRates[role.id] || {
                  hourlyRate: 0,
                  overtimeHourlyRate: 0
                };

                return (
                  <div
                    key={role.id}
                    className='p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card flex flex-col gap-3 shadow-2xs hover:border-border transition-colors'
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 min-w-0'>
                        <span className='font-semibold text-xs sm:text-sm text-foreground truncate'>
                          {role.name}
                        </span>
                        <span className='font-mono text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0'>
                          {role.code}
                        </span>
                        {role.tier && (
                          <span className='text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground uppercase border border-border/40 shrink-0'>
                            {role.tier}
                          </span>
                        )}
                      </div>

                      <div className='flex items-center gap-2 shrink-0'>
                        <span
                          className={cn(
                            'text-[10.5px] font-semibold px-2 py-0.5 rounded-full border',
                            role.isClinical
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                              : 'bg-muted text-muted-foreground border-border/50'
                          )}
                        >
                          {role.isClinical ? 'Tenaga Klinis' : 'Staf Operasional'}
                        </span>

                        {/* Tombol Hapus / Buang Tarif Peran */}
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleRemoveRole(role.id)}
                          disabled={isSaving}
                          className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors'
                          title={`Hapus konfigurasi tarif ${role.name}`}
                        >
                          <Icons.trash className='size-3.5' />
                        </Button>
                      </div>
                    </div>

                    {role.description && (
                      <p className='text-xs text-muted-foreground leading-relaxed'>
                        {role.description}
                      </p>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/40'>
                      {/* Tarif Dasar Pokok */}
                      <div className='flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/60 bg-muted/20'>
                        <span className='text-xs font-medium text-foreground whitespace-nowrap'>
                          Tarif Dasar Pokok
                        </span>
                        <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 shrink-0 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                          <span className='px-2.5 h-full flex items-center text-[11px] font-semibold text-muted-foreground bg-muted/40 border-r border-border/50 select-none'>
                            Rp
                          </span>
                          <input
                            type='text'
                            inputMode='numeric'
                            aria-label={`Tarif Dasar Pokok ${role.name}`}
                            value={values.hourlyRate.toLocaleString('id-ID')}
                            onChange={(e) =>
                              handleRateChange(role.id, 'hourlyRate', e.target.value)
                            }
                            disabled={isLoading || isSaving}
                            className='h-full text-right font-mono font-medium text-xs bg-transparent border-0 outline-none px-2.5 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-24 sm:w-28'
                          />
                          <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none whitespace-nowrap'>
                            / jam
                          </span>
                        </div>
                      </div>

                      {/* Tarif Pengganti / Lembur */}
                      <div className='flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/60 bg-muted/20'>
                        <span className='text-xs font-medium text-foreground whitespace-nowrap'>
                          Tarif Pengganti / Lembur
                        </span>
                        <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 shrink-0 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                          <span className='px-2.5 h-full flex items-center text-[11px] font-semibold text-muted-foreground bg-muted/40 border-r border-border/50 select-none'>
                            Rp
                          </span>
                          <input
                            type='text'
                            inputMode='numeric'
                            aria-label={`Tarif Pengganti atau Lembur ${role.name}`}
                            value={values.overtimeHourlyRate.toLocaleString('id-ID')}
                            onChange={(e) =>
                              handleRateChange(role.id, 'overtimeHourlyRate', e.target.value)
                            }
                            disabled={isLoading || isSaving}
                            className='h-full text-right font-mono font-medium text-xs bg-transparent border-0 outline-none px-2.5 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-24 sm:w-28'
                          />
                          <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none whitespace-nowrap'>
                            / jam
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pinned Footer */}
        <div className='shrink-0 pt-3.5 border-t border-border/50 flex items-center justify-between gap-2.5'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onClose}
            disabled={isSaving}
            className='px-3 font-semibold cursor-pointer text-xs h-8.5 text-muted-foreground hover:text-foreground'
          >
            Tutup
          </Button>
          <Button
            type='button'
            variant='default'
            size='sm'
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className='px-4 font-semibold cursor-pointer text-xs h-8.5 gap-1.5'
          >
            {isSaving ? (
              <>
                <Icons.spinner className='size-3.5 animate-spin mr-1' />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
