'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function GreetingDialog() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='bg-white dark:bg-zinc-900'>
        <DialogHeader>
          <DialogTitle>👋 Halo Anas!</DialogTitle>
          <DialogDescription>
            Ini Zikri. Kalau kamu melihat pesan ini, berarti fitur kolaborasi kita sudah berhasil!
            Selamat datang di project Amanah Healthcare.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Oke, Siap! 🚀</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
