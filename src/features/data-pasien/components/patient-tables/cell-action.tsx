'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Patient } from '../../api/types';
import { PatientDetailsModal } from '../patient-details-modal';
import { PatientFormModal } from '../patient-form-modal';

interface CellActionProps {
  data: Patient;
}

export function CellAction({ data }: CellActionProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <PatientDetailsModal
        patient={data}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={() => {
          setDetailOpen(false);
          setEditOpen(true);
        }}
      />
      <PatientFormModal patient={data} isOpen={editOpen} onClose={() => setEditOpen(false)} />

      <div className='flex items-center gap-1'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors'
              onClick={(e) => {
                e.stopPropagation();
                setDetailOpen(true);
              }}
            >
              <Icons.eye className='size-4' />
              <span className='sr-only'>Lihat Detail</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Lihat Detail
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors'
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
            >
              <Icons.edit className='size-4' />
              <span className='sr-only'>Edit Pasien</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Edit Pasien
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}
