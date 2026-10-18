'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { usePayrollPeriodsQuery } from '../api/queries';
import { useCalculatePayrollMutation } from '../api/mutations';
import type { PayrollPeriodItem, PayrollSummaryItem } from '../api/types';

interface LeavePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeavePayrollModal({ isOpen, onClose }: LeavePayrollModalProps) {
  const { data: pastPeriods, isLoading: isPastLoading } = usePayrollPeriodsQuery();
  const calculateMutation = useCalculatePayrollMutation();

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const [periodStart, setPeriodStart] = useState(`${year}-${month}-01`);
  const [periodEnd, setPeriodEnd] = useState(`${year}-${month}-30`);
  const [periodName, setPeriodName] = useState(`Periode Gaji ${month}/${year}`);

  const [lastCalculation, setLastCalculation] = useState<{
    period: PayrollPeriodItem;
    summaries: PayrollSummaryItem[];
  } | null>(null);

  const handleCalculate = async () => {
    try {
      const result = await calculateMutation.mutateAsync({
        periodStart,
        periodEnd,
        periodName
      });
      setLastCalculation(result);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-3xl p-0 overflow-hidden rounded-2xl max-h-[85vh] flex flex-col'>
        <DialogHeader className='p-6 border-b border-border/60 shrink-0'>
          <div className='flex items-center gap-2'>
            <div className='size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
              <Icons.calendar className='size-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold'>
                Kalkulasi Payroll & Rekapitulasi Dinas
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Hitung gaji terjadwal, pemotongan izin/cuti, dan insentif dinas pengganti staf.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6 flex flex-col gap-6'>
          {/* Calculation Form */}
          <div className='bg-muted/30 p-4 rounded-xl border border-border/40 flex flex-col gap-4'>
            <h5 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Parameter Periode Penggajian
            </h5>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div>
                <Label htmlFor='period-start' className='text-xs text-muted-foreground mb-1 block'>
                  Tanggal Mulai
                </Label>
                <Input
                  id='period-start'
                  type='date'
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className='text-xs h-8'
                />
              </div>
              <div>
                <Label htmlFor='period-end' className='text-xs text-muted-foreground mb-1 block'>
                  Tanggal Selesai
                </Label>
                <Input
                  id='period-end'
                  type='date'
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className='text-xs h-8'
                />
              </div>
              <div>
                <Label htmlFor='period-name' className='text-xs text-muted-foreground mb-1 block'>
                  Nama Periode
                </Label>
                <Input
                  id='period-name'
                  type='text'
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className='text-xs h-8'
                />
              </div>
            </div>

            <div className='flex justify-end pt-1'>
              <Button
                size='sm'
                className='text-xs h-8 px-4 gap-1.5'
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
              >
                <Icons.clock className='size-3.5' />
                {calculateMutation.isPending ? 'Menghitung...' : 'Hitung Payroll Sekarang'}
              </Button>
            </div>
          </div>

          {/* Result view */}
          {lastCalculation && (
            <div className='flex flex-col gap-4'>
              <div className='bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between'>
                <div>
                  <h4 className='text-sm font-bold text-foreground'>
                    {lastCalculation.period.periodName}
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Rentang: {lastCalculation.period.periodStart} s.d{' '}
                    {lastCalculation.period.periodEnd}
                  </p>
                </div>
                <div className='text-right'>
                  <span className='text-xs text-muted-foreground block'>
                    Total Pengeluaran Gaji
                  </span>
                  <span className='text-base font-bold text-primary'>
                    Rp {Number(lastCalculation.period.totalPayout).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <h5 className='text-xs font-semibold text-muted-foreground uppercase'>
                  Rincian Kompensasi per Karyawan ({lastCalculation.summaries.length} Staf)
                </h5>
                <div className='flex flex-col gap-2'>
                  {lastCalculation.summaries.map((s) => (
                    <div
                      key={s.staffId}
                      className='bg-card border border-border/60 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs'
                    >
                      <div>
                        <span className='font-semibold text-foreground block'>{s.fullName}</span>
                        <span className='text-muted-foreground text-[11px]'>
                          {s.staffType.toUpperCase()}{' '}
                          {s.positionTitle ? `• ${s.positionTitle}` : ''}
                        </span>
                      </div>

                      <div className='flex items-center gap-4 text-right'>
                        <div>
                          <span className='text-muted-foreground block text-[10px]'>
                            Pokok Jadwal
                          </span>
                          <span className='font-medium text-foreground'>
                            Rp {s.baseEarnings.toLocaleString('id-ID')} ({s.baseHours}j)
                          </span>
                        </div>
                        {s.leaveDeductions > 0 && (
                          <div>
                            <span className='text-rose-500 block text-[10px]'>Potongan Izin</span>
                            <span className='font-medium text-rose-600'>
                              -Rp {s.leaveDeductions.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                        {s.replacementAdditions > 0 && (
                          <div>
                            <span className='text-emerald-500 block text-[10px]'>
                              Insentif Pengganti
                            </span>
                            <span className='font-medium text-emerald-600'>
                              +Rp {s.replacementAdditions.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                        <div className='pl-2 border-l border-border/60'>
                          <span className='text-muted-foreground block text-[10px]'>
                            Gaji Bersih
                          </span>
                          <span className='font-bold text-primary'>
                            Rp {s.netPayroll.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Past periods */}
          {!lastCalculation && (
            <div className='flex flex-col gap-2'>
              <h5 className='text-xs font-semibold text-muted-foreground uppercase'>
                Riwayat Periode Penggajian Sebelumnya
              </h5>
              {isPastLoading ? (
                <div className='py-6 text-center text-xs text-muted-foreground'>
                  Memuat data periode...
                </div>
              ) : !pastPeriods || pastPeriods.length === 0 ? (
                <div className='py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border/40'>
                  Belum ada periode payroll yang dihitung. Klik &ldquo;Hitung Payroll
                  Sekarang&rdquo; di atas untuk memulai.
                </div>
              ) : (
                <div className='flex flex-col gap-2'>
                  {pastPeriods.map((p) => (
                    <div
                      key={p.id}
                      className='bg-card border border-border/60 p-3 rounded-xl flex items-center justify-between text-xs'
                    >
                      <div>
                        <span className='font-semibold text-foreground block'>{p.periodName}</span>
                        <span className='text-muted-foreground text-[11px]'>
                          {p.periodStart} s.d {p.periodEnd}
                        </span>
                      </div>
                      <div className='text-right'>
                        <span className='font-bold text-foreground'>
                          Rp {Number(p.totalPayout).toLocaleString('id-ID')}
                        </span>
                        <span className='text-emerald-600 block text-[10px]'>
                          Status: {p.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className='p-4 border-t border-border/60 bg-muted/10 shrink-0'>
          <Button variant='outline' size='sm' onClick={onClose} className='text-xs h-8'>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
