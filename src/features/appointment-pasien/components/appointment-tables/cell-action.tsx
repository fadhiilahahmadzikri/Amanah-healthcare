'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import type { AdminAppointment } from '../../api/types';
import { callPatient } from '../../api/service';
import { AppointmentDetailModal } from '../appointment-detail-modal';
import { AppointmentStatusModal } from '../appointment-status-modal';

interface CellActionProps {
  data: AdminAppointment;
}

export function CellAction({ data }: CellActionProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const canCall = data.allowedActions?.includes('CALL');

  const handleCallPatient = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCalling) return;
    setIsCalling(true);
    try {
      await callPatient(data.id);
      toast.success(`Pasien dipanggil: Nomor antrean ${data.queueNumber}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Gagal memanggil pasien: ${message}`);
    } finally {
      setIsCalling(false);
    }
  };

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
        {canCall && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                disabled={isCalling}
                className='size-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-md transition-colors'
                onClick={handleCallPatient}
              >
                {isCalling ? (
                  <Icons.spinner className='size-4 animate-spin' />
                ) : (
                  <Icons.phone className='size-4' />
                )}
                <span className='sr-only'>Panggil Pasien</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top' className='text-xs'>
              Panggil Pasien
            </TooltipContent>
          </Tooltip>
        )}

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
