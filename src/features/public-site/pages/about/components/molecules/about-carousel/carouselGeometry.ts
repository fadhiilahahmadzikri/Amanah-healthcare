export type DeckSlotProperties = {
  filter: string;
  opacity: number;
  pointerEvents: 'auto' | 'none';
  scale: number;
  xPercent: number;
  z: number;
  zIndex: number;
};

export const INITIAL_SLIDE_INDEX = 2;
export const MOUSE_SWIPE_THRESHOLD_PX = 40;
export const TOUCH_SWIPE_THRESHOLD_PX = 35;

export function getWrappedIndex(index: number, totalItems: number): number {
  if (totalItems <= 0) {
    return 0;
  }
  return ((index % totalItems) + totalItems) % totalItems;
}

export function getInitialIndex(totalItems: number): number {
  if (totalItems <= 0) {
    return 0;
  }
  return Math.min(INITIAL_SLIDE_INDEX, totalItems - 1);
}

export function getOffset(index: number, currentIndex: number, totalItems: number): number {
  if (totalItems <= 0) {
    return 0;
  }

  let offset = index - currentIndex;

  while (offset < -Math.floor(totalItems / 2)) {
    offset += totalItems;
  }

  while (offset > Math.floor((totalItems - 1) / 2)) {
    offset -= totalItems;
  }

  return offset;
}

export function getDeckSlot(
  index: number,
  currentIndex: number,
  totalItems: number
): DeckSlotProperties {
  const offset = getOffset(index, currentIndex, totalItems);

  if (offset === 0) {
    return {
      filter: 'blur(0px) brightness(1)',
      opacity: 1,
      pointerEvents: 'auto',
      scale: 1,
      xPercent: 0,
      z: 0,
      zIndex: 30
    };
  }

  if (offset === -1) {
    return {
      filter: 'blur(2px) brightness(0.65)',
      opacity: 0.45,
      pointerEvents: 'auto',
      scale: 0.84,
      xPercent: -65,
      z: -120,
      zIndex: 20
    };
  }

  if (offset === 1) {
    return {
      filter: 'blur(2px) brightness(0.65)',
      opacity: 0.45,
      pointerEvents: 'auto',
      scale: 0.84,
      xPercent: 65,
      z: -120,
      zIndex: 20
    };
  }

  if (offset < -1) {
    return {
      filter: 'blur(5px) brightness(0.3)',
      opacity: 0,
      pointerEvents: 'none',
      scale: 0.68,
      xPercent: -130,
      z: -250,
      zIndex: 10
    };
  }

  return {
    filter: 'blur(5px) brightness(0.3)',
    opacity: 0,
    pointerEvents: 'none',
    scale: 0.68,
    xPercent: 130,
    z: -250,
    zIndex: 10
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
