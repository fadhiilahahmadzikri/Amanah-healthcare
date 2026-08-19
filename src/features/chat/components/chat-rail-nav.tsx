'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type ChatRailTool = 'inbox' | 'calendar' | 'patients' | 'stats' | 'settings';

interface ChatRailNavProps {
  activeTool: ChatRailTool;
  onSelectTool: (tool: ChatRailTool) => void;
}

export function ChatRailNav({ activeTool, onSelectTool }: ChatRailNavProps) {
  const tools: { id: ChatRailTool; label: string; icon: React.ReactNode }[] = [
    { id: 'inbox', label: 'Pesan Masuk (Inbox)', icon: <Icons.inbox className='size-4' /> },
    { id: 'calendar', label: 'Jadwal Janji Temu', icon: <Icons.calendar className='size-4' /> },
    { id: 'patients', label: 'Data & Kontak Pasien', icon: <Icons.teams className='size-4' /> },
    { id: 'stats', label: 'Statistik Layanan', icon: <Icons.dashboard className='size-4' /> }
  ];

  return (
    <aside className='w-[46px] border-r border-border/60 bg-card/60 flex flex-col items-center justify-between py-3 shrink-0 select-none'>
      <TooltipProvider delayDuration={150}>
        <div className='flex flex-col items-center gap-3'>
          {/* Clinic Brand Indicator */}
          <div className='size-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center cursor-pointer shadow-2xs'>
            A
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className='size-6 rounded-full border border-border/80 flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors'>
                <Icons.add className='size-3.5' />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right'>Buat Pesan Baru</TooltipContent>
          </Tooltip>

          <div className='w-4 h-[1px] bg-border/60 my-0.5' />

          {/* Navigation Tools */}
          <div className='flex flex-col items-center gap-1.5 text-muted-foreground'>
            {tools.map((item) => {
              const isActive = activeTool === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectTool(item.id)}
                      className={cn(
                        'size-7 rounded-md flex items-center justify-center transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {item.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side='right'>{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className='flex flex-col items-center gap-2 text-muted-foreground'>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelectTool('settings')}
                className={cn(
                  'size-6 flex items-center justify-center hover:text-foreground transition-colors',
                  activeTool === 'settings' && 'text-primary font-bold'
                )}
              >
                <Icons.settings className='size-4' />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right'>Pengaturan Chat</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </aside>
  );
}
