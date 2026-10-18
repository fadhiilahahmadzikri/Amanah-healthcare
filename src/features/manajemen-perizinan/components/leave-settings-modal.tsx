'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useCompensationRatesQuery, useLeavePoliciesQuery } from '../api/queries';
import { useUpdateCompensationRateMutation, useUpdateLeavePolicyMutation } from '../api/mutations';

interface LeaveSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaveSettingsModal({ isOpen, onClose }: LeaveSettingsModalProps) {
  const { data: policies, isLoading: isPolicyLoading } = useLeavePoliciesQuery();
  const { data: rates, isLoading: isRatesLoading } = useCompensationRatesQuery();

  const updatePolicyMutation = useUpdateLeavePolicyMutation();
  const updateRateMutation = useUpdateCompensationRateMutation();

  // Policy form state
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [limitMode, setLimitMode] = useState<'unlimited' | 'monthly_limit'>('monthly_limit');
  const [monthlyLimit, setMonthlyLimit] = useState(2);
  const [noticeDaysRequired, setNoticeDaysRequired] = useState(2);

  // Rate states
  const [doctorHourly, setDoctorHourly] = useState(150000);
  const [doctorOvertime, setDoctorOvertime] = useState(200000);

  const [midwifeHourly, setMidwifeHourly] = useState(150000);
  const [midwifeOvertime, setMidwifeOvertime] = useState(200000);

  const [workerHourly, setWorkerHourly] = useState(75000);
  const [workerOvertime, setWorkerOvertime] = useState(100000);

  useEffect(() => {
    if (policies && policies.length > 0) {
      const activePolicy = policies.find((p) => p.isActive) || policies[0];
      setApprovalRequired(activePolicy.approvalRequired);
      setLimitMode(activePolicy.limitMode);
      setMonthlyLimit(activePolicy.monthlyLimit);
      setNoticeDaysRequired(activePolicy.noticeDaysRequired ?? 2);
    }
  }, [policies]);

  useEffect(() => {
    if (rates && rates.length > 0) {
      for (const r of rates) {
        if (r.category === 'doctor') {
          setDoctorHourly(r.hourlyRate);
          setDoctorOvertime(r.overtimeHourlyRate);
        } else if (r.category === 'midwife') {
          setMidwifeHourly(r.hourlyRate);
          setMidwifeOvertime(r.overtimeHourlyRate);
        } else if (r.category === 'worker') {
          setWorkerHourly(r.hourlyRate);
          setWorkerOvertime(r.overtimeHourlyRate);
        }
      }
    }
  }, [rates]);

  const handleSavePolicy = async () => {
    await updatePolicyMutation.mutateAsync({
      policyName: 'Kebijakan Standar Klinik Amanah',
      approvalRequired,
      limitMode,
      monthlyLimit,
      noticeDaysRequired
    });
  };

