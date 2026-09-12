import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/features/public-site/lib/helpers';
import { AmanahScriptText } from './AmanahScriptText';
import { HealthcareHeading, HealthcareText } from './HealthcareTypography';

export type SectionHeaderAlign = 'center' | 'left';

export type SectionHeaderProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
  actionSlot?: ReactNode;
  align?: SectionHeaderAlign;
  description?: ReactNode;
  descriptionClassName?: string;
  descriptionSize?: 'body' | 'caption' | 'lead' | 'small';
  eyebrow?: ReactNode;
  eyebrowClassName?: string;
  headingAs?: 'h1' | 'h2' | 'h3';
  headingClassName?: string;
  headingSize?: 'card' | 'display' | 'hero' | 'section' | 'subsection';
  maskAnimation?: boolean;
  title: ReactNode;
  titleWrapperClassName?: string;
};

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      actionSlot,
      align = 'center',
      children,
      className,
      description,
      descriptionClassName,
      descriptionSize = 'body',
      eyebrow,
      eyebrowClassName,
      headingAs = 'h2',
      headingClassName,
      headingSize = 'section',
      maskAnimation = true,
      title,
      titleWrapperClassName,
      ...props
    },
    ref
  ) => {
    const isCenter = align === 'center';

    const renderEyebrow = () => {
      if (!eyebrow) {
        return null;
      }

      if (typeof eyebrow === 'string') {
        return (
          <div className='-my-3 flex w-fit max-w-full overflow-visible py-3'>
            <AmanahScriptText
              mask={maskAnimation ? 'text' : undefined}
              className={cn('font-semibold text-foreground', eyebrowClassName)}
            >
              {eyebrow}
            </AmanahScriptText>
          </div>
        );
      }

      return eyebrow;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          isCenter ? 'mx-auto max-w-5xl items-center text-center' : 'items-start text-left',
          className
        )}
        {...props}
      >
        {renderEyebrow()}

        <div
          className={cn(
            eyebrow
              ? `
                mt-2.5
                sm:mt-3
              `
              : undefined,
            `
              -mb-3 overflow-hidden pb-3
              md:-mb-4 md:pb-4
            `,
            titleWrapperClassName
          )}
        >
          <HealthcareHeading
            as={headingAs}
            data-mask-text={maskAnimation ? true : undefined}
            size={headingSize}
            className={cn(
              'inline-block font-medium text-foreground',
              maskAnimation && 'will-change-transform',
              headingClassName
            )}
          >
            {title}
          </HealthcareHeading>
        </div>

        {description && (
          <div
            className='
            mt-4 -mb-2 overflow-hidden pb-2
            sm:mt-5
          '
          >
            {typeof description === 'string' ? (
              <HealthcareText
                data-mask-text={maskAnimation ? true : undefined}
                size={descriptionSize}
                className={cn(
                  'inline-block max-w-2xl font-medium text-muted-foreground',
                  maskAnimation && 'will-change-transform',
                  descriptionClassName
                )}
              >
                {description}
              </HealthcareText>
            ) : (
              description
            )}
          </div>
        )}

        {actionSlot}
        {children}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';
