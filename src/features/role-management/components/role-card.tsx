'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  IconEdit,
  IconTrash,
  IconBrowser,
  IconAlertTriangle,
  IconArrowUpRight
} from '@tabler/icons-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { Role } from '../types/role.types';

export interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onManagePages?: (role: Role) => void;
  onToggleActive?: (role: Role, nextActive: boolean) => void;
  isToggling?: boolean;
  canManage?: boolean;
}

export function RoleCard({
  role,
  onEdit,
  onDelete,
  onManagePages,
  onToggleActive,
  isToggling = false,
  canManage = true
}: RoleCardProps) {
  const router = useRouter();
  const [showDeactivateConfirm, setShowDeactivateConfirm] = React.useState(false);
  const directPermsCount = (role.permissions || []).length;
  const effectivePermsCount = (role.effectivePermissionCodes || []).length;
  const userCount = role.userCount ?? role.staffCount ?? 0;
  const isActive = role.isActive !== false;

  const handleToggleClick = (checked: boolean) => {
    if (!checked) {
      if (userCount > 0) {
        setShowDeactivateConfirm(true);
        return;
      }
      onToggleActive?.(role, false);
    } else {
      onToggleActive?.(role, true);
    }
  };

  const confirmDeactivate = () => {
    setShowDeactivateConfirm(false);
    onToggleActive?.(role, false);
  };

  return (
    <>
      <Card
        className={cn(
          'flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs',
          !isActive && 'opacity-85 border-dashed bg-muted/20'
        )}
      >
        <CardHeader className='pb-2 pt-4 px-4'>
          <div className='flex items-center justify-between gap-3'>
            <h3
              className='font-semibold text-base text-foreground leading-tight truncate'
              title={role.name}
            >
              {role.name}
            </h3>
            {!isActive ? (
              <Badge
                variant='outline'
                className='text-[10px] px-2 py-0.5 border-destructive/40 text-destructive bg-destructive/10 shrink-0 font-medium'
              >
                Nonaktif
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='text-[10px] px-2 py-0.5 border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 shrink-0 font-medium'
              >
                Aktif
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className='px-4 pb-3 space-y-3 flex-1'>
          <p className='text-xs text-muted-foreground line-clamp-2 min-h-[32px]'>
            {role.description || 'Tidak ada deskripsi peran.'}
          </p>

          {/* Activation Switch Control */}
          <div className='flex items-center justify-between text-xs pt-1.5 pb-1 border-t'>
            <span className='text-muted-foreground font-medium'>Status Aktivasi:</span>
            {canManage ? (
              <div className='flex items-center gap-2'>
                <span className='text-[11px] text-muted-foreground'>
                  {isToggling ? 'Memproses...' : isActive ? 'Aktif' : 'Nonaktif'}
                </span>
                <Switch
                  checked={isActive}
                  disabled={isToggling}
                  onCheckedChange={handleToggleClick}
                  aria-label={`Ubah status aktivasi peran ${role.name}`}
                />
              </div>
            ) : (
              <span className='font-medium text-foreground'>{isActive ? 'Aktif' : 'Nonaktif'}</span>
            )}
          </div>

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
            <span className='text-muted-foreground'>Jumlah Pengguna:</span>
            <div className='flex items-center gap-1.5'>
              <span className='font-medium text-foreground'>{userCount} pengguna</span>
              <Button
                variant='ghost'
                size='icon'
                className='size-5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm cursor-pointer'
                title={`Lihat ${userCount} pengguna peran ${role.name} di Data User`}
                onClick={() => router.push(`/admin/data-user?role=${role.id}`)}
              >
                <IconArrowUpRight className='size-3.5' />
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className='px-4 py-3 border-t bg-muted/10 flex items-center justify-between gap-2 flex-wrap'>
          <Button
            variant='outline'
            size='sm'
            disabled={!canManage}
            className='h-8 text-xs flex-1 min-w-[105px] gap-1.5'
            onClick={() => onEdit(role)}
            title={`Ubah informasi dan hak akses peran ${role.name}`}
          >
            <IconEdit className='size-3.5' />
            Ubah Peran
          </Button>

          {onManagePages && (
            <Button
              variant='outline'
              size='sm'
              disabled={!canManage}
              className='h-8 text-xs flex-1 min-w-[110px] gap-1.5'
              onClick={() => onManagePages(role)}
              title={`Atur akses halaman peran ${role.name}`}
            >
              <IconBrowser className='size-3.5' />
              Akses Halaman
            </Button>
          )}

          {role.code !== 'admin' && role.code !== 'super_admin' && canManage && (
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0'
              onClick={() => onDelete(role)}
              title={`Hapus peran ${role.name}`}
            >
              <IconTrash className='size-4' />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Confirmation Dialog Before Disabling Role With Active Users */}
      <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className='flex items-center gap-2 text-destructive'>
              <IconAlertTriangle className='size-5' />
              <AlertDialogTitle>Nonaktifkan Peran &quot;{role.name}&quot;?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className='space-y-2 pt-2'>
              <p>
                Peran ini saat ini terhubung dengan <strong>{userCount} pengguna</strong>.
              </p>
              <p>
                Menonaktifkan peran ini akan mencabut seluruh hak akses dan izin yang diberikan oleh
                peran ini bagi pengguna terkait secara langsung.
              </p>
              <p className='text-xs text-muted-foreground'>
                Catatan peran, matriks izin, dan relasi penugasan pengguna tetap aman tersimpan di
                database dan akan langsung aktif kembali saat peran diaktifkan ulang.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeactivate}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Ya, Nonaktifkan Peran
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
