'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { StepperTimeline } from '@/components/ui/stepper-timeline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Conversation, StepperTimelineItem } from '../utils/types';

interface PatientCrmSidebarProps {
  conversation?: Conversation;
}

export function PatientCrmSidebar({ conversation }: PatientCrmSidebarProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'profile' | 'medical' | 'appointments'>(
    'timeline'
  );

  if (!conversation) {
    return (
      <aside className='w-[310px] bg-card flex flex-col overflow-y-auto p-3 shrink-0 select-none border-l border-border/60'>
        <EmptyState
          icon={Icons.user}
          title='Belum ada profil pasien'
          description='Profil pasien akan ditampilkan setelah percakapan dipilih.'
          className='h-full min-h-[360px] border-0 bg-transparent px-3'
        />
      </aside>
    );
  }

  const statusConfig = getStatusConfig(conversation.status);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard`);
  };

  const handleTimelineAction = (item: StepperTimelineItem) => {
    toast.info(`Membuka: ${item.title}`);
  };

  const initials =
    conversation.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '-';

  const docInitials =
    conversation.dpjp.name
      .replace('dr. ', '')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '-';
  const patientMeta = [
    conversation.id_pasien,
    conversation.gender,
    conversation.age ? `${conversation.age} th` : ''
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <aside className='w-[310px] bg-card flex flex-col overflow-y-auto p-3 shrink-0 select-none border-l border-border/60'>
      {/* 1. Patient Avatar & Identity */}
      <div className='flex flex-col items-center text-center mt-1'>
        <Avatar className='size-[60px] rounded-full ring-2 ring-primary/20 shadow-xs'>
          <AvatarImage src={conversation.avatar} alt={conversation.name} />
          <AvatarFallback className='text-sm font-bold bg-primary/10 text-primary'>
            {initials}
          </AvatarFallback>
        </Avatar>
        <h3 className='text-[13px] font-bold text-foreground mt-2 leading-tight'>
          {conversation.name || '-'}
        </h3>
        <p className='text-[10px] text-muted-foreground font-mono'>{patientMeta || '-'}</p>
      </div>

      {/* 2. Clinical Status Dropdown Button */}
      <div className='mt-3'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className={cn(
                'w-full h-[28px] rounded-[6px] flex items-center justify-between px-2.5 text-[10.5px] font-bold border shadow-2xs',
                statusConfig.pillBg,
                statusConfig.pillBorder
              )}
            >
              <div className='flex items-center gap-1.5 min-w-0'>
                <span
                  className={cn(
                    'size-2 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                    statusConfig.dotGradient
                  )}
                />
                <span
                  className={cn(
                    'bg-clip-text text-transparent truncate',
                    statusConfig.textGradient
                  )}
                >
                  {statusConfig.label}
                </span>
              </div>
              <Icons.chevronDown className='size-3 text-muted-foreground shrink-0' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            {[
              'SUDAH BUAT JANJI',
              'SUDAH DATANG',
              'MENUNGGU',
              'SEDANG PERIKSA',
              'SELESAI',
              'TIDAK ADA DOKTER'
            ].map((st) => {
              const cfg = getStatusConfig(st);
              return (
                <DropdownMenuItem
                  key={st}
                  onClick={() => toast.success(`Status diubah menjadi: ${cfg.label}`)}
                  className='text-xs font-medium flex items-center gap-2 cursor-pointer'
                >
                  <span className={cn('size-2 rounded-full', cfg.dotGradient)} />
                  <span>{cfg.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 3. Contact Quick Actions */}
      <div className='mt-2.5 space-y-1.5'>
        {/* Phone */}
        <div className='h-[28px] border border-border/70 rounded-[6px] px-2 flex items-center justify-between text-[10px] text-foreground bg-background shadow-2xs'>
          <div className='flex items-center gap-1.5 truncate'>
            <Icons.phone className='size-3 text-muted-foreground shrink-0' />
            <span className='truncate font-medium'>{conversation.phone || '-'}</span>
          </div>
          <div className='flex items-center gap-1 text-muted-foreground shrink-0'>
            <button
              onClick={() => copyToClipboard(conversation.phone, 'Nomor Telepon')}
              disabled={!conversation.phone}
              className='p-0.5 hover:text-foreground transition-colors'
              title='Salin No. HP'
            >
              <Icons.copy className='size-3' />
            </button>
          </div>
        </div>

        {/* Email */}
        <div className='h-[28px] border border-border/70 rounded-[6px] px-2 flex items-center justify-between text-[10px] text-foreground bg-background shadow-2xs'>
          <div className='flex items-center gap-1.5 truncate'>
            <Icons.mail className='size-3 text-muted-foreground shrink-0' />
            <span className='truncate font-medium'>{conversation.email || '-'}</span>
          </div>
          <div className='flex items-center text-muted-foreground shrink-0'>
            <button
              onClick={() => copyToClipboard(conversation.email, 'Email Pasien')}
              disabled={!conversation.email}
              className='p-0.5 hover:text-foreground transition-colors'
              title='Salin Email'
            >
              <Icons.copy className='size-3' />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Dokter DPJP Card */}
      <div className='mt-2.5 p-2 border border-border/70 rounded-[6px] flex items-center justify-between bg-background shadow-2xs'>
        <div className='flex flex-col min-w-0 pr-2'>
          <span className='text-[9.5px] text-muted-foreground block leading-tight'>
            Dokter Penanggung Jawab (DPJP)
          </span>
          <span className='text-[11px] font-bold text-foreground leading-tight truncate mt-0.5'>
            {conversation.dpjp.name || '-'}
          </span>
          <span className='text-[9.5px] text-muted-foreground truncate'>
            {conversation.dpjp.specialty || '-'}
          </span>
        </div>
        <Avatar className='size-6 rounded-full shrink-0 ring-1 ring-border/40'>
          <AvatarImage src={conversation.dpjp.avatar} alt={conversation.dpjp.name || 'Dokter'} />
          <AvatarFallback className='text-[8px] bg-primary/10 text-primary font-bold'>
            {docInitials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* 5. Sub-Tabs */}
      <div className='mt-3 flex items-center justify-between border-b border-border/60 text-[10.5px] font-medium'>
        {[
          { id: 'timeline', label: 'Timeline' },
          { id: 'profile', label: 'Profil' },
          { id: 'medical', label: 'Medis' },
          { id: 'appointments', label: 'Janji' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'pb-1.5 transition-colors border-b-2 font-medium',
              activeTab === tab.id
                ? 'text-foreground border-primary font-bold'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 6. Stepper Timeline Content */}
      <div className='mt-3'>
        {activeTab === 'timeline' &&
          (conversation.timeline.length > 0 ? (
            <StepperTimeline items={conversation.timeline} onActionClick={handleTimelineAction} />
          ) : (
            <EmptyState
              icon={Icons.clock}
              title='Belum ada timeline'
              description='Aktivitas pasien akan ditampilkan di sini setelah tersedia.'
              className='min-h-[260px] border-0 bg-transparent px-2'
            />
          ))}

        {activeTab === 'profile' && (
          <EmptyState
            icon={Icons.user}
            title='Belum ada profil'
            description='Data profil pasien akan ditampilkan di sini setelah tersedia.'
            className='min-h-[260px] border-0 bg-transparent px-2'
          />
        )}

        {activeTab === 'medical' && (
          <EmptyState
            icon={Icons.post}
            title='Belum ada rekam medis'
            description='Informasi medis pasien akan ditampilkan di sini setelah tersedia.'
            className='min-h-[260px] border-0 bg-transparent px-2'
          />
        )}

        {activeTab === 'appointments' && (
          <EmptyState
            icon={Icons.calendar}
            title='Belum ada janji temu'
            description='Janji temu pasien akan ditampilkan di sini setelah tersedia.'
            className='min-h-[260px] border-0 bg-transparent px-2'
          />
        )}
      </div>
    </aside>
  );
}
