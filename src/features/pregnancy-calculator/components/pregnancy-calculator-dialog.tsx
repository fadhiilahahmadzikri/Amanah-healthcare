'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { PregnancyCalculatorForm } from './pregnancy-calculator-form';

export function PregnancyCalculatorDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => setIsOpen(true)}
        className='size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0'
        title='Kalkulator kehamilan'
        aria-label='Kalkulator kehamilan'
      >
        <Calculator className='size-4' />
      </Button>

      <ModalWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="max-w-[520px]"
        showCloseButton
        dismissible
      >
        <PregnancyCalculatorForm variant="compact" />
      </ModalWrapper>
    </>
  );
}
