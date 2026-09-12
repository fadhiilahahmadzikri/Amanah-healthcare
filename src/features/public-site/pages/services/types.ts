export type AssetImage = {
  src: string;
  alt: string;
};

export type ServiceHighlight = {
  id: string;
  title: string;
};

export type ServiceHeroData = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: ServiceHighlight[];
  image: AssetImage;
};

export type ServiceCardItem = {
  id: string;
  title: string;
  description: string;
  image: AssetImage;
  href?: string;
  colSpanClass?: string;
  heightClass?: string;
};

export type ServiceCategoryContext = 'general-practitioner' | 'midwifery';

export type ServiceCategorySection = {
  id: string;
  contextKey: ServiceCategoryContext;
  indicatorLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  services: ServiceCardItem[];
  layout: 'bento-left' | 'bento-right';
};

export type FacilityCarouselItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
};

export type FacilitySectionData = {
  eyebrow: string;
  title: string;
  description: string;
  items: FacilityCarouselItem[];
};
