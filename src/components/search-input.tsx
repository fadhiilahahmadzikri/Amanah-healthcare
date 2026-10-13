'use client';
import { useKBar } from 'kbar';
import { Icons } from '@/components/icons';
import { Button } from './ui/button';

export default function SearchInput() {
  const { query } = useKBar();
  return (
    <div className='flex items-center'>
      {/* Mobile View: Minimalist Icon-based Button */}
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={query.toggle}
        aria-label='Pencarian global'
        className='size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors md:hidden cursor-pointer'
      >
        <Icons.search className='size-4' />
      </Button>

      {/* Desktop View: Full Pill Input with ⌘K Shortcut */}
      <Button
        type='button'
        variant='outline'
        className='bg-background text-muted-foreground relative hidden h-9 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none sm:pr-12 md:flex md:w-40 lg:w-64 cursor-pointer'
        onClick={query.toggle}
      >
        <Icons.search className='mr-2 h-4 w-4' />
        Search...
        <kbd className='bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-6 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
    </div>
  );
}
