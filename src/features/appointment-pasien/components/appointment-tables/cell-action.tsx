'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { AdminAppointment } from '../../api/types';
import { AppointmentDetailModal } from '../appointment-detail-modal';
import { AppointmentStatusModal } from '../appointment-status-modal';

interface CellActionProps {
  data: AdminAppointment;
}

export function CellAction({ data }: CellActionProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <>
      <AppointmentDetailModal
        appointment={data}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdateStatus={() => {
          setDetailOpen(false);
          setStatusOpen(true);
        }}
      />
      <AppointmentStatusModal
        appointment={data}
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
      />

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
            setStatusOpen(true);
          }}
        >
          <Icons.refresh className='mr-1.5 size-3.5' />
          Update Status
        </Button>
      </div>
    </>
  );
}
