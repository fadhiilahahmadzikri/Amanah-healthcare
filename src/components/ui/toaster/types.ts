import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'default';

export type ToastPosition =
  | 'top-right'
  | 'top-center'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'responsive';

export interface ToastColorTokens {
  layer1: string; // Left-most deep peek layer
  layer2: string; // Middle accent peek layer
  panelBg: string; // Main card background
  panelBorder: string; // Subtle crisp border
  textColor: string; // Primary title / text color
  descriptionColor: string; // Secondary description color
  iconColor: string; // Status icon stroke color
}

export interface ToastActionItem {
  label: ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface StaggeredToastProps {
  id: string | number;
  type?: ToastType;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  avatar?: string | ReactNode;
  duration?: number;
  dismissible?: boolean;
  action?: ToastActionItem;
  cancel?: ToastActionItem;
  extraAction?: ReactNode;
  customContent?: ReactNode;
  className?: string;
  onClick?: () => void;
  onDismiss: (id: string | number) => void;
}

export interface StaggeredToasterProps {
  position?: ToastPosition;
  duration?: number;
  expand?: boolean;
  visibleToasts?: number;
  closeButton?: boolean;
  className?: string;
}
