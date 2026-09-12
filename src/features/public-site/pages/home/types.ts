import type { PixelIconName } from '@/features/public-site/components/shared';

export type AssetImage = {
  src: string;
  alt: string;
};

export type NavigationItem = {
  label: string;
  href: string;
};

export type FacilityItem = {
  title: string;
  description: string;
  icon: AssetImage;
  image: AssetImage;
  pixelIcon?: PixelIconName;
};

export type ServiceItem = {
  title: string;
  image: AssetImage;
};

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  avatar: AssetImage;
};

export type ContactItem = {
  label: string;
  value: string;
  href: string;
};

export type DocumentationMoment = {
  imgUrl: string;
  alt: string;
  linkUrl?: string;
};
