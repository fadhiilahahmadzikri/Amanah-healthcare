'use client';

import Image from 'next/image';
import { useRef, type ChangeEvent, type KeyboardEvent } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ImageUploadFieldProps = {
  value?: string;
  onChange: (value?: string) => void;
  alt?: string;
  className?: string;
};

export function ImageUploadField({
  value,
  onChange,
  alt = 'Image preview',
  className
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        onChange(typeof reader.result === 'string' ? reader.result : undefined);
      },
      { once: true }
    );
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    openFilePicker();
  };

  const handleRemove = () => {
    onChange(undefined);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      role='button'
      tabIndex={0}
      className={cn(
        'border-border bg-muted/20 hover:bg-muted/40 relative flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed transition-colors',
        className
      )}
      onClick={openFilePicker}
      onKeyDown={handleKeyDown}
    >
      {value ? (
        <>
          <Image
            src={value}
            alt={alt}
            fill
            sizes='(min-width: 768px) 672px, 100vw'
            unoptimized
            className='object-contain'
          />
          <Button
            type='button'
            variant='destructive'
            size='icon'
            className='absolute top-3 right-3'
            onClick={(event) => {
              event.stopPropagation();
              handleRemove();
            }}
            aria-label='Remove image'
          >
            <Icons.trash />
          </Button>
        </>
      ) : (
        <div className='flex flex-col items-center gap-2 text-center'>
          <Icons.upload className='text-muted-foreground size-8' />
          <div className='text-sm font-medium'>Click to upload image</div>
          <div className='text-muted-foreground text-xs'>SVG, PNG, JPG or GIF</div>
        </div>
      )}
      <input
        ref={inputRef}
        aria-label='Upload image'
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />
    </div>
  );
}
