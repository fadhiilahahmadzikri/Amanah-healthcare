'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PatientActionDrawer } from './patient-action-drawer';
import { getInitials } from './patient-tables/columns-helpers';
import { usePatientMobileCards } from '../model/usePatientMobileCards';
import type { Patient } from '../api/types';

export interface PatientMobileCardsProps {
  patients: Patient[];
  hasFilters: boolean;
  onReset?: () => void;
  onRowClick: (patient: Patient) => void;
  onViewDetail: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
}

export function PatientMobileCards({
  patients,
  hasFilters,
  onReset,
  onRowClick,
  onViewDetail,
  onEdit,
  onViewHistory,
  onDelete,
  sentinelRef,
  isFetchingNextPage,
  hasNextPage
}: PatientMobileCardsProps) {
  const {
    isDeckExpanded,
    toggleDeck,
    selectedActionPatient,
    openActionDrawer,
    closeActionDrawer,
    getCleanRelationLabel,
    getRelationStatusKey,
    getDemographicSlots,
    formatVisitDate
  } = usePatientMobileCards();

  if (patients.length === 0) {
    return (
      <div className='flex flex-1 min-h-[300px] flex-col items-center justify-center p-4'>
        {hasFilters ? (
          <div className='flex flex-col items-center gap-3 w-full max-w-xs text-center'>
            <EmptyState
              title='Tidak ada pasien yang cocok'
              description='Tidak ditemukan data pasien dengan filter atau kata kunci pencarian yang dipilih.'
            />
            {onReset && (
              <Button
                type='button'
                variant='outline'
                shape='pill'
                size='sm'
                onClick={onReset}
                className='font-semibold text-xs cursor-pointer'
              >
                Reset Semua Filter
              </Button>
            )}
          </div>
        ) : (
          <EmptyState
            title='Belum ada data pasien'
            description='Data pasien akan ditampilkan di sini setelah didaftarkan ke sistem klinik.'
          />
        )}
      </div>
    );
  }

  return (
    <>
      {/* Container dengan gutter vertikal proporsional */}
      <div className='flex flex-col gap-3.5 pb-28 pt-1 select-none'>
        {patients.map((patient) => {
          const isMaster =
            patient.is_master ?? (!patient.master_patient_id && !patient.relationship_type);
          const slots = getDemographicSlots(patient);
          const statusAccount = patient.account_status || 'active';
          const relLabel = getCleanRelationLabel(patient.relationship_type, patient.relation_label);
          const relStatusKey = getRelationStatusKey(patient.relationship_type);
          const hasAffiliates = Boolean(
            !hasFilters && patient.affiliates && patient.affiliates.length > 0
          );
          const isExpanded = hasAffiliates && isDeckExpanded(patient.id);

          return (
            <div key={patient.id} className='flex flex-col w-full'>
              {/* KARTU PASIEN UTAMA */}
              <div
                onClick={() => onRowClick(patient)}
                className={cn(
                  'group relative z-20 w-full bg-gradient-to-t from-primary/[0.04] via-card to-card text-card-foreground border border-border rounded-[22px] p-4 sm:p-4.5 flex flex-col justify-between gap-3 select-none transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/50 hover:shadow-xs'
                )}
              >
                {/* 1. Header: Avatar + Nama + Subtitle (Badge Status/Hubungan) + Status Akun */}
                <div className='flex items-start justify-between gap-2.5 min-w-0'>
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <div className='size-11 sm:size-12 rounded-full overflow-hidden shrink-0 ring-1 ring-border/50 bg-muted aspect-square shadow-2xs flex items-center justify-center'>
                      <Avatar className='h-full w-full'>
                        <AvatarFallback className='text-xs font-bold bg-primary/10 text-primary'>
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className='min-w-0 flex-1 space-y-1'>
                      <h3
                        className='text-sm sm:text-[15px] font-bold tracking-tight text-foreground truncate'
                        title={patient.name}
                      >
                        {patient.name}
                      </h3>

                      {/* Subtitle: Badge Profil / Hubungan */}
                      <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-1.5 flex-wrap'>
                          {isMaster ? (
                            <StatusBadge
                              status='AKUN_UTAMA'
                              label='Akun Utama'
                              icon={
                                <Icons.crown className='size-2.5 shrink-0 text-amber-600 dark:text-amber-400' />
                              }
                              size='sm'
                            />
                          ) : (
                            <StatusBadge status={relStatusKey} label={relLabel} size='sm' />
                          )}
                          {patient.has_own_account && !isMaster && (
                            <StatusBadge status='PUNYA_AKUN' label='Punya Akun' size='sm' />
                          )}
                        </div>
                        {patient.master_patient_name && !isMaster && (
                          <span className='text-[11px] text-muted-foreground/80 truncate'>
                            Afiliasi dari{' '}
                            <strong className='text-foreground/90 font-medium'>
                              {patient.master_patient_name}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Akun di Pojok Kanan Atas */}
                  <div className='shrink-0 self-start pt-0.5'>
                    <StatusBadge status={statusAccount} size='sm' />
                  </div>
                </div>

                {/* 2. Slot Demografis dengan Separator Pipa (|) */}
                <div className='flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    {slots.map((s, idx) => (
                      <React.Fragment key={s.id}>
                        {idx > 0 && (
                          <span className='text-border/90 font-light select-none'>|</span>
                        )}
                        <span
                          className={cn('text-foreground font-medium', s.isMono && 'font-mono')}
                        >
                          {s.label}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>

                  {patient.patient_id && (
                    <span className='font-mono text-[11px] text-muted-foreground/80'>
                      {patient.patient_id}
                    </span>
                  )}
                </div>

                {/* 3. Footer: Kunjungan Terakhir + Ellipsis Action + Detail Button */}
                <div className='w-full flex items-center justify-between gap-3 pt-2.5 border-t border-border/40 min-w-0'>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[11px] text-muted-foreground'>Kunjungan terakhir</span>
                    <span className='text-xs font-semibold font-mono text-foreground truncate'>
                      {formatVisitDate(patient.last_visit_date)}
                    </span>
                  </div>

                  <div className='flex items-center gap-1.5 shrink-0'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        openActionDrawer(patient);
                      }}
                      aria-label={`Aksi untuk pasien ${patient.name}`}
                      className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer shrink-0'
                    >
                      <Icons.ellipsis className='size-4' />
                    </Button>

                    <Button
                      type='button'
                      variant='default'
                      shape='pill'
                      size='card-action'
                      withTrailingCircleIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(patient);
                      }}
                      className='font-bold shadow-2xs cursor-pointer'
                    >
                      Detail
                    </Button>
                  </div>
                </div>
              </div>

              {/* Afiliasi Keluarga: Stacking Card Deck dari si Super (Collapsed) & Tree Hierarchy (Expanded) */}
              {hasAffiliates &&
                (() => {
                  const affiliates = patient.affiliates || [];
                  const previewAffiliates = affiliates.slice(0, 3);
                  const extraCount = affiliates.length - previewAffiliates.length;

                  return (
                    <div className='flex flex-col'>
                      {!isExpanded ? (
                        /* Collapsed Mode: Stacking Card Deck dari si Super (Sesuai sketsa Excalidraw & reference) */
                        <div
                          role='button'
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDeck(patient.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleDeck(patient.id);
                            }
                          }}
                          className='group/stack relative flex flex-col cursor-pointer select-none focus:outline-none'
                          aria-label={`Buka dropdown ${affiliates.length} anggota afiliasi untuk ${patient.name}`}
                        >
                          {/* Tab Layer 1 (Afiliasi 1 - e.g. "wulandari | anak") */}
                          {affiliates[0] && (
                            <div
                              className={cn(
                                'relative z-10 -mt-3.5 pt-4.5 pb-2 px-3.5 sm:px-4 rounded-b-[20px] mx-1 sm:mx-1.5',
                                'border-x border-b border-border/80 bg-muted/40 dark:bg-card/90 backdrop-blur-xs',
                                'flex items-center justify-between gap-2 shadow-xs transition-all duration-200 group-hover/stack:bg-muted/60'
                              )}
                            >
                              <div className='flex items-center gap-2 min-w-0 flex-1'>
                                <div className='size-5.5 rounded-full overflow-hidden shrink-0 ring-1 ring-border/50 bg-muted aspect-square flex items-center justify-center'>
                                  <Avatar className='h-full w-full'>
                                    <AvatarFallback className='text-[9px] font-bold bg-primary/10 text-primary'>
                                      {getInitials(affiliates[0].name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <span className='text-xs font-semibold text-foreground truncate'>
                                  {affiliates[0].name}
                                </span>
                              </div>

                              <div className='shrink-0 flex items-center gap-1.5'>
                                <StatusBadge
                                  status={getRelationStatusKey(affiliates[0].relationship_type)}
                                  label={getCleanRelationLabel(
                                    affiliates[0].relationship_type,
                                    affiliates[0].relation_label
                                  )}
                                  size='sm'
                                />
                                {affiliates.length === 1 && (
                                  <Icons.chevronDown className='size-3.5 text-muted-foreground group-hover/stack:text-primary transition-transform group-hover/stack:translate-y-0.5' />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tab Layer 2 (Afiliasi 2 - e.g. "surya ning | orang tua") */}
                          {affiliates[1] && (
                            <div
                              className={cn(
                                'relative z-[5] -mt-1.5 pt-2.5 pb-2 px-3.5 sm:px-4 rounded-b-[22px] mx-2.5 sm:mx-3',
                                'border-x border-b border-border/70 bg-muted/60 dark:bg-card/75',
                                'flex items-center justify-between gap-2 shadow-xs transition-all duration-200 group-hover/stack:bg-muted/80'
                              )}
                            >
                              <div className='flex items-center gap-2 min-w-0 flex-1'>
                                <div className='size-5.5 rounded-full overflow-hidden shrink-0 ring-1 ring-border/50 bg-muted aspect-square flex items-center justify-center'>
                                  <Avatar className='h-full w-full'>
                                    <AvatarFallback className='text-[9px] font-bold bg-primary/10 text-primary'>
                                      {getInitials(affiliates[1].name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <span className='text-xs font-semibold text-foreground truncate'>
                                  {affiliates[1].name}
                                </span>
                              </div>

                              <div className='shrink-0 flex items-center gap-1.5'>
                                <StatusBadge
                                  status={getRelationStatusKey(affiliates[1].relationship_type)}
                                  label={getCleanRelationLabel(
                                    affiliates[1].relationship_type,
                                    affiliates[1].relation_label
                                  )}
                                  size='sm'
                                />
                                {affiliates.length === 2 && (
                                  <Icons.chevronDown className='size-3.5 text-muted-foreground group-hover/stack:text-primary transition-transform group-hover/stack:translate-y-0.5' />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tab Layer 3 (Afiliasi 3 atau Abstraksi jika > 2) */}
                          {affiliates[2] && (
                            <div
                              className={cn(
                                'relative z-0 -mt-1.5 pt-2.5 pb-2 px-3.5 sm:px-4 rounded-b-[24px] mx-4 sm:mx-4.5',
                                'border-x border-b border-border/60 bg-muted/80 dark:bg-card/60',
                                'flex items-center justify-between gap-2 shadow-xs transition-all duration-200 group-hover/stack:bg-muted/95'
                              )}
                            >
                              <div className='flex items-center gap-2 min-w-0 flex-1'>
                                <div className='size-5.5 rounded-full overflow-hidden shrink-0 ring-1 ring-border/50 bg-muted aspect-square flex items-center justify-center'>
                                  <Avatar className='h-full w-full'>
                                    <AvatarFallback className='text-[9px] font-bold bg-primary/10 text-primary'>
                                      {getInitials(affiliates[2].name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <span className='text-xs font-semibold text-foreground truncate'>
                                  {affiliates[2].name}
                                </span>
                              </div>

                              <div className='shrink-0 flex items-center gap-1.5'>
                                <StatusBadge
                                  status={getRelationStatusKey(affiliates[2].relationship_type)}
                                  label={getCleanRelationLabel(
                                    affiliates[2].relationship_type,
                                    affiliates[2].relation_label
                                  )}
                                  size='sm'
                                />
                                {affiliates.length > 3 && (
                                  <span className='text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full'>
                                    +{affiliates.length - 3} lainnya
                                  </span>
                                )}
                                <Icons.chevronDown className='size-3.5 text-muted-foreground group-hover/stack:text-primary transition-transform group-hover/stack:translate-y-0.5' />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Expanded Mode: Dropdown Terbuka Menampilkan Seluruh Hierarki Lengkap */
                        <div className='mt-2.5 flex flex-col gap-2.5 pt-0.5'>
                          {/* Header Tutup Dropdown */}
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDeck(patient.id);
                            }}
                            className='w-full py-2 px-3.5 flex items-center justify-between text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-xl border border-primary/25 transition-all cursor-pointer'
                          >
                            <div className='flex items-center gap-2'>
                              <Icons.users className='size-3.5' />
                              <span>Tutup Afiliasi ({affiliates.length} Anggota)</span>
                            </div>
                            <Icons.chevronDown className='size-4 rotate-180 transition-transform duration-200' />
                          </button>

                          {/* Hierarchical Tree of Full Affiliate Cards */}
                          <div className='relative ml-4 pl-3 sm:ml-5 sm:pl-4 border-l-2 border-primary/30 flex flex-col gap-2.5'>
                            {affiliates.map((affiliate) => {
                              const affSlots = getDemographicSlots(affiliate);
                              const affRelLabel = getCleanRelationLabel(
                                affiliate.relationship_type,
                                affiliate.relation_label
                              );
                              const affRelKey = getRelationStatusKey(affiliate.relationship_type);

                              return (
                                <div
                                  key={affiliate.id}
                                  onClick={() => onRowClick(affiliate)}
                                  className='group/aff relative w-full bg-card/95 hover:bg-card text-card-foreground border border-border/80 rounded-[18px] p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 transition-all duration-150 cursor-pointer shadow-2xs hover:border-primary/40 box-border min-w-0'
                                >
                                  {/* Horizontal connector arm from vertical tree line */}
                                  <span className='absolute -left-3 sm:-left-4 top-6 w-3 sm:w-4 h-[1.5px] bg-primary/30 pointer-events-none' />

                                  {/* Header Afiliasi: Avatar + Nama + Status Badge */}
                                  <div className='flex items-start justify-between gap-2 min-w-0'>
                                    <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                                      <div className='size-9 rounded-full overflow-hidden shrink-0 ring-1 ring-border/40 bg-muted aspect-square flex items-center justify-center'>
                                        <Avatar className='h-full w-full'>
                                          <AvatarFallback className='text-[10px] font-bold bg-muted text-muted-foreground'>
                                            {getInitials(affiliate.name)}
                                          </AvatarFallback>
                                        </Avatar>
                                      </div>

                                      <div className='min-w-0 flex-1 space-y-0.5'>
                                        <h4
                                          className='text-xs sm:text-[13px] font-bold text-foreground truncate'
                                          title={affiliate.name}
                                        >
                                          {affiliate.name}
                                        </h4>
                                        <div className='flex items-center gap-1.5'>
                                          <StatusBadge
                                            status={affRelKey}
                                            label={affRelLabel}
                                            size='sm'
                                          />
                                          {affiliate.has_own_account && (
                                            <StatusBadge
                                              status='PUNYA_AKUN'
                                              label='Punya Akun'
                                              size='sm'
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <StatusBadge
                                      status={affiliate.account_status || 'active'}
                                      size='sm'
                                    />
                                  </div>

                                  {/* Slot Demografis Afiliasi */}
                                  <div className='flex items-center text-[11px] px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/30 text-muted-foreground gap-2'>
                                    {affSlots.map((s, idx) => (
                                      <React.Fragment key={s.id}>
                                        {idx > 0 && (
                                          <span className='text-border/90 font-light select-none'>
                                            |
                                          </span>
                                        )}
                                        <span
                                          className={cn(
                                            'text-foreground font-medium',
                                            s.isMono && 'font-mono'
                                          )}
                                        >
                                          {s.label}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </div>

                                  {/* Footer Afiliasi: Kunjungan Terakhir + Aksi */}
                                  <div className='w-full flex items-center justify-between gap-2 pt-2 border-t border-border/30 min-w-0'>
                                    <div className='flex flex-col min-w-0 flex-1'>
                                      <span className='text-[10px] text-muted-foreground'>
                                        Kunjungan terakhir
                                      </span>
                                      <span className='text-[11px] font-medium font-mono text-foreground truncate'>
                                        {formatVisitDate(affiliate.last_visit_date)}
                                      </span>
                                    </div>

                                    <div className='flex items-center gap-1 shrink-0'>
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openActionDrawer(affiliate);
                                        }}
                                        aria-label={`Aksi untuk pasien ${affiliate.name}`}
                                        className='size-7 text-muted-foreground hover:text-foreground rounded-md'
                                      >
                                        <Icons.ellipsis className='size-3.5' />
                                      </Button>

                                      <Button
                                        type='button'
                                        variant='outline'
                                        shape='pill'
                                        size='card-action'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onViewDetail(affiliate);
                                        }}
                                        className='text-xs font-semibold cursor-pointer'
                                      >
                                        Detail
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Bottom Collapse Button if affiliates count is large */}
                          {affiliates.length > 3 && (
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDeck(patient.id);
                              }}
                              className='self-center mt-1 text-[11px] font-semibold text-primary/80 hover:text-primary py-1 px-3 rounded-full hover:bg-primary/5 transition-colors cursor-pointer'
                            >
                              Tutup Afiliasi ▲
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>
          );
        })}

        {/* Sentinel Infinite Scroll */}
        {sentinelRef && (
          <div
            ref={sentinelRef}
            className='py-3 flex flex-col items-center justify-center text-xs text-muted-foreground'
          >
            {isFetchingNextPage && (
              <div className='flex items-center gap-2 text-primary font-medium'>
                <Icons.spinner className='size-4 animate-spin' />
                <span>Memuat pasien berikutnya...</span>
              </div>
            )}
            {!hasNextPage && patients.length > 0 && (
              <span className='text-muted-foreground/60 text-[11px]'>
                Semua hasil pencarian telah dimuat
              </span>
            )}
          </div>
        )}
      </div>

      {/* Centralized Action Drawer */}
      <PatientActionDrawer
        isOpen={Boolean(selectedActionPatient)}
        patient={selectedActionPatient}
        onClose={closeActionDrawer}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onViewHistory={onViewHistory}
        onDelete={onDelete}
      />
    </>
  );
}
