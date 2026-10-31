'use client';

import * as React from 'react';
import {
  IconStethoscope,
  IconBriefcase,
  IconEdit,
  IconTrash,
  IconBrowser
} from '@tabler/icons-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AUDIENCE } from '@/core/auth/permissions.constants';
import type { Role } from '../types/role.types';

export interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onManagePages?: (role: Role) => void;
  canManage?: boolean;
}

export function RoleCard({
  role,
  onEdit,
  onDelete,
  onManagePages,
  canManage = true
}: RoleCardProps) {
  const directPermsCount = (role.permissions || []).length;
  const effectivePermsCount = (role.effectivePermissionCodes || []).length;

  return (
    <Card className='flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs'>
      <CardHeader className='pb-3 pt-4 px-4 space-y-2'>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <h3 className='font-semibold text-base text-foreground leading-tight'>{role.name}</h3>
            <p className='font-mono text-xs text-muted-foreground pt-0.5'>{role.code}</p>
          </div>

          <div className='flex flex-col items-end gap-1'>
            <div className='flex items-center gap-1'>
              {role.audience === AUDIENCE.EXTERNAL ? (
                <Badge
                  variant='outline'
                  className='text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300'
                >
                  Eksternal
                </Badge>
              ) : (
                <Badge variant='outline' className='text-[10px] px-1.5 py-0 text-muted-foreground'>
                  Internal
                </Badge>
              )}

              {role.isSystem ? (
                <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
                  Sistem
                </Badge>
              ) : (
                <Badge variant='outline' className='text-[10px] px-1.5 py-0 capitalize'>
                  {role.tier}
                </Badge>
              )}
            </div>

            {role.isClinical ? (
              <Badge
                variant='outline'
                className='text-[10px] px-1.5 py-0 border-sky-400 text-sky-700 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-300 gap-0.5'
              >
                <IconStethoscope className='size-2.5' />
                Klinis
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='text-[10px] px-1.5 py-0 text-muted-foreground gap-0.5'
              >
                <IconBriefcase className='size-2.5' />
                Operasional
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='px-4 pb-3 space-y-3 flex-1'>
        <p className='text-xs text-muted-foreground line-clamp-2 min-h-[32px]'>
          {role.description || 'Tidak ada deskripsi peran.'}
        </p>

        <div className='flex items-center justify-between text-xs pt-1 border-t'>
          <span className='text-muted-foreground'>Hak Akses:</span>
          <span className='font-medium text-foreground'>
            {directPermsCount} izin{' '}
            {effectivePermsCount > directPermsCount && (
              <span className='text-muted-foreground text-[11px]'>
                ({effectivePermsCount} efektif)
              </span>
            )}
          </span>
        </div>

        <div className='flex items-center justify-between text-xs'>
          <span className='text-muted-foreground'>Jumlah Staf:</span>
          <span className='font-medium text-foreground'>{role.staffCount ?? 0} pegawai</span>
        </div>

        {role.parentRole && (
          <div className='flex items-center justify-between text-xs'>
            <span className='text-muted-foreground'>Peran Induk:</span>
            <span className='font-medium text-foreground truncate max-w-[140px]'>
              {role.parentRole.name}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className='px-4 py-3 border-t bg-muted/10 flex items-center justify-between gap-2 flex-wrap'>
        <Button
          variant='outline'
          size='sm'
          disabled={!canManage}
          className='h-8 text-xs flex-1 min-w-[105px] gap-1.5'
          onClick={() => onEdit(role)}
        >
          <IconEdit className='size-3.5' />
          Atur Izin & Edit
        </Button>

        {onManagePages && (
          <Button
            variant='outline'
            size='sm'
            disabled={!canManage}
            className='h-8 text-xs flex-1 min-w-[110px] gap-1.5'
            onClick={() => onManagePages(role)}
          >
            <IconBrowser className='size-3.5' />
            Akses Halaman
          </Button>
        )}

        {!role.isSystem && canManage && (
          <Button
            variant='ghost'
            size='icon'
            className='size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0'
            onClick={() => onDelete(role)}
          >
            <IconTrash className='size-4' />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