  const handleSaveRates = async () => {
    await updateRateMutation.mutateAsync({
      category: 'doctor',
      hourlyRate: doctorHourly,
      overtimeHourlyRate: doctorOvertime
    });
    await updateRateMutation.mutateAsync({
      category: 'midwife',
      hourlyRate: midwifeHourly,
      overtimeHourlyRate: midwifeOvertime
    });
    await updateRateMutation.mutateAsync({
      category: 'worker',
      hourlyRate: workerHourly,
      overtimeHourlyRate: workerOvertime
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='p-6 border-b border-border/60'>
          <div className='flex items-center gap-2'>
            <div className='size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
              <Icons.settings className='size-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold'>
                Pengaturan Dinamis Cuti & Kompensasi
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Konfigurasi syarat persetujuan, batas bulanan, dan tarif dinas pengganti / lembur.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='p-6'>
          <Tabs defaultValue='policy' className='w-full'>
            <TabsList className='grid grid-cols-2 w-full mb-6'>
              <TabsTrigger value='policy' className='text-xs'>
                Kebijakan Cuti & Izin
              </TabsTrigger>
              <TabsTrigger value='rates' className='text-xs'>
                Standar Tarif Kompensasi
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Policy */}
            <TabsContent value='policy' className='flex flex-col gap-5 mt-0'>
              {isPolicyLoading ? (
                <div className='py-12 text-center text-xs text-muted-foreground'>
                  Memuat kebijakan cuti...
                </div>
              ) : (
                <>
                  <div className='bg-muted/30 p-4 rounded-xl border border-border/40 flex items-center justify-between'>
                    <div>
                      <h4 className='text-xs font-semibold text-foreground'>
                        Persetujuan Manual oleh Admin
                      </h4>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Jika dinonaktifkan, permohonan staf langsung disetujui otomatis oleh sistem.
                      </p>
                    </div>
                    <Button
                      type='button'
                      variant={approvalRequired ? 'default' : 'outline'}
                      size='sm'
                      className='text-xs h-8'
                      onClick={() => setApprovalRequired(!approvalRequired)}
                    >
                      {approvalRequired ? 'Wajib Review Admin' : 'Otomatis Disetujui'}
                    </Button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-2'>
                      <Label className='text-xs font-medium'>Model Batasan Kuota Cuti</Label>
                      <div className='grid grid-cols-2 gap-2'>
                        <Button
                          type='button'
                          variant={limitMode === 'monthly_limit' ? 'default' : 'outline'}
                          size='sm'
                          className='text-xs h-8'
                          onClick={() => setLimitMode('monthly_limit')}
                        >
                          Batas Bulanan
                        </Button>
                        <Button
                          type='button'
                          variant={limitMode === 'unlimited' ? 'default' : 'outline'}
                          size='sm'
                          className='text-xs h-8'
                          onClick={() => setLimitMode('unlimited')}
                        >
                          Tanpa Batas
                        </Button>
                      </div>
                    </div>

                    {limitMode === 'monthly_limit' && (
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='monthly-limit' className='text-xs font-medium'>
                          Maksimal Pengajuan per Bulan (kali)
                        </Label>
                        <Input
                          id='monthly-limit'
                          type='number'
                          min={1}
                          max={30}
                          value={monthlyLimit}
                          onChange={(e) => setMonthlyLimit(Number(e.target.value) || 1)}
                          className='text-xs h-8'
                        />
                      </div>
                    )}

                    <div className='flex flex-col gap-2'>
                      <Label htmlFor='notice-days' className='text-xs font-medium'>
                        Minimal Hari Pengajuan di Muka (Hari)
                      </Label>
                      <Input
                        id='notice-days'
                        type='number'
                        min={0}
                        max={30}
                        value={noticeDaysRequired}
                        onChange={(e) => setNoticeDaysRequired(Number(e.target.value) || 0)}
                        className='text-xs h-8'
                      />
                    </div>
                  </div>

                  <div className='flex justify-end pt-2'>
                    <Button
                      size='sm'
                      className='text-xs h-8 px-4'
                      onClick={handleSavePolicy}
                      disabled={updatePolicyMutation.isPending}
                    >
                      {updatePolicyMutation.isPending ? 'Menyimpan...' : 'Simpan Kebijakan Cuti'}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* TAB 2: Rates */}
            <TabsContent value='rates' className='flex flex-col gap-4 mt-0'>
              {isRatesLoading ? (
                <div className='py-12 text-center text-xs text-muted-foreground'>
                  Memuat tarif kompensasi...
                </div>
              ) : (
                <>
                  {/* Doctor Rates */}
                  <div className='bg-muted/20 p-4 rounded-xl border border-border/40 flex flex-col gap-3'>
                    <h5 className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                      <Icons.user className='size-3.5 text-primary' />
                      Kategori Dokter Spesialis & Umum
                    </h5>
                    <div className='grid grid-cols-2 gap-3 text-xs'>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1 block'>
                          Tarif Dasar Pokok (Rp / Jam)
                        </Label>
                        <Input
                          type='number'
                          step={5000}
                          value={doctorHourly}
                          onChange={(e) => setDoctorHourly(Number(e.target.value) || 0)}
                          className='text-xs h-8'
                        />
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1 block'>
                          Tarif Pengganti / Lembur (Rp / Jam)
                        </Label>
                        <Input
                          type='number'
                          step={5000}
                          value={doctorOvertime}
                          onChange={(e) => setDoctorOvertime(Number(e.target.value) || 0)}
                          className='text-xs h-8'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Midwife Rates */}
                  <div className='bg-muted/20 p-4 rounded-xl border border-border/40 flex flex-col gap-3'>
                    <h5 className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                      <Icons.user className='size-3.5 text-primary' />
                      Kategori Bidan & Paramedis
                    </h5>
                    <div className='grid grid-cols-2 gap-3 text-xs'>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1 block'>
                          Tarif Dasar Pokok (Rp / Jam)
                        </Label>
                        <Input
                          type='number'
                          step={5000}
                          value={midwifeHourly}
                          onChange={(e) => setMidwifeHourly(Number(e.target.value) || 0)}
                          className='text-xs h-8'
                        />
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1 block'>
                          Tarif Pengganti / Lembur (Rp / Jam)
                        </Label>
                        <Input
                          type='number'
                          step={5000}
                          value={midwifeOvertime}
                          onChange={(e) => setMidwifeOvertime(Number(e.target.value) || 0)}
                          className='text-xs h-8'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Worker Rates */}
                  <div className='bg-muted/20 p-4 rounded-xl border border-border/40 flex flex-col gap-3'>
                    <h5 className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                      <Icons.user className='size-3.5 text-primary' />
                      Kategori Staf Operasional / Front Office / Perawat
                    </h5>
                    <div className='grid grid-cols-2 gap-3 text-xs'>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1 block'>
                          Tarif Dasar Pokok (Rp / Jam)
                        </Label>
                        <Input
                          type='number'
                          step={5000}
                          value={workerHourly}
                          onChange={(e) => setWorkerHourly(Number(e.target.value) || 0)}
                          className='text-xs h-8'
                        />
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1 block'>
                          Tarif Pengganti / Lembur (Rp / Jam)
                        </Label>
                        <Input
                          type='number'
                          step={5000}
                          value={workerOvertime}
                          onChange={(e) => setWorkerOvertime(Number(e.target.value) || 0)}
                          className='text-xs h-8'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-end pt-2'>
                    <Button
                      size='sm'
                      className='text-xs h-8 px-4'
                      onClick={handleSaveRates}
                      disabled={updateRateMutation.isPending}
                    >
                      {updateRateMutation.isPending ? 'Menyimpan...' : 'Simpan Semua Standar Tarif'}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className='p-4 border-t border-border/60 bg-muted/10'>
          <Button variant='outline' size='sm' onClick={onClose} className='text-xs h-8'>
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
