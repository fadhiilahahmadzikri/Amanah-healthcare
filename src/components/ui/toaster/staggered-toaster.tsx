'use client';

import React, { useEffect, useState } from 'react';
import { useSonner, toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Icons } from '@/components/icons';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { renderSystemIcon } from '@/features/notifications/components/unified-notification-toast';
import type { NotificationToastModel } from '@/features/notifications/presentation/notification-toast-mapper';
import { StaggeredToastCard } from './organisms/staggered-toast-card.organism';
import type { StaggeredToasterProps, ToastActionItem, ToastPosition, ToastType } from './types';

function getPositionClasses(position: ToastPosition = 'responsive'): string {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4 sm:top-6 sm:right-6 sm:w-[420px] w-[calc(100%-2rem)]';
    case 'top-left':
      return 'top-4 left-4 sm:top-6 sm:left-6 sm:w-[420px] w-[calc(100%-2rem)]';
    case 'top-center':
      return 'top-4 left-1/2 -translate-x-1/2 sm:top-6 sm:w-[420px] w-[calc(100%-2rem)]';
    case 'bottom-right':
      return 'bottom-4 right-4 sm:bottom-6 sm:right-6 sm:w-[420px] w-[calc(100%-2rem)]';
    case 'bottom-left':
      return 'bottom-4 left-4 sm:bottom-6 sm:left-6 sm:w-[420px] w-[calc(100%-2rem)]';
    case 'bottom-center':
      return 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6 sm:w-[420px] w-[calc(100%-2rem)]';
    case 'responsive':
    default:
      // Mobile: top-center fluid with safe side margins (inset-x-3)
      // Desktop: fixed width (420px) pinned to top-right (sm:right-6 sm:top-6)
      return 'top-4 inset-x-3 sm:inset-x-auto sm:top-6 sm:right-6 sm:w-[420px] w-auto max-w-full';
  }
}

export const StaggeredToaster: React.FC<StaggeredToasterProps> = ({
  position = 'responsive',
  duration = 4000,
  className = ''
}) => {
  const { toasts } = useSonner();
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark' || theme === 'dark';
  const positionClasses = getPositionClasses(position);

  return (
    <div
      aria-live='polite'
      role='region'
      aria-label='Notifikasi Sistem'
      className={`fixed z-[9999] flex flex-col gap-2.5 pointer-events-none ${positionClasses} ${className}`}
    >
      {toasts.map((t) => {
        const rawToast = t as unknown as Record<string, unknown>;
        let toastType = (t.type || 'default') as ToastType;
        let toastDuration = typeof t.duration === 'number' ? t.duration : duration;
        let toastAvatar = rawToast.avatar as string | React.ReactNode | undefined;
        let toastIcon = t.icon as React.ReactNode | undefined;
        let toastAction = rawToast.action as ToastActionItem | undefined;
        const toastCancel = rawToast.cancel as ToastActionItem | undefined;
        let toastOnClick: (() => void) | undefined = undefined;
        let resolvedTitle: React.ReactNode = undefined;
        let resolvedDescription: React.ReactNode = undefined;
        let customContent: React.ReactNode = undefined;

        // 1. Inspect if toast was dispatched via toast.custom(jsx, data)
        const rawJsx = t.jsx as unknown;
        const jsxNode =
          typeof rawJsx === 'function'
            ? (rawJsx as (id: string | number) => React.ReactNode)(t.id)
            : (rawJsx as React.ReactNode);

        if (React.isValidElement(jsxNode)) {
          const props = jsxNode.props as Record<string, unknown>;
          const model = props.model as NotificationToastModel | undefined;

          if (model) {
            // First-class backend notification model mapping (Chat, Push, System events)
            toastType = model.systemIconType === 'alert-circle' ? 'error' : 'info';
            if (model.duration) toastDuration = model.duration;

            if (model.isPerson) {
              toastAvatar = model.avatarUrl || DEFAULT_AVATAR_PATH;
            } else if (model.systemIconType) {
              toastIcon = renderSystemIcon(model.systemIconType);
            }

            resolvedTitle = (
              <span className='flex items-center gap-1.5 font-semibold text-[13.5px] leading-snug'>
                <span className='truncate'>{model.headline}</span>
                {model.emoji && (
                  <span className='text-sm select-none shrink-0 leading-none'>{model.emoji}</span>
                )}
              </span>
            );

            resolvedDescription = (
              <div className='flex flex-col gap-0.5 min-w-0'>
                {model.entityName && (
                  <span className='font-medium text-xs truncate'>{model.entityName}</span>
                )}
                {model.subline && (
                  <span className='text-[12px] opacity-85 truncate'>{model.subline}</span>
                )}
              </div>
            );

            if (model.action) {
              toastAction = {
                label: (
                  <span className='inline-flex items-center gap-1 font-semibold text-xs'>
                    {model.action.label || 'Buka'}
                    <Icons.arrowUpRight className='size-3 stroke-[2.2]' />
                  </span>
                ),
                onClick: () => {
                  model.action?.onClick();
                  toast.dismiss(t.id);
                }
              };

              toastOnClick = () => {
                model.action?.onClick();
                toast.dismiss(t.id);
              };
            }
          } else {
            // Arbitrary custom JSX: mount directly into the Staggered card
            customContent = jsxNode;
          }
        }

        // 2. Resolve standard title & description if not already extracted from model
        if (!customContent && !resolvedTitle) {
          if (typeof t.title === 'function') {
            resolvedTitle = (t.title as () => React.ReactNode)();
          } else if (
            typeof t.title === 'object' &&
            t.title !== null &&
            !React.isValidElement(t.title)
          ) {
            const titleObj = t.title as unknown as Record<string, unknown>;
            resolvedTitle = (titleObj.title || titleObj.message || titleObj.headline) as React.ReactNode;
            if (!resolvedDescription) {
              resolvedDescription = (titleObj.description || titleObj.subline) as React.ReactNode;
            }
          } else {
            resolvedTitle = t.title as React.ReactNode;
          }

          if (typeof t.description === 'function') {
            resolvedDescription = (t.description as () => React.ReactNode)();
          } else if (
            typeof t.description === 'object' &&
            t.description !== null &&
            !React.isValidElement(t.description)
          ) {
            const descObj = t.description as unknown as Record<string, unknown>;
            resolvedDescription = (descObj.description || descObj.subline) as React.ReactNode;
          } else if (t.description) {
            resolvedDescription = t.description as React.ReactNode;
          }

          // Fallback to rawToast.message if title is still empty
          if (!resolvedTitle && rawToast.message) {
            resolvedTitle = rawToast.message as React.ReactNode;
          }
        }

        return (
          <StaggeredToastCard
            key={t.id}
            id={t.id}
            type={toastType}
            title={resolvedTitle}
            description={resolvedDescription}
            icon={toastIcon}
            avatar={toastAvatar}
            duration={toastDuration}
            dismissible={t.dismissible !== false}
            action={toastAction}
            cancel={toastCancel}
            customContent={customContent}
            isDark={isDark}
            onClick={toastOnClick}
            onDismiss={(id) => toast.dismiss(id)}
          />
        );
      })}
    </div>
  );
};
