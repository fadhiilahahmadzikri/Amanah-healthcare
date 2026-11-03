import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface InspectorHeaderProps {
  isPregnancy: boolean;
  isImmunization: boolean;
  isEditing: boolean;
  isReadOnly: boolean;
  isExporting: boolean;
  hideHeader?: boolean;
  onStartEdit: () => void;
  onOpenReader: () => void;
  onDownload: (format: 'docx' | 'pdf' | 'xlsx') => void;
  onClose?: () => void;
}

export function InspectorHeader({
  isPregnancy,
  isImmunization,
  isEditing,
  isReadOnly,
  isExporting,
  hideHeader = false,
  onStartEdit,
  onOpenReader,
  onDownload,
  onClose
}: InspectorHeaderProps) {
  const title = isPregnancy
    ? 'Formulir KIA & Kehamilan'
    : isImmunization
      ? 'Formulir Imunisasi Anak'
      : 'Formulir Pendaftaran Pasien';

  const subtitle = isPregnancy
    ? isEditing
      ? 'Perbarui data skrining klinis, kebiasaan, obstetri & riwayat KB pasien'
      : 'Data skrining klinis, kebiasaan, obstetri & riwayat KB'
    : isImmunization
      ? isEditing
        ? 'Perbarui identitas anak, orang tua, riwayat vaksin & catatan alergi'
        : 'Data riwayat vaksinasi dan tumbuh kembang anak'
      : isEditing
        ? 'Perbarui data pendaftaran & identitas pasien'
        : 'Data rekam medis & pendaftaran pasien';

  if (hideHeader) {
    return (
      <div className='flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-border/30 shrink-0'>
        <div className='flex items-center gap-2'>
          {isEditing ? (
            <span className='text-xs font-semibold text-primary'>Mode Edit Aktif</span>
          ) : !isReadOnly ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onStartEdit}
              className='h-7.5 text-xs font-semibold gap-1.5'
            >
              <Icons.edit className='size-3.5 text-primary' /> Edit Data
            </Button>
          ) : null}
        </div>

        <div className='flex items-center gap-1.5 ml-auto'>
          <Button
            type='button'
            variant='secondary'
            size='icon-sm'
            shape='rounded'
            onClick={onOpenReader}
            className='size-8 text-foreground/80 hover:text-foreground'
            title='Buka Formulir Ukuran Penuh'
            aria-label='Buka Formulir Ukuran Penuh'
          >
            <Icons.maximize className='size-4' />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type='button'
                variant='secondary'
                size='icon-sm'
                shape='rounded'
                disabled={isExporting}
                isLoading={isExporting}
                className='size-8 text-foreground/80 hover:text-foreground'
                title='Unduh Formulir (Multi-Format)'
                aria-label='Unduh Formulir Multi-Format'
              >
                <Icons.download className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48 text-xs font-medium'>
              <DropdownMenuItem onClick={() => onDownload('docx')} className='gap-2 cursor-pointer'>
                <Icons.fileTypeDoc className='size-3.5 text-blue-600 dark:text-blue-400' />
                <span>Dokumen Word (.docx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload('pdf')} className='gap-2 cursor-pointer'>
                <Icons.fileTypePdf className='size-3.5 text-rose-600 dark:text-rose-400' />
                <span>Dokumen PDF (.pdf)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload('xlsx')} className='gap-2 cursor-pointer'>
                <Icons.fileTypeXls className='size-3.5 text-emerald-600 dark:text-emerald-400' />
                <span>Spreadsheet Excel (.xlsx)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between gap-4 pb-3 border-b border-border/40 shrink-0 min-h-[77px]'>
      <div className='flex flex-col items-start min-w-0 flex-1 space-y-0.5 justify-center'>
        <div className='flex items-center gap-2'>
          <h3 className='text-base sm:text-lg font-bold text-foreground truncate tracking-tight'>
            {title}
          </h3>
        </div>
        <p className='text-sm font-medium text-muted-foreground truncate w-full'>{subtitle}</p>
      </div>

      <div className='flex items-center gap-1.5 shrink-0'>
        {!isEditing && !isReadOnly && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onStartEdit}
            className='h-8 text-xs font-semibold gap-1.5 text-foreground hover:bg-muted'
            title='Edit Data Intake Medis'
          >
            <Icons.edit className='size-3.5 text-primary' />
            <span className='hidden sm:inline'>Edit Intake</span>
          </Button>
        )}

        <Button
          type='button'
          variant='secondary'
          size='icon-sm'
          shape='rounded'
          onClick={onOpenReader}
          className='size-8 text-foreground/80 hover:text-foreground'
          title='Buka Formulir Ukuran Penuh (Web Viewer)'
          aria-label='Buka Formulir Ukuran Penuh'
        >
          <Icons.maximize className='size-4' />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='secondary'
              size='icon-sm'
              shape='rounded'
              disabled={isExporting}
              isLoading={isExporting}
              className='size-8 text-foreground/80 hover:text-foreground'
              title='Unduh Formulir (Multi-Format)'
              aria-label='Unduh Formulir Multi-Format'
            >
              <Icons.download className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48 text-xs font-medium'>
            <DropdownMenuItem onClick={() => onDownload('docx')} className='gap-2 cursor-pointer'>
              <Icons.fileTypeDoc className='size-3.5 text-blue-600 dark:text-blue-400' />
              <span>Dokumen Word (.docx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload('pdf')} className='gap-2 cursor-pointer'>
              <Icons.fileTypePdf className='size-3.5 text-rose-600 dark:text-rose-400' />
              <span>Dokumen PDF (.pdf)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload('xlsx')} className='gap-2 cursor-pointer'>
              <Icons.fileTypeXls className='size-3.5 text-emerald-600 dark:text-emerald-400' />
              <span>Spreadsheet Excel (.xlsx)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onClose && (
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            shape='pill'
            onClick={onClose}
            aria-label='Tutup formulir'
            className='text-muted-foreground hover:text-foreground hover:bg-muted/70 size-8'
          >
            <Icons.chevronRight className='size-5' />
          </Button>
        )}
      </div>
    </div>
  );
}
