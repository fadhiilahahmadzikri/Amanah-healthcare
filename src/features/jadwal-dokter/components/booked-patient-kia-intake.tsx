'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  kiaIntakeService,
  type MaternalIntakeResponse,
  type ChildImmunizationResponse
} from '@/features/klinik/api/kia-intake-service';
import { FLOW_NAMES } from '@/features/klinik/constants/kia-constants';

export interface BookedPatientKiaIntakeProps {
  appointmentId: string;
}

export function BookedPatientKiaIntake({ appointmentId }: BookedPatientKiaIntakeProps) {
  const { data: intake, isLoading } = useQuery({
    queryKey: ['kia-intake-by-appointment', appointmentId],
    queryFn: () => kiaIntakeService.getIntakeByAppointmentId(appointmentId),
    enabled: Boolean(appointmentId),
    staleTime: 60_000
  });

  if (isLoading || !intake?.data) {
    return null;
  }

  if (intake.flow === FLOW_NAMES.PREGNANCY) {
    const maternal = intake.data as MaternalIntakeResponse;
    const gpa = `G${maternal.gravidaCount ?? 1} P${maternal.parityCount ?? 0} A${maternal.abortionCount ?? 0} Ah${maternal.livingChildrenCount ?? 0}`;

    return (
      <div className='space-y-2.5'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-bold text-foreground tracking-tight block'>
            Riwayat Medis KIA & Kehamilan (ANC)
          </span>
          <span className='font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20'>
            {gpa}
          </span>
        </div>

        <div className='p-3.5 rounded-xl bg-muted/15 border border-border/50 text-xs space-y-3'>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2.5 border-b border-border/30'>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                HPHT
              </span>
              <span className='font-mono font-semibold text-foreground'>
                {maternal.hpht || '-'}
              </span>
            </div>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                Taksiran Persalinan (HPL)
              </span>
              <span className='font-mono font-semibold text-foreground'>
                {maternal.estimatedDueDate || '-'}
              </span>
            </div>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                Usia Kehamilan
              </span>
              <span className='font-semibold text-foreground'>
                {maternal.gestationalAgeFormatted || '-'}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2.5 border-b border-border/30'>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                TB / BB Awal
              </span>
              <span className='font-medium text-foreground'>
                {maternal.heightCm ? `${maternal.heightCm} cm` : '-'} /{' '}
                {maternal.prePregnancyWeightKg ? `${maternal.prePregnancyWeightKg} kg` : '-'}
              </span>
            </div>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                LiLA / IMT Awal
              </span>
              <span className='font-medium text-foreground'>
                {maternal.upperArmCircumferenceCm ? `${maternal.upperArmCircumferenceCm} cm` : '-'}{' '}
                / {maternal.initialBmi ?? '-'}
              </span>
            </div>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                Gol. Darah / TT
              </span>
              <span className='font-medium text-foreground'>
                {maternal.motherBloodType || '-'} / {maternal.tetanusStatus || '-'}
              </span>
            </div>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                Suami / Pasangan
              </span>
              <span className='font-medium text-foreground truncate block'>
                {maternal.partnerName || '-'}
              </span>
            </div>
          </div>

          {maternal.previousPregnancies && maternal.previousPregnancies.length > 0 && (
            <div className='space-y-1.5 pb-2.5 border-b border-border/30'>
              <span className='text-[11px] font-semibold text-foreground block'>
                Riwayat Persalinan Sebelumnya
              </span>
              <div className='space-y-1.5'>
                {maternal.previousPregnancies.map((p) => (
                  <div
                    key={p.orderNumber}
                    className='p-2 rounded-lg bg-card border border-border/40 text-[11px] space-y-0.5'
                  >
                    <div className='flex items-center justify-between font-semibold text-foreground'>
                      <span>
                        Anak Ke-{p.orderNumber} ({p.birthYear || '-'})
                      </span>
                      <span className='text-muted-foreground font-normal'>
                        {p.childSex || '-'} • {p.birthWeightGrams ? `${p.birthWeightGrams} g` : '-'}
                      </span>
                    </div>
                    <div className='text-muted-foreground text-[10.5px]'>
                      Cara: {p.deliveryMethod || '-'} • Penolong: {p.birthAttendant || '-'} •
                      Tempat: {p.deliveryPlace || '-'}
                    </div>
                    {p.complications && p.complications !== 'Tidak ada' && (
                      <div className='text-destructive text-[10px]'>
                        Komplikasi: {p.complications}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {maternal.contraceptiveHistories && maternal.contraceptiveHistories.length > 0 && (
            <div className='space-y-1.5'>
              <span className='text-[11px] font-semibold text-foreground block'>
                Riwayat Pemakaian Kontrasepsi (KB)
              </span>
              <div className='space-y-1'>
                {maternal.contraceptiveHistories.map((c) => (
                  <div
                    key={c.orderNumber}
                    className='p-2 rounded-lg bg-card border border-border/40 text-[11px] flex items-center justify-between'
                  >
                    <span className='font-medium text-foreground'>{c.contraceptiveType}</span>
                    <span className='text-muted-foreground text-[10.5px]'>
                      {c.durationText || (c.startDate ? `Mulai: ${c.startDate}` : '-')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (intake.flow === FLOW_NAMES.IMMUNIZATION) {
    const child = intake.data as ChildImmunizationResponse;

    return (
      <div className='space-y-2.5'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-bold text-foreground tracking-tight block'>
            Skrining Imunisasi & Tumbuh Kembang Anak
          </span>
          <span className='font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'>
            {child.childAgeFormatted ?? '-'}
          </span>
        </div>

        <div className='p-3.5 rounded-xl bg-muted/15 border border-border/50 text-xs space-y-2.5'>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2.5 border-b border-border/30'>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                Nama & NIK Anak
              </span>
              <span className='font-semibold text-foreground block truncate'>
                {child.childName}
              </span>
              <span className='font-mono text-[10px] text-muted-foreground'>{child.childNik}</span>
            </div>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                Tanggal Lahir
              </span>
              <span className='font-mono font-semibold text-foreground'>
                {child.childBirthDate}
              </span>
            </div>
            <div>
              <span className='text-[10.5px] font-medium text-muted-foreground block mb-0.5'>
                Orang Tua (Ayah / Ibu)
              </span>
              <span className='text-foreground truncate block'>
                {child.fatherName || '-'} / {child.motherName || '-'}
              </span>
            </div>
          </div>

          <div className='space-y-1'>
            <span className='text-[10.5px] font-medium text-muted-foreground block'>
              Riwayat Vaksinasi Sebelumnya
            </span>
            <div className='p-2 rounded-lg bg-card border border-border/40 text-foreground leading-relaxed text-[11.5px]'>
              {child.previousVaccineHistory || 'Belum ada catatan vaksinasi sebelumnya.'}
            </div>
          </div>

          {child.childAllergyHistory && child.childAllergyHistory !== 'Tidak ada alergi' && (
            <div className='space-y-1'>
              <span className='text-[10.5px] font-medium text-destructive block'>
                Riwayat Alergi Anak
              </span>
              <div className='p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11.5px]'>
                {child.childAllergyHistory}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
