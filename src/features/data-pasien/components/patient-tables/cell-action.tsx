'use client';

import React, { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Patient } from '../../api/types';
import type { PatientTableMeta } from '../../model/usePatientTable';
import { PatientModal } from '../patient-modal';
import { PatientHistoryModal } from '../patient-history-modal';
import { PatientDeleteDialog } from '../patient-delete-dialog';

export interface CellActionProps {
  data: Patient;
  table?: Table<Patient>;
}

export function CellAction({ data, table }: CellActionProps) {
  const [localDetailOpen, setLocalDetailOpen] = useState(false);
  const [localEditOpen, setLocalEditOpen] = useState(false);
  const [localHistoryOpen, setLocalHistoryOpen] = useState(false);
  const [localDeleteOpen, setLocalDeleteOpen] = useState(false);

  const meta = table?.options.meta as PatientTableMeta | undefined;

  const handleViewHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (meta?.onViewHistory) {
      meta.onViewHistory(data);
    } else {
      setLocalHistoryOpen(true);
    }
  };

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (meta?.onViewDetail) {
      meta.onViewDetail(data);
    } else {
      setLocalDetailOpen(true);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (meta?.onEdit) {
      meta.onEdit(data);
    } else {
      setLocalEditOpen(true);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (meta?.onDelete) {
      meta.onDelete(data);
    } else {
      setLocalDeleteOpen(true);
    }
  };

  return (
    <>
      {/* Fallback local dialogs in case meta is not wired */}
      {!meta && (
        <>
          <PatientModal
            patient={data}
            isOpen={localDetailOpen || localEditOpen}
            initialMode={localEditOpen ? 'edit' : 'view'}
            onClose={() => {
              setLocalDetailOpen(false);
              setLocalEditOpen(false);
            }}
          />
          <PatientHistoryModal
            patient={data}
            isOpen={localHistoryOpen}
            onClose={() => setLocalHistoryOpen(false)}
          />
          <PatientDeleteDialog
            patient={data}
            isOpen={localDeleteOpen}
            onClose={() => setLocalDeleteOpen(false)}
          />
        </>
      )}

      <div className='flex items-center gap-1'>
        {/* 1. Riwayat Janji Temu */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-primary hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer'
              onClick={handleViewHistory}
            >
              <Icons.history className='size-4' />
              <span className='sr-only'>Lihat Riwayat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Lihat Riwayat Janji Temu
          </TooltipContent>
        </Tooltip>

        {/* 2. Detail Pasien */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer'
              onClick={handleViewDetail}
            >
              <Icons.eye className='size-4' />
              <span className='sr-only'>Lihat Detail</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Lihat Detail Pasien
          </TooltipContent>
        </Tooltip>

        {/* 3. Edit Pasien */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer'
              onClick={handleEdit}
            >
              <Icons.edit className='size-4' />
              <span className='sr-only'>Edit Pasien</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Edit Pasien
          </TooltipContent>
        </Tooltip>

        {/* 4. Nonaktifkan / Hapus Pasien */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer'
              onClick={handleDelete}
            >
              <Icons.trash className='size-4' />
              <span className='sr-only'>Nonaktifkan Pasien</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Nonaktifkan Pasien
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}
