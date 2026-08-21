import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Icons } from '@/components/icons';

import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-medium select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.18),0_1px_2px_0_rgba(0,0,0,0.12),0_3px_6px_-2px_rgba(0,0,0,0.2)] border border-primary/40 dark:border-white/10 hover:bg-primary/90 active:scale-[0.96] transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out active:shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.08),0_1px_2px_0_rgba(0,0,0,0.15)]',
        primary:
          'bg-primary text-primary-foreground shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.18),0_1px_2px_0_rgba(0,0,0,0.12),0_3px_6px_-2px_rgba(0,0,0,0.2)] border border-primary/40 dark:border-white/10 hover:bg-primary/90 active:scale-[0.96] transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out active:shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.08),0_1px_2px_0_rgba(0,0,0,0.15)]',
        destructive:
          'bg-destructive text-white shadow-[inset_0_1px_0.5px_0_rgba(255,255,255,0.18),0_1px_2px_0_rgba(0,0,0,0.12),0_3px_6px_-2px_rgba(0,0,0,0.2)] border border-destructive/40 hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/80 active:scale-[0.96] transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:scale-[0.96] transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 border border-border/80 active:scale-[0.96] transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out',
        ghost:
          'hover:bg-accent hover:text-accent-foreground text-foreground/80 transition-colors duration-150',
        link: 'text-primary underline-offset-4 hover:underline transition-colors duration-150'
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm',
        sm: 'h-8 px-3 py-1.5 text-xs',
        md: 'h-[38px] px-4 py-2 text-xs sm:text-[13px]',
        lg: 'h-10 px-6 py-2.5 text-sm sm:text-base',
        compact: 'h-[32px] px-[11px] py-[6px] text-[12.5px]',
        'card-action': 'h-10 px-4 py-2 text-[13px] font-semibold',
        card: 'h-10 px-4 py-2 text-[13px] font-semibold',
        icon: 'size-9 justify-center',
        'icon-sm': 'size-8 justify-center',
        'icon-lg': 'size-10 justify-center'
      },
      shape: {
        rounded: 'rounded-xl',
        card: 'rounded-xl',
        pill: 'rounded-full',
        compact: 'rounded-[5.4px]',
        default: 'rounded-md',
        square: 'rounded-none'
      },
      align: {
        center: 'justify-center text-center',
        left: 'justify-start text-left',
        right: 'justify-end text-right',
        between: 'justify-between'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
      align: 'center'
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
  hug?: boolean;
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  shape = 'default',
  align = 'center',
  asChild = false,
  isLoading,
  withTrailingCircleIcon = false,
  trailingIcon,
  leadingIcon,
  icon,
  iconRight,
  fullWidth = false,
  hug = false,
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
        className={cn(
          buttonVariants({ variant, size, shape, align, className }),
          fullWidth && 'w-full'
        )}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  if (withTrailingCircleIcon || actualLeadingIcon || actualTrailingIcon) {
    const isPill = shape === 'pill';
    const circleSizeClass =
      size === 'lg'
        ? 'size-[36px]'
        : size === 'card-action' || size === 'card'
          ? isPill
            ? 'size-[34px]'
            : 'size-[28px]'
          : size === 'compact' || size === 'sm'
            ? 'size-[26px]'
            : 'size-[30px]';

    const circleIconSizeClass =
      size === 'lg'
        ? 'size-4.5 stroke-[2.5]'
        : size === 'card-action' || size === 'card'
          ? 'size-4 stroke-[2.5]'
          : 'size-3.5 stroke-[2.5]';

    // Snug padding matching the Apple-style pill (minimal margin around circle)
    const paddingWithCircle = withTrailingCircleIcon
      ? isPill
        ? align === 'center'
          ? 'pl-8 pr-[3px] py-[3px]'
          : align === 'left'
            ? 'pl-5 pr-[3px] py-[3px]'
            : align === 'right'
              ? 'pl-3 pr-[3px] py-[3px]'
              : 'pl-5 pr-[3px] py-[3px]'
        : size === 'lg'
          ? 'pl-5 pr-1.5'
          : size === 'card-action' || size === 'card'
            ? 'pl-4 pr-1.5'
            : 'pl-3.5 pr-1'
      : undefined;

    return (
      <button
        data-slot='button'
        className={cn(
          buttonVariants({ variant, size, shape, align }),
          withTrailingCircleIcon && 'justify-between',
          paddingWithCircle,
          hug ? 'w-fit' : fullWidth ? 'w-full' : '',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        <span
          className={cn(
            'inline-flex items-center gap-2',
            withTrailingCircleIcon && align === 'center' && 'flex-1 justify-center',
            withTrailingCircleIcon && align === 'left' && 'flex-1 justify-start',
            withTrailingCircleIcon && align === 'right' && 'flex-1 justify-end'
          )}
        >
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
              'flex shrink-0 items-center justify-center rounded-full shadow-2xs transition-transform',
              circleSizeClass,
              circleColorClass
            )}
          >
            {actualTrailingIcon || (
              <Icons.arrowUpRight className={cn('shrink-0', circleIconSizeClass)} />
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
        className={cn(
          buttonVariants({ variant, size, shape, align, className }),
          hug ? 'w-fit' : fullWidth && 'w-full'
        )}
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
        buttonVariants({ variant, size, shape, align }),
        'grid place-items-center justify-center [&>*]:col-start-1 [&>*]:row-start-1',
        hug ? 'w-fit' : fullWidth && 'w-full',
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
