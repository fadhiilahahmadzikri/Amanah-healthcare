import type { PixelIconName } from '@/features/public-site/components/shared';

export type TestimonialVideoData = {
  src?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  poster?: string;
  title: string;
  isPlaceholder?: boolean;
};

export type TestimonialPixelIcon = {
  name: PixelIconName;
  title: string;
};

export type TestimonialShowcaseItem = {
  id: string;
  eyebrow: string;
  title: string;
  quote: string;
  paragraphs: string[];
  authorName: string;
  authorRole: string;
  ctaLabel: string;
  ctaHref: string;
  video: TestimonialVideoData;
  pixelIcons: readonly TestimonialPixelIcon[];
  reversed?: boolean;
};

export type TestimonialsHeroData = {
  eyebrow: string;
  title: string;
  subtitle: string;
};
