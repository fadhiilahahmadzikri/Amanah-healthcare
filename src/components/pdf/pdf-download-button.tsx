'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, DocumentProps } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { VariantProps } from 'class-variance-authority';

interface PDFDownloadButtonProps extends VariantProps<typeof buttonVariants> {
  document: React.ReactElement<DocumentProps>;
  fileName: string;
  buttonText?: string;
  className?: string;
  iconOnly?: boolean;
}

export default function PDFDownloadButton({
  document,
  fileName,
  buttonText = 'Download PDF',
  variant = 'default',
  size = 'default',
  className,
  iconOnly = false
}: PDFDownloadButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button className={cn(buttonVariants({ variant, size }), className)} disabled>
        <Icons.spinner className={cn('animate-spin', iconOnly ? '' : 'mr-2 h-4 w-4')} />
        {!iconOnly && 'Loading...'}
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={document}
      fileName={fileName}
      className={cn(buttonVariants({ variant, size }), className, 'no-underline')}
      onClick={() => {
        toast.success(`Downloaded ${fileName}`);
      }}
    >
      {({ loading }) => (
        <>
          {loading ? (
            <>
              <Icons.spinner className={cn('animate-spin', iconOnly ? '' : 'mr-2 h-4 w-4')} />
              {!iconOnly && 'Generating...'}
            </>
          ) : (
            <>
              <Icons.fileTypePdf className={cn(iconOnly ? '' : 'mr-2 h-4 w-4')} />
              {!iconOnly && buttonText}
            </>
          )}
        </>
      )}
    </PDFDownloadLink>
  );
}
