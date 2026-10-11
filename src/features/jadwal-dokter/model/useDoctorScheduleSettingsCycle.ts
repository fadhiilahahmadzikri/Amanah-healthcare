'use client';

import { useState, useCallback } from 'react';
import type { ConfigurationCategory } from './useDoctorScheduleSettingsModal';

export type SettingsSubView = 'defs' | 'operating_days';

export interface SettingsNavigationState {
  category: ConfigurationCategory;
  subView: SettingsSubView;
}

export interface UseDoctorScheduleSettingsCycleReturn {
  isOpen: boolean;
  category: ConfigurationCategory;
  subView: SettingsSubView;
  canGoBack: boolean;
  openSettings: (category?: ConfigurationCategory, subView?: SettingsSubView) => void;
  closeSettings: () => void;
  navigateTo: (category: ConfigurationCategory, subView?: SettingsSubView) => void;
  navigateBack: () => void;
  navigateToOperatingDays: () => void;
  navigateToWeeklyTemplates: () => void;
  navigateToSessionDefs: () => void;
  navigateToClinicSettings: () => void;
}

export function useDoctorScheduleSettingsCycle(
  initialCategory: ConfigurationCategory = 'session_defs',
  initialSubView: SettingsSubView = 'defs'
): UseDoctorScheduleSettingsCycleReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [historyStack, setHistoryStack] = useState<SettingsNavigationState[]>([
    { category: initialCategory, subView: initialSubView }
  ]);

  const currentState = historyStack[historyStack.length - 1] ?? {
    category: initialCategory,
    subView: initialSubView
  };

  const openSettings = useCallback(
    (category: ConfigurationCategory = 'session_defs', subView: SettingsSubView = 'defs') => {
      setHistoryStack([{ category, subView }]);
      setIsOpen(true);
    },
    []
  );

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  const navigateTo = useCallback(
    (category: ConfigurationCategory, subView: SettingsSubView = 'defs') => {
      setHistoryStack((prev) => [...prev, { category, subView }]);
    },
    []
  );

  const navigateBack = useCallback(() => {
    setHistoryStack((prev) => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
  }, []);

  const navigateToOperatingDays = useCallback(() => {
    navigateTo('session_defs', 'operating_days');
  }, [navigateTo]);

  const navigateToWeeklyTemplates = useCallback(() => {
    navigateTo('weekly_templates', 'defs');
  }, [navigateTo]);

  const navigateToSessionDefs = useCallback(() => {
    navigateTo('session_defs', 'defs');
  }, [navigateTo]);

  const navigateToClinicSettings = useCallback(() => {
    navigateTo('clinic_settings', 'defs');
  }, [navigateTo]);

  return {
    isOpen,
    category: currentState.category,
    subView: currentState.subView,
    canGoBack: historyStack.length > 1,
    openSettings,
    closeSettings,
    navigateTo,
    navigateBack,
    navigateToOperatingDays,
    navigateToWeeklyTemplates,
    navigateToSessionDefs,
    navigateToClinicSettings
  };
}
