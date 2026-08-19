'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
                setStatusOpen(true);
              }}
            >
              <Icons.refresh className='size-4' />
              <span className='sr-only'>Update Status</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' className='text-xs'>
            Update Status
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}
