'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { formatClinicDate } from '@/lib/date-format';
import {
  staffManagementApi,
  type StaffMember
} from '@/features/staff-management/api/staff-management.api';
import { getSessionTitle } from '../constants/replacement.constants';
import type { ReplacementOpportunityItem } from '../api/types';

export interface AssignReplacementModalProps {
  opportunity: ReplacementOpportunityItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (
    opportunityId: string,
    staffProfileId: string,
    practitionerId?: string,
    notes?: string
  ) => void;
  isAssigning?: boolean;
}

export function AssignReplacementModal({
  opportunity,
  isOpen,
  onClose,
  onAssign,
  isAssigning = false
}: AssignReplacementModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [searchStaff, setSearchStaff] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const { data: staffs = [], isLoading: isLoadingStaffs } = useQuery({
    queryKey: ['staffs', 'all'],
    queryFn: staffManagementApi.getAllStaffs,
    enabled: isOpen
  });

  // Filter available staff: must be active and cannot be the staff on leave
  const eligibleStaffs = useMemo(() => {
    if (!opportunity) return [];
    const query = searchStaff.trim().toLowerCase();

    return staffs
      .filter((s) => s.isActive)
      .filter((s) => s.id !== opportunity.originalStaffProfileId)
      .filter((s) => {
        if (!query) return true;
        const name = s.fullName.toLowerCase();
        const profession = s.profession.toLowerCase();
        return name.includes(query) || profession.includes(query);
      });
  }, [staffs, opportunity, searchStaff]);

  const selectedStaff = useMemo(
    () => staffs.find((s) => s.id === selectedStaffId),
    [staffs, selectedStaffId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity || !selectedStaffId) return;
    onAssign(opportunity.id, selectedStaffId, undefined, notes);
  };

  if (!opportunity) return null;

  const sessionName = getSessionTitle(opportunity.sessionCode);
  const formattedDate = formatClinicDate(opportunity.workDate, {
    style: 'human_full'
  });

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='w-full sm:max-w-[520px]'
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className='font-sans space-y-4 text-left p-1'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3 border-b border-border/60 pb-3'>
          <div className='flex items-center gap-2.5 min-w-0'>
            <div className='p-2 rounded-xl bg-primary/10 text-primary shrink-0'>
              <Icons.userCheck className='size-5' />
            </div>
            <div className='min-w-0'>
              <h3 className='text-base font-bold text-foreground leading-snug'>
                Tugaskan Staf Pengganti
              </h3>
              <p className='text-xs text-muted-foreground'>
                {sessionName} • {formattedDate}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Info Cuti */}
        <div className='bg-muted/30 p-3 rounded-xl space-y-1.5 text-xs border border-border/40'>
          <span className='text-[11px] font-semibold text-muted-foreground block'>
            Menggantikan Staf
          </span>
          <div className='font-semibold text-foreground text-xs'>
            {opportunity.originalStaffName} ({opportunity.originalStaffRole || 'Staf'})
          </div>
          {opportunity.leaveReason && (
            <p className='text-[11px] text-muted-foreground italic'>
              &ldquo;{opportunity.leaveReason}&rdquo;
            </p>
          )}
        </div>

        {/* Staff Selection List */}
        <div className='space-y-2'>
          <label
            htmlFor='search-staff-input'
            className='text-xs font-semibold text-foreground block'
          >
            Pilih Rekan Staf Pengganti
          </label>

          {/* Search Bar */}
          <div className='relative'>
            <Icons.search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
            <input
              id='search-staff-input'
              type='text'
              value={searchStaff}
              onChange={(e) => setSearchStaff(e.target.value)}
              placeholder='Cari nama atau profesi staf...'
              aria-label='Cari nama atau profesi staf'
              className='w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary'
            />
          </div>

          {/* List Area */}
          <div className='max-h-[180px] overflow-y-auto space-y-1 rounded-xl border border-border/60 p-1 bg-muted/10'>
            {isLoadingStaffs ? (
              <div className='p-3 text-center text-xs text-muted-foreground animate-pulse'>
                Memuat daftar staf klinik...
              </div>
            ) : eligibleStaffs.length === 0 ? (
              <div className='p-3 text-center text-xs text-muted-foreground'>
                Tidak ada staf yang sesuai
              </div>
            ) : (
              eligibleStaffs.map((staff: StaffMember) => {
                const isSelected = selectedStaffId === staff.id;
                return (
                  <button
                    key={staff.id}
                    type='button'
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`flex items-center justify-between w-full text-left p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-primary/10 border border-primary/30 text-primary font-medium'
                        : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <Avatar className='size-7 rounded-lg border border-border/50 shrink-0'>
                        <AvatarImage
                          src={staff.photoUrl || DEFAULT_AVATAR_PATH}
                          alt={staff.fullName}
                          className='rounded-lg object-cover'
                        />
                        <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
                          <Image
                            src={DEFAULT_AVATAR_PATH}
                            alt={staff.fullName}
                            width={28}
                            height={28}
                            unoptimized
                            className='size-full rounded-lg object-cover'
                          />
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <div className='font-semibold text-xs truncate leading-tight'>
                          {staff.fullName}
                        </div>
                        <div className='text-[10.5px] text-muted-foreground truncate leading-tight'>
                          {staff.profession}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Icons.check className='size-4 text-primary shrink-0 stroke-[2.5]' />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Catatan Penugasan */}
        <div className='space-y-1.5'>
          <label
            htmlFor='assignment-notes-input'
            className='text-xs font-semibold text-foreground block'
          >
            Catatan Penugasan (Opsional)
          </label>
          <input
            id='assignment-notes-input'
            type='text'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Misal: Penugasan koordinasi langsung supervisor'
            aria-label='Catatan Penugasan'
            className='w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary'
          />
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-end gap-2 pt-3 border-t border-border/60'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onClose}
            disabled={isAssigning}
            className='text-xs h-8 px-3'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='primary'
            size='sm'
            disabled={!selectedStaffId || isAssigning}
            className='text-xs h-8 px-4 font-semibold gap-1.5'
          >
            {isAssigning ? (
              <>
                <Icons.spinner className='size-3.5 animate-spin' />
                <span>Menugaskan...</span>
              </>
            ) : (
              <>
                <Icons.check className='size-3.5' />
                <span>
                  Tugaskan {selectedStaff?.fullName ? selectedStaff.fullName.split(' ')[0] : 'Staf'}
                </span>
              </>
            )}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
