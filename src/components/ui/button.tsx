import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Icons } from '@/components/icons';

import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-medium select-none transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        primary: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 border border-border/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground text-foreground/80',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm',
        sm: 'h-8 px-3 py-1.5 text-xs',
        md: 'h-[38px] px-4 py-2 text-xs sm:text-[13px]',
        lg: 'h-10 px-6 py-2.5 text-sm sm:text-base',
        compact: 'h-[32px] px-[11px] py-[6px] text-[12.5px]',
        icon: 'size-9 justify-center'
      },
      shape: {
        rounded: 'rounded-xl',
        pill: 'rounded-full',
        compact: 'rounded-[5.4px]',
        default: 'rounded-md',
        square: 'rounded-none'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  withTrailingCircleIcon?: boolean;
  trailingIcon?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  shape = 'default',
  asChild = false,
  isLoading,
  withTrailingCircleIcon = false,
  trailingIcon,
  leadingIcon,
  icon,
  iconRight,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const actualLeadingIcon = leadingIcon || icon;
  const actualTrailingIcon = trailingIcon || iconRight;

  const circleColors: Record<string, string> = {
    default: 'bg-primary-foreground text-primary',
    primary: 'bg-primary-foreground text-primary',
    secondary: 'bg-secondary-foreground text-secondary',
    ghost: 'bg-primary text-primary-foreground',
    outline: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive-foreground text-destructive',
    link: 'bg-primary text-white'
  };

  const currentVariantKey = variant || 'default';
  const circleColorClass = circleColors[currentVariantKey] || 'bg-primary-foreground text-primary';

  if (asChild) {
    return (
      <Slot
        data-slot='button'
        className={cn(buttonVariants({ variant, size, shape, className }), fullWidth && 'w-full')}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  if (withTrailingCircleIcon || actualLeadingIcon || actualTrailingIcon) {
    const isPill = shape === 'pill';
    const paddingWithCircle = withTrailingCircleIcon
      ? isPill
        ? size === 'lg'
          ? 'pl-5 pr-[3px] py-[3px]'
          : size === 'compact' || size === 'sm'
            ? 'pl-3.5 pr-[2px] py-[2px]'
            : 'pl-4 pr-[2px] py-[2px]'
        : size === 'lg'
          ? 'pl-5 pr-1.5'
          : 'pl-3.5 pr-1'
      : undefined;

    return (
      <button
        data-slot='button'
        className={cn(
          buttonVariants({ variant, size, shape }),
          withTrailingCircleIcon && 'justify-between',
          paddingWithCircle,
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className='inline-flex items-center gap-2'>
          {actualLeadingIcon && <span className='shrink-0'>{actualLeadingIcon}</span>}
          {isLoading ? (
            <span className='inline-flex items-center gap-2'>
              <Spinner />
              <span>{children}</span>
            </span>
          ) : (
            <span>{children}</span>
          )}
        </span>

        {withTrailingCircleIcon ? (
          <span
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full ml-3',
              size === 'lg'
                ? 'size-[34px]'
                : size === 'compact' || size === 'sm'
                  ? 'size-[26px]'
                  : 'size-[30px]',
              circleColorClass
            )}
          >
            {actualTrailingIcon || (
              <Icons.arrowUpRight
                className={cn(
                  'stroke-[2.5]',
                  size === 'lg'
                    ? 'size-4'
                    : size === 'compact' || size === 'sm'
                      ? 'size-3.5'
                      : 'size-3.5'
                )}
              />
            )}
          </span>
        ) : (
          actualTrailingIcon && <span className='shrink-0 ml-1.5'>{actualTrailingIcon}</span>
        )}
      </button>
    );
  }

  if (isLoading === undefined) {
    return (
      <button
        data-slot='button'
        className={cn(buttonVariants({ variant, size, shape, className }), fullWidth && 'w-full')}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      data-slot='button'
      className={cn(
        buttonVariants({ variant, size, shape }),
        'grid place-items-center justify-center [&>*]:col-start-1 [&>*]:row-start-1',
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      <span
        className={cn('inline-flex items-center justify-center gap-2', isLoading && 'invisible')}
      >
        {children}
      </span>
      <span className={cn('flex items-center justify-center', !isLoading && 'invisible')}>
        <Spinner />
      </span>
    </button>
  );
}

export { Button, buttonVariants };
