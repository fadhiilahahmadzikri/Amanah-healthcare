'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import {
  PROFILE_TYPE_OPTIONS,
  BLOOD_TYPE_OPTIONS,
} from './patient-tables/columns-helpers';

export const GENDER_OPTIONS = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' },
];

export const STATUS_OPTIONS = [
  { label: 'Aktif', value: 'active' },
  { label: 'Non-Aktif', value: 'inactive' },
];

export type DrawerFilterType = 'profile' | 'gender' | 'status' | 'blood' | null;

export interface PatientMobileFilterDrawersProps {
  openDrawer: DrawerFilterType;
  onClose: () => void;
  profileValue: string[];
  genderValue: string;
  statusValue: string[];
  bloodValue: string;
  onToggleProfile: (val: string) => void;
  onSelectGender: (val?: string) => void;
  onToggleStatus: (val: string) => void;
  onSelectBlood: (val?: string) => void;
}

export function PatientMobileFilterDrawers({
  openDrawer,
  onClose,
  profileValue,
  genderValue,
  statusValue,
  bloodValue,
  onToggleProfile,
  onSelectGender,
  onToggleStatus,
  onSelectBlood,
}: PatientMobileFilterDrawersProps) {
  return (
    <>
      {/* Drawer 1: Profile Type Filter */}
      <Drawer open={openDrawer === 'profile'} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Status Profil Pasien</DrawerTitle>
            <DrawerDescription>Pilih kategori akun utama atau afiliasi</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1'>
            {PROFILE_TYPE_OPTIONS.map((opt) => {
              const isSelected = profileValue.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => onToggleProfile(opt.value)}
                  className={cn(
                    'px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Icons.check className='size-3 stroke-[2.5]' />}
                </button>
              );
            })}
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='primary'
              size='card-action'
              shape='pill'
              onClick={onClose}
              className='w-full font-semibold text-xs cursor-pointer'
            >
              Selesai
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 2: Gender Filter */}
      <Drawer open={openDrawer === 'gender'} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Pilih Jenis Kelamin</DrawerTitle>
            <DrawerDescription>Tampilkan pasien berdasarkan jenis kelamin</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-col gap-1.5 p-4 pt-1'>
            <button
              type='button'
              onClick={() => {
                onSelectGender(undefined);
                onClose();
              }}
              className={cn(
                'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center justify-between cursor-pointer select-none',
                !genderValue
                  ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                  : 'bg-card border-border/40 hover:bg-muted/50 text-foreground'
              )}
            >
              <span>Semua Jenis Kelamin</span>
              {!genderValue && <Icons.check className='size-4 text-primary' />}
            </button>
            {GENDER_OPTIONS.map((g) => {
              const isSelected = genderValue === g.value;
              return (
                <button
                  key={g.value}
                  type='button'
                  onClick={() => {
                    onSelectGender(g.value);
                    onClose();
                  }}
                  className={cn(
                    'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center justify-between cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary/10 text-primary border-primary/40 font-semibold'
                      : 'bg-card border-border/40 hover:bg-muted/50 text-foreground'
                  )}
                >
                  <span>{g.label}</span>
                  {isSelected && <Icons.check className='size-4 text-primary' />}
                </button>
              );
            })}
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={onClose}
              className='w-full font-semibold text-xs cursor-pointer'
            >
              Tutup
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 3: Status Filter */}
      <Drawer open={openDrawer === 'status'} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Filter Status Akun Pasien</DrawerTitle>
            <DrawerDescription>Pilih satu atau beberapa status akun</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-wrap gap-2 p-4 pt-1'>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = statusValue.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => onToggleStatus(opt.value)}
                  className={cn(
                    'px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none flex items-center gap-1.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-foreground border-border/60 hover:bg-muted'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Icons.check className='size-3 stroke-[2.5]' />}
                </button>
              );
            })}
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='primary'
              size='card-action'
              shape='pill'
              onClick={onClose}
              className='w-full font-semibold text-xs cursor-pointer'
            >
              Selesai
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer 4: Blood Type Filter */}
      <Drawer open={openDrawer === 'blood'} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DrawerContent className='max-h-[85vh]'>
          <DrawerHeader className='text-left pb-2'>
            <DrawerTitle>Pilih Golongan Darah</DrawerTitle>
            <DrawerDescription>Tampilkan pasien berdasarkan golongan darah</DrawerDescription>
          </DrawerHeader>
          <div className='grid grid-cols-2 gap-2 p-4 pt-1'>
            {BLOOD_TYPE_OPTIONS.map((b) => {
              const isSelected = bloodValue === b.value;
              return (
                <button
                  key={b.value}
                  type='button'
                  onClick={() => {
                    onSelectBlood(isSelected ? undefined : b.value);
                    onClose();
                  }}
                  className={cn(
                    'px-4 py-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-between cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border/40 hover:bg-muted/50 text-foreground'
                  )}
                >
                  <span>Golongan {b.label}</span>
                  {isSelected && <Icons.check className='size-4' />}
                </button>
              );
            })}
          </div>
          <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
            <Button
              type='button'
              variant='outline'
              size='card-action'
              shape='pill'
              onClick={onClose}
              className='w-full font-semibold text-xs cursor-pointer'
            >
              Tutup
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
