import { clientFetch } from '@/lib/client-fetch';
import type { FacilityCarouselItem } from '@/features/public-site/pages/services/types';
import type { HealthcareFAQItem } from '@/features/public-site/components/shared/faq/types';

export type PublicFacilityDto = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  ctaUrl: string;
  displayOrder: number;
  isPublished: boolean;
  serviceId: string | null;
  serviceName: string | null;
};

export type PublicFaqDto = {
  id: string;
  category: string;
  title: string;
  solutionSteps: string[];
  paths: string[];
  displayOrder: number;
  isPublished: boolean;
  serviceId: string | null;
  serviceName: string | null;
  categoryId: string | null;
  categoryName: string | null;
};

class PublicContentService {
  async getFacilities(): Promise<FacilityCarouselItem[]> {
    const raw = await clientFetch<PublicFacilityDto[]>('/api/v1/clinics/facilities', {
      method: 'GET'
    });
    return (raw || []).map((f) => ({
      id: f.id,
      title: f.title,
      summary: f.summary || '',
      url: f.ctaUrl || '/kontak',
      image: f.imageUrl || '/healthcare/assets/images/fasilitas-apotek.webp',
      serviceId: f.serviceId,
      serviceName: f.serviceName
    }));
  }

  async getFaqs(path?: string): Promise<HealthcareFAQItem[]> {
    const url = path
      ? `/api/v1/clinics/faqs?path=${encodeURIComponent(path)}`
      : '/api/v1/clinics/faqs';
    const raw = await clientFetch<PublicFaqDto[]>(url, {
      method: 'GET'
    });
    return (raw || []).map((faq) => ({
      id: faq.id,
      question: faq.title,
      answer: Array.isArray(faq.solutionSteps) ? faq.solutionSteps.join('\n\n') : String(faq.solutionSteps || ''),
      paths: faq.paths as any
    }));
  }
}

export const publicContentService = new PublicContentService();
