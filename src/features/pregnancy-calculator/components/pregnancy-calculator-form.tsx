'use client';

import React, { useState, useMemo } from 'react';
import {
  calculateEddFromLmp,
  calculateGestationalAge,
} from '@/features/klinik/utils/obstetric-calculator';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { Card } from '@/components/ui/card';

export interface PregnancyCalculatorFormProps {
  className?: string;
  variant?: 'page' | 'compact';
  showHeader?: boolean;
}

export function PregnancyCalculatorForm({
  className,
  variant = 'page',
  showHeader = true,
}: PregnancyCalculatorFormProps) {
  const [hpht, setHpht] = useState<string>('');

  const calculation = useMemo(() => {
    if (!hpht) return null;
    try {
      const edd = calculateEddFromLmp(hpht);
      const ga = calculateGestationalAge(edd, new Date());

      const now = new Date();
      const eddDate = new Date(edd);
      const diffTime = eddDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      let trimester = 1;
      if (ga.weeks >= 28) {
        trimester = 3;
      } else if (ga.weeks >= 14) {
        trimester = 2;
      }

      const formattedEdd = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(edd);

      return {
        edd: formattedEdd,
        gaFormatted: ga.formatted,
        daysRemaining,
        trimester,
      };
    } catch {
      return null;
    }
  }, [hpht]);

  const handleReset = () => {
    setHpht('');
  };

  if (variant === 'compact') {
    return (
      <div className={`space-y-5 ${className || ''}`}>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Kalkulator kehamilan
        </h2>

        <div>
          <CustomDatePicker
            id="hpht-picker-modal"
            label="Hari pertama haid terakhir (HPHT)"
            placeholder="DD/MM/YYYY"
            ariaLabel="Hari pertama haid terakhir"
            value={hpht}
            onChange={(newIso) => setHpht(newIso)}
            disableFutureDates
            variant="outline"
          />
        </div>

        {calculation && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-primary/5 p-3.5 border border-primary/15">
                <div className="text-xs font-medium text-primary">
                  Hari perkiraan lahir (HPL)
                </div>
                <div className="text-sm font-semibold text-foreground mt-1">
                  {calculation.edd}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {calculation.daysRemaining} hari lagi
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3.5 border border-border/40">
                <div className="text-xs font-medium text-muted-foreground">
                  Usia kehamilan
                </div>
                <div className="text-sm font-semibold text-foreground mt-1">
                  {calculation.gaFormatted}
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3.5 border border-border/40">
                <div className="text-xs font-medium text-muted-foreground">
                  Trimester
                </div>
                <div className="text-sm font-semibold text-foreground mt-1">
                  Trimester {calculation.trimester}
                </div>
              </div>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-10 ${className || ''}`}>
      {showHeader && (
        <div className="text-center space-y-2">
          <p className="font-caveat text-xl sm:text-2xl font-semibold text-foreground">
            Layanan edukasi kesehatan ibu dan anak
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Kalkulator Kehamilan
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Pantau perkembangan janin Bunda dan ketahui estimasi hari persalinan dengan panduan medis terpercaya dari Klinik Amanah Healthcare.
          </p>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <CustomDatePicker
          id="hpht-picker-page"
          label="Hari pertama haid terakhir (HPHT)"
          placeholder="DD/MM/YYYY"
          ariaLabel="Hari pertama haid terakhir"
          value={hpht}
          onChange={(newIso) => setHpht(newIso)}
          disableFutureDates
          variant="outline"
        />
      </div>

      {calculation && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-primary/20 bg-primary/5 shadow-sm rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-primary">
                  Hari perkiraan lahir (HPL)
                </span>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {calculation.edd}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                {calculation.daysRemaining} hari lagi
              </div>
            </Card>

            <Card className="p-6 border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Usia kehamilan
                </span>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {calculation.gaFormatted}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                Masa gestasi 280 hari
              </div>
            </Card>

            <Card className="p-6 border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Trimester
                </span>
                <div className="text-2xl font-bold text-foreground mt-2">
                  Trimester {calculation.trimester}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                Tahap trimester aktif
              </div>
            </Card>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/60 rounded-lg hover:bg-muted/50"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
