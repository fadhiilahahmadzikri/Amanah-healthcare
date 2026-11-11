'use client';

import * as React from 'react';
import { promotionsApi } from '../api/promotions.api';
import {
  dismissBanner as persistDismissBanner,
  hasSeenModal,
  markModalSeen,
  shouldShowBanner,
} from '../lib/modalMemory';
import type { PublicPromotion } from '../types/promotions.types';

interface PromotionsContextValue {
  promotions: PublicPromotion[];
  isLoading: boolean;
  activeBannerPromo: PublicPromotion | null;
  activeModalPromo: PublicPromotion | null;
  sectionPromos: PublicPromotion[];
  dismissBanner: (id: string) => void;
  dismissModal: () => void;
  refresh: () => Promise<void>;
}

const PromotionsContext = React.createContext<PromotionsContextValue | undefined>(
  undefined
);

interface PromotionsProviderProps {
  children: React.ReactNode;
  initialData?: PublicPromotion[];
}

export function PromotionsProvider({
  children,
  initialData,
}: PromotionsProviderProps) {
  const [promotions, setPromotions] = React.useState<PublicPromotion[]>(
    initialData ?? []
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(!initialData);
  const [dismissedBannerIds, setDismissedBannerIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const [isModalDismissed, setIsModalDismissed] = React.useState<boolean>(false);

  const fetchPromotions = React.useCallback(async () => {
    try {
      const data = await promotionsApi.getPublicPromotions();
      setPromotions(data);
    } catch {
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!initialData) {
      void fetchPromotions();
    }
  }, [initialData, fetchPromotions]);

  // Find highest priority banner promo that has not been dismissed in this session
  const activeBannerPromo = React.useMemo(() => {
    const list = Array.isArray(promotions) ? promotions : [];
    const banners = list.filter(
      (p) =>
        Array.isArray(p.placements) &&
        p.placements.includes('banner') &&
        !dismissedBannerIds.has(p.id) &&
        shouldShowBanner(p.id, p.version)
    );
    return banners[0] ?? null;
  }, [promotions, dismissedBannerIds]);

  // Find first eligible modal promo that visitor hasn't seen
  const activeModalPromo = React.useMemo(() => {
    if (isModalDismissed) return null;
    const list = Array.isArray(promotions) ? promotions : [];
    const modals = list.filter(
      (p) => Array.isArray(p.placements) && p.placements.includes('modal')
    );
    for (const promo of modals) {
      const frequency = promo.modal?.frequency ?? 'once_per_day';
      if (!hasSeenModal(promo.id, promo.version, frequency)) {
        return promo;
      }
    }
    return null;
  }, [promotions, isModalDismissed]);

  // Section promos for landing page
  const sectionPromos = React.useMemo(() => {
    const list = Array.isArray(promotions) ? promotions : [];
    return list.filter(
      (p) => Array.isArray(p.placements) && p.placements.includes('section')
    );
  }, [promotions]);

  const dismissBanner = React.useCallback(
    (id: string) => {
      const promo = promotions.find((p) => p.id === id);
      if (promo) {
        persistDismissBanner(promo.id, promo.version);
      }
      setDismissedBannerIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    },
    [promotions]
  );

  const dismissModal = React.useCallback(() => {
    if (activeModalPromo) {
      markModalSeen(
        activeModalPromo.id,
        activeModalPromo.version,
        activeModalPromo.modal?.frequency ?? 'once_per_day'
      );
    }
    setIsModalDismissed(true);
  }, [activeModalPromo]);

  const value = React.useMemo<PromotionsContextValue>(
    () => ({
      promotions,
      isLoading,
      activeBannerPromo,
      activeModalPromo,
      sectionPromos,
      dismissBanner,
      dismissModal,
      refresh: fetchPromotions,
    }),
    [
      promotions,
      isLoading,
      activeBannerPromo,
      activeModalPromo,
      sectionPromos,
      dismissBanner,
      dismissModal,
      fetchPromotions,
    ]
  );

  return (
    <PromotionsContext.Provider value={value}>
      {children}
    </PromotionsContext.Provider>
  );
}

export function usePromotions(): PromotionsContextValue {
  const context = React.useContext(PromotionsContext);
  if (!context) {
    throw new Error('usePromotions must be used within a PromotionsProvider');
  }
  return context;
}
