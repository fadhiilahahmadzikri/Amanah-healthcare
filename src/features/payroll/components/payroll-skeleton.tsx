'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function PayrollSkeleton() {
  return (
    <div className='flex h-full min-h-0 flex-1 flex-col gap-3.5 select-none animate-pulse'>
      {/* 1. Desktop Toolbox Bar Skeleton */}
      <div className='hidden md:flex items-center justify-between gap-3 shrink-0'>
        <div className='flex items-center gap-2 flex-1'>
          <Skeleton className='h-9 w-60 rounded-xl' />
          <Skeleton className='h-9 w-36 rounded-xl border-dashed' />
          <Skeleton className='h-9 w-32 rounded-xl border-dashed' />
          <Skeleton className='h-9 w-28 rounded-xl border-dashed' />
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <Skeleton className='h-9 w-32 rounded-md' />
          <Skeleton className='h-8 w-28 rounded-md' />
          <Skeleton className='size-8 rounded-md' />
        </div>
      </div>

      {/* 2. Mobile Filter Toolbar Skeleton */}
      <div className='flex md:hidden items-center justify-between gap-1.5 shrink-0'>
        <Skeleton className='h-8.5 flex-1 rounded-xl' />
        <div className='flex items-center gap-1.5 shrink-0'>
          <Skeleton className='size-8.5 rounded-xl' />
          <Skeleton className='size-8.5 rounded-xl' />
          <Skeleton className='size-8.5 rounded-xl' />
        </div>
      </div>

      {/* 3. Main Split Content Area */}
      <div className='flex flex-1 min-h-0 gap-4 overflow-hidden'>
        {/* Left: Table Skeleton (Desktop) / Cards (Mobile) */}
        <div className='flex flex-1 min-h-0 flex-col overflow-hidden'>
          {/* Desktop Table Header & Rows */}
          <div className='hidden md:flex flex-col flex-1 border border-border/60 rounded-xl overflow-hidden'>
            <div className='border-b border-border/60 px-4 py-3 flex items-center justify-between gap-4 bg-muted/20'>
              <Skeleton className='size-4 rounded-xs' />
              <Skeleton className='h-4 w-32 rounded-md' />
              <Skeleton className='h-4 w-20 rounded-md' />
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-4 w-28 rounded-md' />
              <Skeleton className='h-4 w-16 rounded-md' />
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-4 w-12 rounded-md' />
            </div>
            <div className='divide-y divide-border/40 flex-1 overflow-hidden p-1'>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='px-4 py-3 flex items-center justify-between gap-4'>
                  <Skeleton className='size-4 rounded-xs' />
                  <div className='flex items-center gap-2.5'>
                    <Skeleton className='size-8 rounded-lg' />
                    <Skeleton className='h-4 w-28 rounded-md' />
                  </div>
                  <Skeleton className='h-4 w-16 rounded-md' />
                  <Skeleton className='h-5 w-20 rounded-full' />
                  <Skeleton className='h-4 w-24 rounded-md' />
                  <Skeleton className='h-4 w-14 rounded-md' />
                  <Skeleton className='h-4 w-20 rounded-md' />
                  <Skeleton className='h-4 w-16 rounded-md' />
                  <Skeleton className='h-4 w-16 rounded-md' />
                  <Skeleton className='h-4 w-20 rounded-md' />
                  <Skeleton className='h-6 w-14 rounded-md' />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards Skeleton */}
          <div className='flex md:hidden flex-col gap-2 flex-1 overflow-y-auto'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='p-3 border border-border/60 rounded-xl flex items-center justify-between gap-3'
              >
                <div className='flex items-center gap-2.5'>
                  <Skeleton className='size-8 rounded-lg' />
                  <div className='space-y-1.5'>
                    <Skeleton className='h-3.5 w-28 rounded-md' />
                    <Skeleton className='h-3 w-20 rounded-md' />
                  </div>
                </div>
                <Skeleton className='h-3.5 w-20 rounded-md' />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Vertical KPI Column Skeleton (Hidden on Mobile) */}
        <div className='hidden lg:flex w-72 xl:w-80 flex-col gap-3.5 shrink-0'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='p-4 border border-border/60 rounded-2xl bg-card flex flex-col justify-between h-32'
            >
              <div className='flex items-center justify-between'>
                <Skeleton className='h-3.5 w-28 rounded-md' />
                <Skeleton className='size-8 rounded-lg' />
              </div>
              <Skeleton className='h-6 w-36 rounded-md' />
              <Skeleton className='h-3 w-24 rounded-md' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
