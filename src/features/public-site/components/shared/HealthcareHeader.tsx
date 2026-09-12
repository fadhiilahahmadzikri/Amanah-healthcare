'use client';

import { ArrowRightIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/features/public-site/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/features/public-site/components/ui/sheet';
import { AppConfig } from '@/features/public-site/lib/app-config';
import { cn } from '@/features/public-site/lib/helpers';
import { AmanahLogo } from './AmanahLogo';
import { healthcareNavigationItems } from './data';
import { getHealthcareHref } from './healthcareNavigation';
import { SectionContainer } from './SectionContainer';
import { ThemeToggle } from './ThemeToggle';
import { ViewportLine } from './ViewportLine';

type HealthcareHeaderProps = {
  activePath?: string;
  locale?: string;
};

type HealthcareNavLinkProps = {
  className?: string;
  href: string;
  isActive: boolean;
  isSectionLink: boolean;
  label: string;
  onClick: () => void;
};

type HealthcareMobileMenuProps = {
  activeValue: string;
  locale: string;
  signInHref: string;
  onSelect: (value: string) => void;
};

const navigationLinkClass = `
  group relative flex h-12 shrink-0 items-center overflow-hidden bg-background
  border-r border-line px-5 amanah-type-body font-medium
  text-foreground
`;

const curtainPanelClass = `
  absolute inset-y-0 origin-bottom scale-y-0 bg-primary
  transition-transform duration-[250ms]
  [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
  group-hover:scale-y-100
  group-focus-visible:scale-y-100
`;

const activeNavigationLinkClass = 'bg-primary text-primary-foreground';

const healthcareSignInHref = '/auth/sign-in';

function getNavigationActiveValue(item: { hash?: string; path: string }) {
  return item.hash ?? item.path;
}

function GridMenuIcon() {
  return (
    <span aria-hidden className='relative inline-block w-5 shrink-0'>
      <svg viewBox='0 0 30 30' width='20' height='20' fill='currentColor'>
        <path d='M8.4 26H4V21.6H8.4V26Z' />
        <path d='M17.2 26H12.8V21.6H17.2V26Z' />
        <path d='M26 26H21.6V21.6H26V26Z' />
        <path d='M8.4 17.2H4V12.8H8.4V17.2Z' />
        <path d='M17.2 17.2H12.8V12.8H17.2V17.2Z' />
        <path d='M26 17.2H21.6V12.8H26V17.2Z' />
        <path d='M8.4 8.4H4V4H8.4V8.4Z' />
        <path d='M17.2 8.4H12.8V4H17.2V8.4Z' />
        <path d='M26 8.4H21.6V4H26V8.4Z' />
      </svg>
    </span>
  );
}

function HealthcareNavLink({
  className,
  href,
  isActive,
  isSectionLink,
  label,
  onClick
}: HealthcareNavLinkProps) {
  return (
    <a
      href={href}
      aria-current={isActive ? (isSectionLink ? 'location' : 'page') : undefined}
      onClick={onClick}
      className={cn(navigationLinkClass, isActive && activeNavigationLinkClass, className)}
    >
      <span
        className='
        relative z-10 transition-colors duration-200
        group-hover:text-primary-foreground
        group-focus-visible:text-primary-foreground
      '
      >
        {label}
      </span>
      <span aria-hidden className='pointer-events-none absolute inset-0 z-0'>
        <span
          className={cn(
            curtainPanelClass,
            `
          left-0 w-[calc(100%/3+1px)] delay-0
        `
          )}
        />
        <span
          className={cn(curtainPanelClass, 'left-[33.333333%] w-[calc(100%/3+1px)] delay-[40ms]')}
        />
        <span
          className={cn(
            curtainPanelClass,
            `
          right-0 w-[calc(100%/3+1px)] delay-[80ms]
        `
          )}
        />
      </span>
    </a>
  );
}

function HealthcareMobileMenu({
  activeValue,
  locale,
  signInHref,
  onSelect
}: HealthcareMobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='
            size-12 shrink-0 rounded-none border-l border-line bg-background
            text-foreground
            hover:bg-accent hover:text-foreground
            lg:hidden
          '
          aria-label='Toggle menu'
          id='mobile-menu-button'
        >
          <GridMenuIcon />
        </Button>
      </SheetTrigger>

      <SheetContent
        side='right'
        className='
          w-[min(448px,calc(100vw-48px))] border-line bg-background p-0
          text-foreground
          sm:max-w-none
        '
      >
        <SheetHeader className='border-b border-line p-4 pr-16'>
          <SheetTitle className='sr-only'>Navigasi utama</SheetTitle>
          <AmanahLogo locale={locale} textClassName='text-foreground' />
        </SheetHeader>

        <nav
          aria-label='Navigasi utama mobile'
          className='flex-1 divide-y divide-line overflow-y-auto'
        >
          {healthcareNavigationItems.map((item) => {
            const itemActiveValue = getNavigationActiveValue(item);
            const isActive = itemActiveValue === activeValue;

            return (
              <SheetClose key={`${item.path}${item.hash ?? ''}`} asChild>
                <a
                  href={getHealthcareHref(item, locale)}
                  aria-current={isActive ? (item.hash ? 'location' : 'page') : undefined}
                  onClick={() => onSelect(itemActiveValue)}
                  className={cn(
                    `
                      flex min-h-14 w-full items-center justify-between px-4
                      py-3 text-left transition-colors
                      hover:bg-accent
                    `,
                    isActive &&
                      `
                      bg-primary text-primary-foreground
                      hover:bg-primary
                    `
                  )}
                >
                  <span className='amanah-type-body font-medium'>{item.label}</span>
                  <ArrowRightIcon aria-hidden className='size-4' />
                </a>
              </SheetClose>
            );
          })}
        </nav>

        <div className='border-t border-line p-4'>
          <SheetClose asChild>
            <a
              href={signInHref}
              className='
                flex w-full min-h-12 items-center justify-between rounded-xl border
                border-line bg-background px-4 amanah-type-small font-semibold
                text-foreground transition-colors cursor-pointer
                hover:bg-accent
              '
            >
              Masuk
              <ArrowRightIcon aria-hidden className='size-4' />
            </a>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function HealthcareHeader({
  activePath = '/',
  locale = AppConfig.i18n.defaultLocale
}: HealthcareHeaderProps) {
  const [activeValue, setActiveValue] = useState(activePath);

  useEffect(() => {
    const syncActiveValue = () => {
      setActiveValue(window.location.hash || activePath);
    };

    const syncTimer = window.setTimeout(syncActiveValue, 0);
    window.addEventListener('hashchange', syncActiveValue);

    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener('hashchange', syncActiveValue);
    };
  }, [activePath]);

  return (
    <header
      className='
      sticky top-0 z-50 max-w-screen overflow-x-clip bg-background
    '
    >
      <SectionContainer
        className='
        relative flex h-12 items-center overflow-visible border-x-2 border-line
        px-0
        sm:px-0
      '
      >
        <ViewportLine position='top' />
        <ViewportLine position='bottom' className='z-30' />

        <div className='flex min-w-0 flex-1 items-center px-3'>
          <AmanahLogo locale={locale} className='min-w-0' />
        </div>

        <nav
          aria-label='Navigasi utama'
          className='
            hidden h-full items-stretch border-l border-line bg-background
            text-foreground transition-colors
            lg:flex
          '
        >
          {healthcareNavigationItems.map((item) => {
            const itemActiveValue = getNavigationActiveValue(item);
            const isActive = itemActiveValue === activeValue;

            return (
              <HealthcareNavLink
                key={`${item.path}${item.hash ?? ''}`}
                href={getHealthcareHref(item, locale)}
                isActive={isActive}
                isSectionLink={Boolean(item.hash)}
                label={item.label}
                onClick={() => setActiveValue(itemActiveValue)}
              />
            );
          })}
        </nav>

        <div className='flex h-full items-center'>
          <div
            className='
            flex h-full items-center border-l border-line px-1.5
            lg:border-l-0
          '
          >
            <ThemeToggle />
          </div>
          <a
            href={healthcareSignInHref}
            className='
              hidden h-full items-center border-l border-line px-4
              amanah-type-small font-medium text-muted-foreground
              transition-colors cursor-pointer
              hover:text-foreground
              sm:inline-flex
            '
          >
            Masuk
          </a>
          <HealthcareMobileMenu
            activeValue={activeValue}
            locale={locale}
            signInHref={healthcareSignInHref}
            onSelect={setActiveValue}
          />
        </div>
      </SectionContainer>
    </header>
  );
}
