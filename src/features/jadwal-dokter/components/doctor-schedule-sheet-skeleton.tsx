'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Atom: ShimmerSkeleton
 * Enhances the base shadcn Skeleton with an elegant CSS shimmering beam effect.
 */
export function ShimmerSkeleton({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return (
    <Skeleton
      className={cn(
        'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/15 dark:before:via-white/5 before:to-transparent',
        className
      )}
      {...props}
    />
  );
}

/**
 * Molecule: DoctorProfileHeaderSkeleton
 * Displays the cover banner, profile avatar, verified badge, doctor name, and status pills.
 */
export function DoctorProfileHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full shrink-0 border-b border-border/40 bg-card select-none',
        className
      )}
    >
      {/* Cover Banner Skeleton */}
      <div className='relative w-full h-24 sm:h-28 bg-muted/40 overflow-hidden'>
        <ShimmerSkeleton className='w-full h-full rounded-none' />
        <div className='absolute top-3 left-4'>
          <ShimmerSkeleton className='h-7 w-20 rounded-full' />
        </div>
      </div>

      {/* Profile Identity Skeleton Overlapping Banner */}
      <div className='px-6 pb-3.5 pt-0'>
        <div className='flex items-end gap-3.5 sm:gap-4 -mt-10 sm:-mt-11'>
          {/* Avatar Circle */}
          <div className='relative shrink-0 size-20 sm:size-22'>
            <ShimmerSkeleton className='size-20 sm:size-22 rounded-full ring-4 ring-card' />
          </div>

          {/* Name & Badges */}
          <div className='flex-1 min-w-0 pb-1 space-y-2'>
            <div className='flex items-center gap-2'>
              <ShimmerSkeleton className='h-6 w-44 sm:w-56 rounded-md' />
              <ShimmerSkeleton className='size-5 rounded-full shrink-0' />
            </div>

            <div className='flex items-center gap-2'>
              <ShimmerSkeleton className='h-5 w-28 rounded-full' />
              <ShimmerSkeleton className='h-5 w-20 rounded-full' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Molecule: DoctorTabsListSkeleton
 * Renders the 3-tab navigation bar skeleton.
 */
export function DoctorTabsListSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'px-6 pt-3 pb-2 border-b border-border/40 shrink-0 bg-muted/20 select-none',
        className
      )}
    >
      <div className='grid w-full grid-cols-2 h-9 p-1 bg-muted/40 rounded-lg gap-1'>
        <ShimmerSkeleton className='h-full rounded-md' />
        <ShimmerSkeleton className='h-full rounded-md' />
      </div>
    </div>
  );
}

/**
 * Molecule: DoctorCalendarGridSkeleton
 * Renders the calendar month view skeleton with week headers and 35 date cells.
 */
export function DoctorCalendarGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 select-none', className)}>
      {/* Month Navigation & Controls Skeleton */}
      <div className='flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-muted/20'>
        <div className='space-y-1'>
          <ShimmerSkeleton className='h-4 w-32 rounded-md' />
          <ShimmerSkeleton className='h-3 w-24 rounded-md' />
        </div>
        <div className='flex items-center gap-1.5'>
          <ShimmerSkeleton className='size-8 rounded-full' />
          <ShimmerSkeleton className='size-8 rounded-full' />
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className='grid grid-cols-7 gap-1 text-center'>
        {Array.from({ length: 7 }).map((_, i) => (
          <ShimmerSkeleton key={i} className='h-5 w-full rounded-sm' />
        ))}
      </div>

      {/* 35 Calendar Day Cells */}
      <div className='grid grid-cols-7 gap-1.5'>
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className='h-16 sm:h-20 p-1.5 rounded-xl border border-border/40 bg-muted/15 flex flex-col justify-between'
          >
            <div className='flex items-center justify-between'>
              <ShimmerSkeleton className='size-4 rounded-full' />
              <ShimmerSkeleton className='size-2 rounded-full' />
            </div>
            <ShimmerSkeleton className='h-3 w-10/12 rounded-sm' />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Molecule: DoctorDailyGridSkeleton
 * Renders the 24-hour daily grid skeleton with 4 shift cards and time slots.
 */
