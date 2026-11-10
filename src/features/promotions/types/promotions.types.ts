export type PromoImageType = 'static' | 'url';

export type ModalFrequency =
  | 'once_per_session'
  | 'once_per_day'
  | 'once_per_week';

export type PromoStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'expired'
  | 'archived';

export type Placement = 'banner' | 'modal' | 'section';

export interface PromoGalleryItem {
  path: string;
  width: number;
  height: number;
  bytes: number;
}

export interface PublicPromotion {
  id: string;
  version: string; // epoch timestamp of updated_at to reset "already seen"
  title: string;
  summary: string;
  body?: string;
  terms?: string;
  serviceId?: string;
  serviceName?: string;
  image: {
    src: string;
    alt: string;
  };
  cta?: {
    label: string;
    href: string;
  };
  placements: Placement[];
  modal?: {
    frequency: ModalFrequency;
    delaySec: number;
  };
}

export interface AdminPromotion {
  id: string;
  serviceId?: string | null;
  serviceName?: string | null;
  serviceCode?: string | null;
  title: string;
  summary: string;
  body?: string | null;
  terms?: string | null;
  imageType: PromoImageType;
  imageValue: string;
  imageAlt: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  showBanner: boolean;
  showModal: boolean;
  showSection: boolean;
  modalFrequency: ModalFrequency;
  modalDelaySec: number;
  priority: number;
  isPublished: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  deletedAt?: string | null;
  broadcastToUsers: boolean;
  broadcastAt?: string | null;
  broadcastChannels: string[];
  status: PromoStatus;
  placements: Placement[];
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueryAdminPromotionsParams {
  status?: PromoStatus | 'all';
  search?: string;
  serviceId?: string;
  page?: number;
  limit?: number;
}

export interface CreatePromotionPayload {
  serviceId?: string | null;
  title: string;
  summary: string;
  body?: string | null;
  terms?: string | null;
  imageType: PromoImageType;
  imageValue: string;
  imageAlt: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  showBanner: boolean;
  showModal: boolean;
  showSection: boolean;
  modalFrequency: ModalFrequency;
  modalDelaySec: number;
  priority: number;
  isPublished?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  broadcastToUsers?: boolean;
  broadcastChannels?: string[];
}

export type UpdatePromotionPayload = Partial<CreatePromotionPayload>;
