'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { CategoryDialog } from './category-dialog';

export function CategoryAddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className='text-xs md:text-sm'>
        <Icons.add className='mr-2 h-4 w-4' /> Add New
      </Button>
      <CategoryDialog isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
