'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { PixelTexture } from '@/features/klinik/components/pixel-texture';
import { cn } from '@/lib/utils';
import type { UserItem } from '../api/types';
import { useUpdateUserStatusMutation } from '../api/mutations';

export interface UserMobileCardsProps {
  users: UserItem[];
  hasFilters: boolean;
  onReset?: () => void;
  onRowClick: (user: UserItem) => void;
  onViewDetail: (user: UserItem) => void;
  onEdit: (user: UserItem) => void;
  onPurge: (user: UserItem) => void;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  isLoading?: boolean;
}

function MobileStatusSwitch({ user }: { user: UserItem }) {
  const mutation = useUpdateUserStatusMutation();
  const isActive = user.status === 'active';

  const handleToggle = (checked: boolean) => {
    mutation.mutate({
      id: user.id,
      status: checked ? 'active' : 'inactive'
    });
  };

  return (
    <div className='flex items-center gap-1.5'>
      <Switch
        checked={isActive}
        disabled={mutation.isPending}
        onCheckedChange={handleToggle}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Ubah status ${user.name}`}
      />
      <span className='text-[11px] font-semibold'>
        {isActive ? (
          <span className='text-emerald-600 dark:text-emerald-400'>Aktif</span>
        ) : (
          <span className='text-muted-foreground'>Nonaktif</span>
        )}
      </span>
    </div>
  );
}

export function UserMobileCards({
  users,
  hasFilters,
  onReset,
  onRowClick,
  onViewDetail,
  onEdit,
  onPurge,
  sentinelRef,
  isFetchingNextPage = false,
  hasNextPage = false,
  isLoading = false
}: UserMobileCardsProps) {
  const updateStatusMutation = useUpdateUserStatusMutation();

  if (isLoading) {
    return <UserCardsSkeleton />;
  }

  if (users.length === 0) {
    return (
      <div className='flex flex-1 min-h-[300px] flex-col items-center justify-center p-4'>
        {hasFilters ? (
          <div className='flex flex-col items-center gap-3 w-full max-w-xs text-center'>
            <EmptyState
              icon={Icons.search}
              title='Tidak ada pengguna cocok'
              description='Tidak ditemukan akun pengguna dengan kata kunci pencarian atau filter yang dipilih.'
            />
            {onReset && (
              <Button
                type='button'
                variant='outline'
                shape='pill'
                size='sm'
                onClick={onReset}
                className='font-semibold text-xs cursor-pointer'
              >
                Reset Semua Filter
              </Button>
            )}
          </div>
        ) : (
          <EmptyState
            icon={Icons.users}
            title='Belum ada akun pengguna'
            description='Daftar identitas akun pengguna sistem akan muncul di sini setelah didaftarkan.'
          />
        )}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3.5 pb-28 pt-1 select-none font-sans'>
      {users.map((user) => {
        const initials = user.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        const formattedDate = user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          : '-';

        const roles = user.roles || [];
        const isExternal = user.primaryAudience === 'external';

        return (
          <div
            key={user.id}
            role='button'
            tabIndex={0}
            onClick={() => onRowClick(user)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick(user);
              }
            }}
            className='group relative w-full bg-gradient-to-t from-primary/[0.03] via-card to-card text-card-foreground border border-border/80 rounded-[20px] p-4 flex flex-col justify-between gap-3 select-none transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/50 hover:shadow-xs overflow-hidden'
          >
            {/* Tactile Texture Background matching Appointment and Facility Cards */}
            <div className='absolute bottom-0 left-0 right-0 h-[145px] pointer-events-none z-0 overflow-hidden'>
              <PixelTexture
                colorMode='theme'
                maskVariant='curved-convex'
                invertMask={true}
                opacity={0.24}
                density='medium'
                pixelSize={4.5}
                gap={1.5}
                height='100%'
              />
            </div>

            {/* 1. Header: Avatar + Nama + Email + Status Switch */}
            <div className='relative z-1 flex items-start justify-between gap-2.5 min-w-0'>
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                <Avatar className='size-11 rounded-full overflow-hidden shrink-0 ring-1 ring-border/50 bg-muted aspect-square shadow-2xs'>
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback className='text-xs font-bold bg-primary/10 text-primary'>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className='min-w-0 flex-1 space-y-0.5'>
                  <h3
                    className='text-sm sm:text-[15px] font-bold tracking-tight text-foreground truncate'
                    title={user.name}
                  >
                    {user.name}
                  </h3>
                  <p
                    className='text-xs text-muted-foreground font-mono truncate max-w-[200px]'
                    title={user.email}
                  >
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Status Switch di Kanan Atas */}
              <div className='shrink-0 self-start pt-0.5'>
                <MobileStatusSwitch user={user} />
              </div>
            </div>

            {/* 2. Metadata Slot: Audience Badge + Roles + Phone */}
            <div className='relative z-1 flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground'>
              <div className='flex items-center gap-1.5 flex-wrap min-w-0'>
                {/* Audience Badge */}
                <Badge
                  variant='outline'
                  className={cn(
                    'text-[10px] px-2 py-0 font-medium shrink-0',
                    isExternal
                      ? 'border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300'
                      : 'text-muted-foreground'
                  )}
                >
                  {isExternal ? 'Eksternal' : 'Internal'}
                </Badge>

                {/* Role Badges */}
                {roles.length === 0 ? (
                  <span className='text-[10px] text-muted-foreground italic'>Tanpa Peran</span>
                ) : (
                  roles.slice(0, 2).map((r) => (
                    <Badge
                      key={r.id}
                      variant='outline'
                      className='text-[10px] px-1.5 py-0 font-medium shrink-0'
                    >
                      {r.name}
                    </Badge>
                  ))
                )}
                {roles.length > 2 && (
                  <span className='text-[10px] font-semibold text-primary/80'>
                    +{roles.length - 2}
                  </span>
                )}
              </div>

              {/* No. Telepon */}
              {user.phone && (
                <div className='flex items-center gap-1 shrink-0 font-mono text-[11px] text-foreground/80 pl-2'>
                  <Icons.phone className='size-3 text-muted-foreground/70' />
                  <span className='truncate max-w-[110px]'>{user.phone}</span>
                </div>
              )}
            </div>

            {/* 3. Footer: Tanggal Terdaftar + Dropdown Aksi + Detail Pill */}
            <div className='relative z-1 w-full flex items-center justify-between gap-3 pt-2.5 border-t border-border/40 min-w-0'>
              <div className='flex items-center gap-1.5 min-w-0 text-[11px] text-muted-foreground'>
                <Icons.calendar className='size-3.5 text-primary/70 shrink-0' />
                <span className='font-mono truncate'>{formattedDate}</span>
              </div>

              <div className='flex items-center gap-1.5 shrink-0'>
                {/* Menu Aksi Elipsis */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label={`Aksi untuk pengguna ${user.name}`}
                      className='size-8 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer shrink-0'
                    >
                      <Icons.ellipsis className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(user);
                      }}
                      className='gap-2 cursor-pointer'
                    >
                      <Icons.info className='size-4 text-primary' />
                      <span>Detail Akun</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(user);
                      }}
                      className='gap-2 cursor-pointer'
                    >
                      <Icons.edit className='size-4 text-primary' />
                      <span>Edit Akun</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextStatus = user.status === 'active' ? 'inactive' : 'active';
                        updateStatusMutation.mutate({ id: user.id, status: nextStatus });
                      }}
                      disabled={updateStatusMutation.isPending}
                      className='gap-2 cursor-pointer'
                    >
                      {user.status === 'active' ? (
                        <>
                          <Icons.close className='size-4 text-amber-600' />
                          <span>Nonaktifkan Akun</span>
                        </>
                      ) : (
                        <>
                          <Icons.check className='size-4 text-emerald-600' />
                          <span>Aktifkan Akun</span>
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onPurge(user);
                      }}
                      className='gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer'
                    >
                      <Icons.trash className='size-4' />
                      <span>Hapus Permanen</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Tombol Detail Pill Berstandar Janji Temu */}
                <Button
                  type='button'
                  variant='default'
                  shape='pill'
                  size='card-action'
                  withTrailingCircleIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail(user);
                  }}
                  className='font-bold shadow-2xs cursor-pointer'
                >
                  Detail
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Sentinel Infinite Scroll */}
      {sentinelRef && (
        <div
          ref={sentinelRef}
          className='py-3 flex flex-col items-center justify-center text-xs text-muted-foreground'
        >
          {isFetchingNextPage && (
            <div className='flex items-center gap-2 text-primary font-medium'>
              <Icons.spinner className='size-4 animate-spin' />
              <span>Memuat pengguna berikutnya...</span>
            </div>
          )}
          {!hasNextPage && users.length > 0 && (
            <span className='text-muted-foreground/60 text-[11px]'>
              Semua pengguna telah dimuat
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function UserCardsSkeleton() {
  return (
    <div className='flex flex-col gap-3.5 pb-12 pt-1 font-sans'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className='w-full rounded-[20px] border border-border/60 bg-card p-4 space-y-3 shadow-2xs'
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-3 flex-1'>
              <Skeleton className='size-11 rounded-full shrink-0' />
              <div className='space-y-1.5 flex-1'>
                <Skeleton className='h-4 w-36 rounded-md' />
                <Skeleton className='h-3 w-28 rounded-md' />
              </div>
            </div>
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
          <Skeleton className='h-9 w-full rounded-xl' />
          <div className='flex items-center justify-between pt-2.5 border-t border-border/40'>
            <Skeleton className='h-3.5 w-24 rounded-md' />
            <div className='flex items-center gap-1.5'>
              <Skeleton className='size-8 rounded-md' />
              <Skeleton className='h-8 w-20 rounded-full' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
