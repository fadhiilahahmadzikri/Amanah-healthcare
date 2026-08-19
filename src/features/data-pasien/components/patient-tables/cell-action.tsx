'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
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

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='h-8 px-2.5 text-xs font-medium'
          onClick={(e) => {
            e.stopPropagation();
            setDetailOpen(true);
          }}
        >
          <Icons.eye className='mr-1.5 size-3.5' />
          Lihat Detail
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='h-8 px-2.5 text-xs font-medium'
          onClick={(e) => {
            e.stopPropagation();
            setEditOpen(true);
          }}
        >
          <Icons.edit className='mr-1.5 size-3.5' />
          Edit
        </Button>
      </div>
    </>
  );
}
