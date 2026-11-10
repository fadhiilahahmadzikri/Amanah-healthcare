'use client';
import { KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch } from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useAuthorizedNav } from '@/lib/rbac/auth-context';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const filteredGroups = useAuthorizedNav();

  const actions = useMemo(() => {
    const navigateTo = (url: string) => {
      router.push(url);
    };

    const allItems = filteredGroups.flatMap((group) => group.items);

    return allItems.flatMap((navItem) => {
      const baseAction =
        navItem.url !== '#'
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: navItem.title,
              shortcut: navItem.shortcut,
              keywords: navItem.title.toLowerCase(),
              section: 'Navigation',
              subtitle: `Go to ${navItem.title}`,
              perform: () => navigateTo(navItem.url)
            }
          : null;

      const childActions =
        navItem.items
          ?.filter((childItem) => Boolean(childItem.url && childItem.url !== '#'))
          .map((childItem) => ({
            id: `${childItem.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${childItem.url.replace(/[^a-z0-9]/g, '-')}-action`,
            name: childItem.title,
            shortcut: childItem.shortcut,
            keywords: `${childItem.title.toLowerCase()} ${navItem.title.toLowerCase()}`,
            section: navItem.title,
            subtitle: `Go to ${childItem.title}`,
            perform: () => navigateTo(childItem.url)
          })) ?? [];

      return baseAction ? [baseAction, ...childActions] : childActions;
    });
  }, [router, filteredGroups]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-3 sm:p-6 backdrop-blur-xs flex justify-center items-start'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-3 sm:mt-20 w-full max-w-[600px] overflow-hidden rounded-2xl border border-border/70 shadow-2xl'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch className='bg-card w-full border-none px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden text-foreground' />
            </div>
            <div className='max-h-[380px] sm:max-h-[440px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
