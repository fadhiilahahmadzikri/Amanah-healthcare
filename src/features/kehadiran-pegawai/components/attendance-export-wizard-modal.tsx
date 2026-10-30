'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { CustomMonthPicker } from '@/components/ui/custom-month-picker';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { cn } from '@/lib/utils';
import {
  EXPORT_FORMAT_OPTIONS,
  ExportFormatCard,
  useExportPipeline,
  type ExportFormat
} from '@/features/export';
import { attendanceQueries } from '../api/queries';
import type { AttendanceExportCandidate } from '../api/types';

export type ExportWizardStep = 'month' | 'scope' | 'staff' | 'format';
export type ExportScopeMode = 'all' | 'individual';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
] as const;

function getInitialMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatMonthLabel(monthStr: string): string {
  const [yearStr, monthNumStr] = monthStr.split('-');
  const monthIdx = Number(monthNumStr) - 1;
  const monthName = MONTH_NAMES[monthIdx] || '';
  return `${monthName} ${yearStr}`;
}

export interface AttendanceExportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceExportWizardModal({ isOpen, onClose }: AttendanceExportWizardModalProps) {
  const [step, setStep] = React.useState<ExportWizardStep>('month');
  const [selectedMonth, setSelectedMonth] = React.useState<string>(getInitialMonthString);
  const [exportMode, setExportMode] = React.useState<ExportScopeMode>('all');
  const [selectedStaff, setSelectedStaff] = React.useState<AttendanceExportCandidate | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const {
    isChecking,
    hasData,
    totalRows,
    isExporting,
    isDownloading,
    isCompleted,
    progressPercent,
    currentPhase,
    errorMessage,
    checkAvailability,
    startExport,
    reset
  } = useExportPipeline();

  // Reset state when modal is opened or closed
  React.useEffect(() => {
    if (!isOpen) {
      setStep('month');
      setExportMode('all');
      setSelectedStaff(null);
      setSearchQuery('');
      reset();
    }
  }, [isOpen, reset]);

