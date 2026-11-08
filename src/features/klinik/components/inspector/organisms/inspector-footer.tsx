import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

interface InspectorFooterProps {
  isSaving: boolean;
  isSaveDisabled?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function InspectorFooter({
  isSaving,
  isSaveDisabled = false,
  onCancel,
  onSave
}: InspectorFooterProps) {
  return (
    <div className='flex items-center justify-between pt-3 mt-1 border-t border-border/40 shrink-0 bg-background'>
      <div className='flex items-center gap-2'>
        <span className='text-xs text-muted-foreground'>
          Perubahan belum disimpan ke server
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onCancel}
          disabled={isSaving}
          className='h-8 text-xs font-medium'
        >
          Batal
        </Button>

        <Button
          type='button'
          variant='default'
          size='sm'
          onClick={onSave}
          isLoading={isSaving}
          disabled={isSaving || isSaveDisabled}
          className='h-8 text-xs font-semibold gap-1.5'
        >
          <Icons.check className='size-3.5' /> Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
