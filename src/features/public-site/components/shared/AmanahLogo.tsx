import Image from 'next/image';
import { AppConfig } from '@/features/public-site/lib/app-config';
import { cn, getI18nPath } from '@/features/public-site/lib/helpers';
import { healthcareBrand } from './data';

type AmanahLogoProps = {
  className?: string;
  locale?: string;
  markClassName?: string;
  textClassName?: string;
};

export function AmanahLogo({
  className,
  locale = AppConfig.i18n.defaultLocale,
  markClassName,
  textClassName
}: AmanahLogoProps) {
  return (
    <a
      className={cn('inline-flex items-center gap-2.5', className)}
      href={getI18nPath('/', locale)}
    >
      <Image
        src={healthcareBrand.logo.src}
        alt={healthcareBrand.logo.alt}
        width={48}
        height={48}
        className={cn(`size-8 shrink-0 rounded-none object-contain`, markClassName)}
        priority
      />
      <span
        className={cn(
          `
        truncate amanah-type-card-title font-semibold text-foreground
      `,
          textClassName
        )}
      >
        {healthcareBrand.name}
      </span>
    </a>
  );
}