export function DoctorDailyGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3.5 select-none', className)}>
      {/* Day Selector Header Skeleton */}
      <div className='flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20'>
        <div className='space-y-1'>
          <ShimmerSkeleton className='h-4 w-36 rounded-md' />
          <ShimmerSkeleton className='h-3 w-20 rounded-md' />
        </div>
        <div className='flex items-center gap-1.5'>
          <ShimmerSkeleton className='h-7 w-24 rounded-full' />
          <ShimmerSkeleton className='size-7 rounded-full' />
        </div>
      </div>

      {/* 4 Shift Cards Skeleton */}
      {['Dini Hari', 'Pagi', 'Siang', 'Malam'].map((shiftName, idx) => (
        <div
          key={shiftName}
          className='p-4 rounded-2xl border border-border/50 bg-card space-y-3 shadow-2xs'
        >
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <ShimmerSkeleton className='h-4 w-24 rounded-md' />
                <ShimmerSkeleton className='h-4 w-16 rounded-full' />
              </div>
              <ShimmerSkeleton className='h-3 w-32 rounded-md' />
            </div>
            <ShimmerSkeleton className='h-6 w-11 rounded-full' />
          </div>

          {/* Expanded slot previews for first 2 shifts */}
          {idx < 2 && (
            <div className='pt-2 border-t border-border/30 grid grid-cols-2 sm:grid-cols-4 gap-2'>
              {Array.from({ length: 4 }).map((_, slotIdx) => (
                <ShimmerSkeleton key={slotIdx} className='h-8 rounded-lg' />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Molecule: DoctorInfoSkeleton
 * Renders the 6-field doctor information grid skeleton.
 */
export function DoctorInfoSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 select-none', className)}>
      <ShimmerSkeleton className='h-3.5 w-48 rounded-md mb-2' />
      <div className='grid grid-cols-2 gap-y-4 gap-x-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='border-b border-border/40 pb-2 space-y-1.5'>
            <ShimmerSkeleton className='h-3 w-20 rounded-sm' />
            <ShimmerSkeleton className='h-4 w-36 rounded-md' />
          </div>
        ))}
      </div>
    </div>
  );
}

export interface DoctorScheduleSheetContentSkeletonProps {
  activeTab?: 'kalender' | 'sesi';
  className?: string;
}

/**
 * Organism: DoctorScheduleSheetContentSkeleton
 * Plug-and-play body skeleton that adapts to the active tab or defaults to calendar.
 */
export function DoctorScheduleSheetContentSkeleton({
  activeTab = 'kalender',
  className
}: DoctorScheduleSheetContentSkeletonProps) {
  return (
    <div className={cn('flex-1 flex flex-col min-h-0 gap-0 select-none', className)}>
      <DoctorTabsListSkeleton />
      <div className='flex-1 overflow-y-auto p-6 space-y-4'>
        {activeTab === 'kalender' && <DoctorCalendarGridSkeleton />}
        {activeTab === 'sesi' && <DoctorDailyGridSkeleton />}
      </div>
    </div>
  );
}

export interface DoctorScheduleSheetSkeletonProps {
  activeTab?: 'kalender' | 'sesi';
  className?: string;
}

/**
 * Component / Composite: DoctorScheduleSheetSkeleton
 * Complete schedule sheet skeleton with header and adaptive body content.
 */
export function DoctorScheduleSheetSkeleton({
  activeTab = 'kalender',
  className
}: DoctorScheduleSheetSkeletonProps) {
  return (
    <div className={cn('flex flex-col h-full w-full', className)}>
      <DoctorProfileHeaderSkeleton />
      <DoctorScheduleSheetContentSkeleton activeTab={activeTab} />
    </div>
  );
}