  // Auto-dismiss modal smoothly 1.8s after download is completed
  React.useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        onClose();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onClose]);

  // Query staff candidates for the chosen month
  const candidatesQuery = useQuery({
    ...attendanceQueries.exportCandidates(selectedMonth),
    enabled: isOpen
  });

  const candidates = React.useMemo(() => {
    return candidatesQuery.data?.candidates || [];
  }, [candidatesQuery.data?.candidates]);

  // Dynamic Role Tabs from candidates
  const roleTabs = React.useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    map.set('all', { label: 'Semua Staf', count: candidates.length });
    for (const c of candidates) {
      const key = c.roleId || c.roleCode || 'staf';
      const label = c.roleName || c.positionTitle || c.roleCode || 'Staf';
      if (!map.has(key)) {
        map.set(key, { label, count: 0 });
      }
      map.get(key)!.count += 1;
    }
    return Array.from(map.entries()).map(([id, info]) => ({
      id,
      label: info.label,
      count: info.count
    }));
  }, [candidates]);

  // Filtered candidates for Step 3
  const filteredCandidates = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return candidates.filter((c) => {
      const roleKey = c.roleId || c.roleCode || 'staf';
      if (activeTab !== 'all' && roleKey !== activeTab) return false;
      if (!q) return true;
      const queryMatches = [
        c.fullName.toLowerCase().includes(q),
        c.staffCode.toLowerCase().includes(q),
        Boolean(c.specialtyName?.toLowerCase().includes(q)),
        Boolean(c.positionTitle?.toLowerCase().includes(q))
      ];
      return queryMatches.some(Boolean);
    });
  }, [candidates, activeTab, searchQuery]);

  // Effective export parameters
  const effectiveParameters = React.useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = Number(yearStr);
    const monthNum = Number(monthStr);
    const lastDay = new Date(year, monthNum, 0).getDate();
    const dd = String(lastDay).padStart(2, '0');
    const periodLabel = formatMonthLabel(selectedMonth);

    const params: Record<string, unknown> = {
      startDate: `${yearStr}-${monthStr}-01`,
      endDate: `${yearStr}-${monthStr}-${dd}`,
      periodLabel
    };

    if (exportMode === 'individual' && selectedStaff) {
      params.staffProfileId = selectedStaff.id;
      params.staffName = selectedStaff.fullName;
    }

    return params;
  }, [selectedMonth, exportMode, selectedStaff]);

  // Check availability when entering Step 4 ('format')
  React.useEffect(() => {
    if (step === 'format' && isOpen) {
      checkAvailability('attendance', effectiveParameters);
    }
  }, [step, isOpen, effectiveParameters, checkAvailability]);

  // Execute export
  const handleSelectFormat = React.useCallback(
    (format: ExportFormat) => {
      const entitySlug =
        exportMode === 'individual' && selectedStaff
          ? selectedStaff.fullName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .slice(0, 30)
          : 'semua_pegawai';

      const [yearStr, monthStr] = selectedMonth.split('-');
      const defaultPrefix = `Presensi_${entitySlug}_${monthStr}_${yearStr}`;

      startExport({
        exportType: 'attendance',
        format,
        parameters: effectiveParameters,
        fileNamePrefix: defaultPrefix
      });
    },
    [exportMode, selectedStaff, selectedMonth, effectiveParameters, startExport]
  );

  const isBusy = isExporting || isDownloading;

  const modalWidth =
    step === 'staff'
      ? 'max-w-4xl sm:max-w-5xl'
      : isBusy || isCompleted
        ? 'max-w-[420px]'
        : 'max-w-[500px]';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={isBusy ? () => {} : onClose}
      maxWidth={modalWidth}
      backdropClassName='overflow-hidden'
      className={cn(
        'flex flex-col h-auto max-h-[90vh] overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl transition-all duration-300 ease-in-out',
        modalWidth
      )}
    >
      <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-4 justify-start'>
        {/* ================= STEP 1: PURE PILIH BULAN ================= */}
        {step === 'month' && (
          <div className='space-y-4'>
            <div>
              <h2 className='text-base font-bold text-foreground tracking-tight'>
                Pilih Periode Presensi
              </h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Tentukan bulan dan tahun rekapitulasi kehadiran yang ingin diekspor
              </p>
            </div>

            {/* In-Flow Month Picker (Ngedorong konten ke bawah secara dinamis) */}
            <div className='pt-1'>
              <CustomMonthPicker
                id='attendanceExportMonthPicker'
                label='Bulan & Tahun Laporan*'
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val)}
                className='w-full'
              />
            </div>
          </div>
        )}

        {/* ================= STEP 2: PILIH CAKUPAN LAPORAN ================= */}
        {step === 'scope' && (
          <div className='space-y-4'>
            <div>
              <h2 className='text-base font-bold text-foreground tracking-tight'>
                Pilih Cakupan Laporan
              </h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Pilih cakupan data kehadiran untuk periode {formatMonthLabel(selectedMonth)}
              </p>
            </div>

            {/* Grid Dua Kartu Cakupan */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
              {/* Opsi A: Rekapitulasi Keseluruhan */}
              <button
                type='button'
                onClick={() => setExportMode('all')}
                className={cn(
                  'flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer relative',
                  exportMode === 'all'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border'
                )}
              >
                <div className='flex items-center justify-between gap-2 mb-2.5'>
                  <div
                    className={cn(
                      'size-9 rounded-lg flex items-center justify-center border transition-colors',
                      exportMode === 'all'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border/60'
                    )}
                  >
                    <Icons.users className='size-4.5' />
                  </div>
                  <span
                    className={cn(
                      'size-4.5 rounded-full border flex items-center justify-center shrink-0',
                      exportMode === 'all'
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/40'
                    )}
                  >
                    {exportMode === 'all' && <span className='size-1.5 rounded-full bg-white' />}
                  </span>
                </div>

                <span className='text-xs sm:text-sm font-bold text-foreground'>
                  Rekapitulasi Keseluruhan
                </span>
                <p className='text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>
                  Semua dokter, bidan, dan staf operasional dalam satu berkas terpadu.
                </p>
              </button>

              {/* Opsi B: Per Orang / Individu */}
              <button
                type='button'
                onClick={() => setExportMode('individual')}
                className={cn(
                  'flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer relative',
                  exportMode === 'individual'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border'
                )}
              >
                <div className='flex items-center justify-between gap-2 mb-2.5'>
                  <div
                    className={cn(
                      'size-9 rounded-lg flex items-center justify-center border transition-colors',
                      exportMode === 'individual'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border/60'
                    )}
                  >
                    <Icons.userCheck className='size-4.5' />
                  </div>
                  <span
                    className={cn(
                      'size-4.5 rounded-full border flex items-center justify-center shrink-0',
                      exportMode === 'individual'
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/40'
                    )}
                  >
                    {exportMode === 'individual' && (
                      <span className='size-1.5 rounded-full bg-white' />
                    )}
                  </span>
                </div>

                <span className='text-xs sm:text-sm font-bold text-foreground'>
                  Pilih Staf Tertentu (Per Orang)
                </span>
                <p className='text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>
                  Pilih satu pegawai spesifik untuk rincian kehadiran individual.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PILIH STAF (JIKA MODE INDIVIDU) ================= */}
        {step === 'staff' && (
          <div className='space-y-3.5'>
            <div>
              <h2 className='text-base font-bold text-foreground tracking-tight'>
                Pilih Pegawai Presensi
              </h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Pilih satu dokter, bidan, atau staf untuk bulan {formatMonthLabel(selectedMonth)}
              </p>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5'>
              {/* Dynamic Role Tabs */}
              <div className='flex items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full'>
                {roleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type='button'
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0',
                      activeTab === tab.id
                        ? 'bg-card text-foreground font-semibold shadow-xs border border-border/60'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span className='size-4 rounded-full flex items-center justify-center text-[10px] bg-muted text-muted-foreground font-mono'>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className='relative w-full sm:w-64'>
                <Icons.search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
                <Input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Cari nama atau spesialisasi...'
                  className='h-8.5 pl-8 text-xs bg-card'
                />
                {searchQuery && (
                  <button
                    type='button'
                    onClick={() => setSearchQuery('')}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  >
                    <Icons.close className='size-3.5' />
                  </button>
                )}
              </div>
            </div>

            {/* Candidates 4-Column Grid */}
            <div className='max-h-[380px] overflow-y-auto pr-1'>
              {candidatesQuery.isLoading ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5'>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className='p-3 rounded-xl border border-border/60 bg-card/60 animate-pulse flex items-start gap-2.5'
                    >
                      <div className='size-9 rounded-full bg-muted shrink-0' />
                      <div className='flex-1 space-y-1.5'>
                        <div className='h-3 bg-muted rounded w-3/4' />
                        <div className='h-2.5 bg-muted rounded w-1/2' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className='py-12 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-2'>
                  <div className='size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
                    <Icons.users className='size-5' />
                  </div>
                  <p className='text-xs font-semibold text-foreground'>
                    Tidak Ada Pegawai Ditemukan
                  </p>
                  <p className='text-[11px] text-muted-foreground max-w-xs'>
                    {searchQuery
                      ? 'Tidak ada pegawai yang cocok dengan kata kunci pencarian Anda.'
                      : 'Belum ada data pegawai terdaftar untuk kategori ini.'}
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5'>
                  {filteredCandidates.map((candidate) => {
                    const isSelected = selectedStaff?.id === candidate.id;
                    const subtitle = candidate.positionTitle ?? '';

                    return (
                      <button
                        key={candidate.id}
                        type='button'
                        onClick={() => setSelectedStaff(candidate)}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 relative cursor-pointer group',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs'
                            : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border'
                        )}
                      >
                        <Avatar className='size-9 rounded-full shrink-0 border border-border/60'>
                          <AvatarImage
                            src={candidate.avatarUrl || DEFAULT_AVATAR_PATH}
                            alt={candidate.fullName}
                          />
                          <AvatarFallback className='rounded-full text-[10px] font-bold'>
                            {candidate.fullName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className='flex-1 min-w-0 pr-1'>
                          <p className='text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors'>
                            {candidate.fullName}
                          </p>
                          <p className='text-[11px] text-muted-foreground truncate mt-0.5'>
                            {subtitle}
                          </p>
                          <div className='mt-2 flex items-center gap-1.5'>
                            <span className='px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted border border-border/60 text-muted-foreground font-mono'>
                              {candidate.totalAttendance} Hadir
                            </span>
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <span className='absolute top-2.5 right-2.5 size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs'>
                            <Icons.check className='size-2.5 stroke-[3]' />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 4: FORMAT & UNDUH ================= */}
        {step === 'format' && (
          <div className='space-y-4'>
            {/* Pure Real-time Progress State (Header, Summary Card & Footer Hidden) */}
            {isBusy && (
              <div className='py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-300'>
                <div className='relative size-16 flex items-center justify-center'>
                  <div className='size-16 rounded-full border-4 border-muted border-t-primary animate-spin' />
                  <span className='absolute text-xs font-extrabold text-primary tabular-nums'>
                    {progressPercent}%
                  </span>
                </div>
                <div className='space-y-1 max-w-xs'>
                  <p className='text-sm font-bold text-foreground'>{currentPhase}</p>
                  <p className='text-xs text-muted-foreground'>
                    {isDownloading
                      ? 'Sedang mengunduh berkas laporan ke peramban...'
                      : 'Memproses kalkulasi dan menyusun laporan di server...'}
                  </p>
                </div>
              </div>
            )}

            {/* Pure Success State (Header, Summary Card & Footer Hidden) */}
            {isCompleted && (
              <div className='py-8 flex flex-col items-center justify-center text-center space-y-3.5 animate-in fade-in zoom-in-90 duration-300'>
                <div className='size-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400'>
                  <Icons.check className='size-7' />
                </div>
                <div className='space-y-1 max-w-xs'>
                  <p className='text-base font-bold text-foreground'>Laporan Berhasil Diunduh!</p>
                  <p className='text-xs text-muted-foreground'>
                    Berkas laporan presensi telah berhasil disimpan di perangkat Anda.
                  </p>
                </div>
              </div>
            )}

            {/* Normal Interactive Format Selection State (Shown only when NOT busy and NOT completed) */}
            {!isBusy && !isCompleted && (
              <>
                <div>
                  <h2 className='text-base font-bold text-foreground tracking-tight'>
                    Format Dokumen & Unduh
                  </h2>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Pilih format dokumen resmi untuk mengunduh rekapitulasi presensi
                  </p>
                </div>

                {/* Target Summary Card */}
                <div className='p-3 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2.5 min-w-0'>
                    {exportMode === 'all' ? (
                      <div className='size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0'>
                        <Icons.users className='size-4' />
                      </div>
                    ) : (
                      <Avatar className='size-9 rounded-full shrink-0 border border-border/60'>
                        <AvatarImage
                          src={selectedStaff?.avatarUrl || DEFAULT_AVATAR_PATH}
                          alt={selectedStaff?.fullName || 'Staf'}
                        />
                        <AvatarFallback className='rounded-full text-[10px] font-bold'>
                          {selectedStaff?.fullName?.slice(0, 2).toUpperCase() || 'ST'}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className='min-w-0'>
                      <p className='text-xs font-bold text-foreground truncate'>
                        {exportMode === 'all'
                          ? 'Seluruh Pegawai Klinik'
                          : selectedStaff?.fullName || 'Staf Terpilih'}
                      </p>
                      <p className='text-[11px] text-muted-foreground truncate'>
                        {exportMode === 'all'
                          ? 'Semua Dokter, Bidan, dan Staf'
                          : (selectedStaff?.positionTitle ?? '')}
                      </p>
                    </div>
                  </div>

                  <span className='px-2.5 py-1 rounded-lg text-xs font-semibold bg-card border border-border/70 text-foreground shrink-0'>
                    {formatMonthLabel(selectedMonth)}
                  </span>
                </div>

                {/* Checking Data State */}
                {isChecking && (
                  <div className='py-8 flex flex-col items-center justify-center text-center space-y-2'>
                    <Icons.spinner className='size-6 text-primary animate-spin' />
                    <p className='text-xs font-medium text-muted-foreground'>
                      Memeriksa ketersediaan data di basis data...
                    </p>
                  </div>
                )}

                {/* Empty Data State */}
                {!isChecking && hasData === false && (
                  <div className='py-6 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-2'>
                    <div className='size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
                      <Icons.alertCircle className='size-5' />
                    </div>
                    <p className='text-xs font-semibold text-foreground'>Data Tidak Tersedia</p>
                    <p className='text-[11px] text-muted-foreground max-w-xs'>
                      Tidak ditemukan rekaman presensi pada periode dan target yang dipilih. Silakan
                      pilih bulan atau staf lain.
                    </p>
                  </div>
                )}

                {/* Format Selection Cards (Normal State) */}
                {!isChecking && hasData !== false && (
                  <div className='space-y-2.5'>
                    {totalRows > 0 && (
                      <div className='flex items-center justify-between text-[11px] text-muted-foreground px-1'>
                        <span>Format Berkas Dokumen:</span>
                        <span className='font-semibold text-foreground/80'>
                          {totalRows} rekaman ditemukan
                        </span>
                      </div>
                    )}
                    {EXPORT_FORMAT_OPTIONS.map((meta) => (
                      <ExportFormatCard
                        key={meta.format}
                        meta={meta}
                        disabled={isBusy}
                        onSelect={() => handleSelectFormat(meta.format)}
                      />
                    ))}
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className='p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5'>
                    <Icons.alertCircle className='size-4 shrink-0 mt-0.5' />
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold'>Gagal Mengekspor Laporan</p>
                      <p className='text-[11px] opacity-90 mt-0.5'>{errorMessage}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= MODAL FOOTER ================= */}
        {!isCompleted && !isBusy && (
          <div className='flex items-center justify-between shrink-0 pt-3 border-t border-border/40'>
            <div>
              {step === 'month' ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='md'
                  shape='pill'
                  onClick={onClose}
                  disabled={isBusy}
                >
                  Batal
                </Button>
              ) : step === 'scope' ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='md'
                  shape='pill'
                  leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                  onClick={() => setStep('month')}
                  disabled={isBusy}
                >
                  Kembali
                </Button>
              ) : step === 'staff' ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='md'
                  shape='pill'
                  leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                  onClick={() => setStep('scope')}
                  disabled={isBusy}
                >
                  Kembali
                </Button>
              ) : (
                <Button
                  type='button'
                  variant='ghost'
                  size='md'
                  shape='pill'
                  leadingIcon={<Icons.arrowLeft className='size-3.5' />}
                  onClick={() => setStep(exportMode === 'all' ? 'scope' : 'staff')}
                  disabled={isBusy}
                >
                  Kembali
                </Button>
              )}
            </div>

            <div>
              {step === 'month' && (
                <Button
                  type='button'
                  variant='primary'
                  size='md'
                  shape='pill'
                  withTrailingCircleIcon
                  trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
                  onClick={() => setStep('scope')}
                  className='min-w-[130px]'
                >
                  Lanjut
                </Button>
              )}

              {step === 'scope' && (
                <Button
                  type='button'
                  variant='primary'
                  size='md'
                  shape='pill'
                  withTrailingCircleIcon
                  trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
                  onClick={() => {
                    if (exportMode === 'all') {
                      setStep('format');
                    } else {
                      setStep('staff');
                    }
                  }}
                  className='min-w-[130px]'
                >
                  Lanjut
                </Button>
              )}

              {step === 'staff' && (
                <Button
                  type='button'
                  variant='primary'
                  size='md'
                  shape='pill'
                  withTrailingCircleIcon
                  trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
                  disabled={!selectedStaff}
                  onClick={() => setStep('format')}
                  className='min-w-[130px]'
                >
                  Lanjut
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
