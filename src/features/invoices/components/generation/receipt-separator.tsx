import { cn } from '@/lib/utils';

export function ReceiptSeparator({ className }: { className?: string }) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'my-4 border-t border-dashed border-slate-300 dark:border-slate-700',
        className
      )}
    />
  );
}
